from flask import render_template, request, redirect, current_app, g
from opdash.auth.identity import Identity
from opdash.controllers.base import LoginBlueprint
from uuid import uuid4

mod = LoginBlueprint('login', __name__)


@mod.route('/login', methods=['GET'])
def login_get():
    """Show index page"""
    return render_template('login.html')


@mod.route('/login', methods=['POST'])
def login_post():
    """Show index page"""
    current_app.logger.debug('USERNAME:{0}'.format(request.form['username']))
    current_app.logger.debug('PASSWORD:{0}'.format(request.form['rsa_token']))

    username = request.form["username"]
    rsa_token = request.form["rsa_token"]
    is_racker = request.form["user_type"] == "racker"

    error_message = "Login was not correct."

    if username and rsa_token:

        identity = Identity(current_app.config["IDENTITY_URL"])

        if is_racker:
            service_catalog = identity.auth_racker_username_and_token(
                username, rsa_token)

            if service_catalog is None:
                error_message = "Username or rsa token is not correct."

        else:
            service_catalog = identity.auth_username_and_password(
                username, rsa_token)

            if service_catalog is None:
                error_message = "Username or password is not correct."

        current_app.logger.debug('LOGIN - IS AUTHENTICATED')

        if service_catalog:
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
