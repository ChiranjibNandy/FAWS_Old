(function(angular){
    "use strict";

    angular.module('migrationApp')
        .factory('httpwrapper', ['$q', '$http', HttpWrapper]);

    function HttpWrapper($q, $http) {

        /**
         * Gets the operation from the operation type for the request
         * @param {String} operation - Specifies whether the type of request is get/post/put/delete.
         * @param {String} url - URL where the request has to be sent. URLs can have macros like (":id") which
         * will be replaced from real values before sending.
         * @param {String} data - Data to be sent in case of post/put/delete
         */
        function _getOperation(operation, url, data){
            var method;
            method = $http({
                    url: url,
                    method: operation,
                    data: data,
                    headers: {
                        "x-auth-token": "AAA_0PFyadCTqoifmhXPfB3fueZEwhU9dt8_h6wWAZ5My1xrDiCPpF_k1UHxJdnRHsZn0NbgQ_Z6RCzWIXghX0ZargGKD_qIlgy1n8uuqrL-Fq5QS49b4P23z_A3CvIj04bJHioHzDTKkgJWwgdduAVU9NU_aPBHA9034Y748nvBUtRKysUtcP1KPvxHutJdXuJUwt3XcDXlTC04CR0cBYlwwPKchkOROsndhW6Ze42OyJTCTdTo7Cy0",
                        "x-tenant-id": "1018602",
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
            _getOperation(params.operation, url, params.data).success( function(data, status) {
                if (data.status === "success" || status === 200 || status === 204){ 				
                    deferred.resolve(data);				
                }else {
                    console.log("data "+data);
                    console.log("status "+status)
                    deferred.reject(data, status);
                }
            })
            .error(function(data, status){
                console.log("data "+data);
                console.log("status "+status);
                deferred.reject(data, status);
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