from flask import Blueprint, g, redirect, abort, request, current_app
from uuid import uuid4
import json
import urlparse
from datetime import datetime

from opdash.rax.pilot import get_pilot_header


class UnsecureBlueprint(Blueprint):
    '''
        Base Blueprint, use for pages that DO NOT REQUIRE authentication
    '''

    def on_before_request(self):

            current_app.logger.debug('&&& SamlBlueprint - on_before_request')

            # self.req = self.prepare_flask_request(request)
            # self.auth = self.init_saml_auth(self.req)

            g.user_data = None

            cookie_session_id = request.cookies.get(
                current_app.config['SESSION_COOKIE_NAME'], None)

            if (cookie_session_id):

                current_app.logger.debug(
                    '@@@@@@@@ FOUND A COOKIE:{0}'.format(cookie_session_id))

                user_data = current_app.cache.get(cookie_session_id)

                if user_data:

                    #
                    # Session FOUND in cache, restore data and proceed
                    #
                    current_app.logger.debug('PULLED DATA FROM CACHE')
                    g.user_data = user_data

                    # logging.debug('****** JSON DATA START ********')
                    # logging.debug(
                    #     json.dumps(
                    #         request.environ["rax_auth"]["service_catalog"],
                    #         sort_keys=True, indent=2, separators=(',', ': ')
                    #     )
                    # )
                    # logging.debug('****** JSON DATA STOPS ********')

            if not g.user_data:

                current_app.logger.debug(
                    "****** BASE NOT AUTHENTICATED ******")
                return self.handleNotAuthenticated()

    def register(self, app, options, first_registration=False):

        self._app = app
        self._identity_url = app.config["IDENTITY_URL"]

        # Prepare Each Request
        self.before_request(self.on_before_request)
        self.after_request(self.on_after_request)

        super(UnsecureBlueprint, self).register(
            app, options, first_registration)

    def samlExpiryToDT(self, samlExpiration):
        return datetime.strptime(samlExpiration, '%Y-%m-%dT%H:%M:%S.%fZ')
        # return datetime.datetime.utcfromtimestamp(
        #     OneLogin_Saml2_Utils.parse_SAML_to_time(samlExpiration))

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
                    expires=self.samlExpiryToDT(
                        g.user_data["expires"]),
                )
                return response

            current_app.logger.debug('--- NO AUTH - SO CLEAR COOKIE ---')

            g.rax_auth = None

            # if NO userData clear session cookie
            response.delete_cookie(
                current_app.config['SESSION_COOKIE_NAME'],
                domain=current_app.config['SESSION_COOKIE_DOMAIN'],
                path='/')

            return response

    def logout(self):
        # Delete from cache if it exists
        if current_app.cache.get(g.user_data["session_id"]):
            current_app.cache.delete(g.user_data["session_id"])
        g.user_data = None

    def get_base_url(self):
        '''
            Gets the base url of the request.
            Looks for the X-Forwarded-Proto header to see
            if the request came through the load balancer.
            If so, uses the protocol specificed in that header.
        '''
        parsed_url = urlparse.urlparse(request.url)

        # Check for X-Forwarded-Proto header from AWS load balancer
        forwarded_proto = request.headers.get('X-Forwarded-Proto')
        if forwarded_proto:
            # Change scheme and remove port
            parsed_url = parsed_url._replace(
                scheme=forwarded_proto,
                netloc=parsed_url.hostname)

        return "{scheme}://{netloc}".format(
            scheme=parsed_url.scheme,
            netloc=parsed_url.netloc)

    def update_session_user(self, service_catalog):
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
                "username": json_catalog["access"]["user"]["name"],
                "authtoken": json_catalog["access"]["token"]["id"],
                "expires": json_catalog["access"]["token"]["expires"],
                "is_racker": is_racker,
                "roles": roles,
                "session_id": str(uuid4()),
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

            current_app.cache.set(
                user_data["session_id"],  # Cache Key
                user_data,
                timeout=3600  # Cache User Data for 1 Hour
            )

            # Save User Data to session and Flask g
            g.user_data = user_data

    def handleNotAuthenticated(self):
        ''' Allow unauthenticated user '''
        current_app.logger.debug(
            "***** UnsecureBlueprint: Allow Unauthenticated User *****")
        pass


class CustomerBlueprint(UnsecureBlueprint):
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
            return redirect(self.get_base_url() + "/login")


class RackerBlueprint(UnsecureBlueprint):
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
            return redirect(self.get_base_url() + "/login")
