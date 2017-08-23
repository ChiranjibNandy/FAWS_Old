(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rspricingpanel
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
            controller:["datastoreservice","$rootRouter","httpwrapper","$filter","$timeout","$q","$rootScope","httpwrapper","migrationitemdataservice","$window","$scope",function(dataStoreService,$rootRouter,HttpWrapper,$filter,$timeout,$q,$rootScope,httpwrapper,ds,$window,$scope){
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
                    vm.precheckButtonEnabled = false;
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
                            dataStoreService.setSelectedItems(vm.selecteditem);
                            $rootRouter.navigate(["MigrationRecommendation"]);
                        }
                        else{
                            alert("Please select some items to migrate");
                        } 
                    } 
                    else if(vm.page==="recommendation"){ 
                        vm.precheckSuccess = false;
                        vm.precheck = false;
                        vm.precheckError = false;
                        $("#precheck_modal").modal('show');
                        var requestObj = ds.prepareJobRequest(true); //Send 'true' to generate pre-req job-spec obj
                        var servers = JSON.parse($window.localStorage.selectedResources)['server'];//dataStoreService.getItems("server");
                        HttpWrapper.save("/api/precheck", { "operation": 'POST' }, requestObj)
                        .then(function (result) {
                            if(Object.keys(result.results).length != 0){
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
                                            }else if(subObj.type=="failure"){
                                                vm.failures.push({
                                                    name:server.name,
                                                    description:server.description
                                                })
                                            }
                                        });
                                    });
                                }
                                var networks = result.results.networks;
                                if(networks){
                                    vm.warningMappingsOfEquipments(networks);
                                }
                                var account = result.results.account;
                                if(account){
                                    vm.warningMappingsOfEquipments(account);
                                }
                            }
                            if(Object.keys(result.results).length === 0 || (vm.errors.length === 0 && vm.warnings.length === 0 && vm.failures.length === 0)){
                                vm.precheckSuccess = true;
                            }else{
                                vm.precheck = true;
                            }
                        }, function (error) {
                            vm.precheck = false;
                            vm.precheckError = true;
                        });
                    }
                };

                $scope.$on('enableContinuePrecheck',function(event,args){
                     vm.precheckButtonEnabled = args.enableStatus;
                });

                vm.warningMappingsOfEquipments = function(descriptionBlock){
                    for(var key in descriptionBlock){
                        if (descriptionBlock.hasOwnProperty(key)) {
                            angular.forEach(descriptionBlock[key],function(networkBlock){
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
                                }else if(networkBlock.type=="failure"){
                                    vm.failures.push({
                                        name:networkBlock.name,
                                        description:networkBlock.description
                                    })
                                }
                            })
                        }
                    }
                }
                        
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
                    var selectedServers = [];
                    //var selectedServers = dataStoreService.getItems('server');
                    if($window.localStorage.selectedResources !== undefined)
                        selectedServers = JSON.parse($window.localStorage.selectedResources)['server'];
                    else
                        selectedServers = dataStoreService.getItems('server');
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
                        var selectedPricingMappingObj = [];
                        //var selectedPricingMappingObj = dataStoreService.getItems('server');
                        if($window.localStorage.selectedResources !== undefined)
                            selectedPricingMappingObj = JSON.parse($window.localStorage.selectedResources)['server'];
                        else
                            selectedPricingMappingObj = dataStoreService.getItems('server');                        
                        vm.totalProjectedPricingSum = 0;
                        selectedPricingMappingObj.forEach(function(item){
                            if(item.details.hasOwnProperty('rax_bandwidth')){
                                var aws_uptime_cost = parseFloat(parseFloat(item.selectedMapping.cost) * parseFloat(item.details.rax_uptime)).toFixed(2);
                                var aws_bandwidth_cost = parseFloat(parseFloat(item.selectedMapping.cost) * parseFloat(item.details.rax_bandwidth)).toFixed(2);
                                var storage_rate = parseFloat(parseFloat(item.details.rax_storage_size) * parseFloat(item.selectedMapping.storage_rate)).toFixed(2);
                                vm.totalProjectedPricingSum += parseFloat(parseFloat(aws_uptime_cost) + parseFloat(aws_bandwidth_cost) + parseFloat(storage_rate));
                            }
                            else{
                                var storage_rate = parseFloat(parseFloat(item.details.rax_storage_size) * parseFloat(item.selectedMapping.storage_rate)).toFixed(2);
                                vm.totalProjectedPricingSum += parseFloat(parseFloat(item.selectedMapping.cost * (720)) + parseFloat(storage_rate));
                            }
                        });
                        vm.totalProjectedPricingSum = vm.totalProjectedPricingSum.toFixed(2);
                    },1000);                                 
                }

                vm.openUsageCostsModalInChild = function(){
                    $scope.$broadcast("openUsageCostsModal");
                }
                return vm;             
            }]
        });
})();