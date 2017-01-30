from flask import Blueprint, g, session, redirect, abort, request
import urlparse
import json

from opdash.rax.pilot import get_pilot_header


class UnsecureBlueprint(Blueprint):
    '''
        Base Blueprint, use for pages that DO NOT REQUIRE authentication
    '''

    def on_before_request(self):
        g.user_data = session.get('user_data', None)

    def register(self, app, options, first_registration=False):

        self._app = app
        self._identity_url = app.config["IDENTITY_URL"]

        # Prepare Each Request
        self.before_request(self.on_before_request)
        self.after_request(self.on_after_request)

        super(UnsecureBlueprint, self).register(
            app, options, first_registration)

    def on_after_request(self, response):
        self._app.logger.debug("***** BASE on_after_request *****")
        return response

    def get_base_url(self):
        '''
            Gets the base url of the request.
            Looks for the X-Forwarded-Proto header to see
            if the request came through the load balancer.
            If so, uses the protocol specificed in that header.
        '''
        parsed_url = urlparse.urlparse(request.url)
        forwarded_proto = request.headers.get('X-Forwarded-Proto')
        if forwarded_proto:
            # Change scheme and remove port
            parsed_url = parsed_url._replace(
                scheme=forwarded_proto,
                netloc=parsed_url.hostname)

        return urlparse.urlunparse(parsed_url)

    def update_session_user(self, service_catalog):
        ''' Save the user_data to session '''
        self._app.logger.debug('** UPDATING SESSION WITH USER')
        json_catalog = json.loads(service_catalog)
        if json_catalog:

            roles = json_catalog["access"]["user"]["roles"]
            is_racker = next(
                (True for role in roles if role['name'] == 'Racker'),
                False  # Default
            )

            session["user_data"] = {
                # Get Racker Info
                "username": json_catalog["access"]["user"]["name"],
                "authtoken": json_catalog["access"]["token"]["id"],
                "is_racker": is_racker,
                "roles": roles,
            }

            if not is_racker:

                # Save tenant id for customer
                session["tenant_id"] = (json_catalog["access"]
                                                    ["token"]
                                                    ["tenant"]
                                                    ["id"])

                # Get Pilot Header for this user
                get_pilot_header(
                    session['user_data']['authtoken'],
                    session['tenant_id'])

            # Save User Data to session and Flask g
            g.user_data = session['user_data']

    def handleNotAuthenticated(self):
        ''' Allow unauthenticated user '''
        self._app.logger.debug(
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
            self._app.logger.debug('USER IS A CUSTOMER OR RACKER')
            return
        else:
            return redirect(self.get_base_url() + "login")


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
                self._app.logger.debug('USER IS A RACKER')
                return
            else:
                abort(403)
        else:
            return redirect(self.get_base_url() + "login")
