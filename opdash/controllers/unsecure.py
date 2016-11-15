from flask import render_template


def register_unsecure_routes(app):

    @app.route('/health')
    def health():
        """Return health check"""
        return 'OK', 200

    @app.route('/base')
    def base_template():
        """Show base template"""
        return render_template('_template_base.html')

    @app.route('/help')
    def help_template():
        """Show help template"""
        return render_template('_template_help.html')

    @app.route('/full')
    def full_template():
        """Show full template"""
        return render_template('_template_full.html')

    @app.route('/')
    def index():
        """Show index page"""
        return render_template('index.html')
