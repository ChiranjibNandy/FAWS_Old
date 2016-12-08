(function () {
    "use strict";

    angular.module("migrationApp")
        .service("migrationitemdataservice", ["serverservice", "networkservice", "httpwrapper", function (serverService, networkService, HttpWrapper) {
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

            // Get log details of an item vased on migration item type
            this.getLogDetails = function (type, id) {
                // TODO: add code retrieve log details
            }

            // Get all items based on migration item type
            this.getAllMigrations = function (tenant_id) {
                var url = "/api/jobs/" + tenant_id + "?fake_data=true";
                return HttpWrapper.send(url,{"operation":'GET'})
                                  .then(function(response){

                    var migrations = {
                        labels: ['Job Id', 'Status'],
                        jobs: response.jobs,
                        id: response.id
                    };
                    return migrations;
                });
            }

            this.getMigration = function (job_id) {
                var url = "/api/job/" + job_id;
                return HttpWrapper.send(url,{"operation":'GET'})
                                  .then(function(response){

                    var migration = {
                        job: response,
                    };
                    return migration;
                });
            }

            return self;
       }]); // end of service definition
})();