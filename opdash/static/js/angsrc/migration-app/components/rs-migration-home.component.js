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
            templateUrl: "/static/angtemplates/migration/migration-home.html",
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
                        //calling get user Settings method to check whether to display welcome modal or not.
                        var userSettings = datastoreservice.getUserSettings();
                        authService.getAuth().tenant_id = user_data.tenant_id;
                        authService.getAuth().account_name = this.account_name;
                        var doSavedForLaterMigrationsExist = false;
                        var doResourceMigrationsExist = false;
                        var tenant_id = user_data.tenant_id;
                        var allBatches = dashboardservice.getBatches(true);
                        $q.all([userSettings, allBatches]).then(function(result){
                            datastoreservice.setFirstLoginFlag();
                            if(result[1]){
                                doSavedForLaterMigrationsExist = result[1].savedMigrations.length>0?true:false;
                                doResourceMigrationsExist = (result[1].jobs.job_status_list && result[1].jobs.job_status_list.length>0)?true:false;
                            }
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