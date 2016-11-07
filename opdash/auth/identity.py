from flask import current_app
import requests
import json


class Identity:

    def __init__(self, identity_url):

        self._identity_url = identity_url

    def auth_username_and_password(self, username, password):
        """
            This function authenticates the user using the
            a username and password. Returns service_catalog.

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

        if(response.status_code == requests.codes.ok):
            service_catalog = response.text
        else:
            current_app.logger.error(
                "auth_username_and_password - " +
                "identity returned:{status}".format(
                    status=response.status_code))

        return service_catalog

    def auth_tenantid_and_token(self, tenant_id, token):

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

        if(response.status_code == requests.codes.ok):
            service_catalog = response.text
        else:
            current_app.logger.error(
                "auth_tenantid_and_token - identity returned:{status}".format(
                    status=response.status_code))

        return service_catalog

    def auth_username_and_apikey(self, username, apikey, tenant_id=None):

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

        if(response.status_code == requests.codes.ok):
            service_catalog = response.text
        else:
            current_app.logger.error(
                "auth_username_and_apikey - identity returned:{status}".format(
                    status=response.status_code))

        return service_catalog
