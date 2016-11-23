import os
import pickle
from datetime import timedelta
from uuid import uuid4
from redis import Redis
from werkzeug.datastructures import CallbackDict
from flask.sessions import SessionInterface
from flask.sessions import SessionMixin


def configure_session_provider(app):
    """Configures the session interface based on an environment variable value

    By default a flask application stores its session in a secure cookie on the
    client. In our case we have some information that we do not want stored
    on our clients browser for security reasons. We get the added benefit that
    our web traffic will be smaller as well.

    :type app: flask.Flask
    :param app: The flask app to configure
    """

    provider = os.environ.get('SESSION_PROVIDER', '').lower()
    app.logger.debug('Session Provider Setting: "{provider}"'.format(
        provider=provider))
    if provider == 'redis':
        app.logger.info('Using redis session provider.')
        app.session_interface = RedisSessionInterface()


class RedisSession(CallbackDict, SessionMixin):
    # NOTE: Taken from http://flask.pocoo.org/snippets/75/
    def __init__(self, initial=None, sid=None, new=False):
        def on_update(self):
            self.modified = True

        CallbackDict.__init__(self, initial, on_update)
        self.sid = sid
        self.new = new
        self.modified = False


class RedisSessionInterface(SessionInterface):
    # NOTE: Taken from http://flask.pocoo.org/snippets/75/
    serializer = pickle
    session_class = RedisSession

    def __init__(self, redis=None, prefix='session:'):
        if redis is None:
            host = os.environ.get(
                'AWS_REDIS_HOST',
                'localhost')
            port = os.environ.get('AWS_REDIS_PORT', 6379)
            redis = Redis(host=host, port=port)

        self.redis = redis
        self.prefix = prefix

    @staticmethod
    def generate_sid():
        return str(uuid4())

    @staticmethod
    def get_redis_expiration_time(app, session):
        if session.permanent:
            return app.permanent_session_lifetime
        return timedelta(days=1)

    def open_session(self, app, request):
        sid = request.cookies.get(app.session_cookie_name)
        if not sid:
            sid = self.generate_sid()
            return self.session_class(sid=sid, new=True)

        val = self.redis.get(self.prefix + sid)
        if val is not None:
            data = self.serializer.loads(val)
            return self.session_class(data, sid=sid)

        return self.session_class(sid=sid, new=True)

    def save_session(self, app, session, response):
        domain = self.get_cookie_domain(app)
        if not session:
            self.redis.delete(self.prefix + session.sid)
            if session.modified:
                response.delete_cookie(app.session_cookie_name, domain=domain)
            return

        redis_exp = self.get_redis_expiration_time(app, session)
        cookie_exp = self.get_expiration_time(app, session)
        val = self.serializer.dumps(dict(session))
        self.redis.setex(self.prefix + session.sid,
                         val,
                         int(redis_exp.total_seconds()))
        response.set_cookie(app.session_cookie_name,
                            session.sid,
                            expires=cookie_exp,
                            httponly=True,
                            domain=domain)
