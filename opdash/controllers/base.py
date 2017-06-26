from flask import Blueprint, g, redirect, abort, request, \
    current_app, make_response
import json
import urlparse
import urllib
from datetime import datetime

from base64 import b64decode
from zlib import decompress

from onelogin.saml2.auth import OneLogin_Saml2_Auth
from onelogin.saml2.utils import OneLogin_Saml2_Utils
from onelogin.saml2.settings import OneLogin_Saml2_Settings
from onelogin.saml2.logout_request import OneLogin_Saml2_Logout_Request
from onelogin.saml2.logout_response import OneLogin_Saml2_Logout_Response

from opdash.rax.pilot import get_pilot_header
from opdash.auth.identity import Identity


class UnsecureBlueprint(Blueprint):
    '''
        Base Blueprint, use for pages that DO NOT require authentication
    '''

    def on_before_request(self):

        current_app.logger.debug(
            "***** UnsecureBlueprint: Allow Unauthenticated User *****")

    def on_after_request(self, response):
        '''
            This can be overridden in child Blueprints
        '''
        return response

    def get_base_url(self, request, remove_path=True):
        '''
            Gets the base url of the request.
            Looks for the X-Forwarded-Proto header to see
            if the request came through the load balancer.
            If so, uses the protocol specificed in that header.
        '''

        parsed_url = urlparse.urlparse(request.url)

        forwarded_proto = request.headers.get('X-Forwarded-Proto', None)

        if forwarded_proto:
            # Change scheme and remove port
            parsed_url = parsed_url._replace(scheme=forwarded_proto)

        if remove_path:
            # Remove Path from URL
            parsed_url = parsed_url._replace(
                path="",
                query="",
                fragment="")

        return urlparse.urlunparse(parsed_url)

    def register(self, app, options, first_registration=False):

        self._app = app

        # Prepare Each Request
        self.before_request(self.on_before_request)
        self.after_request(self.on_after_request)

        super(UnsecureBlueprint, self).register(
            app, options, first_registration)


class SecureBlueprint(UnsecureBlueprint):
    '''
        This is the base blueprint for endpoints
        that require authentication.
    '''
    def register(self, app, options, first_registration=False):
        super(SecureBlueprint, self).register(app,
                                              options,
                                              first_registration)

        self._identity_url = app.config["IDENTITY_URL"]

    def on_before_request(self):

        g.user_data = None

        # prepare SAML request
        self.saml_req = self.saml_prepare_request(request)
        self.saml_auth = self.saml_init_auth(self.saml_req)

        cookie_session_id = request.cookies.get(
            current_app.config['SESSION_COOKIE_NAME'], None)

        if (cookie_session_id):

            current_app.logger.debug(
                '* - FOUND SESSION COOKIE:{0}'.format(cookie_session_id))

            user_data = current_app.cache.get(cookie_session_id)

            if user_data:

                #
                # Session FOUND in cache, restore data and proceed
                #
                current_app.logger.debug('* - SESSION PULLED FROM CACHE')
                g.user_data = user_data

            else:
                current_app.logger.debug('* - SESSION NOT FOUND IN CACHE')

    def on_after_request(self, response):

        if g.user_data:

            response.set_cookie(
                current_app.config['SESSION_COOKIE_NAME'],
                domain=current_app.config['SESSION_COOKIE_DOMAIN'],
                httponly=True,
                secure=request.headers.get(
                    'X-Forwarded-Proto', "") == "https",
                value=g.user_data["session_id"],
                path='/',
                expires=g.user_data["expiration"],
            )
            return response

        current_app.logger.debug('--- NO AUTH - SO CLEAR COOKIE ---')

        g.user_data = None

        # if NO userData clear session cookie
        response.delete_cookie(
            current_app.config['SESSION_COOKIE_NAME'],
            domain=current_app.config['SESSION_COOKIE_DOMAIN'],
            path='/')

        return response

    def saml_init_auth(self, req):

        auth = OneLogin_Saml2_Auth(
            req,
            current_app.config["saml_settings"])
        return auth

    def saml_prepare_request(self, request):
        # We only need the X-Forwarded fields because
        # SAML will only work behind a LB or NGINX
        return {
            'http_host': request.host,
            'server_port': request.headers.get('X-Forwarded-Port'),
            'script_name': request.path,
            'get_data': request.args.copy(),
            'post_data': request.form.copy(),
        }

    def create_user_data(self, session_id, service_catalog, is_saml=True):
        ''' Save the user_data to session '''

        current_app.logger.debug('** UPDATING SESSION WITH USER')

        json_catalog = json.loads(service_catalog)

        if json_catalog:

            # Check if user is a Racker
            roles = json_catalog["access"]["user"]["roles"]
            is_racker = next(
                (True for role in roles if role['name'] == 'Racker'),
                False  # Default
            )

            user_data = {
                # Get Racker Info
                "session_id": session_id,
                "is_saml": is_saml,
                "username": json_catalog["access"]["user"]["name"],
                "authtoken": json_catalog["access"]["token"]["id"],
                "expiration": datetime.strptime(
                    json_catalog["access"]["token"]["expires"],
                    '%Y-%m-%dT%H:%M:%S.%fZ'),
                "is_racker": is_racker,
                "is_impersonator": False,
                "roles": roles,
            }

            if not is_racker:

                # Save tenant id for customer
                user_data["tenant_id"] = (json_catalog["access"]
                                                      ["token"]
                                                      ["tenant"]
                                                      ["id"])

                # Get Pilot Header
                user_data["pilot_header"] = get_pilot_header(
                    user_data['authtoken'],
                    user_data['tenant_id'])

                identity = Identity(self._identity_url)

                # Check if this authtoken is impersonated
                impersonator = identity.get_impersonator(
                    user_data["authtoken"])

                if impersonator:
                    user_data["is_impersonator"] = True
                    user_data["impersonator"] = impersonator["name"]

            return user_data

    def cache_user_data(self):

        timeNow = datetime.utcnow()
        timeExpire = g.user_data["expiration"]
        deltaSeconds = int((timeExpire - timeNow).total_seconds())

        #
        # SAVE AUTH DATA TO CACHE
        #
        current_app.cache.set(
            g.user_data["session_id"],  # Cache Key
            g.user_data,
            timeout=deltaSeconds
        )

    def clear_session(self, session_id):
        # Delete from cache if it exists
        if current_app.cache.get(session_id):
            # Delete Session from Cache
            current_app.cache.delete(session_id)


class LoginBlueprint(SecureBlueprint):
    '''
        Blueprint for Login Endpoints
        These DO NOT REQUIRE AUTHENTICATION but do handle
        creating user sessions, so require methods in SecureBlueprint
    '''
    def register(self, app, options, first_registration=False):
        super(LoginBlueprint, self).register(app,
                                             options,
                                             first_registration)

    def on_before_request(self):

        # call parent method
        super(LoginBlueprint, self).on_before_request()

        if g.user_data:
            # User is authenticated so log them out first
            return redirect(
                self.get_base_url(request, remove_path=True) + "/logout")

        else:
            # User is NOT Authenticated so continue to login page
            return


class CustomerBlueprint(SecureBlueprint):
    '''
        This blueprint is for an authenticated customer or racker
    '''

    def register(self, app, options, first_registration=False):
        super(CustomerBlueprint, self).register(app,
                                                options,
                                                first_registration)

    def on_before_request(self):

        # call parent method
        super(CustomerBlueprint, self).on_before_request()

        if g.user_data:
            current_app.logger.debug('USER IS A CUSTOMER OR RACKER')
            return
        else:
            current_app.logger.debug("CUSTOMER IS NOT AUTHENTICATED REDIRECT")
            return redirect(self.saml_auth.login(
                self.get_base_url(request, remove_path=False)))


class RackerBlueprint(SecureBlueprint):
    '''
        This Blueprint for authenticated RACKERS ONLY
    '''

    def register(self, app, options, first_registration=False):
        super(RackerBlueprint, self).register(app,
                                              options,
                                              first_registration)

    def on_before_request(self):

        # call base method
        super(RackerBlueprint, self).on_before_request()

        if g.user_data:
            if g.user_data['is_racker']:
                current_app.logger.debug('USER IS A RACKER')
                return
            else:
                abort(403)
        else:
            current_app.logger.debug(
                'NO CURRENT USER - URL IS:{0}'.format(request.url))
            return redirect(self.saml_auth.login(
                self.get_base_url(request, remove_path=False)))


class ProxyBlueprint(SecureBlueprint):
    '''
        This blueprint is for API proxy requests
    '''

    def register(self, app, options, first_registration=False):
        super(ProxyBlueprint, self).register(app,
                                             options,
                                             first_registration)

    def on_before_request(self):

        # call parent method
        super(ProxyBlueprint, self).on_before_request()

        if g.user_data:
            current_app.logger.debug('PROXY REQUEST IS A CUSTOMER OR RACKER')
            return
        else:
            current_app.logger.debug("PROXY REQUEST NOT AUTHENTICATED")
            abort(403)


class SamlBlueprint(SecureBlueprint):
    '''
        This blueprint is for SAML ENDPOINTS
    '''

    def register(self, app, options, first_registration=False):
        super(SamlBlueprint, self).register(app,
                                            options,
                                            first_registration)

    def on_before_request(self):

        # call parent method
        super(SamlBlueprint, self).on_before_request()

    def SAML_decode_logout_request(self, saml_request):
        """ decode and maybe decompress the request body """

        decoded_request = b64decode(saml_request)

        try:
            return decompress(decoded_request, -15)
        except Exception:
            return decoded_request

    def SAML_process_logout_request(self):
        '''
            HANDLE BACK CHANNEL LOGOUT POST FROM ASTRA
            We recieve this message when the user has logged out
            of another control panel, and must end their SAML session.
            AN HTTP POST is not supported by the SAML Library, so
            we have to manually process it.
        '''

        current_app.logger.debug(
            'SAML_process_logout_request - POST DATA:{0}'.format(
                self.saml_req)
        )
        saml_data = self.saml_req.get("post_data").get('SAMLRequest', None)

        if saml_data is None:
            current_app.logger.debug('>>>>>>>> SAML REQUEST NOT FOUND')
            return abort(400)

        settings = OneLogin_Saml2_Settings(
            custom_base_path=current_app.config["SAML_PATH"])

        logout_request = OneLogin_Saml2_Logout_Request(settings, saml_data)

        if not logout_request.is_valid({}):
            current_app.logger.debug('>>>>>>>> SAML REQUEST IS NOT VALID')
            return abort(400)

        data = self.SAML_decode_logout_request(saml_data)

        for session_index in \
                OneLogin_Saml2_Logout_Request.get_session_indexes(data):

            current_app.logger.debug(
                "*** LOGOUT SESSION: {0}".format(session_index))
            self.clear_session(session_index)

        saml_response = OneLogin_Saml2_Logout_Response(settings)
        saml_response.build(OneLogin_Saml2_Logout_Request.get_id(data))

        response = make_response(
            urllib.urlencode(
                {'SAMLResponse': saml_response.get_response(False)}
            )
        )
        response.headers['Content-Type'] = 'application/x-www-form-urlencoded'

        return response

    def SAML_process_authentication_response(self):
        '''
            This is called when Astra posts a SAML message that gives
            us the OK that the user has been authenticated successfully.
            We then create a session for the user and return a redirect
            to the user's browser to go to the correct page on our site.
        '''

        self.saml_auth.process_response()
        errors = self.saml_auth.get_errors()

        current_app.logger.debug('MESSAGE:{0}'.format(
            request.form['RelayState']))
        current_app.logger.debug('SAML-INDEX:{0}'.format(
            self.saml_auth.get_session_index()))

        g.user_data = None

        if len(errors) > 0:

            # Encountered An Error Authenticating

            current_app.logger.debug("***** SAML DEBUG START *****")

            current_app.logger.error(
                "SAML ERROR ENCOUNTERED, IS IDP PUBLIC KEY UP TO DATE?")

            current_app.logger.error("SAML ERROR IS: {0}".format(
                ', '.join(errors)))

            current_app.logger.error(
                "SAML ERROR LAST REASON IS: {0}".format(
                    self.saml_auth.get_last_error_reason()))

            current_app.logger.debug(
                "Last SAML request XML: {0}".format(
                    self.saml_auth.get_last_request_xml()))

            current_app.logger.debug(
                "Last SAML response XML: {0}".format(
                    self.saml_auth.get_last_response_xml()))

            current_app.logger.debug("***** SAML DEBUG END *****")

            abort(403)

        else:

            user_data = None
            samlUserdata = self.saml_auth.get_attributes()

            session_id = self.saml_auth.get_session_index()
            tenant_id = samlUserdata['ddi'][0]
            authtoken = samlUserdata['auth_token'][0]

            identity = Identity(self._identity_url)

            service_catalog = identity.auth_tenant_id_and_token(
                tenant_id,
                authtoken)

            if service_catalog:
                user_data = self.create_user_data(
                    session_id,
                    service_catalog,
                    True)

                user_data["expiration"] = (
                    datetime.utcfromtimestamp(
                        OneLogin_Saml2_Utils.parse_SAML_to_time(
                            samlUserdata['token_expiry'][0])
                    )
                )

                user_data["samlUserdata"] = samlUserdata,
                user_data["samlNameId"] = self.saml_auth.get_nameid()

                # Save User Data to Cache
                g.user_data = user_data
                self.cache_user_data()

            if 'RelayState' in request.form:
                current_app.logger.debug('****** RELAY STATE *****')
                current_app.logger.debug(
                    'REDIRECT TO:{0}'.format(request.form['RelayState']))

            if 'RelayState' in request.form:
                return redirect(
                    self.saml_auth.redirect_to(request.form['RelayState']))
            else:
                return redirect(self.get_base_url(request, remove_path=True))

    def SAML_send_logout_request(self):
        '''
            Logout locally, and send a logout message to Astra
        '''

        session_id = None
        is_saml = None
        name_id = None

        if g.user_data:
            session_id = g.user_data.get("session_id", None)
            is_saml = g.user_data.get("is_saml", False)
            name_id = g.user_data.get("samlNameId", None)

            # Clear Local CP Session
            g.user_data = None

        if session_id:

            self.clear_session(session_id)

            if is_saml:
                # Call SAML Logout
                return redirect(self.saml_auth.logout(
                    session_index=session_id,
                    name_id=name_id,
                    return_to=self.get_base_url(request, remove_path=True)
                ))
            else:
                # Non-SAML Session, go to our login page
                return redirect(
                    self.get_base_url(request, remove_path=True) + "/login")
        else:
            return redirect(self.get_base_url(request, remove_path=True))

    def SAML_process_authentication_logout(self):
        '''
            This is called when Astra confirms the logout request
        '''

        def clear_session_callback():
            self.clear_session(g.user_data["session_id"])

            # Remove User Data
            g.user_data = None

        url = self.saml_auth.process_slo(
            delete_session_cb=clear_session_callback)
        errors = self.saml_auth.get_errors()

        current_app.logger.debug('REDIRECT URL:{0}'.format(url))

        if len(errors) == 0:
            return redirect(url or self.get_base_url(
                request, remove_path=True))

        # Encountered An Error Authenticating
        abort(403)
