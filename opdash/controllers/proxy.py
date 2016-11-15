from flask import request, Response
import requests

def register_api_proxy(app):

    @app.route('/api/<path>')
    def api_proxy(path):

        app.logger.debug("API Route is:{0}".format(path))

        api_host = app.config.get('API_BASE_URL')

        # request timeout in seconds
        proxy_timeout = 15

        # We only allow these headers
        headers = {
            'X-Forwarded-For': request.host,
            'X-Auth-Token': request.headers.get('X-Auth-Token', ''),
            'Content-Type': "application/json; charset=utf-8",
            'User-Agent': 'opdash-proxy'
        }

        resp = requests.request(
            method=request.method,
            url='{host}/{path}'.format(host=api_host, path=path),
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

        headers = [
            (name, value) for (name, value) in resp.raw.headers.items()
                if name.lower() not in excluded_headers
        ]

        response = Response(resp.content, resp.status_code, headers)

        return response
