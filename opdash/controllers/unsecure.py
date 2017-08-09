import os
from flask import current_app, send_from_directory
from opdash.controllers.base import UnsecureBlueprint


mod = UnsecureBlueprint('unsecure', __name__)


@mod.route('/health')
def health():
    """
        Return health check
    """
    return "OK", 200


@mod.route('/robots.txt')
def robots():
    # For Google Search Engine
    return send_from_directory(
        os.path.join(current_app.root_path, 'static'),
        'robots.txt', mimetype='text/plain')


@mod.route('/favicon.ico')
def favicon():
    # Rackspace Icon for Favorites
    return send_from_directory(
        os.path.join(current_app.root_path, 'static'),
        'favicon.ico', mimetype='image/vnd.microsoft.icon')
