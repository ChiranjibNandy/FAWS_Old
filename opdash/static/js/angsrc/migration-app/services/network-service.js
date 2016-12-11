(function () {
    "use strict";

    angular.module("migrationApp")
        .factory("networkservice", ["httpwrapper", "$q", function (HttpWrapper, $q) {
            // local variables to help cache data
            var loaded, networks, self = this;

            // function to transform the data from api call
            function trimTransform (data) {
                var networksList = [];
                var t = data.data;
                for(var key in t){
                    // iterate over networks by region
                    if (t.hasOwnProperty(key)) { 
                        // iterate over each network and extract necessary data
                        //ip_address is id 
                        angular.forEach(t[key].networks, function(network) { 
                            networksList.push({
                                ip_address: network.id,
                                name: network.name,
                                status: network.status
                            });
                        });
                    }
                }

                return {
                    labels: data.labels,
                    data: networksList
                };
            }

            // function to transform the data from api call for details display
            function detailsTransform (data) {
                var networksList = [];
                var t = data.data;

                for(var key in t){
                    // iterate over networks by region
                    if (t.hasOwnProperty(key)) {
                        // iterate over each network and extract necessary data
                        
                        angular.forEach(t[key].networks, function(network) { 
                            networksLiself.getPricingDetails = function(flavor, ram){
            var url = "/api/get_server_mappings/"+flavor+"/"+ram;
            return HttpWrapper.send(url,{"operation":'GET'})
                    .then(function (response) {
                        return {
                            data: response
                        };
                    });
        };st.push({
                                id: network.id,
                                name: network.name,
                                tenant_id: network.tenant_id,
                                ip_address: network.accessIPv4,
                                hostId: network.hostId,
                                OS_DCF_diskConfig: network["OS-DCF:diskConfig"],
                                OS_EXT_STS_power_state: network["OS-EXT-STS:power_state"],
                                OS_EXT_STS_task_state: network["OS-EXT-STS:task_state"],
                                OS_EXT_STS_vm_state: network["OS-EXT-STS:vm_state"],
                                created: network.created,
                                updated:network.updated
                            });
                        });
                    }
                }

                return {
                    labels: data.labels,
                    data: networksList
                };
            }

            // get network list with only the required properties
            self.getTrimmedList = function() {
                var deferred = $q.defer();
                self.getAll().then(function(response) {
                    if(response.error)
                        return deferred.resolve(response);
                    return deferred.resolve(trimTransform(response));
                });
                return deferred.promise;
            };
        
            self.getDetailedList = function() {
                       var deferred = $q.defer();
                       self.getAll().then(function(response) {
                        if(response.error)
                                return deferred.resolve(response);
                           return deferred.resolve(detailsTransform(response));
                       });
                       return deferred.promise;
           };

            // get all network items from backend
            self.getAll = function () {
                
                var url = "/api/us-networks";

                if (!loaded) {

                    return HttpWrapper.send(url,{"operation":'GET'})
                                .then(function(response){
                                    loaded = true;
                                    networks = {
                                        labels: [
                                            {field: "name", text: "Network Name"},
                                            {field: "status", text: "Status"}
                                        ],
                                        data: response
                                    };
                                    return networks;
                                }, function(errorResponse) {
                                    return errorResponse;
                                });
                } else {
                    return $q.when(networks);
                }
            };

            // get network details of specific items
            self.getMigrationDetails = function (ids) {
                var url = "/static/angassets/network-migration-details.json";
                return $http.get(url)
                    .then(function (response) {
                        var data = response.data.filter(function (item) { return ids.indexOf(item.id) >= 0 });
                        return {
                            labels: ["Network Name", "Description", "Migration Status", "Progress", "View log details"],
                            data: data
                        };
                    });
            };

            self.getPricingDetails = function(flavor, ram){
            var url = "/api/compute/get_network_mappings/"+flavor+"/"+ram;
                return HttpWrapper.send(url,{"operation":'GET'})
                        .then(function (response) {
                            return {
                                data: response
                            };
                        });
            };

            return self;
        }]); // end of service definition
})();