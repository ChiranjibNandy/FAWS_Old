from flask import session, current_app
import requests
import json


def get_pilot_header(authtoken, tenant_id):

    # get config
    pilot_config = current_app.config.get("PILOT")

    product = pilot_config["PRODUCT"]
    pilot_url = pilot_config["PILOT_URL"]
    mycloud_url = pilot_config["MYCLOUD_URL"]
    logout_url = pilot_config["LOGOUT_URL"]

    pilot_header = session.get('pilot_header', None)

    if pilot_header:
        current_app.logger.debug('-- PILOT HEADER LOADED FROM SESSION --')

    else:
        current_app.logger.debug('-- PILOT NOT FROM SESSION --')

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
            current_app.logger.debug('-- SAVING PILOT  HEADER TO SESSION --')

    session['pilot_header'] = pilot_header
