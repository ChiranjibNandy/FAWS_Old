from uuid import uuid4

class BaseConfig(object):
    HOST='0.0.0.0'
    PORT=8080
    DEBUG=False
    USE_RELOADER=False

    # Used as a cache buster, and so we can tell what
    # version of the code we are looking at
    GIT_BRANCH='UNKNOWN'
    GIT_HASH=uuid4().hex
