from flask import current_app, request, Response
from opdash.controllers.base import ProxyBlueprint
import requests

mod = ProxyBlueprint('proxy', __name__)


@mod.route('/api/<path:path>', methods=['GET', 'PUT', 'POST', 'DELETE'])
def api_proxy(path):
    """
        Proxy http request from control panel to api
        this allows us to avoid cross-domain requests
    """

    current_app.logger.debug("API Route is:{0}".format(path))

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

    response = Response(resp.content, resp.status_code, headers)

    return response
