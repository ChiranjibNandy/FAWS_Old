from flask import current_app
import requests
import json


def get_pilot_header(authtoken, tenant_id):

    # Get Required Pilot Config Settings
    product = current_app.config["PILOT_PRODUCT"]
    pilot_url = current_app.config["PILOT_URL"]
    mycloud_url = current_app.config["PILOT_MYCLOUD_URL"]
    logout_url = current_app.config["PILOT_LOGOUT_URL"]

    # Custom Support Link
    support_text = current_app.config.get("PILOT_SUPPORT_TEXT", "Get Help")
    support_url = current_app.config.get("PILOT_SUPPORT_URL", None)

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

    data = {
        "logout": {
            "uri": logout_url
        }
    }

    # Add Custom Support Link if Configured
    if support_url is not None:
        data["utility-nav"] = ({
            "menus": {
                "support": {
                    "label": support_text,
                    "uri": support_url,
                    "external": True
                }
            }
        })

    response = requests.post(
        url,
        data=json.dumps(data),
        headers={
            "X-Auth-Token": authtoken
        }
    )

    if response and response.text:
        response.encoding = "utf-8"
        pilot_header = response.text

    return pilot_header
