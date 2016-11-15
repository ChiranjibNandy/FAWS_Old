from uuid import uuid4
from os import environ

def load_configuration(app):

    app.config.from_object('opdash.configs.BaseConfig')

    # Loads source-control storable default values for
    # the current deployment environment
    deploy_environ = environ.get('UI_DEPLOY_ENVIRON', None)
    if deploy_environ:
        app.config.from_object('opdash.configs.' + deploy_environ)

    # Load Secret Values from environent variables
    app.config['SSL_KEY'] = environ.get('UI_SSL_KEY', None)
    app.config['SSL_CRT'] = environ.get('UI_SSL_CERT', None)
    app.config['CSRF_SESSION_KEY'] = environ.get(
        'UI_CSRF_SESSION_KEY', uuid4())
    app.config['SECRET_COOKIE_KEY'] = environ.get(
        'UI_SECRET_COOKIE_KEY', uuid4())


class BaseConfig(object):
    """
        Base configuration object.
        Secret values should be set by environmental variables
    """

    HOST = '0.0.0.0'
    PORT = 8000
    DEBUG = False
    USE_RELOADER = False

    API_BASE_URL = environ.get(
        'API_BASE_URL',
        'http://opdash-api-dev.us-east-1.elasticbeanstalk.com'
    )

    # Application threads. A common general assumption is using 2 per available
    # processor core - to handle incoming requests using one and performing
    # background operations using the other.
    THREADS_PER_PAGE = 2

    # Enable protection against Cross-site Request Forgery
    CSRF_ENABLED = True

class DebugConfig(object):
    DEBUG = True
    USE_RELOADER = True
    #API_BASE_URL = 'http://0.0.0.0:9000'
