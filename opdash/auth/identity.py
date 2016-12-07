import requests
import json
import logging


class Identity(object):

    def __init__(self, identity_url):

        self._identity_url = identity_url
        self.logger = logging.getLogger(__name__)

    def auth_username_and_password(self, username, password):
        """
            Authenticates the user using a username and password.
            Returns the service catalog.

            :params username
            :params password
        """

        data = {
            "auth": {
                "passwordCredentials": {
                    "username": username,
                    "password": password
                }
            }
        }

        response = requests.post(
            "{identity_url}/tokens".format(
                identity_url=self._identity_url),
            data=json.dumps(data),
            headers={
                "Content-Type": "application/json"
            }
        )

        service_catalog = None

        if response.status_code == requests.codes.ok:
            service_catalog = response.text
        else:
            self.logger.error(
                "auth_username_and_password - " +
                "identity returned:{status}".format(
                    status=response.status_code))

        return service_catalog

    def auth_tenant_id_and_token(self, tenant_id, token):
        """
            Authenticates the user using the tenant_id and authtoken.
            Returns the service catalog.

            :params tenant_id
            :params token
        """

        data = {
            "auth": {
                "tenantId": tenant_id,
                "token": {
                    "id": token
                }
            }
        }

        response = requests.post(
            "{identity_url}/tokens".format(
                identity_url=self._identity_url),
            data=json.dumps(data),
            headers={
                "Content-Type": "application/json"
            }
        )

        service_catalog = None

        if response.status_code == requests.codes.ok:
            service_catalog = response.text
        else:
            self.logger.error(
                "auth_tenantid_and_token - identity returned:{status}".format(
                    status=response.status_code))

        return service_catalog

    def auth_username_and_apikey(self, username, apikey, tenant_id=None):
        """
            Authenticates the user using the username, api_key.
            The tenant_id is optional. (Some services may require it.)
            Returns the service catalog.

            :params username
            :params apikey
            :params tenant_id (default None)
        """

        data = {
            "auth": {
                "RAX-KSKEY:apiKeyCredentials": {
                    "username": username,
                    "apiKey": apikey
                }
            },
        }
        if tenant_id is not None:
            data["tenantId"] = tenant_id

        response = requests.post(
            "{identity_url}/tokens".format(
                identity_url=self._identity_url),
            data=json.dumps(data),
            headers={
                "Content-Type": "application/json"
            }
        )

        service_catalog = None

        if response.status_code == requests.codes.ok:
            service_catalog = response.text
        else:
            self.logger.error(
                "auth_username_and_apikey - identity returned:{status}".format(
                    status=response.status_code))

        return service_catalog

    def auth_racker_username_and_token(self, username, rsa_token):
        """
            Authenticates a Racker using their username and RSA token.
            (REQUIRES RACKSPACE INTERNAL IDENTITY)
            Returns the service catalog.

            :params username
            :params rsa_token (pin + rsa token)
        """

        data = {
            "auth": {
                "RAX-AUTH:domain": {
                    "name": "Rackspace"
                },
                "RAX-AUTH:rsaCredentials": {
                    "username": username,
                    "tokenKey": rsa_token
                }
            }
        }

        response = requests.post(
            "{identity_url}/tokens".format(
                identity_url=self._identity_url),
            data=json.dumps(data),
            headers={
                "Content-Type": "application/json"
            }
        )

        service_catalog = None

        if response.status_code == requests.codes.ok:
            service_catalog = response.text
        else:
            self.logger.error(
                "auth_username_and_apikey - identity returned:{status}".format(
                    status=response.status_code))

        return service_catalog

    def impersonate_user(self, username, authtoken,
                         token_expiration_seconds=10800):
        """
            Impersonates a user. Requires an authtoken for the impersonator,
            and the username of the user you want to impersonate.
            (REQUIRES RACKSPACE INTERNAL IDENTITY)
            Returns impersonation response.

            :params username
            :params authtoken
            :params token_expiration_seconds (default 10800)
        """

        data = {
            "RAX-AUTH:impersonation": {
                "user": {
                    "username": username
                },
                "expire-in-seconds": token_expiration_seconds
            }
        }

        response = requests.post(
            "{identity_url}/RAX-AUTH/impersonation-tokens".format(
                identity_url=self._identity_url),
            data=json.dumps(data),
            headers={
                "X-Auth-Token": authtoken,
                "Content-Type": "application/json"
            }
        )

        response_text = None

        if response.status_code == requests.codes.ok:
            response_text = response.text
        else:
            self.logger.error(
                "impersonate_user - " +
                "identity returned:{status}".format(
                    status=response.status_code))

        return response_text
