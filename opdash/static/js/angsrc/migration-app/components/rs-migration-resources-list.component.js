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
                vm.saveClicked = false;

                vm.$onInit = function() {
                    //testing
                    // dataStoreService.fetchUserProfile()
                    //     .then(function (result) {
                    //         var profileDetails = JSON.parse(result.savedDetails || '[]');
                    //     });
                    // If status is true, popup for migration won't be displayed in first step of Migration.
                    var status = dataStoreService.getDontShowStatus(); //check for flag status created for intorduction Modal.
                    vm.fawsAcctStatus = status;
                    if(status == false){
                        $('#intro_modal').modal('show');
                    }
                    dataStoreService.setDontShowStatus(true);//set introduction modal flag to true after first time display.
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

                    vm.auth = authservice.getAuth();
                    /**
                     * @ngdoc property
                     * @name isRacker
                     * @propertyOf migrationApp.controller:rsmigrationresourceslistCtrl
                     * @type {Boolean}
                     * @description Returns if logged in user is a Racker. If user is customer, it returns false.
                     */
                    vm.isRacker = authservice.is_racker;
                    /**
                     * @ngdoc property
                     * @name selectedItems
                     * @propertyOf migrationApp.controller:rsmigrationresourceslistCtrl
                     * @type {Array}
                     * @description List of items that are selected for migration
                     */
                    vm.selectedItems = {
                        server:[],
                        network:[],
                        LoadBalancers:[]
                    };
                    vm.filterSearch = "";
                    vm.saveProgress = "";
                    var d = new Date();
                    //Objects created to fetch results of Save Later API call.
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
                     * @propertyOf migrationApp.controller:rsmigrationresourceslistCtrl
                     * @type {String}
                     * @description Create Migration considering Timestamp.
                     */
                    vm.migrationName = 'My Migration';
                    vm.noName = false;
                    vm.numOfItems = {
                        server:0,
                        network:0,
                        file:0
                    };
                }

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
                        dataStoreService.setItems(vm.selectedItems);//save items selected for migration in service.
                        $scope.$broadcast("ItemsModified");//make a function call to child component to enable checkobox for selected items.
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
                    vm.selectedItems = dataStoreService.getItems();
                    //look for item to be removed in array of selected items and splice it from the array.
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
                //catch emit call from child components.
                $scope.$on("ItemRemoved", function(event, item){
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
                    if(vm.selectedItems.server.length > 0 || vm.selectedItems.network.length > 0 || vm.selectedItems.LoadBalancers.length > 0) {
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
                 * @param {Object} buttonDetails _Object_ assign appropriate values as per API response for save or cancel functionality.
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
                    //make API call(through service) for saving the instance and wait for its response.
                    dataStoreService.saveItems(saveInstance).then(function(success){
                        if(success){
                            buttonDetails.saveInProgress = false;
                            buttonDetails.saveSuccess = true;
                            buttonDetails.resultMsg = "Saved your instance successfully with name: "+dataStoreService.getScheduleMigration().migrationName;
                            //make the popup or alert message disappear after 3 seconds of API response.
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
                 * Consider Dont show checkbox of introduction Modal if checked.
                 */
                vm.dontShow = function() {
                    dataStoreService.setShowWelcomeModal(!(vm.dontshowStatus));
                };

                /**
                 * @ngdoc method
                 * @name dontShowNameModal
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description
                 * Consider Dont show checkbox of Modal where user can name a Migration if checked.
                 */
                vm.dontShowNameModal = function() {
                    dataStoreService.setDontShowNameModal(vm.dontshowNameModal);
                };

                /**
                 * @ngdoc method
                 * @name continue
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description
                 * Continue to next step: **Recommendations**
                 */
                 vm.continue = function() {
                    if(vm.selectedItems.server.length > 0 || vm.selectedItems.network.length > 0 || vm.selectedItems.LoadBalancers.length > 0 || dataStoreService.getItems('server').length > 0 || dataStoreService.getItems('LoadBalancers').length > 0){
                        vm.nameStatus = dataStoreService.getdontShowNameModal(); //check for flag status created for Modal where user can name a migration.
                        var migrationName = dataStoreService.getScheduleMigration().migrationName;
                        if(vm.nameStatus || migrationName){
                            vm.migrationName = migrationName;
                            vm.savencontinue();
                        }
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
                 * Assign Migration considering current Timestamp and continue to next step: **Recommendations**
                 */
                vm.savencontinue = function() {
                    if(vm.selectedItems.server.length > 0 || vm.selectedItems.network.length > 0 || vm.selectedItems.LoadBalancers.length > 0 || dataStoreService.getItems('server').length > 0 || dataStoreService.getItems('LoadBalancers').length > 0){
                        if(vm.selectedItems.server.length > 0 || vm.selectedItems.LoadBalancers.length > 0){
                            dataStoreService.setItems(vm.selectedItems);
                        }                
                        dataStoreService.setDontShowStatus(true);
                        dataStoreService.setDontShowNameModal(true);
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
                    if(vm.selectedItems.server.length > 0 || vm.selectedItems.network.length > 0 || vm.selectedItems.LoadBalancers.length > 0){
                        $('#cancel_modal').modal('show');
                        var migration_name = dataStoreService.getScheduleMigration().migrationName;
                        if(!migration_name && !vm.displayMigName){
                            vm.displayMigName = true;
                        };
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
                        // var migration_name = dataStoreService.getScheduleMigration().migrationName;
                        // if(!migration_name && !vm.displayMigName){
                        //     vm.displayMigName = true;
                        // }
                        // else{
                        vm.saveItems(vm.cancelnSaveObj);
                        vm.displayMigName = false;
                        //};
                    }
                    else{
                        $rootRouter.navigate(["MigrationStatus"]);
                        $('#cancel_modal').modal('hide');
                    }
                    $('#save_for_later').modal('hide');
                    $('#name_modal').modal('hide');
                    $('#intro_modal').modal('hide');
                    $('#no_selection').modal('hide');
                };

                vm.equipmentDetailsModal = function(type, itemdetails) {
                    vm.itemType = type;
                    vm.itemDetails = itemdetails;
                    $('#resource_info').modal('show');
                }

                return vm;
            }
        ]}); // end of component rsmigrationresourceslist
})();
