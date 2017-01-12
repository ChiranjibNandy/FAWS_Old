from flask import render_template
from opdash.controllers.base import SecureBlueprint
from opdash.lib.pilot import get_pilot_header

mod = SecureBlueprint('customer', __name__)


@mod.route('/customer')
def customer_template():
    """Show base template"""
    return render_template('_template_base.html')
