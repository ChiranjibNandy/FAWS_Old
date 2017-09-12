(function() {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:dashboardservice
     * @description
     * This service helps to fetch and refresh dashboard data
     */
    angular.module("migrationApp")
        .service("dashboardservice", ["authservice", "httpwrapper", "datastoreservice", "$q","$window", function(authservice, HttpWrapper, dataStoreService, $q, $window) {
            var self = this,
                loaded = false,
                currentTenant = null,
                batches = {},
                jobsCallInProgress = false,
                statusPromise;

            self.autoRefreshStatus = '';

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
                var currentJobsUrl = "/api/combined/dashboard";
                //var currentJobsUrl = "/static/angassets/batch-details.json";

                if ((refresh || !loaded || (currentTenant !== tenant_id)) && jobsCallInProgress == false) {
                    var savedMigrationsTask = dataStoreService.getSavedItems();
                    var currentJobsTask = HttpWrapper.send(currentJobsUrl, { "operation": 'GET' });
                    jobsCallInProgress = true;
                    statusPromise =  $q.all([savedMigrationsTask, currentJobsTask])
                        .then(function(results) {
                            loaded = true;
                            jobsCallInProgress = false;
                            currentTenant = tenant_id;
                            var savedMigrations = [];
                            savedMigrations = results[0] || [];
                            batches = { savedMigrations: savedMigrations, jobs: results[1], alerts: self.buildAlerts(results[1].alerts) };
                            $window.localStorage.setItem("currentBatches",JSON.stringify(results[1]));
                            return batches;
                        }, function(errorResponse) {
                            jobsCallInProgress = false;
                            return false;
                        });
                    return statusPromise;
                } else if(jobsCallInProgress == true){
                    return statusPromise;
                } else {
                    return $q.when(batches);
                }
            };
            
            self.buildAlerts = function(result){
                var alerts = [];
                var tempAlerts = [];
                for(var j=0; j<result.length; j++){
                    var msgs = angular.copy(result[j].messages);
                    for(var k=0; k<msgs.length; k++){
                        msgs[k].job_id = result[j]["job-id"];
                        msgs[k].resource_id = result[j]["resource-id"];
                        msgs[k].resource_name = result[j]["resource-name"];
                        msgs[k].resource_type = result[j]["resource-type"];
                        msgs[k].batch_name = result[j]["batch-name"];
                    }
                    tempAlerts = tempAlerts.concat(msgs);
                }
                alerts = tempAlerts;
                 return alerts;
            }

            /**
             * @ngdoc method
             * @name getCurrentBatches
             * @methodOf migrationApp.service:dashboardservice
             * @returns {Promise} A promise to fetch the batch list for a given tenant
             * @description 
             * This service method returns a promise to fetch an array containing the list of batches for a tenant
             */
            self.getCurrentBatches = function(){
                var deferred = $q.defer();
                var batches  = JSON.parse($window.localStorage.getItem("currentBatches"));
                if(batches === undefined || batches === null){
                    return HttpWrapper.send("/api/jobs/all", {"operation":'GET'})
                    .then(function(result){
                        return result;
                    },function(error) {
                        return error;
                    });
                }else{
                    deferred.resolve(JSON.parse($window.localStorage.getItem('currentBatches')));
                }
                return deferred.promise;
            };

            /**
             * @ngdoc method
             * @name getCurrentBatcheForJobId
             * @methodOf migrationApp.service:dashboardservice
             * @returns {Promise} A promise to fetch the batch list for a given tenant
             * @description 
             * This service method returns a promise to fetch an array containing the list of batches for a tenant
             */
            self.getCurrentBatcheForJobId = function(jobId){

                return HttpWrapper.send("/api/jobs/"+jobId, {"operation":'GET'})
                    .then(function(result){
                       return result;
                    },function(error) {
                      return error;
                    });
                
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

            self.storeAutoRefreshStatus = function(status){
                self.autoRefreshStatus = status;
                $window.localStorage.setItem("autoRefreshStatus",status);
            };

            self.getAutoRefreshStatus = function(){
                if(self.autoRefreshStatus === ''){
                    return $window.localStorage.getItem("autoRefreshStatus");
                }else{
                    return self.autoRefreshStatus;
                }
            };

            return self;
        }]); // end of service definition
})();