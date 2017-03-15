(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:migrationitemdataservice
     * @description
     * This service acts as a facade which handles calling the specific service implementation for each resoource type (server, network etc).
     */
    angular.module("migrationApp")
        .service("migrationitemdataservice", ["serverservice", "networkservice", "contactservice", "httpwrapper",'$filter',"authservice", "datastoreservice", "$q", function (serverService, networkService, contactService, HttpWrapper, $filter,authservice, dataStoreService, $q) {
            var self = this;

            var prepareNames = function() {
                var servers = dataStoreService.getItems("server");
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
            this.getTrimmedAllItems = function (type) { // should be moved to dashboard service
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
            this.prepareRequest = function(batchName){
                console.log(dataStoreService.getItems("server"));
                var equipments = {
                        instances : dataStoreService.getItems("server"),
                        networks : dataStoreService.getDistinctNetworks()
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
                equipments.instances.map(function(instance){
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
                equipments.networks.map(function(network){
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

                if(dataStoreService.selectedTime.time === "" || dataStoreService.selectedTime.time < moment().unix()){
                    reqObj.start = moment().unix();
                    dataStoreService.selectedTime.time = reqObj.start;
                }else{
                    reqObj.start = dataStoreService.selectedTime.time;
                }

                reqObj.resources.instances = instancesReqList; //add servers to the resources list
                if (networksReqList[0] != null){               //add networks to the resources list iff there are any networks
                    reqObj.resources.networks = networksReqList;
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

            this.getResourceMigrationStatus = function(tenant_id){
                var url = "/api/jobs/" + tenant_id;
                return HttpWrapper.send(url,{"operation":'GET'})
                                  .then(function(response){
                                      return response;
                                  });
            }

            return self;
       }]); // end of service definition
})();