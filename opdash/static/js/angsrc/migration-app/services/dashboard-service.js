(function() {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:dashboardservice
     * @description
     * This service helps to fetch and refresh dashboard data
     */
    angular.module("migrationApp")
        .service("dashboardservice", ["authservice", "httpwrapper", "datastoreservice", "$q", function(authservice, HttpWrapper, dataStoreService, $q) {
            var self = this,
                loaded = false,
                currentTenant = null,
                batches = {};

            /**
             * @ngdoc method
             * @name getBatches
             * @methodOf migrationApp.service:dashboardservice
             * @param {Boolean} refresh True if the batch list needs to be refreshed
             * @returns {Promise} A promise to fetch the batch list for a given tenant
             * @description 
             * This service method returns a promise to fetch an array containing the list of batches for a tenant
             */
            self.getBatches = function(refresh) {
                var tenant_id = authservice.getAuth().tenant_id;
                var currentJobsUrl = "/api/jobs/all";
                //var currentJobsUrl = "/static/angassets/batch-details.json";

                if (refresh || !loaded || (currentTenant !== tenant_id)) {
                    var savedMigrationsTask = dataStoreService.getSavedItems();
                    var currentJobsTask = HttpWrapper.send(currentJobsUrl, { "operation": 'GET' });

                    return $q.all([savedMigrationsTask, currentJobsTask])
                        .then(function(results) {
                            loaded = true;
                            currentTenant = tenant_id;
                            var savedMigrations = [];
                            savedMigrations = JSON.parse(results[0].savedDetails || '[]');
                            batches = { savedMigrations: savedMigrations, jobs: results[1] };
                            return batches;
                        }, function(errorResponse) {
                            return false;
                        });
                } else {
                    return $q.when(batches);
                }
            };

            self.getBatchTasks = function(jobId) {
                var url = "api/tasks/"+jobId;
                return HttpWrapper.send(url, { "operation": 'GET' })
                .then(function(result){
                    return result;
                },function(error){
                    return false;
                });
            };

            return self;
        }]); // end of service definition
})();