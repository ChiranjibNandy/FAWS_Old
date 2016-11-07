from uuid import uuid4


class BaseConfig(object):
    HOST = '0.0.0.0'
    PORT = 8080
    DEBUG = False
    USE_RELOADER = False

    SSL_CRT = None
    SSL_KEY = None

    # Used as a cache buster, and so we can tell what
    # version of the code we are looking at
    GIT_BRANCH = 'UNKNOWN'
    GIT_HASH = uuid4().hex

    # Application threads. A common general assumption is using 2 per available
    # processor core - to handle incoming requests using one and performing
    # background operations using the other.
    THREADS_PER_PAGE = 2

    # Enable protection against Cross-site Request Forgery
    CSRF_ENABLED = True
    CSRF_SESSION_KEY = 'Crazy Key Goes Here'

    # Secret key for signing cookies
    SECRET_KEY = 'Awesome Secret Here'
