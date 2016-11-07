from flask import request, render_template


class ErrorHandlers(object):

    def __init__(self, app):

        logger = app.logger

        @app.errorhandler(401)
        def unauthorized(error_code):
            """
                This function logs unauthorized error
            """
            logger.error('%s: Unauthorized access attempt.' % error_code)
            return render_template("error-401.html"), 401

        @app.errorhandler(403)
        def forbidden(error_code):
            """
                This function logs forbidden errors
            """
            logger.error('%s: Access forbidden.' % error_code)
            return render_template("error-403.html"), 403

        @app.errorhandler(404)
        def not_found(error_code):
            """
                This function logs page not found
                errors.
            """
            logger.error('%s: Page Not Found' % error_code)
            return render_template("error-404.html"), 404

        @app.errorhandler(500)
        def internal(error_code):
            """
                This function logs internal server errors.
            """
            logger.error('%s: Internal Server Error' % error_code)
            return render_template("error-500.html"), 500

        @app.after_request
        def after_request(response):
            """
                This function runs after every request
                and updates the cookie if it needs to be.
            """
            logger.info(request.environ["SERVER_NAME"] +
                        request.environ["PATH_INFO"])
            return response
