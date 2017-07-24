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
            controller: ["$rootRouter", "datastoreservice", "migrationitemdataservice", "$q", "httpwrapper", "authservice", "$timeout", "$rootScope","$scope","$window","migrationService","dashboardservice", function ($rootRouter, dataStoreService, ds, $q, HttpWrapper, authservice, $timeout, $rootScope,$scope,$window,migrationService,dashboardService) {
                var vm = this;
                vm.tenant_id = '';
                vm.tenant_account_name = '';
                vm.cost = '';
                vm.goodToGo = true;
                vm.checking = false;

                // make isNaN available in your view via component as syntax
                vm.isNaN = function(value) {
                    return isNaN(value);
                }
                
                vm.$onInit = function () {
                    vm.tenant_id = authservice.getAuth().tenant_id;
                    vm.saveResources = false;
                    vm.tenant_account_name = authservice.getAuth().account_name;
                    $('title')[0].innerHTML = "Confirm Migration - Rackspace Cloud Migration";
                    var auth = authservice.getAuth();
                    vm.isRacker = authservice.is_racker;
                    vm.tenant_id = auth.tenant_id;
                    vm.tenant_name = auth.rackUsername;
                    vm.userOrTenant = auth.is_racker ? "Tenant" : "User";

                    vm.destination = "AWS EC2";
                    vm.migrationName = dataStoreService.getScheduleMigration().migrationName;
                    vm.changedMigrationName = vm.migrationName;

                    dataStoreService.setPageName("ConfirmMigration");
                    $window.localStorage.setItem('pageName',"ConfirmMigration");
                    vm.scheduleMigration = false;
                    vm.cost = dataStoreService.getProjectedPricing();
                    vm.migrating = false;
                    vm.errorInMigration = false;
                    vm.acceptTermsAndConditions=false;
                    vm.emptyEquipments=true;
                    vm.saveProgress = "";
                    $window.localStorage.setItem("migrationScheduled","false");
                    // vm.error = false;
                };
                
                $rootScope.$on("vm.scheduleMigration", function (event, value) {
                    vm.scheduleMigration = value['vm.scheduleMigration'];
                    vm.saveResources = value.whichTime === 'schedule'?true:false;
                });
                
                $scope.$on("ItemRemoved",function(event,item){
                    var selectedItems = dataStoreService.getItems();
                    if(selectedItems.server.length > 0 || selectedItems.network.length > 0 || selectedItems.LoadBalancers.length > 0) 
                        vm.emptyEquipments=true;
                    else vm.emptyEquipments=false;
                    vm.cost = dataStoreService.getProjectedPricing();
                    $window.localStorage.projectedPricing = JSON.stringify(vm.cost);
                });


                /**
                 * @ngdoc method
                 * @name checkStatus
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * Checks whether the selected server(s) have already been migrated/scheduled, if yes, then rejects the migration, otherwise triggers the migration.
                 */
                vm.checkStatus = function(){
                    if(JSON.parse(dataStoreService.getResourceItemsForEditingMigration())){
                        vm.migrate();
                        return;
                    }
                    dashboardService.getCurrentBatches() //fetch the batch list by making the job_status api call in dashbaord service
                            .then(function (response) {
                                if (response && response.error == undefined){
                                    vm.migrating = true;
                                    vm.checking = true;
                                    var jobList = response.job_status_list;
                                //get status of all the migrations in an array - to check if these resoruces have been scheduled in any migrations earlier 
                                    var statusList=[];
                                    for(var i=0;i<jobList.length;i++){
                                        for(var j=0;j<jobList[i].instances.length;j++){
                                            if(jobList[i].batch_status !== "error" && jobList[i].batch_status !== "canceled" && jobList[i].batch_status !== "done"){
                                                statusList.push(jobList[i].instances[j]);
                                            }
                                        }
                                    }       
                                    
                                //get list of selected resources from local storage, in an array
                                    var equipments = {
                                            instances: JSON.parse($window.localStorage.selectedServers),
                                            networks: dataStoreService.getDistinctNetworks()
                                    };
                                    var selectedResources = [];
                                    for(var i=0;i<equipments.instances.length;i++){
                                      var obj = {
                                                name : equipments.instances[i].name,
                                                id : equipments.instances[i].rrn
                                        }
                                        selectedResources.push(obj);
                                    }
                                    
                                //compare two lists to find out if selected resources have been migrated already or scheduled in other batches.
                                    vm.goodToGo = true;

                                    for(i=0;i<selectedResources.length;i++){ //check for each server in the selected list
                                        var x1=selectedResources[i].name;
                                        var y1=selectedResources[i].id;

                                        for(j=0;j<statusList.length;j++){ //check for each server in the status list
                                            var x2=statusList[j].name;
                                            var y2=statusList[j].id;
                                            var z2=statusList[j].status;

                                            if(x1 === x2 && y1 === y2){ //if the server name and id match
                                                if(z2 !== "error" && z2 !== "canceled" && z2 !== "done"){ //if status is error/canceled or done, migration will be allowed, otherwise not
                                                    vm.goodToGo = false;
                                                    vm.checking = false;
                                                    break;
                                                }
                                            }//endif
                                        }//end of inner for-loop
                                    }//end of outer for-loop
                                    
                                //finally - if none of the resources have been migrated or scheduled to be migrated in other batch (goodToGo === true), trigger migration
                                    if(vm.goodToGo){ 
                                        vm.migrate();
                                    }else{//otherwise error message will be displayed on the screen since goodToGo===false.
                                        vm.checking = false;
                                        $('#duplicate-instance').modal('show');
                                    }//end if
                            }else{ //if the job_status call in dashbaord service fails
                                    vm.checking = false;
                                    vm.errorInMigration = true; //error message will be disaplyed on the screen.
                        }
                    
                })//end of dashboardService.getCurrentBatches()
                        
            };
            
                /**
                 * @ngdoc method
                 * @name goToStep1
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * Resets all previous resource data and helps to starts a new migration
                 */
                vm.goToStep1 = function () {
                    dataStoreService.setResourceItemsForEditingMigration(false);
                    dataStoreService.resetAll();
                    dataStoreService.storeEligibilityResults($window.localStorage.eligibilityResults);
                    $window.localStorage.clear();
                    $window.localStorage.eligibilityResults = dataStoreService.retrieveEligibilityResults();
                    if($window.localStorage.selectedServers !== undefined)
                        $window.localStorage.removeItem('selectedServers');
                    $rootRouter.navigate(["MigrationResourceList"]);
                };

                /**
                 * @ngdoc method
                 * @name migrate
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * Starts a batch to migrate all resources selected by user
                 */
                vm.migrate = function () {
                    var requestObj;
                    vm.migrating = true;
                    $('#confirm-migration-modal').modal('hide');
                    requestObj = ds.prepareJobRequest();
                    vm.acceptTermsAndConditions= true;
                    if(JSON.parse(dataStoreService.getResourceItemsForEditingMigration())){
                        migrationService.modifyMigration(dataStoreService.getJobIdForMigration('jobId'),requestObj)
                        .then(function (result) {
                            if(result){
                                migrationService.pauseMigration(dataStoreService.getJobIdForMigration('jobId'),'unpause').then(function(success){
                                    if(success){
                                        if(vm.saveResources) {
                                            vm.deleteExistingSavedMigration();
                                        }else{
                                            $window.localStorage.setItem("migrationScheduled","true");
                                            $rootRouter.navigate(["MigrationStatus"]);
                                        }
                                    }else{
                                        $('#modify-modal').modal('show');
                                        vm.message = "We have successfully modified your migration but couldn't unpause the migation. You may have to un pause it manually in dashboard page."
                                    }
                                })
                            }else{
                                $('#modify-modal').modal('show');
                                vm.message = "There was a problem modifying this migration. Please try again after some time."
                            }   
                        }, function (error) {
                            vm.migrating = false;
                            $window.localStorage.setItem("migrationScheduled","false");
                            vm.errorInMigration = true;
                            vm.scheduleMigration = true;
                        });
                    }else{
                        HttpWrapper.save("/api/jobs", { "operation": 'POST' }, requestObj)
                        .then(function (result) {
                            if(vm.saveResources) {
                                vm.saveResourceDetails();
                            }else{
                                vm.migrating = false; 
                                $window.localStorage.setItem("migrationScheduled","true");
                                $rootRouter.navigate(["MigrationStatus"]);
                            }
                        }, function (error) {
                            vm.migrating = false;
                            $window.localStorage.setItem("migrationScheduled","false");
                            vm.errorInMigration = true;
                            vm.scheduleMigration = true;
                        });
                    }
                };

                /**
                 * @ngdoc method
                 * @name deleteExistingSavedMigration
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * This will delete the existing saved migration and update it with the new one
                 */
                vm.deleteExistingSavedMigration = function(){
                    dataStoreService.deleteSavedInstances(dataStoreService.getJobIdForMigration('saveId'))
                        .then(function(result){
                            if(result){
                                vm.saveResourceDetails();
                            }
                        });
                };

                /**
                 * @ngdoc method
                 * @name saveResourceDetails
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * This helps to save the selected resources and this function only be called if we are scheduling for later
                 */
                vm.saveResourceDetails = function(){
                    var saveInstance = {
                        recommendations : JSON.parse($window.localStorage.selectedServers),
                        step_name: "MigrationResourceList" ,
                        scheduledItem:true,
                        migration_schedule: {
                            migrationName:$window.localStorage.migrationName,
                            time:dataStoreService.getScheduleMigration().time,
                            timezone:dataStoreService.getScheduleMigration().timezone
                        }
                    };
                    dataStoreService.saveItems(saveInstance).then(function(success){
                        vm.migrating = false; 
                        $window.localStorage.setItem("migrationScheduled","true");
                        $rootRouter.navigate(["MigrationStatus"]);
                    },function(error){
                     
                    });
                };

                /**
                 * @ngdoc method
                 * @name selectServers
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * Navigates to resources page
                 */
                vm.selectServers = function(){
                    $("#no-equipments-modal").modal('hide');
                    $rootRouter.navigate(["MigrationResourceList"]);
                    var requestObj;
                    vm.migrating = true;
                    $('#confirm-migration-modal').modal('hide');
                    requestObj = ds.prepareJobRequest();
                    vm.acceptTermsAndConditions= true;
                    $rootScope.$emit("vm.MigrationName", dataStoreService.selectedTime.migrationName);
                    $rootScope.$emit("vm.MigrationTime", dataStoreService.selectedTime.time);
                    HttpWrapper.save("/api/jobs", { "operation": 'POST' }, requestObj)
                        .then(function (result) {
                            vm.migrating = false;
                            $rootRouter.navigate(["MigrationStatus"]);
                        }, function (error) {
                            vm.migrating = false;
                            vm.errorInMigration = true;
                            vm.scheduleMigration = true;
                        });
                };

                /**
                 * @ngdoc method
                 * @name changeName
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * Updates migration name
                 */
                vm.changeName = function () {
                    vm.migrationName = vm.changedMigrationName;
                    dataStoreService.selectedTime.migrationName = vm.migrationName;
                    vm.editName = false;
                    $rootScope.$emit("vm.MigrationName", dataStoreService.selectedTime.migrationName);
                };

                /**
                 * @ngdoc method
                 * @name disableEditor
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * Cancels updation of migration name
                 */
                vm.revertName = function () {
                    vm.changedMigrationName = vm.migrationName;
                    $rootScope.$emit("vm.MigrationName", dataStoreService.selectedTime.migrationName);
                    vm.editName = false;
                };

                vm.showConfirmMigrateDialog = function (scheduleMigration) {
                    if(dataStoreService.fetchFawsDetails().totalAccounts === 0){
                        $('#confirm-migration-modalFAWS').modal('show');
                     }
                    else {
                        $('#confirm-migration-modal').modal('show');
                    }
                };

                vm.showProjectedCostCalculation = function (projectedCalculation) {
                    $('#calculator_modal').modal('show');
                };

                //Disable the button immediately on click so that multiple clicks get prevented
                vm.disableButton = function($event) {
                    $event.currentTarget.disabled = true;
                };

                /**
                 * @ngdoc method
                 * @name openUsageCostsModal
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * function to open the modal that displays the current and projected pricing calculations for the selected servers.
                 */ 
                vm.openUsageCostsModalComponent = function(){
                    $scope.$broadcast("openUsageCostsModal");
                }
            
            $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
                    if((oldUrl.indexOf("migration/confirm") > -1) && (newUrl.indexOf("migration/recommendation") > -1) && $window.localStorage.selectedServers === "[]"){
                        event.preventDefault();
                        //$('#cancel_modal').modal('show');
                        $rootRouter.navigate(["MigrationResourceList"]);
                        //$rootRouter.navigate(["MigrationResourceList"]);
                    }
                      //condition for direct url jumping or hitting...
                     if((oldUrl.indexOf("/migration/confirm") == -1) && ((newUrl.indexOf("migration/recommendation") > -1))){
                        event.preventDefault();
                        $rootRouter.navigate(["MigrationStatus"]);
                    }
            });

            return vm;

            }
            ]
        }); // end of component definition
})();
