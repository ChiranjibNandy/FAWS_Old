(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsmigrationresourceslist
     * @description
     * Component to display the _Select Resources_ page. This component is loaded directly on route change.
     *
     * This component uses the template: **angtemplates/migration/resources-list.html**.
     *
     * Its controller {@link migrationApp.controller:rsmigrationresourceslistCtrl rsmigrationresourceslistCtrl} uses the below services:
     *  * {@link migrationApp.service:authservice authservice}
     *  * $scope
     *  * $rootRouter
     *  * {@link migrationApp.service:datastoreservice datastoreservice}
     */
    angular.module("migrationApp")
        .component("rsmigrationresourceslist", {
            templateUrl: "/static/angtemplates/migration/resources-list.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsmigrationresourceslistCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsmigrationresourceslist rsmigrationresourceslist} component
             */
            controller: ["authservice", "$scope", "$rootRouter", "datastoreservice", "migrationitemdataservice", "httpwrapper", "$timeout", function(authservice, $scope, $rootRouter, dataStoreService, ds, HttpWrapper, $timeout) {
                var vm = this;
                vm.tenant_id = '';
                vm.tenant_account_name = '';

                vm.$onInit = function() {
                    /**
                     * @ngdoc property
                     * @name status
                     * @propertyOf migrationApp.controller:rsmigrationresourceslist
                     * @type {Boolean}
                     * @description If true, Popup for migration won't be displayed in first step of Migration.
                     */
                    var status = dataStoreService.getDontShowStatus();
                    if(status == false){
                        $('#intro_modal').modal('show');
                    }
                    dataStoreService.setDontShowStatus(true);
                    $('title')[0].innerHTML =  "Inventory - Rackspace Cloud Migration";

                    vm.tenant_id = authservice.getAuth().tenant_id; //get Tenant ID
                   
                    if(authservice.getAuth().is_racker == false){   //get Account Name
                        var actname = dataStoreService.getAccountName(vm.tenant_id); //this service method is setting the accountname through api
                        actname.then(function() {
                            vm.tenant_account_name = authservice.getAuth().account_name;
                        }); //waiting api promise to resolve
                    }
                    else{  //if logged in as a racker then it was sent by racker-dashboard page
                         vm.tenant_account_name = authservice.getAuth().account_name;
                    } //end of if condition

                    
                     var cloudDetails = dataStoreService.setCloudAccountDetails();
                     cloudDetails.then(function() {
                                console.log("cloudDetails=",cloudDetails);
                                // console.log("auth.awsAccount",authservice.getAuth().awsAccount);
                                // console.log("auth.accessKey",authservice.getAuth().accessKey);
                                // console.log("auth.secretKey",authservice.getAuth().secretKey);
                                // console.log("auth.rackAPIKey",authservice.getAuth().rackAPIKey);
                                // console.log("auth.tenant_id",authservice.getAuth().tenant_id);
                                // console.log("auth.user",authservice.getAuth().rackUsername);
                                
                            }); //waiting api promise to resolve
         

                    vm.auth = authservice.getAuth();
                    vm.isRacker = authservice.is_racker;
                    /**
                     * @ngdoc property
                     * @name selectedItems
                     * @propertyOf migrationApp.controller:rsmigrationresourceslist
                     * @type {Array}
                     * @description List of items that are selected for migration
                     */
                    vm.selectedItems = {
                        server:[],
                        network:[]
                    };
                    vm.filterSearch = "";
                    vm.saveProgress = "";
                    var d = new Date();
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
                    vm.displayMigName = false;
                    var timestmp = moment(d).format("DDMMMYYYY-hhmma");
                    /**
                     * @ngdoc property
                     * @name migrationName
                     * @propertyOf migrationApp.controller:rsmigrationresourceslist
                     * @type {String}
                     * @description Create Migration considering Timestamp.
                     */
                    vm.migrationName = 'Migration-' + timestmp;
                    vm.noName = false;
                    vm.numOfItems = {
                        server:0,
                        network:0,
                        file:0
                    };
                }

                vm.numOfResources = function(type, itemLen) {
                    vm.numOfItems[type] = itemLen;
                    //vm.ServerTitle = 'Servers' + '(' + vm.numOfItems['server'] + ')';
                };
                /**
                 * @ngdoc method
                 * @name addItem
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @param {Object} item Object describing the selected resource
                 * @description
                 * Called by child component when an item is selected
                 */
                vm.addItem = function(item, type) {
                    vm.selectedItems[type] = dataStoreService.getItems(type);
                    if(vm.selectedItems[type].indexOf(item)<0){
                        vm.selectedItems[type].push(item);
                        dataStoreService.setItems(vm.selectedItems);
                        $scope.$broadcast("ItemsModified");
                    };
                }

                /**
                 * @ngdoc method
                 * @name removeItem
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @param {Object} item Object describing the selected resource
                 * @description
                 * Called by child component when an item is removed by user
                 */
                vm.removeItem = function(item, type) {
                    vm.selectedItems[type] = dataStoreService.getItems(type);
                    angular.forEach(vm.selectedItems[type], function (item_selected, key) {
                        if(item_selected.id == item.id){
                            vm.selectedItems[type].splice(key, 1);
                            dataStoreService.setItems(vm.selectedItems);
                            $scope.$broadcast("ItemRemovedForChild", item); // broadcast event to all child components
                            $scope.$broadcast("ItemsModified");
                            return;
                        };
                    });
                };

                $scope.$on("ItemRemoved", function(event, item){
                    // console.log("broadcast invoked");
                    $scope.$broadcast("ItemRemovedForChild", item); // broadcast event to all child components
                });

                /**
                 * @ngdoc method
                 * @name saveForLater
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description
                 * Save instance of Migration for further processing
                 */
                vm.saveForLater = function() {
                    if(vm.selectedItems.server.length > 0 || vm.selectedItems.network.length > 0) {
                        var migration_name = dataStoreService.getScheduleMigration().migrationName;
                        if(migration_name){
                            vm.saveItems(vm.saveLaterObj);
                        }
                        else{
                            $('#save_for_later').modal('show');
                        }
                    }
                    else{
                        $("#no_selection").modal('show');
                    }
                }

                /**
                 * @ngdoc method
                 * @name saveItems
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description
                 * Invokes "/api/users/uidata/" API call for fetching existing saved instances.
                 */
                vm.saveItems = function(buttonDetails) {
                    var saveInstance = {
                        recommendations : {},
                        scheduling_details : {},
                        step_name: "MigrationResourceList",
                        migration_schedule: {
                            migrationName:vm.migrationName,
                            time:'',
                            timezone:''
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
                                else
                                    $(buttonDetails.modalName).modal('hide');
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
                 * @name dontShow
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description
                 * Consider Dont show checkbox if checked.
                 */
                vm.dontShow = function() {
                    dataStoreService.setDontShowStatus(vm.dontshowStatus);
                };

                /**
                 * @ngdoc method
                 * @name continue
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description
                 * Continue to next step: **Recommendations**
                 */
                vm.continue = function() {
                    if(vm.selectedItems.server.length > 0 || vm.selectedItems.network.length > 0){
                        dataStoreService.setItems(vm.selectedItems);
                        dataStoreService.setDontShowStatus(true);
                        var migrationName = dataStoreService.getScheduleMigration().migrationName;
                        if(migrationName)
                            $rootRouter.navigate(["MigrationRecommendation"]);
                        else
                            $('#name_modal').modal('show');
                    }
                    else{
                        $('#save_for_later').modal('hide');
                        $('#name_modal').modal('hide');
                        $("#no_selection").modal('show');
                        $('#intro_modal').modal('hide');
                    }
                };
                /**
                 * @ngdoc method
                 * @name savencontinue
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description
                 * Give name for migration and continue to next step: **Recommendations**
                 */
                vm.savencontinue = function() {
                    if(vm.selectedItems.server.length > 0 || vm.selectedItems.network.length > 0){
                        dataStoreService.setItems(vm.selectedItems);
                        dataStoreService.setDontShowStatus(true);
                        var migrationName = dataStoreService.getScheduleMigration().migrationName;
                        if(migrationName)
                            $rootRouter.navigate(["MigrationRecommendation"]);
                        else{
                            // migrationName = vm.migrationName;
                            vm.selectedTime = {
                                    migrationName:vm.migrationName,
                                    time:'',
                                    timezone:''
                                };
                            dataStoreService.setScheduleMigration(vm.selectedTime);
                            $('#save_for_later').modal('hide');
                            $('#name_modal').modal('hide');
                            $('#cancel_modal').modal('hide');
                            $('#intro_modal').modal('hide');
                            $('#no_selection').modal('hide');
                            $rootRouter.navigate(["MigrationRecommendation"]);
                        }
                    }
                    else{
                        $('#save_for_later').modal('hide');
                        $('#name_modal').modal('hide');
                        $("#no_selection").modal('show');
                        $('#intro_modal').modal('hide');
                    }
                };
                /**
                 * @ngdoc method
                 * @name cancelMigration
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description
                 * Cancel Migration of resources and go back to migration dashboard page.
                 */
                vm.cancelMigration = function() {
                    if(vm.selectedItems.server.length > 0 || vm.selectedItems.network.length > 0){
                        $('#cancel_modal').modal('show');
                    }
                    else{
                        $('#save_for_later').modal('hide');
                        $('#name_modal').modal('hide');
                        $('#cancel_modal').modal('hide');
                        $('#intro_modal').modal('hide');
                        $('#no_selection').modal('hide');
                        $rootRouter.navigate(["MigrationStatus"]);
                    }
                };

                /**
                 * @ngdoc method
                 * @name submitCancel
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description
                 * Cancel Migration of resources and go back to migration dashboard page.
                 */
                vm.submitCancel = function() {
                    if(vm.saveProgress == 'yes'){
                        var migration_name = dataStoreService.getScheduleMigration().migrationName;
                        if(!migration_name && !vm.displayMigName){
                            vm.displayMigName = true;
                        }
                        else{
                            vm.saveItems(vm.cancelnSaveObj);
                        };
                    }
                    else{
                        $rootRouter.navigate(["MigrationStatus"]);
                        $('#cancel_modal').modal('hide');
                    }
                    $('#save_for_later').modal('hide');
                    $('#name_modal').modal('hide');
                    $('#intro_modal').modal('hide');
                    $('#no_selection').modal('hide');
                }

                return vm;
            }
        ]}); // end of component rsmigrationresourceslist
})();
