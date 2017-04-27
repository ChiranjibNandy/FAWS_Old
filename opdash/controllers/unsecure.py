from opdash.controllers.base import UnsecureBlueprint


mod = UnsecureBlueprint('unsecure', __name__)


@mod.route('/health')
def health():
    """
        Return health check
    """
    return "OK", 200
