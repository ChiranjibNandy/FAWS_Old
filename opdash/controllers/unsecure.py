from flask import render_template, request, redirect, current_app
from opdash.auth.identity import Identity
from opdash.controllers.base import UnsecureBlueprint

mod = UnsecureBlueprint('unsecure', __name__)


@mod.route('/health')
def health():
    """Return health check"""
    return 'OK', 200


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
            mod.update_session_user(service_catalog)
            return current_app.make_response(
                redirect(mod.get_base_url()))

    current_app.logger.error("{0} -- {1}".format(error_message, username))

    return render_template('login.html', error_message=error_message)


@mod.route('/logout', methods=['GET'])
def logout():
    mod.logout()
    return redirect(mod.get_base_url() + "/login")
