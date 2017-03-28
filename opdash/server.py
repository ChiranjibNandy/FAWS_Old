import os
from flask import Flask
from opdash.controllers.errors import register_error_handlers
from opdash.controllers.proxy import register_api_proxy

from opdash.controllers import unsecure, customer, racker
from flask_caching import Cache
import opdash.config_loader as cl
import waitress


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

    # Load our default/base config
    # Note: conf_file is a 'hack' to get this to work in both docker and
    # on a developers local if being run directly. We also need to replace pyc
    # to py here in case the user is running py27.
    conf_file = os.path.abspath(__file__).replace(
        'server.pyc', 'server.py').replace('server.py', 'config.yml')
    cl.import_config_to_env_var_defaults(conf_file, alt_config=app.config)

    # If we can, load any overrides specified for our config
    cl.import_config_to_env_var_defaults(
        os.environ.get(cl.config['CONFIG_OVERRIDE_ENV_VAR'], None),
        silent=True)

    # Set up application cache
    app.cache = Cache(config=app.config)
    app.cache.init_app(app)
    with app.app_context():
        app.cache.clear()

    context = None
    ssl_key = app.config.get('FLASK_SSL_KEY', None)
    ssl_crt = app.config.get('FLASK_SSL_CRT', None)

    if ssl_key and ssl_crt:
        context = (ssl_crt, ssl_key)

    # Register Routes and Blueprints
    register_api_proxy(app)
    register_error_handlers(app)
    app.register_blueprint(unsecure.mod)
    app.register_blueprint(racker.mod)
    app.register_blueprint(customer.mod)

    return app, context


def main(app=None, context=None):
    """Main entry point for the flask dashboard.

    Creates a new flask application then starts the application on the
    configured host, port and debug settings. Optionally includes the ssl
    certificate if it is available.
    """
    if app is None and context is None:
        app, context = build_app()

    if app.config.get("FLASK_DEBUG", False):
        # Debug Mode
        app.run(
            host=app.config['FLASK_HOST'],
            port=app.config['FLASK_PORT'],
            ssl_context=context,
            debug=True,
            use_reloader=app.config['FLASK_USE_RELOADER'])
    else:
        # Use Waitress
        waitress.serve(
            app,
            host=app.config.get('FLASK_HOST', None),
            port=app.config.get('FLASK_PORT', None))


if __name__ == '__main__':
    main()
