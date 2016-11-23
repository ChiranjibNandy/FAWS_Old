import os
import unittest
import mock

import opdash.session_managers as session_managers


class TestSessionManagers(unittest.TestCase):

    def setUp(self):
        pass

    def tearDown(self):
        pass

    def runTest(self):
        pass

    def test_no_env_setting_uses_default_manager(self):
        default_session_interface = mock.Mock()
        app = mock.Mock()
        app.session_interface = default_session_interface

        session_managers.configure_session_provider(app)

        self.assertEqual(default_session_interface, app.session_interface)

    @mock.patch.dict(os.environ, {'SESSION_PROVIDER': 'asdfzxcfv'})
    def test_unknown_env_setting_uses_default_manager(self):
        default_session_interface = mock.Mock()
        app = mock.Mock()
        app.session_interface = default_session_interface

        session_managers.configure_session_provider(app)

        self.assertEqual(default_session_interface, app.session_interface)

    @mock.patch.dict(os.environ, {'SESSION_PROVIDER': 'redis'})
    def test_env_setting_of_redis_uses_redis_manager(self):
        app = mock.Mock()
        app.session_interface = mock.Mock()

        session_managers.configure_session_provider(app)

        self.assertEqual(type(app.session_interface),
                         session_managers.RedisSessionInterface)
