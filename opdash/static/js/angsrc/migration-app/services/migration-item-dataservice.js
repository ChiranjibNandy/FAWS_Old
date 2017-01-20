(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:migrationitemdataservice
     * @description
     * This service acts as a facade which handles calling the specific service implementation for each resoource type (server, network etc).
     */
    angular.module("migrationApp")
        .service("migrationitemdataservice", ["serverservice", "networkservice", "httpwrapper",'$filter', function (serverService, networkService, HttpWrapper, $filter) {
            var self = this;

            /**
             * @ngdoc method
             * @name getTrimmedAllItems
             * @methodOf migrationApp.service:migrationitemdataservice
             * @param {String} type Resource type (server, network etc)
             * @returns {Promise} a promise to fetch the list of resources of given _type_.
             * @description 
             * This service method returns a promise to fetch the list of resources given _type_ for a tenant.  
             * This operation trims the set of properties available with the service call and returns only the specific properties needed for its representation.
             */
            this.getTrimmedAllItems = function (type) {
                if (type === "server") {
                    return serverService.getTrimmedList();
                }
                else if (type === "network") {
                    return networkService.getTrimmedList();
                }
            }

            /**
             * @ngdoc method
             * @name getDetailedList
             * @methodOf migrationApp.service:migrationitemdataservice
             * @param {String} type Resource type (server, network etc)
             * @returns {Promise} a promise to fetch the detailed list of resources of given _type_.
             * @description 
             * This service method returns a promise to fetch the detailed list of resources of given _type_ for a tenant.
             */
            this.getDetailedList = function(type) {
                if (type === "server") {
                    return serverService.getDetailedList();
                }
                else if (type === "network") {
                    return networkService.getDetailedList();
                }
            }

            /**
             * @ngdoc method
             * @name getPricingDetails
             * @methodOf migrationApp.service:migrationitemdataservice
             * @param {String} type Resource type (server, network etc)
             * @param {String} flavor Flavor of the resource to be migrated (this is specific to servers)
             * @param {String} ram Ram config of the resource to be migrated (this is specific to servers)
             * @returns {Promise} a promise to fetch the pricing details to migrate of a resource.
             * @description 
             * This service method returns a promise to fetch the pricing details to migrate a resource.
             */
            this.getPricingDetails = function(type, flavor, ram) {
                if (type === "server") {
                   return serverService.getPricingDetails(flavor, ram);
                }
            };

            /**
             * @ngdoc method
             * @name prepareRequest
             * @methodOf migrationApp.service:migrationitemdataservice
             * @param {String} type Resource type (server, network etc)
             * @param {Object} info Object containing the relevant data to prepare the request object
             * @returns {Object} A request _object_ for subsequesnt request in migrating a resource.
             * @description 
             * This service method returns an _object_. This object has to be sent while making an HTTP POST request to migrate the resource.
             */
            this.prepareRequest = function(type, info){
                if (type === "server") {
                   return serverService.prepareRequest(info);
                }
                else if (type === "network") {
                    return networkService.prepareRequest(info);
                }
            }

            this.getServerMigrationStatus = function(tenant_id){
                var url = "/api/server_status/" + tenant_id;
                return HttpWrapper.send(url,{"operation":'GET'})
                                  .then(function(response){
                                      var status = {
                                          server_status: response.server_status,
                                          network_status: response.network_status
                                      };
                                      return status;
                                  });
            }

            return self;
       }]); // end of service definition
})();