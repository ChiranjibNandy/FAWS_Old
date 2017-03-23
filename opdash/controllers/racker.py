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
