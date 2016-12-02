(function () {
    "use strict";

    angular.module("migrationApp")
        .service("migrationItemDataService", ["serverService", "networkService", function (serverService, networkService) {
            var self = this;

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
            this.getMigrationDetails = function (type, ids) {
                if (type === "server") {
                    return serverService.getMigrationDetails(ids);
                }
                else if (type === "network") {
                    return networkService.getMigrationDetails(ids);
                }
            }

            // Get log details of an item vased on migration item type
            this.getLogDetails = function (type, id) {
                // TODO: add code retrieve log details
            }

            return self;
        }]); // end of service definition
})();