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
                    vm.migrationName = dataStoreService.getScheduleMigration().migrationName;
                    vm.changedMigrationName = vm.migrationName;
                    vm.schedule = {
                        date: dataStoreService.getMigrationDate() || new Date().toDateString(),
                        time: dataStoreService.getMigrationTime() || new Date().toTimeString(),
                        timezone: dataStoreService.selectedTime.timezone
                    };
                    
                    vm.cost = dataStoreService.getProjectedPricing();
                    vm.migrating = false;
                    vm.errorInMigration = false;
                    vm.saveLaterObj = {
                        "saveSuccess" : false,
                        "saveInProgress" : false,
                        "resultMsg" : "",
                        "modalName": '#save_for_later'
                    };

                    vm.cancelnSaveObj = {
                        "saveSuccess" : false,
                        "saveInProgress" : false,
                        "resultMsg" : "",
                        "modalName": '#cancel_modal'
                    };
                    vm.saveProgress = "";
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
                    $('#confirm-migration-modal').modal('hide');
                    requestObj = ds.prepareRequest();
                    console.log(requestObj);
  
                    HttpWrapper.save("/api/job", {"operation":'POST'}, requestObj)
                                .then(function(result){
                                    console.log("Migration Response: ", result);
                                    $timeout(function(){
                                        $rootRouter.navigate(["MigrationStatus"]);
                                    }, 5000);
                                }, function(error) {
                                    console.log("Error: Could not trigger migration", error);
                                    vm.migrating = false;
                                    vm.errorInMigration = true;
                                });

                               
                };

                /**
                 * @ngdoc method
                 * @name changeName
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * Updates migration name
                 */
                vm.changeName = function() {
                    vm.migrationName = vm.changedMigrationName;
                    dataStoreService.selectedTime.migrationName = vm.migrationName;
                    vm.editName = false;
                };

                /**
                 * @ngdoc method
                 * @name disableEditor
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * Cancels updation of migration name
                 */
                vm.revertName = function() {
                    vm.changedMigrationName = vm.migrationName;
                    vm.editName = false;
                };

                /**
                 * @ngdoc method
                 * @name saveItems
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description 
                 * Invokes "/api/users/uidata/" API call for fetching existing saved instances. 
                 */
                vm.saveItems = function(buttonDetails) {
                    var saveInstance = {
                        recommendations : dataStoreService.getItems('server'),
                        scheduling_details : dataStoreService.getScheduleMigration(),
                        step_name: "ConfirmMigration",
                        migration_schedule: {
                            migrationName:dataStoreService.getScheduleMigration().migrationName,
                            time:dataStoreService.getScheduleMigration().time,
                            timezone:dataStoreService.getScheduleMigration().timezone
                        }
                    };
                    buttonDetails.saveInProgress = true;
                    dataStoreService.saveItems(saveInstance).then(function(success){
                        if(success){
                            buttonDetails.saveInProgress = false;
                            buttonDetails.saveSuccess = true;
                            buttonDetails.resultMsg = "Saved your instance successfully with name: "+dataStoreService.getScheduleMigration().migrationName;
                            $timeout(function () {
                                buttonDetails.resultMsg = "";
                                if(buttonDetails.modalName == '#cancel_modal'){
                                    $('#cancel_modal').modal('hide');
                                    $rootRouter.navigate(["MigrationStatus"]);
                                }
                            }, 3000);
                        }else{
                            buttonDetails.saveInProgress = false;
                            buttonDetails.saveSuccess = false;
                            buttonDetails.resultMsg = "Error while saving. Please try again after sometime!!";
                            $timeout(function () {
                                buttonDetails.resultMsg = "";
                                $(buttonDetails.modalName).modal('hide');
                            }, 3000);
                        }
                    },function(error){
                        buttonDetails.saveInProgress = false;
                        buttonDetails.saveSuccess = false;
                        buttonDetails.resultMsg = "Error while saving. Please try again after sometime!!";
                        $timeout(function () {
                            buttonDetails.resultMsg = "";
                            $(buttonDetails.modalName).modal('hide');
                        }, 3000);
                    });
                };


                vm.submitCancel = function() {
                    if(vm.saveProgress == 'yes'){
                        vm.saveItems(vm.cancelnSaveObj);
                    }
                    else{
                        $rootRouter.navigate(["MigrationStatus"]);
                        $('#cancel_modal').modal('hide');
                    }
                }

                vm.showCancelDialog = function() {
                    $('#cancel_modal').modal('show');
                };

                 vm.showConfirmMigrateDialog = function() {
                    $('#confirm-migration-modal').modal('show');
                };

                return vm;
            }
        ]}); // end of component definition
})();