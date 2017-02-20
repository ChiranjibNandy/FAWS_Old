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
           
            //   require: {
            //      parent: "^^rsmigrationresourceslist,^^rsmigrationrecommendation"
            // },
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rspricingCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rspricingpanel rspricingpanel} component
             */
            controller:["datastoreservice","$rootRouter","httpwrapper","$filter","$timeout","$q","$rootScope",function(dataStoreService,$rootRouter,HttpWrapper,$filter,$timeout,$q,$rootScope){
                var vm = this;
                vm.invoiceCoverageStartDate = '';
                vm.invoiceCoverageEndDate = '';
                vm.invoiceTotal = '';
                vm.totalProjectedPricingSum = 0;

                vm.$onInit = function() {                
                    vm.loading = true;
                    vm.loadError = false;
                    dataStoreService.setRecommendedTotalCost();
                    dataStoreService.setCurrentPricing ();
                    vm.totalCost = dataStoreService.getRecommendedTotalCost();
                    vm.currentPricing = dataStoreService.getCurrentPricing ();
                    vm.savings = (vm.currentPricing - vm.totalCost);           
                    //vm.data = dataStoreService.getItems(vm.selectedItem);
                    // dataStoreService.setItems(vm.selectedItem);
                    // dataStoreService.getItems(vm.type);
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
                    // console.log(vm.selectedTime);
                    dataStoreService.getItems(vm.selecteditem);
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
                        // $('#precheck_modal').modal('show');
                        $rootRouter.navigate(["ScheduleMigration"]);
                    }
                    else if(vm.page==="scheduleMigration"){
                        dataStoreService.setScheduleMigration(vm.selectedTime);  
                        $rootRouter.navigate(["ConfirmMigration"]);
                    }
                };
                vm.back = function() {
                    if(vm.page==="recommendation"){
                        $rootRouter.navigate(["MigrationResourceList"]);
                    }
                    else if(vm.page==="scheduleMigration"){
                        $rootRouter.navigate(["MigrationRecommendation"]);
                    }
                }
                   vm.showCancelDialog = function() {
                    $('#cancel_modal').modal('show');
                };

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
                    $rootRouter.navigate(["ScheduleMigration"]);
                }

                /**
                 * @ngdoc method
                 * @name getCurrentPricingDetails
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
                 * @description 
                 * Gets current pricing amount and the billing period
                 */
                vm.getCurrentPricingDetails = function(){
                    return HttpWrapper.send('/api/billing/get_latest_bill', {"operation":'GET'})
                    .then(function(result){
                        vm.invoiceCoverageStartDate = $filter('date')(result.invoice.coverageStartDate, "MM/dd/yyyy");
                        vm.invoiceCoverageEndDate = $filter('date')(result.invoice.coverageEndDate, "MM/dd/yyyy");
                        vm.invoiceTotal = result.invoice.invoiceTotal;
                    }, function(error) {
                        console.log("Error: Could not fetch current pricing details", error);
                    }); 
                }

                $rootScope.$on("pricingChanged",function(){
                    vm.getProjectedPricing();
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
                            vm.totalProjectedPricingSum += parseFloat(item.selectedMapping.cost);
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
                        recommendations : dataStoreService.getItems('server'),
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