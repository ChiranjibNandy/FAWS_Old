from flask import render_template, request, session, current_app, redirect
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


@mod.route('/select-tenant', methods=['GET'])
def select_tenant_get():
    """Select tenant page"""
    return render_template('select-tenant.html')


@mod.route('/select-tenant', methods=['POST'])
def select_tenant_post():
    """Select tenant page"""
    error_message = ""

    tenant_id = request.form['tenantId']
    if tenant_id:
        session['tenant_id'] = tenant_id
        return current_app.make_response(redirect('/'))
    else:
        error_message = "You must select a tenant."

    return render_template('select-tenant.html', error_message=error_message)


@mod.route('/')
def index():
    """Show index page"""
    return render_template('index.html')


@mod.route('/migrations')
def migrations():
    """Show index page"""
    return render_template('migrations-status.html')
