from flask import Flask
from opdash.controllers.errors import register_error_handlers
from opdash.controllers.proxy import register_api_proxy
from opdash.configs import load_configuration

from opdash.controllers import unsecure, customer, racker
from flask_session import Session

class FlaskOpdash(Flask):
    '''
        Jinja and Angular both use the double braces {{variable}}
        delimiter. So here we are changing the Jinja variable delimeter
        to {!variable!} so it does not conflict with Angular delimiter.
    '''
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update(dict(
        # REMOVE CONFLICT WITH ANGULAR BY
        # CHANGING JINJA VARIABLE DELIMITER
        variable_start_string='{!',
        variable_end_string='!}',
    ))


def build_app():
    """Build the flask application"""
    app = FlaskOpdash(__name__)

    # Load Application Configuration
    load_configuration(app)

    context = None
    ssl_key = app.config.get('SSL_KEY', None)
    ssl_crt = app.config.get('SSL_CRT', None)

    if ssl_key and ssl_crt:
        context = (ssl_crt, ssl_key)

    # Register Routes and Blueprints
    register_api_proxy(app)
    register_error_handlers(app)
    app.register_blueprint(unsecure.mod)
    app.register_blueprint(racker.mod)
    app.register_blueprint(customer.mod)

    # Create Session
    Session(app)

    return app, context


def main(app=None, context=None):
    """Main entry point for the flask dashboard.

    Creates a new flask application then starts the application on the
    configured host, port and debug settings. Optionally includes the ssl
    certificate if it is available.
    """
    if app is None and context is None:
        app, context = build_app()

    app.run(host=app.config['HOST'],
            port=app.config['PORT'],
            ssl_context=context,
            debug=app.config['DEBUG'],
            use_reloader=app.config['USE_RELOADER'])


if __name__ == '__main__':
    main()
