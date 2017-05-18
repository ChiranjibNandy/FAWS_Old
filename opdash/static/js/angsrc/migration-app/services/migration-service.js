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
            
            this.pauseMigration = function(job_id,detail){
               var pauseUrl = "api/jobs/"+job_id+"/"+detail;
               return HttpWrapper.send(pauseUrl, {"operation":'GET'})
                    .then(function(result){
                        return true;
                    },function(error) {
                        return false;
                    });
            };

            return this;
        }]); // end of service definition
})();