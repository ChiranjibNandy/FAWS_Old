(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:migrationitemdataservice
     * @description
     * This service acts as a facade which handles calling the specific service implementation for each resoource type (server, network etc).
     */
    angular.module("migrationApp")
        .service("migrationitemdataservice", ["serverservice", "networkservice", "contactservice", "httpwrapper", '$filter', "authservice", "datastoreservice", "$q", function (serverService, networkService, contactService, HttpWrapper, $filter, authservice, dataStoreService, $q) {
            var loaded, loadbalancers, self = this, currentTenant = null;

            var prepareNames = function () {
                var servers = dataStoreService.getItems("server");
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
            };

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
            }

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
            }

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
            };

            /**
             * @ngdoc method
             * @name prepareRequest
             * @methodOf migrationApp.service:migrationitemdataservice
             * @param {String} type Resource type (server, network etc)
             * @param {Object} info Object containing the relevant data to prepare the request object
             * @returns {Object} A request _object_ for subsequesnt request in migrating a resource.
             * @description 
             * This service method returns an _object_. This object has to be sent while making an HTTP POST request to migrate the resource.
             */
            this.prepareRequest = function (batchName) {
                var equipments = {
                        instances: dataStoreService.getItems("server"),
                        networks: dataStoreService.getDistinctNetworks()
                    },
                    auth = authservice.getAuth(),
                    names = prepareNames(),
                    instancesReqList = [],
                    networksReqList = [],
                    reqObj = {
                        batch_name: dataStoreService.getScheduleMigration().migrationName,
                        names: names,
                        source: {
                            tenantid: auth.tenant_id
                        },
                        resources: {},
                        version: "v1"
                    };

                // prepare servers/instances request object
                equipments.instances.map(function (instance) {
                    instancesReqList.push({
                        source: {
                            id: instance.id,
                            region: instance.region.toUpperCase(),
                        },
                        destination: {
                            region: instance.selectedMapping.region, //.toUpperCase(),
                            zone: "us-east-1a",
                            // zone:instance.selectedMapping.zone,
                            type: instance.selectedMapping.instance_type
                        }
                    });
                });

                // prepare networks request object
                equipments.networks.map(function (network) {
                    networksReqList.push({
                        source: {
                            region: network.region.toUpperCase()
                        },
                        destination: {
                            region: network.destRegion, //.toUpperCase(),
                            default_zone: "us-east-1a"
                        },
                        subnets: "All",
                        instances: "All",
                        security_groups: "All"
                    });
                });

                if (dataStoreService.selectedTime.time === "" || dataStoreService.selectedTime.time < moment().unix()) {
                    reqObj.start = moment().unix();
                    dataStoreService.selectedTime.time = reqObj.start;
                } else {
                    reqObj.start = dataStoreService.selectedTime.time;
                }

                reqObj.resources.instances = instancesReqList; //add servers to the resources list
                if (networksReqList[0] != null) { //add networks to the resources list iff there are any networks
                    reqObj.resources.networks = networksReqList;
                }
                return reqObj;
            }

            //this function has to be removed once removed , there are lot of hardcoded values in here
            this.prepareTemporaryRequest = function (batchName) {
                var equipments = {
                        instances: dataStoreService.getItems("server"),
                        networks: dataStoreService.getDistinctNetworks()
                    },
                    auth = authservice.getAuth(),
                    names = prepareNames(),
                    instancesReqList = [],
                    networksReqList = [],
                    reqObj = {
                        //batch_name: dataStoreService.getScheduleMigration().migrationName,
                        //names: names,
                        source: {
                            auth: {
                                apikey: "f42046566954470dbaa31d6378916bb1",
                                method: "key",
                                type: "customer",
                                username: "RSMTDev1"
                            },
                            cloud: "rackspace",
                            tenantid: "1024814"
                        },
                        resources: {},
                        version: "v1"
                    };
                reqObj.destination = {
                        account :"rax-9391b0f6b8264c6f8efbe2794a541548",
                        auth : {
                            accesskey : "AKIAIUHV3Q5R7JDRDRBQ",
                            method : "keys",
                            secretkey :  "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"
                        },
                        cloud : "aws"
                    };
                // prepare servers/instances request object
                equipments.instances.map(function (instance) {
                    instancesReqList.push({
                        source: {
                            id: instance.id,
                            region: instance.region.toUpperCase(),
                        },
                        destination: {
                            region: instance.selectedMapping.region, //.toUpperCase(),
                            zone: "us-east-1a",
                            // zone:instance.selectedMapping.zone,
                            type: instance.selectedMapping.instance_type
                        }
                    });
                });

                // prepare networks request object
                equipments.networks.map(function (network) {
                    networksReqList.push({
                        source: {
                            region: network.region.toUpperCase()
                        },
                        destination: {
                            region: network.destRegion, //.toUpperCase(),
                            default_zone: "us-east-1a"
                        },
                        subnets: "All",
                        instances: "All",
                        security_groups: "All"
                    });
                });

                if (dataStoreService.selectedTime.time === "" || dataStoreService.selectedTime.time < moment().unix()) {
                    //reqObj.start = moment().unix();
                    dataStoreService.selectedTime.time = reqObj.start;
                } else {
                    //reqObj.start = dataStoreService.selectedTime.time;
                }

                reqObj.resources.instances = instancesReqList; //add servers to the resources list
                if (networksReqList[0] != null) { //add networks to the resources list iff there are any networks
                    reqObj.resources.networks = networksReqList;
                }
                return reqObj;
            }


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
            }

            this.getResourceMigrationStatus = function (tenant_id) {
                var url = "/api/jobs/all";
                return HttpWrapper.send(url, {
                        "operation": 'GET'
                    })
                    .then(function (response) {
                        return response;
                    });
            }

            /**
             * @ngdoc method
             * @name getAll
             * @methodOf migrationApp.service:serverservice
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
            };

            return self;
        }]); // end of service definition
})();