(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rspricingpanelcomponent
     * @description
     * Component to display the list of tenants whose resource migration has to be done. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/pricing-panel.html**.  
     *   
     * Its controller {@link migrationApp.controller:rspricingCtrl rspricingCtrl} uses the below services:
     *  * {@link migrationApp.service:authservice authservice}
     */
    angular.module("migrationApp")
        .component("rspricingpanel", {
            templateUrl: "/static/angtemplates/migration/pricing-panel.html",
             bindings: {
                page: "@",
                selecteditem: "=",
            },
           
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rspricingCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rspricingpanel rspricingpanel} component
             */
            controller:["datastoreservice","$rootRouter","httpwrapper","$filter","$timeout","$q","$rootScope","httpwrapper","migrationitemdataservice",function(dataStoreService,$rootRouter,HttpWrapper,$filter,$timeout,$q,$rootScope,httpwrapper,ds){
                var vm = this;
                vm.invoiceTotal = '';
                vm.totalProjectedPricingSum = 0;
                
                /**
                 * @ngdoc method
                 * @name $onInit
                 * @methodOf migrationApp.controller:rspricingCtrl
                 * @description 
                 *function called on init of the rspricingCtrl.
                 */
                vm.$onInit = function() {                
                    vm.loading = true;
                    vm.loadError = false;
                    vm.precheck = false;
                    vm.precheckError = false;
                    var currentPricingDetails = vm.getCurrentPricingDetails();
                    var projectedPricingDetails = vm.getProjectedPricing();

                    //Waits till all the promises are resolved , then only loads the pricing details
                    $q.all([currentPricingDetails,projectedPricingDetails]).then(function(results) {
                        vm.loading = false;
                    }, function(error){
                        vm.loading = false;
                        vm.loadError = true;
                    });

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
                 * @name continue
                 * @methodOf migrationApp.controller:rspricingCtrl
                 * @description 
                 * Continue to next step: **Schedule Migration**
                 */
                vm.continue = function() {     
                    vm.selectedTime = dataStoreService.getScheduleMigration();
                    vm.warnings = [];
                    vm.errors = [];
                    vm.failures = [];
                    dataStoreService.getItems(vm.selecteditem);
                    //conditions to checkeck on what page the user is and navigate to the following next page.
                    if(vm.page==="resources"){
                        if(vm.selecteditem.length>0){
                            dataStoreService.setItems(vm.selecteditem);
                            $rootRouter.navigate(["MigrationRecommendation"]);
                        }
                        else{
                            alert("Please select some items to migrate");
                        } 
                    } 
                    else if(vm.page==="recommendation"){ 
                        vm.precheck = false;
                        vm.precheckError = false;
                        $("#precheck_modal").modal('show');
                        var requestObj = ds.prepareTemporaryRequest();
                        var servers = dataStoreService.getItems("server");
                        HttpWrapper.save("/api/precheck", { "operation": 'POST' }, requestObj)
                        .then(function (result) {
                            if(result.results.length != 0){
                                if(result.results.instances){
                                    angular.forEach(servers, function (server) {
                                        var serverObjects = result.results.instances[server.id];
                                        angular.forEach(serverObjects, function (subObj) {
                                            if(subObj.type=="error"){
                                                vm.errors.push({
                                                    name:server.name,
                                                    description:server.description
                                                })
                                            }else if(subObj.type=="warning"){
                                                vm.warnings.push({
                                                    name:server.name,
                                                    description:server.description
                                                })
                                            }else if(networkBlock.type=="failure"){
                                                vm.failures.push({
                                                    name:server.name,
                                                    description:server.description
                                                })
                                            }
                                        });
                                    });
                                }
                                var networks = result.results.account;
                                if(networks){
                                    for(var key in networks){
                                        if (networks.hasOwnProperty(key)) {
                                            angular.forEach(networks[key],function(networkBlock){
                                                if(networkBlock.type=="warning"){
                                                    vm.warnings.push({
                                                        name:servers[0].details.networks[0].name,
                                                        description:networkBlock.description
                                                    })
                                                }else if(networkBlock.type=="error"){
                                                    vm.errors.push({
                                                        name:servers[0].details.networks[0].name,
                                                        description:networkBlock.description
                                                    })
                                                }else if(networkBlock.type=="failure"){
                                                    vm.failures.push({
                                                        name:servers[0].details.networks[0].name,
                                                        description:networkBlock.description
                                                    })
                                                }
                                            })
                                        }
                                    }
                                }
                            }
                            if(result.results.length === 0 || (vm.errors.length === 0 && vm.warnings.length === 0 && vm.failures.length === 0)){
                                $("#precheck_modal").modal('hide');
                                $rootRouter.navigate(["ConfirmMigration"]);
                            }else{
                                vm.precheck = true;
                            }
                        }, function (error) {
                            vm.precheck = false;
                            vm.precheckError = true;
                            console.log("error");
                            console.log(error);
                        });
                    }
                };
                
                /**
                 * @ngdoc method
                 * @name back
                 * @methodOf migrationApp.controller:rspricingCtrl
                 * @description 
                 * function to go back to previous page. 
                 */
                vm.back = function() {
                    //we dont need any conditions here as we are only using in pricing panel
                    $rootRouter.navigate(["MigrationResourceList"]);
                }

                /**
                 * @ngdoc method
                 * @name showCancelDialog
                 * @methodOf migrationApp.controller:rspricingCtrl
                 * @description 
                 * function to cancel the migration. 
                 */
                vm.showCancelDialog = function() {
                    $('#cancel_modal').modal('show');
                };

                //Listener to close and show modal
                $rootScope.$on("showCancelModal", function(event){
                    vm.showCancelDialog();
                });

                /**
                 * @ngdoc method
                 * @name continueToSchedule
                 * @methodOf migrationApp.controller:rspricingCtrl
                 * @description 
                 * When we click on the continue button in recommendations page, a popup willbe shown up 
                 * saying about the configurations that are made on inventory. If we press continue button
                 * in that popup, this function will be triggered helping us navigate to schedule migration 
                 * page.
                 */
                vm.continueToSchedule = function(){
                    $('#precheck_modal').modal('hide');
                    $rootRouter.navigate(["ConfirmMigration"]);
                }

                /**
                 * @ngdoc method
                 * @name getCurrentPricingDetails
                 * @methodOf migrationApp.controller:rspricingCtrl
                 * @description 
                 * Gets current pricing amount and the billing period
                 */
                vm.getCurrentPricingDetails = function(){
                    var invoiceTotal = 0.00;
                    var date = new Date();
                    var selectedServers = dataStoreService.getItems('server');
                    angular.forEach(selectedServers, function (item) {
                        invoiceTotal += item.details.rax_price;
                    });
                    vm.invoiceTotal = invoiceTotal.toFixed(2);
                }

                //Listener to listen to price change in the recommendations page.
                $rootScope.$on("pricingChanged",function(){
                    vm.getProjectedPricing();
                    vm.getCurrentPricingDetails();
                });

                /**
                 * @ngdoc method
                 * @name getProjectedPricing
                 * @methodOf migrationApp.controller:rspricingCtrl
                 * @description 
                 * Gets a cumulative projected pricing amount
                 */
                vm.getProjectedPricing = function(){
                    return $timeout(function(){
                        var selectedPricingMappingObj = dataStoreService.getItems('server');
                        vm.totalProjectedPricingSum = 0;
                        selectedPricingMappingObj.forEach(function(item){
                            if(item.details.hasOwnProperty('rax_uptime') && item.details.hasOwnProperty('aws_bandwidth_cost'))
                                vm.totalProjectedPricingSum += parseFloat(item.selectedMapping.cost * item.details.rax_uptime + item.details.aws_bandwidth_cost);
                            else
                                vm.totalProjectedPricingSum += parseFloat(item.selectedMapping.cost * (24*30) + parseFloat("0.10"));
                        });
                        vm.totalProjectedPricingSum = vm.totalProjectedPricingSum.toFixed(2);
                    },1000);                                 
                }

                /**
                 * @ngdoc method
                 * @name saveItems
                 * @methodOf migrationApp.controller:rspricingCtrl
                 * @description 
                 * Invokes "/api/users/uidata/" API call for fetching existing saved instances. 
                 */
                vm.saveItems = function(buttonDetails) {
                    var stepName = "";
                    var scheduleItem = {};
                    var time = '';
                    var timezone = '';
                   //conditions to checkeck on what page the user is and save the data and pass on to the next following pages.  
                    if(vm.page==="recommendation"){ 
                        stepName = "MigrationRecommendation";
                        scheduleItem = {};
                        time = '';
                        timezone = '';
                    }
                    var saveInstance = {
                        recommendations : dataStoreService.getItems(),
                        scheduling_details : scheduleItem,
                        step_name: stepName,
                        migration_schedule: {
                            migrationName:dataStoreService.getScheduleMigration().migrationName,
                            time:time,
                            timezone:timezone
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
                                    dataStoreService.resetAll();
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

                /**
                 * @ngdoc method
                 * @name submitCancel
                 * @methodOf migrationApp.controller:rspricingCtrl
                 * @description 
                 * function to cancel the migration. 
                 */
                vm.submitCancel = function() {
                    if(vm.saveProgress == 'yes'){
                        vm.saveItems(vm.cancelnSaveObj);
                    }
                    else{
                        dataStoreService.resetAll();
                        $rootRouter.navigate(["MigrationStatus"]);
                        $('#cancel_modal').modal('hide');
                    }
                }

                /**
                 * @ngdoc method
                 * @name openUsageCostsModal
                 * @methodOf migrationApp.controller:rspricingCtrl
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
                                "rax_computed_total_cost":server.details.rax_price,
                                "rax_total_cost":"NA"
                            });
                            vm.totalOfCostCalculationItems += server.details.rax_price;
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
                                "aws_uptime_cost":parseFloat(cost),
                                "aws_bandwidth":"NA",
                                "aws_uptime":"NA",
                                "aws_total_cost":parseFloat(parseFloat(parseFloat(cost) * parseFloat(24*30)) + parseFloat("0.10")).toFixed(2),
                                "aws_computed_uptime_cost":parseFloat(parseFloat(cost) * parseFloat(24*30)).toFixed(2),
                                "rax_bandwidth":"NA",
                                "rax_uptime":"NA",
                            });
                        vm.totalOfProjectedCostCalculationItems += (parseFloat(parseFloat(parseFloat(cost) * parseFloat(24*30)) + parseFloat("0.10")));
                    }
                });
                $('#calculator_modal').modal('show');
                }
                return vm;             
            }]
        });
})();