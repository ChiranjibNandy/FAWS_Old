from flask import current_app
import requests


def get_account_name(auth_token, tenant_id):

    account_name = None
    billing_ran_id = '020' if int(tenant_id) <= 10000000 else '021'

    try:

        response = requests.get(
            "https://billingv2.api.rackspacecloud.com/v2"
            "/accounts/{0}-{1}/invoices/latest.json".format(
                billing_ran_id,
                tenant_id),
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
