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
                vm.invoiceCoverageStartDate = '';
                vm.invoiceCoverageEndDate = '';
                vm.invoiceTotal = '';
                vm.totalProjectedPricingSum = 0;
/**
                 * @ngdoc method
                 * @name $onInit
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 *function called on init of the rspricingCtrl.
                 */
                vm.$onInit = function() {                
                    vm.loading = true;
                    vm.loadError = false;
                    vm.precheck = false;
                    dataStoreService.setRecommendedTotalCost();
                    dataStoreService.setCurrentPricing ();
                    vm.totalCost = dataStoreService.getRecommendedTotalCost();
                    vm.currentPricing = dataStoreService.getCurrentPricing ();
                    vm.savings = (vm.currentPricing - vm.totalCost);           
                    var currentPricingDetails = vm.getCurrentPricingDetails();
                    var projectedPricingDetails = vm.getProjectedPricing();

                    //Waits till all the promises are resolved , then only loads the pricing details
                    $q.all([currentPricingDetails,projectedPricingDetails]).then(function(results) {
                        vm.loading = false;
                    }, function(error){
                        vm.loading = false;
                        vm.loadError = true;
                    });
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
                 * @name continue
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
                 * @description 
                 * Continue to next step: **Schedule Migration**
                 */
                vm.continue = function() {     
                    vm.selectedTime = dataStoreService.getScheduleMigration();
                    vm.warnings = [];
                    vm.errors = [];
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
                        $("#precheck_modal").modal('show');
                        var requestObj = ds.prepareTemporaryRequest();
                        HttpWrapper.save("/api/precheck", { "operation": 'POST' }, requestObj)
                        .then(function (result) {
                            if(result.results.length != 0){
                                var servers = dataStoreService.getItems("server");
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
                                        }
                                    });
                                });
                                var networks = result.results.account;
                                for(var key in networks){
                                    if (networks.hasOwnProperty(key)) {
                                        angular.forEach(networks[key],function(networkBlock){
                                            if(networkBlock.type=="warning"){
                                                vm.warnings.push({
                                                    name:networkBlock.name,
                                                    description:networkBlock.description
                                                })
                                            }else if(networkBlock.type=="error"){
                                                vm.errors.push({
                                                    name:networkBlock.name,
                                                    description:networkBlock.description
                                                })
                                            }
                                        })
                                    }
                                }
                            }
                            if(result.results.length === 0 || (vm.errors.length === 0 && vm.warnings.length === 0)){
                                $("#precheck_modal").modal('hide');
                                $rootRouter.navigate(["ConfirmMigration"]);
                            }else{
                                vm.precheck = true;
                            }
                        }, function (error) {
                            console.log("error");
                            console.log(error);
                            // console.log("Error: Could not trigger migration", error);
                            // vm.migrating = false;
                            // vm.errorInMigration = true;
                            // vm.scheduleMigration = true;
                        });
                    }
                    else if(vm.page==="scheduleMigration"){
                        dataStoreService.setScheduleMigration(vm.selectedTime);  
                        $rootRouter.navigate(["ConfirmMigration"]);
                    }
                };
                /**
                 * @ngdoc method
                 * @name back
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description 
                 * function to go back to previous page. 
                 */
                vm.back = function() {
                    //conditions to checkeck on what page the user is and navigate back to the previous page.
                    if(vm.page==="recommendation"){
                        $rootRouter.navigate(["MigrationResourceList"]);
                    }
                    else if(vm.page==="scheduleMigration"){
                        $rootRouter.navigate(["MigrationRecommendation"]);
                    }
                }

/**
                 * @ngdoc method
                 * @name showCancelDialog
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description 
                 * function to cancel the migration. 
                 */

                   vm.showCancelDialog = function() {
                    $('#cancel_modal').modal('show');
                };

                $rootScope.$on("showCancelModal", function(event){
                    $('#cancel_modal').modal('show');
                });

                /**
                 * @ngdoc method
                 * @name continueToSchedule
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
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
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
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
                    vm.invoiceCoverageStartDate = parseInt(date.getMonth())+"/01/"+date.getFullYear();
                    vm.invoiceCoverageEndDate =  parseInt(date.getMonth())+1+"/01/"+date.getFullYear();
                }

                $rootScope.$on("pricingChanged",function(){
                    vm.getProjectedPricing();
                    vm.getCurrentPricingDetails();
                });

                /**
                 * @ngdoc method
                 * @name getProjectedPricing
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
                 * @description 
                 * Gets a cumulative projected pricing amount
                 */
                vm.getProjectedPricing = function(){
                    return $timeout(function(){
                        var selectedPricingMappingObj = dataStoreService.getItems('server');
                        vm.totalProjectedPricingSum = 0;
                        selectedPricingMappingObj.forEach(function(item){
                            vm.totalProjectedPricingSum += parseFloat(item.selectedMapping.cost * item.details.rax_uptime);
                        });
                        vm.totalProjectedPricingSum = vm.totalProjectedPricingSum.toFixed(2);
                    },1000);                                 
                }

                /**
                 * @ngdoc method
                 * @name saveItems
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
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
                    else if(vm.page==="scheduleMigration"){
                        stepName = "ScheduleMigration";
                        scheduleItem = dataStoreService.getScheduleMigration();
                        time = dataStoreService.getScheduleMigration().time;
                        timezone = dataStoreService.getScheduleMigration().timezone;
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
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description 
                 * function to cancel the migration. 
                 */
                vm.submitCancel = function() {
                    if(vm.saveProgress == 'yes'){
                        vm.saveItems(vm.cancelnSaveObj);
                    }
                    else{
                        $rootRouter.navigate(["MigrationStatus"]);
                        $('#cancel_modal').modal('hide');
                    }
                }

                return vm;
              
            }]
        });
})();