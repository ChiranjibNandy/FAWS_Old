from flask import current_app
import requests
import json


def get_pilot_header(authtoken, tenant_id):

    # get config
    product = current_app.config["PILOT_PRODUCT"]
    pilot_url = current_app.config["PILOT_URL"]
    mycloud_url = current_app.config["PILOT_MYCLOUD_URL"]
    logout_url = current_app.config["PILOT_LOGOUT_URL"]

    pilot_header = "<h2>Pilot Header Not Loaded</h2>"

    url = (
        '{0}cloud/{1}/navigation?'
        'active={2}&'
        'mycloud={3}').format(
        pilot_url,
        tenant_id,
        product,
        mycloud_url,
    )

    response = requests.post(
        url,
        data=json.dumps({
            "logout": {
                "uri": logout_url
            }
        }),
        headers={
            "X-Auth-Token": authtoken
        }
    )

    if response and response.text:
        response.encoding = "utf-8"
        pilot_header = response.text

    return pilot_header
