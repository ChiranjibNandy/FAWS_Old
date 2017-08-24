(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:migrationitemdataservice
     * @description
     * This service acts as a facade which handles calling the specific service implementation for each resoource type (server, network etc).
     */
    angular.module("migrationApp")
        .service("migrationitemdataservice", ["serverservice", "networkservice", "contactservice", "httpwrapper", '$filter', "authservice", "datastoreservice", "$q", "$window", function (serverService, networkService, contactService, HttpWrapper, $filter, authservice, dataStoreService, $q, $window) {
            var loaded, loadbalancers, self = this, currentTenant = null, default_zone = 'us-east-1a';
            //the above default_zone is needed to get the default values.
            var prepareNames = function () {
                var servers = JSON.parse($window.localStorage.selectedServers);//dataStoreService.getItems("server");
                var names = {};
                names.instances = {};
                names.networks = {};

                angular.forEach(servers, function (item) {
                    names.instances[item.id] = item.name;
                    var networks = item.details.networks;
                    angular.forEach(networks, function (item) {
                        names.networks[item.id] = item.name;
                    });
                });

                return names;
            };// end of prepareNames method

            /**
             * @ngdoc method
             * @name getTrimmedAllItems
             * @methodOf migrationApp.service:migrationitemdataservice
             * @param {String} type Resource type (server, network etc)
             * @returns {Promise} a promise to fetch the list of resources of given _type_.
             * @description 
             * This service method returns a promise to fetch the list of resources given _type_ for a tenant.  
             * This operation trims the set of properties available with the service call and returns only the specific properties needed for its representation.
             */
            this.getTrimmedAllItems = function (type) { // should be moved to dashboard service
                if (type === "server") {
                    return serverService.getTrimmedList();
                } else if (type === "network") {
                    return networkService.getTrimmedList();
                    // } else if (type === "files") {
                    //     return networkService.getTrimmedList();
                } else if (type === "LoadBalancers") {
                    return self.getLoadBalancers();
                }
            }//end of getTrimmedAllItems method

            /**
             * @ngdoc method
             * @name getTrimmedItem
             * @methodOf migrationApp.service:migrationitemdataservice
             * @param {String} type Resource type (server, network etc)
             * @param {String} item_id Resource id (server, network etc)
             * @param {String} item_region Resources region
             * @returns {Promise} a promise to fetch the list of resources of given _type_.
             * @description
             * This service method returns a promise to fetch the list of resources given _type_ for a tenant.
             * This operation trims the set of properties available with the service call and returns only the specific properties needed for its representation.
             */
            this.getTrimmedItem = function (type, item_id, item_region) { // should be moved to dashboard service
                if (type === "server") {
                    return serverService.getTrimmedItem(item_id, item_region);
                } else if (type === "network") {
                    return networkService.getTrimmedItem(item_id, item_region);
                } else if (type === "files") {
                    //     return networkService.getTrimmedList();
                } else if (type === "LoadBalancers") {
                    // return self.getLoadBalancers();
                }
            }//end of getTrimmedItem method

            /**
             * @ngdoc method
             * @name getDetailedList
             * @methodOf migrationApp.service:migrationitemdataservice
             * @param {String} type Resource type (server, network etc)
             * @returns {Promise} a promise to fetch the detailed list of resources of given _type_.
             * @description 
             * This service method returns a promise to fetch the detailed list of resources of given _type_ for a tenant.
             */
            this.getDetailedList = function (type) {
                if (type === "server") {
                    return serverService.getDetailedList();
                } else if (type === "network") {
                    return networkService.getDetailedList();
                } else if (type === "files") {
                    return networkService.getTrimmedList();
                } else if (type === "LoadBalancers") {
                    return networkService.getTrimmedList();
                } else if (type === "contactNumbers") {
                    return contactService.getContactNumbers();
                }
            }//end of getDetailedList method

            /**
             * @ngdoc method
             * @name getPricingDetails
             * @methodOf migrationApp.service:migrationitemdataservice
             * @param {String} type Resource type (server, network etc)
             * @param {String} flavor Flavor of the resource to be migrated (this is specific to servers)
             * @param {String} ram Ram config of the resource to be migrated (this is specific to servers)
             * @returns {Promise} a promise to fetch the pricing details to migrate of a resource.
             * @description 
             * This service method returns a promise to fetch the pricing details to migrate a resource.
             */
            this.getPricingDetails = function (type, flavor, ram) {
                if (type === "server") {
                    return serverService.getPricingDetails(flavor, ram);
                }
            };//end of getPricingDetails method

            /**
             * @ngdoc method
             * @name prepareJobRequest
             * @methodOf migrationApp.service:migrationitemdataservice
             * @param {Boolean} precheck is 'true' for precheck job spec and 'false' for migration job sepc
             * @returns {Object} A request _object_ for subsequesnt request in migrating a resource.
             * @description 
             * This service method returns an _object_. This object has to be sent while making an HTTP POST request to migrate the resource.
             */
            this.prepareJobRequest = function (precheck) {
                var destaccount = JSON.parse($window.localStorage.getItem("fawsAccounts"));
                var equipments = {
                    instances: JSON.parse($window.localStorage.selectedServers),
                    networks: dataStoreService.getDistinctNetworks()
                };
                var auth = authservice.getAuth();
                var names = prepareNames();
                    
                var reqObj = {
                        source: {
                            tenantid: auth.tenant_id
                        },
                        destination: {
                            account: destaccount.selectedFawsAccountNumber
                        },
                        resources: {},
                        version: "v1"
                    };

                if (equipments.instances.length !=0)
                    reqObj.resources.instances = serverService.prepareServerList(equipments.instances); //add servers to the resources list
                if (equipments.networks.length != 0)  
                    reqObj.resources.networks = networkService.prepareNetworkList(equipments.networks); //add networks to the resources list

                if (precheck === true){ 
                    return reqObj;           //Precheck job-spec requires only these items, so exit from method now
                } //****************END OF PRECHECK JOB-SPEC*************************************************************************

                else if (precheck === false){       //migration job-spec needs following more items so continue configuring job-spec
                    reqObj.metadata = { 
                                batch_name: $window.localStorage.migrationName || dataStoreService.getScheduleMigration().migrationName,
                                initiated_by: auth.impersonator || auth.username
                            };
                    reqObj.create_ticket = true;
                    reqObj.names = names;
                    reqObj.source.live_migrate = dataStoreService.getScheduleMigration().live_migrate || false;

                    //add start time in the request object    
                    var currEPOCHTime = moment().unix();
                    var currISOTime = moment().toISOString();
                    if (dataStoreService.selectedTime.time === "" || dataStoreService.selectedTime.time < (currISOTime)) {
                        reqObj.start = currISOTime;
                        dataStoreService.selectedTime.time = reqObj.start;
                    } else {
                        //code for iso conversion
                        var isoDateTime = dataStoreService.selectedTime.time;
                        reqObj.start = moment.unix(isoDateTime).toISOString();
                        dataStoreService.selectedTime.time = reqObj.start;
                    }
                    return reqObj; //this is the final job-spec object 
                } //END OF MIGRATION JOB-SPEC
            }//end of prepareJobRequest method

            this.getServerMigrationStatus = function (tenant_id) {
                var url = "/api/server_status/" + tenant_id;
                return HttpWrapper.send(url, {
                    "operation": 'GET'
                })
                    .then(function (response) {
                        var status = {
                            server_status: response.server_status,
                            network_status: response.network_status
                        };
                        return status;
                    });
            }//end of getServerMigrationStatus method

            this.getResourceMigrationStatus = function (tenant_id) {
                var url = "/api/jobs/all";
                return HttpWrapper.send(url, {
                    "operation": 'GET'
                })
                    .then(function (response) {
                        return response;
                    },function(error) {
                        return false;
                    });
            }//end of getResourceMigrationStatus method

            /**
             * @ngdoc method
             * @name getAll
             * @methodOf migrationApp.service:migrationitemdataservice
             * @returns {Promise} a promise to fetch all servers.
             * @description 
             * Gets the entire list of servers in its raw JSON form, from the api.
             */
            this.getLoadBalancers = function () {
                //var url = "/static/angassets/servers-list.json";
                var url = "/api/clb/get_all";
                var tenant_id = authservice.getAuth().tenant_id;

                if (!loaded || (currentTenant !== tenant_id)) {

                    return HttpWrapper.send(url, {
                        "operation": 'GET'
                    })
                        .then(function (response) {
                            loaded = true;
                            currentTenant = tenant_id;
                            loadbalancers = {
                                labels: [{
                                    field: "name",
                                    text: "CLB Name"
                                },
                                {
                                    field: "clb status",
                                    text: "CLB Status"
                                },
                                {
                                    field: "id",
                                    text: "CLB ID"
                                },
                                {
                                    field: "migration status",
                                    text: "Migration Status"
                                }
                                ],
                                data: response
                            };
                            return loadbalancers;
                        }, function (errorResponse) {
                            return errorResponse;
                        });

                } else {
                    return $q.when(loadbalancers);
                }
            };//end of getLoadBalancers method

            /**
                 * @ngdoc method
                 * @name eligibilityPrecheck
                 * @methodOf migrationApp.service:migrationitemdataservice
                 * @description 
                 * Invokes "/api/eligibility" API call for checking eligibility of servers to migrate.
            */
            this.eligibilityPrecheck = function (itemsArr) {
                var tenant_id = authservice.getAuth().tenant_id;
                var requestObj = {
                    "source": {
                        "cloud": "rackspace",
                        "tenantid": tenant_id
                    },
                    "resources": {
                        "instances": itemsArr
                    },
                    "version": "v1"
                };
                return HttpWrapper.save("/api/eligibility", { "operation": 'POST' }, requestObj)
                    .then(function (result) {
                        return result;
                    }, function (error) {
                        return error;
                    });
            };

            return self;
        }]); // end of service definition
})();
