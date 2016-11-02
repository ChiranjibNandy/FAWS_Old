from flask import Flask, abort, render_template
from .views.errors import ErrorHandlers


def build_app():
    """Build the flask application.

    WARNING: Do not change the signature here without updating the ansible
             deployment playbook as well.
    """
    app = Flask(__name__)
    app.config.from_object('opdash.configs.BaseConfig')
    app.config.from_envvar('OPDASH_CONFIG', silent=True)

    context = None
    ssl_key = app.config.get('ssl_key', None)
    ssl_crt = app.config.get('ssl_crt', None)

    if(ssl_key and ssl_crt):
        context = (ssl_crt, ssl_key)

    @app.route('/health')
    def health():
        return 'OK', 200

    @app.route('/base')
    def base_template():
        return render_template('_template_base.html')

    @app.route('/help')
    def help_template():
        return render_template('_template_help.html')

    @app.route('/full')
    def full_template():
        return render_template('_template_full.html')

    @app.route('/')
    def index():
        return render_template('index.html')

    ErrorHandlers(app)

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
