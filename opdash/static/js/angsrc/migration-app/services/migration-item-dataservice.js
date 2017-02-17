(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:migrationitemdataservice
     * @description
     * This service acts as a facade which handles calling the specific service implementation for each resoource type (server, network etc).
     */
    angular.module("migrationApp")
        .service("migrationitemdataservice", ["serverservice", "networkservice", "contactservice", "httpwrapper",'$filter',"authservice", "datastoreservice", function (serverService, networkService, contactService, HttpWrapper, $filter,authservice, dataStoreService) {
            var self = this;

            var prepareNames = function() {
                var servers = dataStoreService.selectedItems.server;
                var names = {};
                names.instances = {};
                names.networks = {};

                angular.forEach(servers, function(item) {
                    names.instances[item.id] = item.name;
                    var networks = item.details.networks;
                    angular.forEach(networks, function(item) {
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
            this.getTrimmedAllItems = function (type) {
                if (type === "server") {
                    return serverService.getTrimmedList();
                }
                else if (type === "network") {
                    return networkService.getTrimmedList();
                }
                 else if (type === "files") {
                    return networkService.getTrimmedList();
                }
                 else if (type === "loadBalancers") {
                    return networkService.getTrimmedList();
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
            this.getDetailedList = function(type) {
                if (type === "server") {
                    return serverService.getDetailedList();
                }
                else if (type === "network") {
                    return networkService.getDetailedList();
                }
                else if (type === "files") {
                    return networkService.getTrimmedList();
                }
                else if (type === "loadBalancers") {
                    return networkService.getTrimmedList();
                }
                else if (type === "contactNumbers") {
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
            this.getPricingDetails = function(type, flavor, ram) {
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
            this.prepareRequest = function(equipments, batchName){
                // console.log(dataStoreService.selectedTime.time);
                var instances = [],networks = [];
                var auth = authservice.getAuth();
                var names = prepareNames();
                var reqObj = {
                                batch_name: batchName,
                                //start: dataStoreService.selectedTime.time,
                                start: parseInt((new Date().getTime()/1000), 10),
                                names: names,
                                source: {
                                    cloud: "rackspace",
                                    tenantid: "1024814",
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
                                resources: {},
                                version: "v1"
                            };

                equipments.map(function(item){
                    if(item.equipmentType === "server"){
                        var region = serverService.getRegionById(item.id);
                            instances.push({
                                source: {
                                    id: item.id,
                                    region: region.toUpperCase(),
                                },
                                destination: {
                                    region: "us-east-1",
                                    zone: "us-east-1a",
                                    type: item.type
                                }
                        });
                    }else if(item.equipmentType === "network"){
                        var network = networkService.getNetworkDetails(item.id);
                        networks.push({
                            source: {
                                region: network.region
                            },
                            destination: {
                                region: item.region,
                                default_zone: "us-east-1a"
                            },
                            subnets: "All",
                            instances: "All",
                            security_groups: "All"
                        })
                    }
                     else if (item.equipmentType === "files") {
                        return networkService.getTrimmedList(info);
                    }
                    else if (item.equipmentType === "loadBalancers") {
                        return networkService.getTrimmedList(info);
                    }
                });

                if(instances.length > 0 ){
                    reqObj.resources.instances = instances;
                }
                if(networks.length > 0){
                    reqObj.resources.networks = networks;
                }
                return reqObj;
            }

            this.getServerMigrationStatus = function(tenant_id){
                var url = "/api/server_status/" + tenant_id;
                return HttpWrapper.send(url,{"operation":'GET'})
                                  .then(function(response){
                                      var status = {
                                          server_status: response.server_status,
                                          network_status: response.network_status
                                      };
                                      return status;
                                  });
            }

            return self;
       }]); // end of service definition
})();