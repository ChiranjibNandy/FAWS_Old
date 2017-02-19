(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:dashboardservice
     * @description
     * This service helps to fetch and refresh dashboard data
     */
    angular.module("migrationApp")
        .service("dashboardservice", ["authservice", "httpwrapper", "$q", function(authservice, HttpWrapper, $q) {
            var self = this,
                loaded = false,
                tenant = null,
                batches = [];

            /**
             * @ngdoc method
             * @name getBatches
             * @methodOf migrationApp.service:dashboardservice
             * @param {Boolean} refresh True if the batch list needs to be refreshed
             * @returns {Object} The batch list for a given tenant
             * @description 
             * This service method returns an array containing the list of batches for a tenant
             */
            self.getBatches = function(refresh) {
                var tenant_id = authservice.getAuth().tenant_id;
                var url = "/api/jobs/" + tenant_id;

                if (refresh || !loaded || (tenant !== tenant_id)) {
                    return HttpWrapper.send(url,{"operation":'GET'})
                                    .then(function(response){
                                        loaded = true;
                                        tenant = tenant_id;
                                        batches = response;
                                        return batches;
                                    }, function(errorResponse) {
                                        return errorResponse;
                                    });

                } else {
                    return $q.when(batches);
                }
            };

            return self;
        }]); // end of service definition
})();