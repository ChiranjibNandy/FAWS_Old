(function () {
    "use strict";

    angular.module("migrationApp").factory("serverservice", ["httpwrapper", "$q", function (HttpWrapper, $q) {
        // local variables to help cache data
        var loaded, servers, self = this;

        // function to transform the data from api call for overview display
        function trimTransform (data) {
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
                            status: server.status,
                            progress: server.progress,
                            region:key,
                            migrationStatus:server.mockStatus || 'disabled'
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
            // var url = "/static/Angassets/servers-list.json";
            var url = "/api/compute/us-instances";

            if (!loaded) {

                return HttpWrapper.send(url,{"operation":'GET'}).then(function(response){
                                    loaded = true;
                                    servers = {
                                        labels: [
                                                    {field: "name", text: "Server Name"}, 
                                                    {field: "region", text: "Region"},
                                                    {field: "tenant_id", text: "Tenant ID"}, 
                                                    {field: "ip_address", text: "IP Address"},
                                                    {field: "migrationStatus", text: "Migration Status"}
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
           var url = "/static/Angassets/server-migration-detail.json";
           return $http.get(url)
               .then(function (response) {
                   return {
                       data: response.data
                   };
               });
        }
        return self;
    }]);
})();