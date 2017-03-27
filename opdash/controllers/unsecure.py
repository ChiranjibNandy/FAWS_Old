from flask import request, current_app
from opdash.controllers.base import UnsecureBlueprint


mod = UnsecureBlueprint('unsecure', __name__)


@mod.route('/health')
def health():
    """
        Return health check
    """
    forwarded_for = request.headers.get('X-Forwarded-For', None)
    forwarded_last = None

    if forwarded_for:
        forwarded_last = forwarded_for.split(",")[-1]

    html_response = (
        "<html>OK<br>"
        "HOST:{}<br>"
        "SAML_PATH:{}<br>"
        "X-Forwarded-Proto: {}<br>"
        "X-Forwarded-For: {}<br>"
        "X-Forwarded LAST ONE:{}<br>"
        "<h3>Headers:</h3>"
        "<pre>{}</pre>"
        "</html>"
    ).format(
        request.host,
        current_app.config["SAML_PATH"],
        request.headers.get('X-Forwarded-Proto', None),
        forwarded_for,
        forwarded_last,
        '\n'.join('{}: {}'.format(k, v) for k, v in request.headers.items()),
    )

    return html_response, 200
