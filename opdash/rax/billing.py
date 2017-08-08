from flask import current_app
import requests


def get_account_name(auth_token, tenant_id):

    account_name = None

    try:
        response = requests.get(
            "https://billingv2.api.rackspacecloud.com/v2"
            "/accounts/020-{0}/invoices/latest.json".format(tenant_id),
            headers={
                "X-Auth-Token": auth_token,
                "Content-Type": "application/json",
                "Accept": "application/json"
            })

    except requests.exceptions.RequestException as error:
        current_app.logger.error(
            "Request for account name encountered and error"
            ":{0}".format(error))
        raise

    # If the http status code is an error, raise the error
    response.raise_for_status()

    if response.status_code == requests.codes.ok:

        # nex two lines are temporary for demo so that total is not $0
        # since demo account is internal the total is $0
        account_name = response.json()['invoice']['accountName']

    return account_name
