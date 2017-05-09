from flask import render_template
from opdash.controllers.base import CustomerBlueprint

mod = CustomerBlueprint('customer', __name__)


@mod.route('/')
def index():
    """Show index page"""
    return render_template('index.html')


@mod.route('/customer')
def customer_template():
    """Show base template"""
    return render_template('customer-index.html')
