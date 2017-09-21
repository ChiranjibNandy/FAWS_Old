from flask import current_app, request, Response
from opdash.controllers.base import ProxyBlueprint
import requests
import json

mod = ProxyBlueprint('proxy', __name__)

HANDLED_REDIRECTS = [301]


@mod.route('/api/<path:path>',
           methods=['DELETE', 'GET', 'PATCH', 'POST', 'PUT'])
def api_proxy(path):
    """
        Proxy http request from control panel to api
        this allows us to avoid cross-domain requests
    """
    msg_base = 'API Route (path) is: "{0}" API Route (request.url) is: "{1}"'
    msg = msg_base.format(path, request.url)
    current_app.logger.debug(msg)
    print(msg)

    api_host = current_app.config.get('API_BASE_URL')

    # Request timeout in seconds
    proxy_timeout = current_app.config.get('API_PROXY_TIMEOUT', 15)

    # We only allow these headers
    headers = {
        'X-Forwarded-For': request.host,
        'X-Auth-Token': request.headers.get('X-Auth-Token', ''),
        'X-Tenant-Id': request.headers.get('X-Tenant-Id', ''),
        'Content-Type': "application/json; charset=utf-8",
        'User-Agent': 'opdash-proxy'
    }

    # If request has a query string, pass it on
    query_string = ''
    if request.query_string:
        query_string = '?{query_string}'.format(
            query_string=request.query_string
        )

    resp = requests.request(
        method=request.method,
        url='{host}/{path}{query_string}'.format(
            host=api_host,
            path=path,
            query_string=query_string),
        allow_redirects=False,
        timeout=proxy_timeout,
        data=request.get_data(),
        headers=headers,
    )

    excluded_headers = [
        'content-encoding',
        'content-length',
        'transfer-encoding',
        'connection'
    ]

    headers = [(name, value)
               for (name, value) in resp.raw.headers.items()
               if name.lower() not in excluded_headers]

    if resp.status_code in HANDLED_REDIRECTS:
        # Remove the host and first slash since we rebuild those parts.
        new_path = resp.headers.get('Location')[len(api_host) + 1:]
        return api_proxy(new_path)
    else:
        content = resp.content
        if 400 <= resp.status_code < 500:
            debug_message = ('PROXY call failure. HTTP {code} received when '
                             'requesting {path}. Response: {message}.').format(
                code=resp.status_code,
                path=path,
                message=content
            )
            print(debug_message)

            content = json.dumps({
                'message': 'Please see logs for details of HTTP 400.'})

        response = Response(content, resp.status_code, headers)

    return response
