(function(angular){
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:httpwrapper
     * @description
     * This service provides an API to make all kinds of HTTP requests.
     */
    angular.module('migrationApp')
        .factory('httpwrapper', ['$q', '$http', 'authservice', HttpWrapper]);

    function HttpWrapper($q, $http, authservice) {

        /**
         * Gets the operation from the operation type for the request
         * @param {String} operation - Specifies whether the type of request is get/post/put/delete.
         * @param {String} url - URL where the request has to be sent. URLs can have macros like (":id") which
         * will be replaced from real values before sending.
         * @param {String} data - Data to be sent in case of post/put/delete
         */
        function _getOperation(operation, url, data){
            var method;
            var auth = authservice.getAuth();

            method = $http({
                    url: url,
                    method: operation,
                    data: data,
                    headers: {
                        "x-auth-token": auth.authtoken,
                        "x-tenant-id": auth.tenant_id,
                        "Cache-Control": "no-cache"
                    },
                });
            return method;
        }

        function read(url, urlParams){
            return _send(url, {
                urlVars: urlParams
            });
        }

        function readAll(url, urlParams){
            return _send(url, {
                urlVars: urlParams
            });
        }

        function _delete(url, urlParams, data){
            return _send(url, {
                operation: 'delete',
                urlVars: urlParams ,
                data: data
            });
        }

        function save(url, urlParams, data){

            return _send(url, {
                operation: 'post',
                urlVars: urlParams,
                data: data
            });
        }

        /**
         * Send the request. This function invokes the http service and returns the promise.
         * @param {String} url - URL where the request has to be sent. URLs can have macros like (":id") which
         * will be replaced from real values before sending.
         * @param {Object} params - Params to specify the type of request
         * @param {String} params.urlVars - URL variables to be reaplced in the URL before sending the request.
         * @param {String} params.operation - Specifies whether the type of request is get/post/put/delete.
         * @param {String} params.data - Data to be sent in case of post/put/delete
         */
        function _send(url, params){
            params = params || {};
            //url = _decorateUrl(url, params.urlVars);
            var deferred = $q.defer();
            _getOperation(params.operation, url, params.data)
                .success( function(data, status) {
                    if (status === 200 || status === 201 || status === 204){
                        deferred.resolve(data);
                    }else {
                        deferred.reject({ error: status, data: data });
                    }
            })
            .error(function(data, status){
                // User is not authenticated, logout
                if(status == 403) document.location = "/logout";
                deferred.reject({ error: status, data: data });
            });
            return deferred.promise;
        }

        return {
            /**
             * @ngdoc method
             * @name send
             * @methodOf migrationApp.service:httpwrapper
             * @param {String} url URL where the request has to be sent.
             * @param {Object} params Params to specify the type of request
             * @description
             * This function invokes the HTTP service and returns the promise. This function is used for sending HTTP GET requests.
             */
            send: _send,

            /**
             * @ngdoc method
             * @name read
             * @methodOf migrationApp.service:httpwrapper
             * @param {String} url URL where the request has to be sent.
             * @param {Object} urlParams Params to specify the type of request
             * @description
             * This function invokes the HTTP service and returns the promise. This function is used for sending HTTP GET requests.
             */
            read: read,

            /**
             * @ngdoc method
             * @name readAll
             * @methodOf migrationApp.service:httpwrapper
             * @param {String} url URL where the request has to be sent.
             * @param {Object} urlParams Params to specify the type of request
             * @description
             * This function invokes the HTTP service and returns the promise. This function is used for sending HTTP GET requests.
             */
            readAll: readAll,

            /**
             * @ngdoc method
             * @name delete
             * @methodOf migrationApp.service:httpwrapper
             * @param {String} url URL where the request has to be sent.
             * @param {Object} urlParams Params to specify the type of request
             * @param {Object} data Data to be sent with the request.
             * @description
             * This function invokes the HTTP service and returns the promise. This function is used for sending HTTP DELETE requests (usually while calling a REST API).
             */
            'delete': _delete,

            /**
             * @ngdoc method
             * @name save
             * @methodOf migrationApp.service:httpwrapper
             * @param {String} url URL where the request has to be sent.
             * @param {Object} urlParams Params to specify the type of request
             * @param {Object} data Data to be sent with the request.
             * @description
             * This function invokes the HTTP service and returns the promise. This function is used for sending HTTP POST requests.
             */
            save: save
        };
    }

})(angular);
