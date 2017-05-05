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
            controller: ["$rootRouter", "datastoreservice", "migrationitemdataservice", "$q", "httpwrapper", "authservice", "$timeout", "$rootScope", function ($rootRouter, dataStoreService, ds, $q, HttpWrapper, authservice, $timeout, $rootScope) {
                var vm = this;
                vm.tenant_id = '';
                vm.tenant_account_name = '';

                vm.$onInit = function () {
                    vm.tenant_id = authservice.getAuth().tenant_id;
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

                    dataStoreService.setPageName("confirm-migrate");
                    vm.scheduleMigration = false;
                    vm.cost = dataStoreService.getProjectedPricing();
                    vm.migrating = false;
                    vm.errorInMigration = false;

                    vm.saveLaterObj = {
                        "saveSuccess": false,
                        "saveInProgress": false,
                        "resultMsg": "",
                        "modalName": '#save_for_later'
                    };
                     vm.acceptTermsAndConditions=false;
                    vm.cancelnSaveObj = {
                        "saveSuccess": false,
                        "saveInProgress": false,
                        "resultMsg": "",
                        "modalName": '#cancel_modal'
                    };
                    vm.saveProgress = "";
                    // vm.error = false;
                };
                
                $rootScope.$on("vm.scheduleMigration", function (event, value) {
                    vm.scheduleMigration = value;
                });

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
                    requestObj = ds.prepareRequest();
                    vm.acceptTermsAndConditions= true;
                    console.log(requestObj);
                    $rootScope.$emit("vm.MigrationName", dataStoreService.selectedTime.migrationName);
                    console.log(dataStoreService.selectedTime.migrationName);
                    $rootScope.$emit("vm.MigrationTime", dataStoreService.selectedTime.time);
                    console.log(dataStoreService.selectedTime.time);
                     HttpWrapper.save("/api/jobs", { "operation": 'POST' }, requestObj)
                        .then(function (result) {
                            console.log("Migration Response: ", result);
                            $timeout(function () {
                            }, 5000);
                        }, function (error) {
                            console.log("Error: Could not trigger migration", error);
                            vm.migrating = false;
                            vm.errorInMigration = true;
                            vm.scheduleMigration = true;
                        });
                    $rootRouter.navigate(["MigrationStatus"]);
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

                /**
                 * @ngdoc method
                 * @name saveItems
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * Invokes "/api/users/uidata/" API call for fetching existing saved instances. 
                 */
                vm.saveItems = function (buttonDetails) {
                    var saveInstance = {
                        recommendations: dataStoreService.getItems(),
                        scheduling_details: dataStoreService.getScheduleMigration(),
                        step_name: "ConfirmMigration",
                        migration_schedule: {
                            migrationName: dataStoreService.getScheduleMigration().migrationName,
                            time: dataStoreService.getScheduleMigration().time,
                            timezone: dataStoreService.getScheduleMigration().timezone
                        }
                    };
                    buttonDetails.saveInProgress = true;
                    dataStoreService.saveItems(saveInstance).then(function (success) {
                        if (success) {
                            buttonDetails.saveInProgress = false;
                            buttonDetails.saveSuccess = true;
                            buttonDetails.resultMsg = "Saved your instance successfully with name: " + dataStoreService.getScheduleMigration().migrationName;
                            $timeout(function () {
                                buttonDetails.resultMsg = "";
                                if (buttonDetails.modalName == '#cancel_modal') {
                                    $('#cancel_modal').modal('hide');
                                    dataStoreService.resetAll();
                                    $rootRouter.navigate(["MigrationStatus"]);
                                }
                            }, 3000);
                        } else {
                            buttonDetails.saveInProgress = false;
                            buttonDetails.saveSuccess = false;
                            buttonDetails.resultMsg = "Error while saving. Please try again after sometime!!";
                            $timeout(function () {
                                buttonDetails.resultMsg = "";
                                $(buttonDetails.modalName).modal('hide');
                            }, 3000);
                        }
                    }, function (error) {
                        buttonDetails.saveInProgress = false;
                        buttonDetails.saveSuccess = false;
                        buttonDetails.resultMsg = "Error while saving. Please try again after sometime!!";
                        $timeout(function () {
                            buttonDetails.resultMsg = "";
                            $(buttonDetails.modalName).modal('hide');
                        }, 3000);
                    });
                };


                vm.submitCancel = function () {
                    if (vm.saveProgress == 'yes') {
                        vm.saveItems(vm.cancelnSaveObj);
                    }
                    else {
                        dataStoreService.resetAll();
                        $rootRouter.navigate(["MigrationStatus"]);
                        $('#cancel_modal').modal('hide');
                    }
                }

                vm.showCancelDialog = function () {
                    $('#cancel_modal').modal('show');
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

                    var selectedPricingMappingObj = dataStoreService.getItems('server');
                    selectedPricingMappingObj.forEach(function(server){
                        var selectedFlavor = server.selectedMapping.instance_type;
                        if(server.details.hasOwnProperty('rax_bandwidth')){
                            vm.costCalculationItems.push({
                                "resourceName" : server.details.name,
                                "rax_uptime_cost":server.details.rax_uptime_cost.toFixed(2),
                                "rax_bandwidth_cost":parseFloat(server.details.rax_bandwidth_cost).toFixed(2),
                                "rax_bandwidth":server.details.rax_bandwidth.toFixed(2),
                                "rax_uptime":server.details.rax_uptime.toFixed(2),
                                "rax_total_cost":parseFloat(parseFloat(server.details.rax_uptime_cost) + parseFloat(server.details.rax_bandwidth_cost)).toFixed(2)
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
                            });
                            vm.totalOfCostCalculationItems += server.details.rax_price;;
                        }

                        if(server.details.hasOwnProperty('aws_bandwidth_cost')){
                            var cost = 0;
                            for(var i =0; i< server.mappings.length; i++){
                                if(server.mappings[i].instance_type == selectedFlavor){
                                    cost = server.mappings[i].cost;
                                }
                            }
                            vm.projectedCostCalculationItems.push({
                                "resourceName" : server.details.name,
                                "aws_uptime_cost":parseFloat(parseFloat(cost) * parseFloat(server.details.rax_uptime)).toFixed(2),
                                "aws_bandwidth_cost":server.details.aws_bandwidth_cost.toFixed(2),
                                "aws_bandwidth":server.details.rax_bandwidth.toFixed(2),
                                "aws_uptime":server.details.rax_uptime.toFixed(2),
                                "aws_total_cost":parseFloat(parseFloat(parseFloat(cost) * parseFloat(server.details.rax_uptime)) + parseFloat(server.details.aws_bandwidth_cost)).toFixed(2),
                                "rax_bandwidth":server.details.rax_bandwidth.toFixed(2),
                                "rax_uptime":server.details.rax_uptime.toFixed(2),                              
                            });
                            vm.totalOfProjectedCostCalculationItems += (parseFloat(parseFloat(parseFloat(cost) * parseFloat(server.details.rax_uptime)) + parseFloat(server.details.aws_bandwidth_cost)));
                        }

                        if(!server.details.hasOwnProperty('aws_bandwidth_cost')){
                            var cost = 0;
                            //Checks whether the showCalculatedCostDialog flag was set in the loop before
                            if(vm.showCalculatedCostDialog === false)
                                vm.showCalculatedCostDialog = true;

                            for(var i =0; i< server.mappings.length; i++){
                                if(server.mappings[i].instance_type == selectedFlavor){
                                    cost = server.mappings[i].cost;
                                }
                            }
                            vm.projectedCostCalculationItems.push({
                                "calculated_cost_resourcename" : server.details.name,
                                "aws_uptime_cost":parseFloat(parseFloat(cost) * parseFloat(24 * 30)).toFixed(2),
                                "aws_bandwidth":"NA",
                                "aws_uptime":"NA",
                                "aws_total_cost":parseFloat(parseFloat(cost) * parseFloat(24*30)).toFixed(2),
                                "rax_bandwidth":"NA",
                                "rax_uptime":"720.00",
                            });
                        vm.totalOfProjectedCostCalculationItems += (parseFloat(parseFloat(cost) * parseFloat(24*30)));
                    }
                    });
                    $('#calculator_modal').modal('show');
                }

                return vm;

            }
            ]
        }); // end of component definition
})();