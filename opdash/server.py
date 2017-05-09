import os
from flask import Flask
from opdash.controllers.errors import register_error_handlers

from opdash.controllers import unsecure, customer, racker, saml, login, proxy
from flask_caching import Cache
from opdash.config_loader import import_config_to_env_var_defaults
from opdash.rax.remote_config import RemoteConfig
import waitress
import json


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

    # Load Local Base Config Defaults from File
    app.config.update(
        import_config_to_env_var_defaults(
            RemoteConfig().load(app.root_path + "/config.yml")))

    # Prepare to load override configs (can be remote or local)
    rc = RemoteConfig(
        app.config.get("AWS_ACCESS_KEY_ID", None),
        app.config.get("AWS_SECRET_ACCESS_KEY", None))

    # Get Environment Specific Override Config Settings
    override_config_location = os.environ.get(
        app.config.get('CONFIG_OVERRIDE_ENV_VAR', None), None)

    print "*********************************"
    print "OVERRIDE CONFIG ENV VAR IS:{0}".format(override_config_location)
    print "*********************************"

    # If you have encrypted your local override config
    # (this is highly unlikely unless your name is Matt)
    local_config_encryption_key = os.environ.get(
        os.environ.get('ENCRYPTION_CONFIG_LOCAL_KEY', None),
        None)

    # Load environment specific override configs, if they exist
    if override_config_location:
        override_config = rc.load(override_config_location)
        app.config.update(
            import_config_to_env_var_defaults(
                override_config,
                encryption_key=local_config_encryption_key))

    #  Load SAML Settings
    app.config["saml_settings"] = json.loads(
        rc.load(app.config["SAML_CONFIG_PATH"])
    )

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
    register_error_handlers(app)
    app.register_blueprint(proxy.mod)
    app.register_blueprint(unsecure.mod)
    app.register_blueprint(racker.mod)
    app.register_blueprint(customer.mod)
    app.register_blueprint(saml.mod)
    app.register_blueprint(login.mod)

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
