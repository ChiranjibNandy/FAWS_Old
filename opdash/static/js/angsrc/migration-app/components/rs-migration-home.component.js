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
                        var savedMigrationPromise = datastoreservice.getSavedItems();
                        var resourceMigrationPromise = dashboardservice.getCurrentBatches();
                        $q.all([savedMigrationPromise,resourceMigrationPromise]).then(function(result){
                            doSavedForLaterMigrationsExist = result[0].length>0?true:false;
                            doResourceMigrationsExist = (result[1].job_status_list && result[1].job_status_list.length>0)?true:false;
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