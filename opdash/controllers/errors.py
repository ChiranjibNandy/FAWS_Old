from flask import render_template, request


def register_error_handlers(app):

    logger = app.logger

    @app.errorhandler(401)
    def unauthorized(error_code):
        """
            Logs unauthorized access error
        """
        logger.error('401 Error: {0}'.format(request.url))
        return render_template("error-401.html"), 401

    @app.errorhandler(403)
    def forbidden(error_code):
        """
            Logs forbidden errors
        """
        logger.error('403 Error: {0}'.format(request.url))
        return render_template("error-403.html"), 403

    @app.errorhandler(404)
    def not_found(error_code):
        """
            Logs page not found errors
        """
        logger.error('404 Error: {0}'.format(request.url))
        return render_template("error-404.html"), 404

    @app.errorhandler(500)
    def internal(error_code):
        """
            Logs internal server errors
        """
        logger.error('500 Error: {0}'.format(request.url))
        return render_template("error-500.html"), 500
