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
            controller: ["$rootRouter", "datastoreservice", "migrationitemdataservice", "$q", "httpwrapper", "authservice", "$timeout", "$rootScope","$scope","$window", function ($rootRouter, dataStoreService, ds, $q, HttpWrapper, authservice, $timeout, $rootScope,$scope,$window) {
                var vm = this;
                vm.tenant_id = '';
                vm.tenant_account_name = '';
                vm.cost = '';

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

                    dataStoreService.setPageName("ConfirmMigration");
                    $window.localStorage.setItem('pageName',"ConfirmMigration");
                    vm.scheduleMigration = false;
                    vm.cost = dataStoreService.getProjectedPricing();
                    vm.migrating = false;
                    vm.errorInMigration = false;
                    vm.acceptTermsAndConditions=false;
                    vm.emptyEquipments=true;
                    vm.saveProgress = "";
                    // vm.error = false;
                };
                
                $rootScope.$on("vm.scheduleMigration", function (event, value) {
                    vm.scheduleMigration = value;
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
                 * @name migrate
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * Starts a batch to migrate all resources selected by user
                 */
                vm.migrate = function () {
                    var selectedItems = JSON.parse($window.localStorage.selectedServers);//dataStoreService.getItems(); -- Previous Code
                    if(selectedItems.length > 0){
                        var requestObj;
                        vm.migrating = true;
                        $('#confirm-migration-modal').modal('hide');
                        requestObj = ds.prepareJobRequest();
                        vm.acceptTermsAndConditions= true;
                        HttpWrapper.save("/api/jobs", { "operation": 'POST' }, requestObj)
                            .then(function (result) {
                                vm.migrating = false;
                                $rootRouter.navigate(["MigrationStatus"]);
                            }, function (error) {
                                console.log("Error: Could not trigger migration", error);
                                vm.migrating = false;
                                vm.errorInMigration = true;
                                vm.scheduleMigration = true;
                            });
                    }else{
                        $("#no-equipments-modal").modal('show');
                    }
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
                            console.log("Error: Could not trigger migration", error);
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
            });

            return vm;

            }
            ]
        }); // end of component definition
})();