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
        var self = this, services,currentTenant = null;

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

        /**
         * @ngdoc method
         * @name getServices
         * @methodOf migrationApp.service:migrationitemdataservice
         * @returns {Promise} a promise to fetch all servers.
         * @description 
         * Gets the entire list of CDN Service in its raw JSON form, from the api.
        */
        this.getServices = function () {
            var url = "/api/cdn/services";
            return HttpWrapper.send(url, {
                    "operation": 'GET'
                })
                .then(function (response) {
                    services = {
                        labels: [
                                    {field: "name", text: "name"},
                                    {field: "status",text: "status"},
                                    {field: "migStatus",text: "Migration Status"},
                                    {field:"eligible", text:"Eligibility test result"}
                                ],
                        data: response
                    };
                    return services;
                }, function (errorResponse) {
                    return errorResponse;
                });
        };//end of getServices method

        function transformService(service){
            return {
                id: service.id,
                name: service.name,
                status: service.status,
                domains: service.domains,
                };
        }

        self.getTrimmedItem = function(id){
            var deferred = $q.defer();
            self.getById(id).then(function (response) {
                if (response.error)
                    return deferred.resolve(response);
                return deferred.resolve(transformService(response.data));
            });
            return deferred.promise;
        };

        self.getById = function (id) {
            var url = "/api/cdn/service/" + id;
            var tenant_id = authservice.getAuth().tenant_id;

            return HttpWrapper.send(url, { "operation": 'GET' })
                .then(function (response) {
                    currentTenant = tenant_id;
                    services = {
                        labels: [
                            { field: "name", text: "Service Name" },
                            { field: "id", text: "id" },
                            { field: "rrn", text: "rrn" },
                            { field: "status", text: "Service Status" }
                        ],
                        data: response
                    };
                    return services;
                }, function (errorResponse) {
                    return errorResponse;
                });
        };

        return self;
    }]);
})();
