(function () {
    "use strict";

    angular.module("migrationApp")
        .service("migrationitemdataservice", ["serverservice", "networkservice", "httpwrapper",'$filter', function (serverService, networkService, HttpWrapper, $filter) {
            var self = this;

            // Get all items based on migration item type
            this.getTrimmedAllItems = function (type) {
                if (type === "server") {
                    return serverService.getTrimmedList();
                }
                else if (type === "network") {
                    return networkService.getTrimmedList();
                }
            }

            this.getDetailedList = function(type) {
                if (type === "server") {
                    return serverService.getDetailedList();
                }
                else if (type === "network") {
                    return networkService.getDetailedList();
                }
            }

            this.getPricingDetails = function(type, flavor, ram) {
                if (type === "server") {
                   return serverService.getPricingDetails(flavor, ram);
                }
            };

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