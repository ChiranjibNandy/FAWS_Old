(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:serverservice
     * @description
     * Service to retrieve all data for server resources
     */
    angular.module("migrationApp").factory("serverservice", ["httpwrapper", "$q", "authservice", function (HttpWrapper, $q, authservice) {
        // local variables to help cache data
        var loaded, servers, self = this;

        // function to transform the data from api call for overview display
        function trimTransform (data) {
            var serversList = [];
            var t = data.data;
            for(var key in t){
                // iterate over networks by region
                if (t.hasOwnProperty(key)) {
                    // iterate over each network and extract necessary data
                    angular.forEach(t[key].servers, function(server) {
                        serversList.push({
                            id: server.id,
                            name: server.name,
                            tenant_id: server.tenant_id,
                            ip_address: server.accessIPv4,
                            status: server.status,
                            ram: server.flavor_details.ram,
                            details: server // NEED ALL THE DETAILS
                        });
                    });
                }
            }

            return {
                labels: data.labels,
                data: serversList
            };
        }

        // function to transform the data from api call for details display
        function detailsTransform (data) {
            var serversList = [];
            var t = data.data;

            for(var key in t){
                // iterate over networks by region
                if (t.hasOwnProperty(key)) {
                    // iterate over each network and extract necessary data

                    angular.forEach(t[key].servers, function(server) {
                        serversList.push({
                            id: server.id,
                            name: server.name,
                            tenant_id: server.tenant_id,
                            ip_address: server.accessIPv4,
                            hostId: server.hostId,
                            OS_DCF_diskConfig: server["OS-DCF:diskConfig"],
                            OS_EXT_STS_power_state: server["OS-EXT-STS:power_state"],
                            OS_EXT_STS_task_state: server["OS-EXT-STS:task_state"],
                            OS_EXT_STS_vm_state: server["OS-EXT-STS:vm_state"],
                            created: server.created,
                            updated:server.updated
                        });
                    });
                }
            }

            return {
                labels: data.labels,
                data: serversList
            };
        }

        // get the region of a server based on its id
        var getRegionById = function(id){
            var t = servers.data;
            for(var key in t){
                if(t.hasOwnProperty(key)){
                    for(var i=0; i<t[key].servers.length; i++){
                        if(t[key].servers[i].id === id)
                            return key;
                    }
                }
            }
        };

        self.getRegionById = function(id){
            var t = servers.data;
            for(var key in t){
                if(t.hasOwnProperty(key)){
                    for(var i=0; i<t[key].servers.length; i++){
                        if(t[key].servers[i].id === id)
                            return key;
                    }
                }
            }
        };

        /**
         * @ngdoc method
         * @name getTrimmedList
         * @methodOf migrationApp.service:serverservice
         * @returns {Promise} a promise to fetch the list of servers.
         * @description 
         * Get a list of servers for a tenant. It returns only a definite set of properties of a server for its representation.
         */
        self.getTrimmedList = function() {
            var deferred = $q.defer();
            self.getAll().then(function(response) {
                if(response.error)
                    return deferred.resolve(response);
                return deferred.resolve(trimTransform(response));
            });
            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name getDetailedList
         * @methodOf migrationApp.service:serverservice
         * @returns {Promise} a promise to fetch the list of servers.
         * @description 
         * Get detailed info on all the servers of a tenant as a list
         */
        self.getDetailedList = function() {
            var deferred = $q.defer();
            self.getAll().then(function(response) {
                if(response.error)
                    return deferred.resolve(response);
                return deferred.resolve(detailsTransform(response));
            });
            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name getAll
         * @methodOf migrationApp.service:serverservice
         * @returns {Promise} a promise to fetch all servers.
         * @description 
         * Gets the entire list of servers in its raw JSON form, from the api.
         */
        self.getAll = function () {
            //var url = "/static/angassets/servers-list.json";
            var url = "/api/compute/us-instances";

            if (!loaded) {

                return HttpWrapper.send(url,{"operation":'GET'})
                                .then(function(response){
                                    loaded = true;
                                    servers = {
                                        labels: [
                                                    {field: "name", text: "Server Name"},
                                                    {field: "ip_address", text: "IP Address"},
                                                    {field: "ram", text: "RAM"},
                                                    {field: "status", text: "Status"}
                                                ],
                                        data: response
                                    };
                                    return servers;
                                }, function(errorResponse) {
                                    return errorResponse;
                                });

            } else {
                return $q.when(servers);
            }
        };

        /**
         * @ngdoc method
         * @name getPricingDetails
         * @methodOf migrationApp.service:serverservice
         * @param {String} rs_flavor_id The flavor of the server in Rackspace domain
         * @param {String} aws_region The AWS region to which the server needs to be migrated
         * @returns {Promise} a promise to return an object containing pricing details
         * @description 
         * Get pricing details of a server based on its flavor and the aws region to which it needs to be migrated
         */
        self.getPricingDetails = function(rs_flavor_id, aws_region){
            var url = "/api/compute/mappings_and_prices/"+rs_flavor_id+"/"+aws_region;
            //var url = "/static/angassets/pricing-details.json";
            return HttpWrapper.send(url,{"operation":'GET'})
                    .then(function (response) {
                        return {
                            data: response
                        };
                    });
        };

        /**
         * @ngdoc method
         * @name getJobTasks
         * @methodOf migrationApp.service:serverservice
         * @param {String} jobId The job id allocated for the server migration
         * @returns {Promise} a promise to return an array of tasks under the given job
         * @description
         * Get the list of all tasks involved in migration of a server
         */
        self.getJobTasks = function(jobId){
            var url = "/api/job/"+jobId;
            return HttpWrapper.send(url,{"operation":'GET'})
                    .then(function (response) {
                        return {
                            data: response
                        };
                    });
        };

        /**
         * @ngdoc method
         * @name prepareRequest
         * @methodOf migrationApp.service:serverservice
         * @returns {Object} The request object to be used in the subsequent call for migration
         * @description 
         * Prepares request object to be submitted for server migration
         */
        self.prepareRequest = function(info){
           var region = getRegionById(info.id);
           var auth = authservice.getAuth();

           return {
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
               resources: {
                   instances: [
                       {
                           source: {
                               id: info.id,
                               region: region,
                           },
                           destination: {
                               region: "us-east-1",
                               zone: "us-east-1a",
                               type: info.type
                           }
                       }
                   ]
               },
               version: "v1"
           };
        }

        return self;
    }]);
})();
