(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:migrationitemdataservice
     * @description
     * This service acts as a facade which handles calling the specific service implementation for each resoource type (server, network etc).
     */
    angular.module("migrationApp")
        .service("migrationitemdataservice", ["serverservice", "networkservice", "volumeservice", "contactservice", "httpwrapper", '$filter', "authservice", "datastoreservice", "$q", "$window", "cdnservice", "fileservice", "dnsservice", function (serverService, networkService, volumeService, contactService, HttpWrapper, $filter, authservice, dataStoreService, $q, $window, cdnservice, fileService, dnsService) {
            var loaded, loadbalancers, services, self = this,
                currentTenant = null,
                callInProgress = false,
                statusResponse,
                statusPromise,
                resultsLoaded;

            self.regionFetchedFlags = {
                server:false,
                network:false,
                volume:false,
                LoadBalancers:false,
                service:false,
                file:false,
                dns:false
            };

            self.storeRegionFetchedFlags = function(type,value){
                self.regionFetchedFlags[type] = value;
            };

            self.retrieveAllRegionFetchedFlags = function(type){
                if(type){
                    return self.regionFetchedFlags[type];
                }
                else{
                    return self.regionFetchedFlags;
                }
            };

            var prepareNames = function () {
                var servers = JSON.parse($window.localStorage.selectedResources)['server']; //dataStoreService.getItems("server");
                var cdn = JSON.parse($window.localStorage.selectedResources)['service'];
                var volumes = JSON.parse($window.localStorage.selectedResources)['volume'];
                var file = JSON.parse($window.localStorage.selectedResources)['file'];
                var dns = JSON.parse($window.localStorage.selectedResources)['dns'];
                var names = {};
                names.instances = {};
                names.networks = {};
                names.cdn = {};
                names.volumes = {};
                names.file = {};
                names.dns = {};

                angular.forEach(servers, function (item) {
                    names.instances[item.id] = item.name;
                    var networks = item.details.networks;
                    angular.forEach(networks, function (item) {
                        names.networks[item.id] = item.name;
                    });
                });
                angular.forEach(cdn, function (resource) {
                    names.cdn[resource.id] = resource.name;
                });
                angular.forEach(volumes, function (resource) {
                    names.volumes[resource.id] = resource.name;
                });
                angular.forEach(file, function (resource) {
                    names.file[resource.id] = resource.name;
                });
                angular.forEach(dns, function (resource) {
                    names.dns[resource.id] = resource.name;
                });
                return names;
            }; // end of prepareNames method

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
                } else if (type === "file") {
                    return fileService.getTrimmedList();
                } else if (type === "LoadBalancers") {
                    return self.getLoadBalancers();
                } else if (type === "service") {
                    return cdnservice.getServices();
                } else if (type === "volume") {
                    return volumeService.getTrimmedList();
                } else if (type === "dns") {
                    return dnsService.getDNS();
                }
            } //end of getTrimmedAllItems method

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
                    return networkService.getTrimmedItem(item_id);
                } else if (type === "file") {
                    return fileService.getTrimmedItem(item_id, item_region );
                } else if (type === "LoadBalancers") {
                    // return self.getLoadBalancers();
                } else if( type === "service") {
                    return cdnservice.getTrimmedItem(item_id);
                } else if( type === "volume") {
                    return volumeService.getTrimmedItem(item_id, item_region );
                } else if( type === "dns") {
                    return dnsService.getTrimmedItem(item_id);
                }
            } //end of getTrimmedItem method

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
                } else if (type === "file") {
                    return fileService.getTrimmedList();
                } else if (type === "LoadBalancers") {
                    return networkService.getTrimmedList();
                } else if (type === "contactNumbers") {
                    return contactService.getContactNumbers();
                }
            } //end of getDetailedList method

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
            }; //end of getPricingDetails method

            /**
             * @ngdoc method
             * @name prepareJobRequest
             * @methodOf migrationApp.service:migrationitemdataservice
             * @param {Booelan} type Boolean value to determine whether the method should return pre-req job-spec (true) or migration job-spec (false)
             * @returns {Object} A request _object_ for subsequesnt request in migrating a resource.
             * @description 
             * This service method returns an _object_. This object has to be sent while making an HTTP POST request to migrate the resource.
             */
            this.prepareJobRequest = function (precheck) {
                var destaccount = JSON.parse($window.localStorage.getItem("fawsAccounts"));
                var auth = authservice.getAuth();
                
                //initialise job-spec object with common items (precheck and migration)
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

                //prepare the lists of resources
                var services = cdnservice.prepareCdnList();
                var volumes = volumeService.prepareVolList();
                var servers = serverService.prepareServerList();
                var cloudfiles = fileService.prepareFilesList();
                var networks = networkService.prepareNetworkList();
                
                //add the resources to the job-spec if the list are not empty
                if (servers.length > 0) {
                    reqObj.resources.instances = servers; 
                }
                if (networks.length > 0) { 
                    reqObj.resources.networks = networks;
                }
                if (services.length > 0) {
                    reqObj.resources.cdn = services;
                }
                if (volumes.length > 0) {
                    reqObj.resources.volumes = volumes;
                }
                if (cloudfiles.length > 0) {
                    reqObj.resources.cloudfiles = cloudfiles;
                }
                    
                if (precheck === true){ //exit now, if the call to this method was made for creating precheck job-spec object
                    return reqObj;

                } else if (precheck === false){ // otherwise, continue adding more details to the job spec for migration object

                    reqObj.metadata = {
                            batch_name: dataStoreService.getScheduleMigration().migrationName,
                            initiated_by: auth.username
                    };
                    if (auth.is_impersonator)
                        reqObj.metadata.impersonated_by = auth.impersonator;

                    reqObj.create_ticket= true;
                    reqObj.names = prepareNames();
                    reqObj.source.live_migrate = dataStoreService.getScheduleMigration().live_migrate || false;
                    

                    //time calculations for scheduling the migration
                    var currEPOCHTime = moment().unix();
                    var currISOTime = moment().toISOString();
                    if (dataStoreService.selectedTime.time === "" || dataStoreService.selectedTime.time < (currISOTime)) {
                        reqObj.start = currISOTime;
                        dataStoreService.selectedTime.time = reqObj.start;
                    } else {
                        //code for iso conversion
                        var isoDateTime = dataStoreService.selectedTime.time;
                        reqObj.start = moment.unix(isoDateTime).toISOString(); //add time stamp to job-spec
                        dataStoreService.selectedTime.time = reqObj.start; //reset the time in selected time object
                    }
                return reqObj; //this is the final job-spec for migration
                }
                
            } //end of prepareJobRequest method

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
            } //end of getServerMigrationStatus method

            this.getResourceMigrationStatus = function (tenant_id) {
                var url = "/api/combined/dashboard";
                if (callInProgress == false && dataStoreService.getResourceLoadingStatus("jobStatus") == false) {
                    callInProgress = true;
                    statusPromise = HttpWrapper.send(url, {
                            "operation": 'GET'
                        })
                        .then(function (response) {
                            $window.localStorage.statusResponse = JSON.stringify(response);
                            callInProgress = false;
                            dataStoreService.setResourceLoadingStatus("jobStatus", true);
                            return response;
                        }, function (error) {
                            callInProgress = false;
                            dataStoreService.setResourceLoadingStatus("jobStatus", false);
                            return false;
                        });
                    return statusPromise;
                } else if (callInProgress) {
                    return statusPromise;
                } else if (callInProgress == false && dataStoreService.getResourceLoadingStatus("jobStatus") == true) {
                    return $q.when(JSON.parse($window.localStorage.statusResponse));
                }
            }; //end of getResourceMigrationStatus method

            this.getAllEc2Regions = function (type) {
                resultsLoaded = HttpWrapper.send('/api/aws/regions/ec2', {"operation": 'GET'});
                self.storeRegionFetchedFlags(type,true);
                return resultsLoaded;
            };//end of getAllEc2Regions method

            /**
             * @ngdoc method
             * @name getLoadBalancers
             * @methodOf migrationApp.service:migrationitemdataservice
             * @returns {Promise} a promise to fetch all servers.
             * @description 
             * Gets the entire list of load balancers in its raw JSON form, from the api.
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
            }; //end of getLoadBalancers method

            /**
             * @ngdoc method
             * @name eligibilityPrecheck
             * @methodOf migrationApp.service:migrationitemdataservice
             * @description 
             * Invokes "/api/eligibility" API call for checking eligibility of servers to migrate.
             */
            this.eligibilityPrecheck = function (itemsArr, type) {
                var tenant_id = authservice.getAuth().tenant_id;
                var instance_type = (type == 'server' && "instances") || (type == 'volume' && "volumes") || (type == 'service' && "cdn") || (type == 'file' && "cloudfiles") || (type == 'dns' && "dns");
                var requestObj = {
                    "source": {
                        "cloud": "rackspace",
                        "tenantid": tenant_id
                    },
                    "resources": {
                        [instance_type]: itemsArr
                    },
                    "version": "v1"
                };
                return HttpWrapper.save("/api/eligibility", {
                        "operation": 'POST'
                    }, requestObj)
                    .then(function (result) {
                        return result;
                    }, function (error) {
                        return false;
                    });
            };

            return self;
        }]); // end of service definition
})();
