(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:LoadBalancerservice
     * @description
     * Service to retrieve all data for LoadBalancer resources
     */
    angular.module("migrationApp").factory("LoadBalancerservice", ["httpwrapper", "$q", "authservice","$window","datastoreservice","DEFAULT_VALUES", function (HttpWrapper, $q, authservice,$window,datastoreservice,DEFAULT_VALUES) {
        // local variables to help cache data
        var loaded, LoadBalancers, self = this, currentTenant = null, 
            callInProgress = false,
            LoadBalancerPromise;

        // function to transform the data from api call for overview display
        function trimTransform (data) {
            var LoadBalancersList = [];
            var t = data.data;
            for(var key in t){
                // iterate over networks by region
                if (t.hasOwnProperty(key) && t[key].length > 0) {
                    // iterate over each network and extract necessary data
                    angular.forEach(t[key], function(LoadBalancer) {
                        LoadBalancersList.push({
                            id: LoadBalancer.id,
                            name: LoadBalancer.name,
                            created: LoadBalancer.created,
                            updated: LoadBalancer.updated,
                            algorithm:LoadBalancer.algorithm,
                            nodeCount: LoadBalancer.nodeCount,
                            status:LoadBalancer.status,
                            timeout:LoadBalancer.timeout,
                            virtualIps:LoadBalancer.virtualIps,
                            region:key,
                            protocol:LoadBalancer.protocol
                        });
                    });
                }
            }

            return {
                labels: data.labels,
                data: LoadBalancersList
            };
        }
        
        /**
         * @ngdoc method
         * @name getTrimmedList
         * @methodOf migrationApp.service:LoadBalancerservice
         * @returns {Promise} a promise to fetch the list of LoadBalancers.
         * @description 
         * Get a list of LoadBalancers for a tenant. It returns only a definite set of properties of a LoadBalancer for its representation.
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
         * @name getAll
         * @methodOf migrationApp.service:LoadBalancerservice
         * @returns {Promise} a promise to fetch all LoadBalancers.
         * @description 
         * Gets the entire list of LoadBalancers in its raw JSON form, from the api.
         */
        self.getAll = function () {
            //var url = "/static/angassets/LoadBalancers-list.json";
            var url = "/api/clb/loadbalancers";
            var tenant_id = authservice.getAuth().tenant_id;
            if (callInProgress == false && datastoreservice.getResourceLoadingStatus("LoadBalancers") == false) {
                callInProgress = true;
                LoadBalancerPromise = HttpWrapper.send(url,{"operation":'GET'})
                    .then(function(response){
                        datastoreservice.setResourceLoadingStatus("LoadBalancers", true);
                        currentTenant = tenant_id;
                        LoadBalancers = {
                            labels: [
                                        {field: "name", text: "LoadBalancer Name"},
                                        {field: "status", text: "LoadBalancer Status"},
                                        {field:"migStatus", text:"Migration Status"},
                                        {field:"eligible", text:"Eligibility test result"}
                                    ],
                            data: response
                        };
                        callInProgress = false;
                        return LoadBalancers;
                    }, function(errorResponse) {
                        callInProgress = false;
                        datastoreservice.setResourceLoadingStatus("LoadBalancers", false);
                        return errorResponse;
                    });
                return LoadBalancerPromise;
            } else if (callInProgress) {
                return LoadBalancerPromise;
            } else if (callInProgress == false && datastoreservice.getResourceLoadingStatus("LoadBalancers") == true) {
                return $q.when(LoadBalancers);
            };
        };

        function transformLoadBalancer(LoadBalancer){
            return {
                id: LoadBalancer.id,
                name: LoadBalancer.name,
                status: LoadBalancer.status,
                created_at: moment(LoadBalancer.created_at).format('DD/MM/YYYY HH:mm:ss'),
                attachments: LoadBalancer.attachments
            };
        }

        self.getTrimmedItem = function(id,region){
            var deferred = $q.defer();
            self.getById(id,region).then(function (response) {
                if (response.error)
                    return deferred.resolve(response);
                return deferred.resolve(transformLoadBalancer(response.data));
            });
            return deferred.promise;
        };

        self.getById = function (id,region) {
            var url = "/api/clb/loadbalancers/"+ region.toLowerCase()+"/"+ id;
            var tenant_id = authservice.getAuth().tenant_id;

            return HttpWrapper.send(url, { "operation": 'GET' })
                .then(function (response) {
                    currentTenant = tenant_id;
                    LoadBalancers = {
                        labels: [
                            { field: "name", text: "LoadBalancer Name" },
                            { field: "id", text: "id" },
                            { field: "created_at", text: "Created On" },
                            { field: "source_region", text: "Source Region" },
                            { field: "status", text: "Status" },
                            { field: "rrn", text: "rrn" },
                            { field: "description", text: "Description" },
                        ],
                        data: response
                    };
                    return LoadBalancers;
                }, function (errorResponse) {
                    return errorResponse;
                });
        };        

        /**
        * @ngdoc method
        * @name prepareClbList
        * @methodOf migrationApp.service:LoadBalancerservice
        * @returns LoadBalancerservice instance request object.
        * @description
        * prepare LoadBalancer instance request object
        */
        self.prepareClbList = function () {
            var clbReqList = [];
            var LoadBalancers = JSON.parse($window.localStorage.selectedResources)["LoadBalancers"];
            angular.forEach(LoadBalancers,function(LoadBalancer){
                clbReqList.push(
                    {
                        "source":{
                            "id":LoadBalancer.id,
                            "region":LoadBalancer.region.toUpperCase(),
                            "type":LoadBalancer.type
                        },
                        "destination":{
                            "region":LoadBalancer.selectedMapping.region || DEFAULT_VALUES.REGION,
                            "aws":{
                                "LoadBalancer":{
                                    "zone":LoadBalancer.selectedMapping.zone || DEFAULT_VALUES.ZONE,
                                    "ebs_type":"IOL"
                                },
                                "s3":{
                                    "region":LoadBalancer.selectedMapping.region || DEFAULT_VALUES.REGION
                                }
                            }
                        }
                    }
                )
            });
            return clbReqList;
        }

        return self;
    }]);
})();
