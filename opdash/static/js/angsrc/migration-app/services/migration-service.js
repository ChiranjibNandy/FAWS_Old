(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:migrationService
     * @description
     * This service is used to make all the migration related API calls.
     */
    angular.module("migrationApp")
        .service("migrationService", ["httpwrapper","$q","$window", function (HttpWrapper,$q,$window) {
            var self = this;
            
            /**
             * @ngdoc method
             * @name pauseMigration
             * @methodOf migrationApp.service:migrationService
             * @param {String} job_id Job_id of the batch on which you want to do operation
             * @param {String} detail It will suggest which operation you want to do.It carries pause, unpause and cancel.
             * @returns {Boolean} a boolean based on the result we are getting
             * @description 
             * This helps us to pause,unpause and cancel a migration.
             */
            this.pauseMigration = function(job_id,detail){
               var pauseUrl = "api/jobs/"+job_id+"/"+detail;
               return HttpWrapper.send(pauseUrl, {"operation":'POST'})
                    .then(function(result){
                        return true;
                    },function(error) {
                        return false;
                    });
            };

            /**
             * @ngdoc method
             * @name modifyMigration
             * @methodOf migrationApp.service:migrationService
             * @param {String} job_id Job_id of the batch for which you want to modify
             * @returns {Boolean} a boolean based on the result we are getting
             * @description 
             * This helps us to modify a migration by using a PUT call.
             */
            this.modifyMigration = function(job_id,jobRequest){
               var modifyUrl = "api/jobs/"+job_id;
               return HttpWrapper.send(modifyUrl, {"operation":'PUT',"data":jobRequest})
                    .then(function(result){
                        return result;
                    },function(error) {
                        return false;
                    });
            };

            return this;
        }]); // end of service definition
})();