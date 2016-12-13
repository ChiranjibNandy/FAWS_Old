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
                                id: network.id,
                                name: network.name,
                                shared: network.shared ? "Yes" : "No",
                                status: network.status,
                                tenant_id: network.tenant_id
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
                            networksList.push({
                                id: network.id,
                                name: network.name,
                                admin_state_up: network.admin_state_up ? "Yes" : "No",
                                shared: network.shared ? "Yes" : "No",
                                subnets: network.subnets,
                                status: network.status,
                                tenant_id: network.tenant_id
                            });
                        });
                    }
                }

                return {
                    labels: data.labels,
                    data: networksList
                };
            }

            self.getPricingDetails = function(flavor, ram){
                var url = "/api/get_server_mappings/"+flavor+"/"+ram;
                return HttpWrapper.send(url,{"operation":'GET'})
                        .then(function (response) {
                            return {
                                data: response
                            };
                        });
            };

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
                                            {field: "shared", text: "Shared"},
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