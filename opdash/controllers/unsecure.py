from flask import render_template, request, redirect, session, current_app, g
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

    username = request.form['username']
    rsa_token = request.form['rsa_token']

    error_message = "Login was not correct."

    if username and rsa_token:

        identity = Identity(current_app.config["IDENTITY_URL"])
        service_catalog = identity.auth_racker_username_and_token(
            username, rsa_token)

        current_app.logger.debug('LOGIN - IS AUTHENTICATED')

        if service_catalog:
            mod.update_session_user(service_catalog)
            response = current_app.make_response(redirect('/'))
            return response
        else:
            error_message = "Username or rsa token is not correct."

    current_app.logger.error("{0} -- {1}".format(error_message, username))

    return render_template('login.html', error_message=error_message)


@mod.route('/logout', methods=['GET'])
def logout():
    g.user_data = None
    session.clear()
    return redirect('/login')
