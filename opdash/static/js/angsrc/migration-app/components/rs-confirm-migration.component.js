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
                                            if(jobList[i].batch_status === "scheduled" && jobList[i].batch_status === "done"){
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
                                                if(z2 !== "error" && z2 !== "canceled"){ //if status is error or canceled, migration will be allowed, otherwise not
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

                vm.goToStep1 = function(){
                    $("#duplicate-instance").modal('hide');
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
                    if(dataStoreService.getResourceItemsForEditingMigration()){
                        migrationService.modifyMigration(dataStoreService.getJobIdForMigration(),requestObj)
                        .then(function (result) {
                            if(result){
                                migrationService.pauseMigration(dataStoreService.getJobIdForMigration(),'unpause').then(function(success){
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
                    dataStoreService.getSavedItems()
                        .then(function (result) {
                            var savedMigrations = JSON.parse(result.savedDetails || '[]');
                            
                            // remove from server
                            var index = -1;
                            for(var i=0; i<savedMigrations.length; i++){
                                if($window.localStorage.migrationName === savedMigrations[i].instance_name){
                                    index = i;
                                    break;
                                }
                            }
                            index!==-1 && savedMigrations.splice(index, 1);
                            result.savedDetails = JSON.stringify(savedMigrations);
                            
                            if(dataStoreService.postSavedInstances(result)){
                                vm.saveResourceDetails();
                            }
                        })
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

                /**
                 * @ngdoc method
                 * @name openUsageCostsModal
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * function to open the modal that displays the current and projected pricing calculations for the selected servers.
                 */ 
                vm.openUsageCostsModal = function(){
                    vm.costCalculationItems =[];
                    vm.projectedCostCalculationItems = [];
                    vm.totalOfCostCalculationItems = 0;
                    vm.totalOfProjectedCostCalculationItems = 0;
                    vm.showCalculatedCostDialog = false;
                    var selectedPricingMappingObj = [];
                    //var selectedPricingMappingObj = dataStoreService.getItems('server');
                    if($window.localStorage.selectedServers !== undefined)
                        selectedPricingMappingObj = JSON.parse($window.localStorage.selectedServers);
                    else
                        selectedPricingMappingObj = dataStoreService.getItems('server');
                    selectedPricingMappingObj.forEach(function(server){
                        var selectedFlavor = server.selectedMapping.instance_type;
                        if(server.details.hasOwnProperty('rax_bandwidth')){
                            vm.costCalculationItems.push({
                                "resourceName" : server.details.name,
                                "rax_uptime_cost":server.details.rax_uptime_cost.toFixed(2),
                                "rax_bandwidth_cost":parseFloat(server.details.rax_bandwidth_cost).toFixed(2),
                                "rax_bandwidth":server.details.rax_bandwidth.toFixed(2),
                                "rax_uptime":server.details.rax_uptime.toFixed(2),
                                "rax_total_cost":parseFloat(parseFloat(server.details.rax_uptime_cost) + parseFloat(server.details.rax_bandwidth_cost)).toFixed(2),
                                "storage":server.details.rax_storage_size
                            });
                            vm.totalOfCostCalculationItems += (parseFloat(parseFloat(server.details.rax_uptime_cost) + parseFloat(server.details.rax_bandwidth_cost)));
                        }

                        if(!server.details.hasOwnProperty('rax_bandwidth')){
                            vm.costCalculationItems.push({
                                "resourceName" : server.details.name,
                                "rax_uptime_cost":"NA",
                                "rax_bandwidth_cost":"NA",
                                "rax_bandwidth":"NA",
                                "rax_uptime":"NA",
                                "rax_total_cost":server.details.rax_price,
                                "storage":server.details.rax_storage_size
                            });
                            vm.totalOfCostCalculationItems += server.details.rax_price;
                        }

                        if(server.details.hasOwnProperty('rax_bandwidth')){
                            // var cost = 0;
                            // for(var i =0; i< server.mappings.length; i++){
                            //     if(server.mappings[i].instance_type == selectedFlavor){
                            //         cost = server.mappings[i].cost;
                            //     }
                            // }
                            var storage_rate = parseFloat(parseFloat(server.details.rax_storage_size) * parseFloat(server.selectedMapping.storage_rate)).toFixed(2);
                            var aws_bandwidth_cost = parseFloat(parseFloat(server.selectedMapping.cost) * parseFloat(server.details.rax_bandwidth)).toFixed(2);
                            var aws_uptime_cost = parseFloat(parseFloat(server.selectedMapping.cost) * parseFloat(server.details.rax_uptime)).toFixed(2);
                            vm.projectedCostCalculationItems.push({
                                "resourceName" : server.details.name,
                                "aws_uptime_cost":aws_uptime_cost,
                                "aws_bandwidth_cost":aws_bandwidth_cost,
                                "aws_bandwidth":server.details.rax_bandwidth.toFixed(2),
                                "aws_uptime":server.details.rax_uptime.toFixed(2),
                                "aws_total_cost":parseFloat(parseFloat(aws_uptime_cost) + parseFloat(aws_bandwidth_cost) + parseFloat(storage_rate)).toFixed(2),
                                "rax_bandwidth":server.details.rax_bandwidth.toFixed(2),
                                "rax_uptime":server.details.rax_uptime.toFixed(2),
                                "storage_rate":storage_rate ,
                                "rax_storage":server.details.rax_storage_size                       
                            });
                            vm.totalOfProjectedCostCalculationItems += (parseFloat(aws_uptime_cost) + parseFloat(aws_bandwidth_cost)+ parseFloat(storage_rate));
                        }

                        if(!server.details.hasOwnProperty('rax_bandwidth')){
                            //var cost = 0;
                            //Checks whether the showCalculatedCostDialog flag was set in the loop before
                            if(vm.showCalculatedCostDialog === false)
                                vm.showCalculatedCostDialog = true;

                            // for(var i =0; i< server.mappings.length; i++){
                            //     if(server.mappings[i].instance_type == selectedFlavor){
                            //         cost = server.mappings[i].cost;
                            //     }
                            // }
                            var storage_rate = parseFloat(parseFloat(server.details.rax_storage_size) * parseFloat(server.selectedMapping.storage_rate)).toFixed(2);
                            vm.projectedCostCalculationItems.push({
                                "calculated_cost_resourcename" : server.details.name,
                                "aws_uptime_cost":parseFloat(parseFloat(server.selectedMapping.cost) * parseFloat(24 * 30)).toFixed(2),
                                "aws_bandwidth":"NA",
                                "aws_uptime":"NA",
                                "aws_total_cost":parseFloat((parseFloat(server.selectedMapping.cost) * parseFloat(24*30)) + parseFloat(storage_rate)).toFixed(2),
                                "rax_bandwidth":"NA",
                                "rax_uptime":"720.00",
                                "storage_rate":storage_rate,
                                "rax_storage":server.details.rax_storage_size  
                            });
                        vm.totalOfProjectedCostCalculationItems += (parseFloat(parseFloat(server.selectedMapping.cost) * parseFloat(24*30))+parseFloat(storage_rate));
                    }
                });
                $('#calculator_modal').modal('show');
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
