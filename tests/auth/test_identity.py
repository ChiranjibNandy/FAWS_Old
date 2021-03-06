import unittest
import requests_mock
from opdash.auth.identity import Identity
from flask import Flask


class TestIdentity(unittest.TestCase):

    def setUp(self):
        self._identity_url = "https://identity.com/v2.0"
        self.app = Flask(__name__)

    def tearDown(self):
        pass

    def runTest(self):
        pass

    @requests_mock.Mocker()
    def test_auth_username_and_password(self, m):
        """Test auth using username and password"""
        with self.app.app_context():
            expected_result = "{'service':'catalog'}"
            m.register_uri(
                'POST',
                '{identity_url}/tokens'.format(
                    identity_url=self._identity_url),
                text=expected_result)
            identity = Identity(self._identity_url)
            service_catalog = identity.auth_username_and_password(
                username="username",
                password="password"
            )
            self.assertEqual(expected_result, service_catalog)

    @requests_mock.Mocker()
    def test_auth_tenant_id_and_token(self, m):
        """Test auth using tenant_id and password"""
        with self.app.app_context():
            expected_result = "{'service':'catalog'}"
            m.register_uri(
                'POST',
                '{identity_url}/tokens'.format(
                    identity_url=self._identity_url),
                text=expected_result)
            identity = Identity(self._identity_url)
            service_catalog = identity.auth_tenant_id_and_token(
                tenant_id="123456",
                token="ABC123"
            )
            self.assertEqual(expected_result, service_catalog)

    @requests_mock.Mocker()
    def test_auth_username_and_apikey(self, m):
        """Test auth using username and apikey"""
        with self.app.app_context():
            expected_result = "{'service':'catalog'}"
            m.register_uri(
                'POST',
                '{identity_url}/tokens'.format(
                    identity_url=self._identity_url),
                text=expected_result)
            identity = Identity(self._identity_url)
            service_catalog = identity.auth_username_and_apikey(
                username="username",
                apikey="ABC123",
                tenant_id="123456"
            )
            self.assertEqual(expected_result, service_catalog)
