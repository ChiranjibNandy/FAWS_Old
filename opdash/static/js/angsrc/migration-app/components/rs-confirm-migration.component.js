(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsconfirmmigration
     * @description
     * Component to display the _Confirm Migration_ page. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/batch-migration-details.html**  
     *   
     * Its controller {@link migrationApp.controller:rsconfirmmigrationCtrl rsconfirmmigrationCtrl} uses the below services:
     *  * $rootRouter
     *  * {@link migrationApp.service:datastoreservice datastoreservice}
     *  * {@link migrationApp.service:migrationitemdataservice migrationitemdataservice}
     *  * $q
     *  * {@link migrationApp.service:httpwrapper httpwrapper}
     */
    angular.module("migrationApp")
        .component("rsconfirmmigration", {
            templateUrl: "/static/angtemplates/migration/confirm-migration.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsconfirmmigrationCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsconfirmmigration rsconfirmmigration} component
             */
            controller: [ "$rootRouter","datastoreservice","migrationitemdataservice", "$q","httpwrapper", "authservice", "$timeout", function($rootRouter,dataStoreService,ds,$q,HttpWrapper, authservice, $timeout) {
                var vm = this;
                vm.tenant_id = '';
                vm.tenant_account_name = '';
                
                vm.$onInit = function() {
                    vm.tenant_id = authservice.getAuth().tenant_id;
                    vm.tenant_account_name = authservice.getAuth().account_name;
                    $('title')[0].innerHTML =  "Confirm Migration - Rackspace Cloud Migration";
                    var auth = authservice.getAuth();
                    vm.tenant_id = auth.tenant_id;
                    vm.tenant_name = auth.rackUsername;
                    vm.userOrTenant = auth.is_racker ? "Tenant" : "User";

                    vm.destination = "AWS EC2";
                    vm.batchName = dataStoreService.getScheduleMigration().migrationName;
                    vm.tempBatchName = vm.batchName;
                    vm.schedule = {
                        date: dataStoreService.getMigrationDate(),
                        time: dataStoreService.getMigrationTime(),
                        timezone: dataStoreService.selectedTime.timezone
                    };
                    
                    vm.cost = dataStoreService.getProjectedPricing();
                    vm.migrating = false;
                    vm.errorInMigration = false;
                };

                /**
                 * @ngdoc method
                 * @name migrate
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * Starts a batch to migrate all resources selected by user
                 */
                vm.migrate = function(){
                    var requestObj;
                    vm.migrating = true;
                    requestObj = ds.prepareRequest();
                    console.log(requestObj);

                    HttpWrapper.save("/api/job", {"operation":'POST'}, requestObj)
                                .then(function(result){
                                    console.log("Migration Response: ", result);
                                    $rootRouter.navigate(["MigrationStatus"]);
                                }, function(error) {
                                    console.log("Error: Could not trigger migration", error);
                                    vm.migrating = false;
                                    vm.errorInMigration = true;
                                });
                };

                /**
                 * @ngdoc method
                 * @name disableEditor
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * Disables editing of migration batch name
                 */
                vm.disableEditor = function() {
                    vm.tempBatchName = vm.batchName;
                    vm.editorEnabled = false;
                };

                return vm;
            }
        ]}); // end of component definition
})();