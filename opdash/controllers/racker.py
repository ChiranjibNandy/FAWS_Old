from flask import render_template
from opdash.controllers.base import RackerBlueprint

mod = RackerBlueprint('racker', __name__)


@mod.route('/base')
def base_template():
    """Show base template"""
    return render_template('_template_base.html')


@mod.route('/help')
def help_template():
    """Show help template"""
    return render_template('_template_help.html')


@mod.route('/full')
def full_template():
    """Show full template"""
    return render_template('_template_full.html')


@mod.route('/angular_demo')
def angular_demo():
    """Show index page"""
    return render_template('testindex.html')


@mod.route('/angular_app')
def angular_app():
    """Show index page"""
    return render_template('angindex.html')


@mod.route('/tenant_id')
def tenant_id():
    """Show index page"""
    return render_template('tenant_id.html')


@mod.route('/')
def index():
    """Show index page"""
    return render_template('index.html')


@mod.route('/migrations')
def migrations():
    """Show index page"""
    return render_template('migrations-status.html')
