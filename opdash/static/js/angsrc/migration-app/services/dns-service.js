(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:dnsservice
     * @description
     * Service to retrieve all data for DNS resources
     */
    angular.module("migrationApp").factory("dnsservice", ["httpwrapper", "$q", "authservice","datastoreservice","$window", "DEFAULT_VALUES", function (HttpWrapper, $q, authservice,datastoreservice,$window, DEFAULT_VALUES) {
        // local variables to help cache data
        var self = this, dns,currentTenant = null, 
            callInProgress = false,
            dnsPromise;
        
        /**
         * @ngdoc method
         * @name getDNS
         * @methodOf migrationApp.service:migrationitemdataservice
         * @returns {Promise} a promise to fetch all servers.
         * @description 
         * Gets the entire list of DNS Service in its raw JSON form, from the api.
        */
        this.getDNS = function () {
            var url = "/api/dns";
            if (callInProgress == false && datastoreservice.getResourceLoadingStatus("dns") == false) {
                callInProgress = true;
                dnsPromise = HttpWrapper.send(url, {
                        "operation": 'GET'
                    })
                    .then(function (response) {
                        dns = {
                            labels: [
                                        {field: "name", text: "name"},
                                        {field: "status",text: "status"},
                                        {field: "migStatus",text: "Migration Status"},
                                        {field:"eligible", text:"Eligibility test result"}
                                    ],
                            data: response
                        };
                        callInProgress = false;
                        datastoreservice.setResourceLoadingStatus("dns", true);
                        return dns;
                    }, function (errorResponse) {
                        callInProgress = false;
                        datastoreservice.setResourceLoadingStatus("dns", false);
                        return errorResponse;
                    });
                return dnsPromise;
            } else if(callInProgress) {
                return dnsPromise;
            } else if (callInProgress == false && datastoreservice.getResourceLoadingStatus("dns") == true) {
                return $q.when(dns);
            };
        };//end of getDNS method

        function transformService(dns){
            return {
                id: dns.id,
                name: dns.name,
                status: dns.status,
                domains: dns.domains,
                };
        }

        self.getTrimmedItem = function(id){
            var deferred = $q.defer();
            self.getById(id).then(function (response) {
                if (response.error)
                    return deferred.resolve(response);
                return deferred.resolve(transformService(response.data));
            });
            return deferred.promise;
        };

        self.getById = function (id) {
            var url = "/api/dns/" + id;
            var tenant_id = authservice.getAuth().tenant_id;

            return HttpWrapper.send(url, { "operation": 'GET' })
                .then(function (response) {
                    currentTenant = tenant_id;
                    dns = {
                        labels: [
                            { field: "name", text: "DNS Name" },
                            { field: "id", text: "id" },
                            { field: "rrn", text: "rrn" },
                            { field: "status", text: "DNS Status" }
                        ],
                        data: response
                    };
                    return dns;
                }, function (errorResponse) {
                    return errorResponse;
                });
        };
      
         /**
        * @ngdoc method
        * @name prepareDNSList
        * @methodOf migrationApp.service:dnsservice
        * @returns dnsservice instance request object.
        * @description
        * prepare dns instance request object
        */
        self.prepareDNSList = function () {
            var dnsReqList = [];
            var domains = JSON.parse($window.localStorage.selectedResources)["dns"];
            angular.forEach(domains,function(domain){
                dnsReqList.push(
                    {
                        "source":{
                            "zone_id":domain.id
                        },
                        "destination":{
                            "region":domain.selectedMapping.region || DEFAULT_VALUES.REGION,
                            "aws":{
                                "domain":{
                                    "zone":domain.selectedMapping.zone || DEFAULT_VALUES.ZONE,
                                    "ebs_type":"IOL"
                                }
                            }
                        }
                    }
                )
            });
            return dnsReqList;
        }
       return self;
    }]);
})();
