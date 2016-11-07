import unittest
import requests_mock
from opdash.auth.identity import Identity


class TestIdentity(unittest.TestCase):

    def setUp(self):
        self._identity_url = "http://identity.rackspace.com/v2"

    def tearDown(self):
        pass

    def runTest(self):
        pass

    @requests_mock.Mocker()
    def test_auth_username_and_password(self, m):

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
