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

            this.prepareRequest = function(type, info){
                if (type === "server") {
                   return serverService.prepareRequest(info);
                }
                else if (type === "network") {
                    return networkService.prepareRequest(info);
                }
            }
            
            // Get log details of an item vased on migration item type
            this.getLogDetails = function (type, id) {
                // TODO: add code retrieve log details
            }

            this.getAllMigrationServerData = function (tenant_id) {
                var migrations = [];
                var loaded = false;
                var servers = [];

                self.getAllUSServers()
                    .then(function (response) {
                        servers = response;
                        loaded = true;
                    });
                self.getAllMigrations(tenant_id)
                    .then(function (response) {
                        response.jobs.forEach(function(migration){
                            self.getMigration(migration.id)
                                .then(function (response){
                                    while(loaded === false) {
                                        setTimeout(function(){
                                            console.log("sleeping for 1 second while waiting for servers")
                                        }, 500);
                                    }
                                    var instance_uuid;
                                    for(instance_uuid in response.results.instances){
                                        var region;
                                        var server_name = instance_uuid;
                                        for(region in servers){
                                            var server_by_id = $filter('filter')(servers[region].servers, {id: instance_uuid });
                                            if (server_by_id.length == 1) {
                                                server_name = server_by_id[0].name;
                                                break;
                                            }
                                        }

                                        var progress = 0;
                                        var status = response.results.instances[instance_uuid].status;

                                        if (status === 'in progress') {
                                            progress = 50;
                                        }
                                        else if (status === 'done') {
                                            progress = 100;
                                        }

                                        var item = {
                                            id: response.id,
                                            name: server_name,
                                            status: response.results.instances[instance_uuid].status,
                                            progress: progress
                                        };

                                        migrations.push(item);
                                    }
                            });
                    });
                });
                return migrations;
            }

            // Get all items based on migration item type
            this.getAllMigrations = function (tenant_id) {
                var url = "/api/jobs/" + tenant_id;
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
                    return response;
                });
            }

            this.getAllUSServers = function () {
                var url = "/api/compute/us-instances";
                return HttpWrapper.send(url,{"operation":'GET'})
                                  .then(function(response){
                    return response;
                });
            }

            return self;
       }]); // end of service definition
})();