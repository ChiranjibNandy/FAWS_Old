(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:cdnservice
     * @description
     * Service to retrieve all data for volume resources
     */
    angular.module("migrationApp").factory("cdnservice", ["httpwrapper", "$q", "authservice","$window", function (HttpWrapper, $q, authservice,$window) {
        // local variables to help cache data
        var self = this;

        /**
        * @ngdoc method
        * @name prepareCdnList
        * @methodOf migrationApp.service:cdnservice
        * @returns cdnservice instance request object.
        * @description
        * prepare cdnservice instance request object
        */
        self.prepareCdnList = function () {
            var cdnReqList = [];
            var services = JSON.parse($window.localStorage.selectedResources)["service"];
            angular.forEach(services,function(service){
                cdnReqList.push(
                    {
                        "source":{
                            "id":service.id
                        },
                        "destination":{}
                    }
                )
            });
            return cdnReqList;
        }

        return self;
    }]);
})();
