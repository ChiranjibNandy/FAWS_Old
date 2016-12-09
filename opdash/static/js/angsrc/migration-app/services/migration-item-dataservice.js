(function () {
    "use strict";

    angular.module("migrationApp")
        .service("migrationitemdataservice", ["serverservice", "networkservice", function (serverService, networkService) {
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

            // Get all items based on migration item type
            this.getAllItems = function (type) {
                if (type === "server") {
                    return serverService.getAll();
                }
                else if (type === "network") {
                    return networkService.getAll();
                }
            }

            // Get migration details of items based on type
            this.getMigrationDetails = function (type, id) {
               if (type === "server") {
                   return serverService.getMigrationDetails(id);
               }
               else if (type === "network") {
                   return networkService.getMigrationDetails(id);
               }
            }

             this.getPricingDetails = function(type, flavor, ram) {
                if (type === "server") {
                   return serverService.getPricingDetails(flavor, ram);
               }
               else if (type === "network") {
                   return networkService.getPricingDetails(flavor, ram);
               }
            };

            // Get log details of an item vased on migration item type
            this.getLogDetails = function (type, id) {
                // TODO: add code retrieve log details
            }

            return self;
       }]); // end of service definition
})();