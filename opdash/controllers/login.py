from flask import render_template, request, redirect, current_app, g
from opdash.auth.identity import Identity
from opdash.controllers.base import LoginBlueprint
from uuid import uuid4
import json

mod = LoginBlueprint('login', __name__)


@mod.route('/login', methods=['GET'])
def login_get():
    """Show index page"""

    return render_template('login.html')


@mod.route('/login', methods=['POST'])
def login_post():
    """Show index page"""
    user_type = request.form["user_type"]

    username = request.form["username"]
    rsa_token = request.form["rsa_token"]
    password = request.form["password"]

    sso_username = request.form["sso_username"]
    sso_pin = request.form["sso_pin"]

    service_catalog = None

    error_message = "Login was not correct."

    identity = Identity(current_app.config["IDENTITY_URL"])

    if user_type == 'racker' and username and rsa_token:

        service_catalog = identity.auth_racker_username_and_token(
            username, rsa_token)

        if service_catalog is None:
            error_message = "Username or rsa token is not correct."

    elif user_type == 'customer' and username and password:

            service_catalog = identity.auth_username_and_password(
                username, password)

            if service_catalog is None:
                error_message = "Username or password is not correct."

    elif user_type == 'impersonate' and username and sso_username and sso_pin:

            current_app.logger.debug(
                'IMPERSONATE: \n\tsso_username:{0}\n\tsso_pin:{1}'.format(
                    sso_username, sso_pin))

            racker_service_catalog = identity.auth_racker_username_and_token(
                sso_username, sso_pin)

            if racker_service_catalog:
                racker_service_catalog = json.loads(racker_service_catalog)
                racker_token = racker_service_catalog["access"]["token"]["id"]
                impersonate_result = identity.impersonate_user(
                    username, racker_token)

                if impersonate_result:
                    impersonate_result = json.loads(impersonate_result)

                    # Get Impersonation Token
                    token = impersonate_result['access']['token']['id']

                    tenants_result = identity.get_tenants_for_token(token)

                    if tenants_result:
                        tenants_result = json.loads(tenants_result)
                        tenant_id = \
                            tenants_result["tenants"][0]["RAX-AUTH:domainId"]

                        service_catalog = identity.auth_tenant_id_and_token(
                            tenant_id, token)

                        if service_catalog is None:
                            error_message = \
                                "Unable to get catalog for impersonated user."

                    else:
                        error_message = "Unable to list tenants."

                else:
                    error_message = "Unable to impersonate user."

            else:
                error_message = "SSO Username or Pin is not correct."

    if service_catalog:
        current_app.logger.debug('LOGIN - IS AUTHENTICATED')
        user_data = mod.create_user_data(
            str(uuid4()),
            service_catalog,
            False)

        # Save User Data to Cache
        g.user_data = user_data
        mod.cache_user_data()

        return current_app.make_response(
            redirect(mod.get_base_url(request, remove_path=True)))

    current_app.logger.error("{0} -- {1}".format(error_message, username))

    return render_template('login.html', error_message=error_message)
