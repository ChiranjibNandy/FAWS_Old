from flask import Flask, render_template, current_app, request
from opdash.controllers.errors import register_error_handlers
from opdash.controllers.proxy import register_api_proxy
from opdash.controllers.unsecure import register_unsecure_routes
from configs import load_configuration

from flask import Response


def build_app():
    """Build the flask application"""
    app = Flask(__name__)

    # Load Application Configuration
    load_configuration(app)

    context = None
    ssl_key = app.config.get('SSL_KEY', None)
    ssl_crt = app.config.get('SSL_CRT', None)

    if ssl_key and ssl_crt:
        context = (ssl_crt, ssl_key)

    register_api_proxy(app)
    register_error_handlers(app)
    register_unsecure_routes(app)

    return app, context


def main():
    """Main entry point for the flask dashboard.

    Creates a new flask application then starts the application on the
    configured host, port and debug settings. Optionally includes the ssl
    certificate if it is available.
    """
    app, context = build_app()
    app.run(host=app.config['HOST'],
            port=app.config['PORT'],
            ssl_context=context,
            debug=app.config['DEBUG'],
            use_reloader=app.config['USE_RELOADER'])


if __name__ == '__main__':
    main()
