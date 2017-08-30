(function() {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsmigrationhome
     * @description
     * Component to display migration home when the dafault route is hit.Redirection happens based on the logged in tenant id.
     *
     *
     */
    angular.module("migrationApp")
        .component("rsmigrationhome", {
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsmigrationhomeCtrl
             */
            controller: ["authservice","$rootRouter","httpwrapper","$q","datastoreservice","dashboardservice", function (authService,$rootRouter,HttpWrapper,$q,datastoreservice,dashboardservice) {
                var vm = this;
                vm.$onInit = function(){
                    if(user_data.is_racker) {
                        $rootRouter.navigate(["RackerDash"]);
                    }
                    else{
                        authService.getAuth().tenant_id = user_data.tenant_id;
                        authService.getAuth().account_name = this.account_name;
                        var doSavedForLaterMigrationsExist = false;
                        var doResourceMigrationsExist = false;
                        var tenant_id = user_data.tenant_id;
                        dashboardservice.getBatches(true).then(function(result){
                            datastoreservice.setFirstLoginFlag();
                            doSavedForLaterMigrationsExist = result.savedMigrations.length>0?true:false;
                            doResourceMigrationsExist = (result.jobs.job_status_list && result.jobs.job_status_list.length>0)?true:false;
                            if(doSavedForLaterMigrationsExist === false && doResourceMigrationsExist === false){
                                $rootRouter.navigate(["MigrationResourceList"]);                          
                            }
                            else{
                                $rootRouter.navigate(["MigrationStatus"]);
                            }
                        });   
                    }
                }
                return vm;
            }]
        }); // end of component rscontact
})();