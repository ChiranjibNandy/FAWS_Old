from flask import Blueprint, g, session, redirect
import json

from opdash.lib.pilot import get_pilot_header

class UnsecureBlueprint(Blueprint):
    '''
        Use this Blueprint for pages that DO NOT REQUIRE authenication
    '''

    def register(self, app, options, first_registration=False):

        self._app = app
        self._identity_url = app.config["IDENTITY_URL"]

        def on_before_request():

            self._app.logger.debug('>>>>>> on_before_request')

            print "PILOT HEADER IS:"
            print session.get("pilot_header", "NOTHING HERE")

            g.user_data = session.get('user_data', None)

            if g.user_data:
                # User has an existing session
                # TODO: check authtoken expiration here
                return

            self._app.logger.debug("****** BASE USER NOT AUTHENTICATED ******")
            g.user_data = None
            return self.handleNotAuthenticated()

        def on_after_request(response):

            self._app.logger.debug('<<<<<< on_after_request')
            return response

        # Prepare Each Request
        self.before_request(on_before_request)
        self.after_request(on_after_request)

        super(UnsecureBlueprint, self).register(
            app, options, first_registration)

    def update_session_user(self, service_catalog):
        ''' Save the user_data to session '''
        self._app.logger.debug('** UPDATING SESSION WITH USER')
        json_catalog = json.loads(service_catalog)
        if json_catalog:

            roles = json_catalog["access"]["user"]["roles"]
            is_racker = next(
                (True for role in roles if role['name'] == 'Racker'),
                False # Default
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
                session["tenant_id"] = json_catalog["access"] \
                                                   ["token"] \
                                                   ["tenant"] \
                                                   ["id"]

                # Get Pilot Header for this user
                get_pilot_header(
                    session['user_data']['authtoken'],
                    session['tenant_id'])

            # Save User Data to session and Flask g
            g.user_data = session['user_data']

    def handleNotAuthenticated(self):
        ''' Allow unauthenticated user '''
        self._app.logger.debug(
            "***** UnsecureBlueprint:handleNotAuthenticated *****")
        pass


class SecureBlueprint(UnsecureBlueprint):
    '''
        Use this Blueprint for secure pages for a Racker
    '''

    def register(self, app, options, first_registration=False):
        super(SecureBlueprint, self).register(app, options, first_registration)

    def handleNotAuthenticated(self):
        ''' Deny unauthenticated user '''
        self._app.logger.debug(
            "***** SecureBlueprint:handleNotAuthenticated *****")
        return redirect('/login')
