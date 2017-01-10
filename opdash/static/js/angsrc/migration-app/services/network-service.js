(function () {
    "use strict";

    angular.module("migrationApp")
        .factory("networkservice", ["httpwrapper", "$q", "authservice", function (HttpWrapper, $q, authservice) {
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
                                tenant_id: network.tenant_id,
                                subnets: network.subnets
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

            // function to get specific details of a network based on its id
            var getNetworkDetails = function(id){
                var t = networks.data;
                for(var key in t){
                    if(t.hasOwnProperty(key)){
                        for(var i=0; i<t[key].networks.length; i++){
                            if(t[key].networks[i].id === id){
                                var network = t[key].networks[i];

                                return {
                                    region: key,
                                    subnets: network.subnets.map(function(subnetId){ return {id: subnetId}; })
                                }
                            }
                        }
                    }
                }
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
        
            // get detailed info on all the networks of a tenant as a list
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

            // prepares request object to be submitted for migration
            self.prepareRequest = function(info){
                var network = getNetworkDetails(info.id);
                var auth = authservice.getAuth();
                
                var request = {
                    source: {
                        cloud: "rackspace",
                        tenantid: auth.tenant_id,
                        auth: {
                            method: "key",
                            type: "customer",
                            username: auth.rackUsername,
                            apikey: auth.rackAPIKey
                        }
                    },
                    destination: {
                        cloud: "aws",
                        account: auth.awsAccount,
                        auth: {
                            method: "keys",
                            accesskey: auth.accessKey,
                            secretkey: auth.secretKey
                        }
                    },
                    resources: {
                        networks: [
                            {
                                source: {
                                    region: network.region
                                },
                                destination: {
                                    region: info.region,
                                    default_zone: "us-east-1a"
                                },
                                subnets: [{id:info.id}],
                                // instances: "All",
                                // security_groups: "All"
                            }
                        ]
                    },
                    version: "v1"
                };

                return request;
            };

            return self;
        }]); // end of service definition
})();