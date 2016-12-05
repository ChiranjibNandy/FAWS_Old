from flask import render_template, request, redirect, session
from opdash.auth.identity import Identity

def register_unsecure_routes(app):

    @app.route('/health')
    def health():
        """Return health check"""
        return 'OK', 200

    @app.route('/base')
    def base_template():
        """Show base template"""
        return render_template('_template_base.html')

    @app.route('/help')
    def help_template():
        """Show help template"""
        return render_template('_template_help.html')

    @app.route('/full')
    def full_template():
        """Show full template"""
        return render_template('_template_full.html')

    @app.route('/login', methods=['GET'])
    def login_get():
        """Show index page"""
        return render_template('login.html')

    @app.route('/login', methods=['POST'])
    def login_post():
        """Show index page"""
        app.logger.debug('USERNAME:{0}'.format(request.form['username']))
        app.logger.debug('PASSWORD:{0}'.format(request.form['password']))

        username =request.form['username']
        password = request.form['password']

        error_message = "Login was not correct."

        if username and password:

            identity = Identity(app.config["IDENTITY_URL"])
            result = identity.auth_username_and_password(username, password)

            if result:
                response = app.make_response(redirect('/'))
                session['is_authenticated'] = True
                return response
            else:
                error_message = "Username or password is not correct."

        app.logger.error("{0} -- {1}".format(error_message, username))

        return render_template('login.html', error_message=error_message)

    @app.route('/angular_demo')
    def angular_demo():
        """Show index page"""
        return render_template('testindex.html')

    @app.route('/angular_app')
    def angular_app():
        """Show index page"""
        return render_template('angindex.html')

    @app.route('/tenant_id')
    def tenant_id():
        """Show index page"""
        return render_template('tenant_id.html')

    @app.route('/')
    def index():
        """Show index page"""
        if session.get('is_authenticated', False):
            return render_template('index.html')
        else:
            app.logger.debug('***** INDEX - NOT AUTHENTICATED *****')
            return redirect('/login')
