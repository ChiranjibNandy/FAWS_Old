from flask import current_app
import requests
import json


class Identity(object):

    def __init__(self, identity_url):

        self._identity_url = identity_url

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
                "content-type": "application/json"
            }
        )

        service_catalog = None

        if response.status_code == requests.codes.ok:
            service_catalog = response.text
        else:
            current_app.logger.error(
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
                "content-type": "application/json"
            }
        )

        service_catalog = None

        if response.status_code == requests.codes.ok:
            service_catalog = response.text
        else:
            current_app.logger.error(
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
                "content-type": "application/json"
            }
        )

        service_catalog = None

        if response.status_code == requests.codes.ok:
            service_catalog = response.text
        else:
            current_app.logger.error(
                "auth_username_and_apikey - identity returned:{status}".format(
                    status=response.status_code))

        return service_catalog
