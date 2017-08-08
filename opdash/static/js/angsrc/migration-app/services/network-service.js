(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:networkservice
     * @description
     * Service to retrieve all data for network resources
     */
    angular.module("migrationApp")
        .factory("networkservice", ["httpwrapper", "$q", "authservice", "serverservice", "$window", "datastoreservice", function (HttpWrapper, $q, authservice, serverService, $window, datastoreservice) {
            // local variables to help cache data
            var loaded, networks, self = this, default_zone = 'us-east-1a';

            // function to transform the data from api call
            function trimTransform(data) {
                var networksList = [];
                var t = data.data;
                for (var key in t) {
                    // iterate over networks by region
                    if (t.hasOwnProperty(key)) {
                        // iterate over each network and extract necessary data
                        //ip_address is id 
                        angular.forEach(t[key].networks, function (network) {
                            networksList.push({
                                id: network.id,
                                rrn: network.rrn,
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
            function detailsTransform(data) {
                var networksList = [];
                var t = data.data;

                for (var key in t) {
                    // iterate over networks by region
                    if (t.hasOwnProperty(key)) {
                        // iterate over each network and extract necessary data

                        angular.forEach(t[key].networks, function (network) {
                            networksList.push({
                                id: network.id,
                                rrn: network.rrn,
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

            function transformNetwork(network){
                return {
                id: network.id,
                rrn: network.rrn,
                name: network.name,
                };
            };

            self.getTrimmedItem = function(item_id){
                var deferred = $q.defer();
                serverService.getTrimmedList().then(function (response) {
                if (response.error)
                    return deferred.resolve(response);
                else {
                    var networkList = [];
                    angular.forEach(response.data, function (server) {
                        angular.forEach(server.details.networks, function (network) {
                            if (networkList.filter(function (listItem) { return listItem.id === network.id }).length === 0) {
                                networkList.push(network);
                            };
                        });
                    });
                    angular.forEach(networkList,function(network){
                        if(network.id === item_id){
                            return deferred.resolve(transformNetwork(network));
                        }
                    });
                }
                });
                return deferred.promise;
            };
            
            // function to get specific details of a network based on its id
            var getNetworkDetails = function (id) {
                var t = networks.data;
                for (var key in t) {
                    if (t.hasOwnProperty(key)) {
                        for (var i = 0; i < t[key].networks.length; i++) {
                            if (t[key].networks[i].id === id) {
                                var network = t[key].networks[i];

                                return {
                                    region: key,
                                    subnets: network.subnets.map(function (subnetId) { return { id: subnetId }; })
                                }
                            }
                        }
                    }
                }
            }

            self.getNetworkDetails = function (id) {
                var t = networks.data;
                for (var key in t) {
                    if (t.hasOwnProperty(key)) {
                        for (var i = 0; i < t[key].networks.length; i++) {
                            if (t[key].networks[i].id === id) {
                                var network = t[key].networks[i];

                                return {
                                    region: key,
                                    subnets: network.subnets.map(function (subnetId) { return { id: subnetId }; })
                                }
                            }
                        }
                    }
                }
            }

            /**
             * @ngdoc method
             * @name getTrimmedList
             * @methodOf migrationApp.service:networkservice
             * @returns {Promise} a promise to fetch the list of networks.
             * @description 
             * Get a list of networks for a tenant. It returns only a definite set of properties of a network for its representation.
             */
            self.getTrimmedList = function () {
                var deferred = $q.defer();
                serverService.getTrimmedList().then(function (response) {
                    if (response.error)
                        return deferred.resolve(response);
                    else {
                        var networkList = [];
                        angular.forEach(response.data, function (server) {
                            angular.forEach(server.details.networks, function (network) {
                                if (networkList.filter(function (listItem) { return listItem.id === network.id }).length === 0) {
                                    networkList.push(network);
                                };
                            });
                        });

                        return deferred.resolve({ data: networkList });
                    }
                });
                return deferred.promise;
            };

            /**
             * @ngdoc method
             * @name getDetailedList
             * @methodOf migrationApp.service:networkservice
             * @returns {Promise} a promise to fetch the list of networks.
             * @description 
             * Get detailed info on all the networks of a tenant as a list
             */
            self.getDetailedList = function () {
                var deferred = $q.defer();
                self.getAll().then(function (response) {
                    if (response.error)
                        return deferred.resolve(response);
                    return deferred.resolve(detailsTransform(response));
                });
                return deferred.promise;
            };

            /**
             * @ngdoc method
             * @name getAll
             * @methodOf migrationApp.service:networkservice
             * @returns {Promise} a promise to fetch all networks
             * @description 
             * Gets the entire list of networks in its raw JSON form, from the api.
             */
            self.getAll = function () {

                var url = "/api/us-networks";

                if (!loaded) {

                    return HttpWrapper.send(url, { "operation": 'GET' })
                        .then(function (response) {
                            loaded = true;
                            networks = {
                                labels: [
                                    { field: "name", text: "Network Name" },
                                    { field: "shared", text: "Shared" },
                                    { field: "status", text: "Status" }
                                ],
                                data: response
                            };
                            return networks;
                        }, function (errorResponse) {
                            return errorResponse;
                        });
                } else {
                    return $q.when(networks);
                }
            };

            /**
            * @ngdoc method
            * @name prepareNetworkList
            * @methodOf migrationApp.service:networkservice
            * @returns network instance request object.
            * @description
            * prepare network instance request object
            */
            self.prepareNetworkList = function (networksReqList) {
                if ($window.localStorage.selectedResources !== undefined) {
                    var equipments = {
                        instances: JSON.parse($window.localStorage.selectedResources)['server'],//dataStoreService.getItems("server")
                        networks: datastoreservice.getDistinctNetworks()
                    }
                }
                var networksReqList = [];
                networksReqList = equipments.networks.map(function (network) {
                    return {
                        source: {
                            region: network.region.toUpperCase()
                        },
                        destination: {
                            region: network.destRegion, //.toUpperCase(),
                            default_zone: network.destZone || default_zone
                        },
                        subnets: [
                            {
                                id: network.rrn
                            }
                        ],
                        instances: [
                            {
                                id: network.instanceRrn
                            }
                        ],
                        security_groups: "All"
                    };
                });
                return networksReqList;
            }
            return self;
        }]); // end of service definition
})();