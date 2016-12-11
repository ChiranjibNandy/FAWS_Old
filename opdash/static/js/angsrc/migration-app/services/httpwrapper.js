(function(angular){
    "use strict";

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
                    if (data.status === "success" || status === 200 || status === 204){
                        deferred.resolve(data);
                        console.log(status, data);				
                    }else {
                        console.log(status, data);
                        deferred.reject({ error: status, data: data });
                    }
            })
            .error(function(data, status){
                console.log(status, data);
                deferred.reject({ error: status, data: data });
            });
            return deferred.promise;
        }

        return {
            send: _send,
            read: read,
            readAll: readAll,
            'delete': _delete,
            save: save
        };
    }

})(angular);