(function () {
    "use strict";

    angular.module("migrationApp").factory("serverservice", ["httpwrapper", "$q", function (HttpWrapper, $q) {
        // local variables to help cache data
        var loaded, servers, self = this;

        // function to transform the data from api call for overview display
        function trimTransform (data) {
            var serversList = [];
            var t = data.data;
            console.log(t);
            for(var key in t){
                // iterate over networks by region
                if (t.hasOwnProperty(key)) {
                    // iterate over each network and extract necessary data
                    angular.forEach(t[key].servers, function(server) { 
                        serversList.push({
                            id: server.id,
                            name: server.name,
                            tenant_id: server.tenant_id,
                            ip_address: server.accessIPv4,
                            status: server.status,
                            flavor: server.flavor
                        });
                    });
                }
            }

            return {
                labels: data.labels,
                data: serversList
            };
        }

        // function to transform the data from api call for details display
        function detailsTransform (data) {
            var serversList = [];
            var t = data.data;

            for(var key in t){
                // iterate over networks by region
                if (t.hasOwnProperty(key)) {
                    // iterate over each network and extract necessary data
                    
                    angular.forEach(t[key].servers, function(server) { 
                        serversList.push({
                            id: server.id,
                            name: server.name,
                            tenant_id: server.tenant_id,
                            ip_address: server.accessIPv4,
                            hostId: server.hostId,
                            OS_DCF_diskConfig: server["OS-DCF:diskConfig"],
                            OS_EXT_STS_power_state: server["OS-EXT-STS:power_state"],
                            OS_EXT_STS_task_state: server["OS-EXT-STS:task_state"],
                            OS_EXT_STS_vm_state: server["OS-EXT-STS:vm_state"],
                            created: server.created,
                            updated:server.updated
                        });
                    });
                }
            }

            return {
                labels: data.labels,
                data: serversList
            };
        }

        // get network list with only the required properties
        self.getTrimmedList = function() {
            var deferred = $q.defer();
            self.getAll().then(function(response) {
                return deferred.resolve(trimTransform(response));
            });
            return deferred.promise;
        };

        self.getDetailedList = function() {
            var deferred = $q.defer();
            self.getAll().then(function(response) {
                return deferred.resolve(detailsTransform(response));
            });
            return deferred.promise;
        };

        // get all server items from backend
        self.getAll = function () {
             var url = "/static/angassets/servers-list.json";
            // var url = "/api/compute/us-instances";

            if (!loaded) {

                return HttpWrapper.send(url,{"operation":'GET'}).then(function(response){
                                    loaded = true;
                                    servers = {
                                        labels: [
                                                    {field: "name", text: "Server Name"},
                                                    {field: "ip_address", text: "IP Address"},
                                                    {field: "flavor", text: "Flavor"},
                                                    {field: "status", text: "Status"}
                                                ],
                                        data: response
                                    };
                                    return servers;
                                });

            } else {
                return $q.when(servers);
            }
        };

        // get server details of specific items
        self.getMigrationDetails = function (id) {
           var url = "/static/angassets/server-migration-details.json";
           return HttpWrapper.send(url,{"operation":'GET'})
                    .then(function (response) {
                        return {
                            data: response
                        };
                    });
        }

        self.getPricingDetails = function(flavor, ram){
            // var url = "/api/compute/get_server_mappings/"+flavor+"/"+ram;
            var url = "/static/angassets/pricing-details.json";
            return HttpWrapper.send(url,{"operation":'GET'})
                    .then(function (response) {
                        return {
                            data: response
                        };
                    });
        };

        return self;
    }]);
})();