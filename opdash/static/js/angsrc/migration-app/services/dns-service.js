(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:dnsservice
     * @description
     * Service to retrieve all data for dns resources
     */
    angular.module("migrationApp").factory("dnsservice", ["httpwrapper", "$q", "authservice","$window","DEFAULT_VALUES", function (HttpWrapper, $q, authservice,$window,DEFAULT_VALUES) {
        // local variables to help cache data
        var loaded, domains, self = this, currentTenant = null;

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
