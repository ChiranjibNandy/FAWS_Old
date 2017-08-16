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
            * @name prepareNetworkInstance
            * @methodOf migrationApp.service:networkservice
            * @returns network instance request object.
            * @description
            * prepare network instance request object
            */
            self.prepareNetworkList = function (networksReqList) {
                var networksReqList = [];

                if ($window.localStorage.selectedServers !== undefined) {
                    var networks = datastoreservice.getDistinctNetworks();
                    // var instanceList =[];

                    angular.forEach(networks, function (distinctNetwork) {
                        var pushed=0;
                        for(var i=0;i<networksReqList.length;i++){
                            if(networksReqList[i].destination.region === distinctNetwork.destRegion) { //if the region match add only subnet id and instance id
                                var subnetList = [];    
                                for(var j=0; j<networksReqList[i].subnets.length; j++) //fetch list of all subnnet ids of this network
                                    subnetList[j] = networksReqList[i].subnets[j].id;

                                if(subnetList.indexOf(distinctNetwork.rrn) == -1) { //to avoid multiple entries
                                    networksReqList[i].subnets.push({id:distinctNetwork.rrn});
                                    subnetList.push(distinctNetwork.rrn);
                                }

                                var instanceList =[];
                                for(var j=0; j<networksReqList[i].instances.length; j++) //fetch list of all instances of this network
                                    instanceList[j] = networksReqList[i].instances[j].id;

                                if(instanceList.indexOf(distinctNetwork.instanceRrn) == -1) {  //to avoid multiple entries
                                    networksReqList[i].instances.push({id:distinctNetwork.instanceRrn});
                                    instanceList.push(distinctNetwork.instanceRrn);
                                }
                                pushed=1; //turn the flag on to avoid double entry of the network
                            }
                        }// end of inner for loop

                        if(pushed===0){      //in case the regions didnt match, it is a new entry in the network list
                            var tempobj = {
                                source: {
                                    region: distinctNetwork.region.toUpperCase()
                                },
                                destination: {
                                    region: distinctNetwork.destRegion, //.toUpperCase(),
                                    default_zone: distinctNetwork.destZone || default_zone
                                },
                                subnets: [
                                    {
                                        id: distinctNetwork.rrn
                                    }
                                ],
                                instances: [
                                    {
                                        id: distinctNetwork.instanceRrn
                                    }
                                ],
                                security_groups: "All"
                            };
                            // instanceList.push(distinctNetwork.instanceRrn);  
                            networksReqList.push(tempobj); //add the new object to the network list
                        }//end of if condition
                                            
                    });//end of outer for loop
                }        
                return networksReqList;
            }
            return self;
        }]); // end of service definition
})();