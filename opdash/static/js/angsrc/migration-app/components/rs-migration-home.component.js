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
            controller: ["authservice","$rootRouter","httpwrapper","$q", function (authService,$rootRouter,HttpWrapper,$q) {
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
                        var getSavedInstancesUrl = "/api/users/uidata/Saved_Migrations";
                        var savedMigrationPromise = HttpWrapper.send(getSavedInstancesUrl, {"operation":'GET'})
                        .then(function(result){
                            if(result !== null && result.savedDetails.length !== 0){
                                doSavedForLaterMigrationsExist = true;
                            }
                        },function(error) {
                            doSavedForLaterMigrationsExist = false;
                        });

                        var url = "/api/jobs/all";
                        var resourceMigrationPromise = HttpWrapper.send(url,{"operation":'GET'})
                        .then(function(response){
                            if(response !== null && response.job_status_list.length !== 0){
                                doResourceMigrationsExist = true;
                            }
                        },function(error) {
                            doResourceMigrationsExist = false;
                        });

                        $q.all([savedMigrationPromise,resourceMigrationPromise]).then(function(result){
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