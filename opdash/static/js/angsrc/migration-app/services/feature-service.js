(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:featureservice
     * @description
     * Service to retrieve all data for feature flags
     */
    angular.module("migrationApp").factory("featureservice", ["httpwrapper","$window","$q", function (HttpWrapper,$window,$q) {
        
        //assigning context to self
        var self = this;

        /**
        * @ngdoc method
        * @name prepareCdnList
        * @methodOf migrationApp.service:featureservice
        * @returns featureservice instance request object.
        * @description
        * It make get call to get all the feature flags
        */
        self.getFeatureFlags = function () {
            var deferred = $q.defer();
            if(JSON.parse($window.localStorage.getItem('featureFlags')) === null){
                var url = "/api/feature/all";
                return HttpWrapper.send(url,{"operation":'GET'})
                        .then(function(response){
                            $window.localStorage.setItem('featureFlags',JSON.stringify(response));
                            return response;
                        }, function(errorResponse) {
                            deferred.reject(false);
                        });
            }else{
                deferred.resolve(JSON.parse($window.localStorage.getItem('featureFlags')));
                //return JSON.parse($window.localStorage.getItem('featureFlags'));
            }   
            return deferred.promise;
        }

        return self;
    }]);
})();
