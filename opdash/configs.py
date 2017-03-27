from uuid import uuid4
from os import environ


def load_configuration(app):

    app.config.from_object('opdash.configs.BaseConfig')

    # Loads source-control storable default values for
    # the current deployment environment
    deploy_environ = environ.get('UI_DEPLOY_ENVIRON', None)
    if deploy_environ:
        app.config.from_object('opdash.configs.' + deploy_environ)

    # Used to show what GIT build is currently deployed
    # ALSO used as a cache buster for static files
    app.config['GIT_HASH'] = environ.get('GIT_GUID', uuid4())

    # Load Secret Values from environent variables
    app.config['SSL_KEY'] = environ.get('UI_SSL_KEY', None)
    app.config['SSL_CRT'] = environ.get('UI_SSL_CERT', None)

    # DONT BELIEVE THESE ARE NEEDED ANYMORE
    # app.config['CSRF_SESSION_KEY'] = environ.get(
    #     'UI_CSRF_SESSION_KEY', uuid4())
    # app.config['SECRET_COOKIE_KEY'] = environ.get(
    #     'UI_SECRET_COOKIE_KEY', uuid4())

    app.config['SESSION_COOKIE_DOMAIN'] = environ.get(
        'SESSION_COOKIE_DOMAIN', None)


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

    IDENTITY_URL = "https://identity-internal.api.rackspacecloud.com/v2.0"

    # PILOT HEADER CONFIGURATION ITEMS
    PILOT = {
        "PILOT_URL": 'https://prod.pilot.api.rackspacecloud.com/v1/',
        "PRODUCT": '',  # we don't have a product in the menu yet
        "MYCLOUD_URL": 'https://mycloud.rackspace.com',
        "LOGOUT_URL": '/logout',
    }

    # Application threads. A common general assumption is using 2 per available
    # processor core - to handle incoming requests using one and performing
    # background operations using the other.
    THREADS_PER_PAGE = 2

    # Enable protection against Cross-site Request Forgery
    CSRF_ENABLED = True

    # Session Cookie Settings
    SESSION_COOKIE_NAME = 'migrate-session'
    SESSION_DOMAIN = None

    if environ.get("SESSION_TYPE", None) == 'redis':

        # Set Cache to use AWS Redis Host
        CACHE_CONFIG = {
            "CACHE_TYPE": 'redis',
            "CACHE_KEY_PREFIX": 'opdash-session',
            "CACHE_REDIS_HOST": environ.get(
                "AWS_REDIS_HOST",
                '0.0.0.0'),
        }

    else:

        # Use File System Cache (FOR DEV ONLY)
        CACHE_CONFIG = {
            "CACHE_TYPE": "filesystem",
            "CACHE_DIR": "./session"
        }


class DebugConfig(object):
    DEBUG = True
    USE_RELOADER = True


class DockerConfig(object):
    PORT = 5000


class LocalConfig(object):
    DEBUG = True
    USE_RELOADER = True
    API_BASE_URL = 'http://0.0.0.0:5000'
