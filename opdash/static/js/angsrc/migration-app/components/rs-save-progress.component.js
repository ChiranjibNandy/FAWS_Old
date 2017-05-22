(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rssaveprogress
     * @description
     * Component to display the save progress modal. This component is being used in all the three steps of the 
     * Migration.
     *   
     * This component uses the template: **angtemplates/migration/save-progress.html**  
     *   
     * Its controller {@link migrationApp.controller:save-progress.htmlCtrl save-progress.html} uses the below services:
     */
    angular.module("migrationApp")
        .component("rssaveprogress", {
            templateUrl: "/static/angtemplates/migration/save-progress.html",
            controllerAs: "vm",
            bindings: {
                stepname: "@",
                type:"@"
            },
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rssaveprogressCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rssaveprogress rssaveprogress} component
             */
            controller: ["datastoreservice","$timeout","$rootRouter","$window", function (dataStoreService,$timeout,$rootRouter,$window) {
                var vm = this;

                vm.$onInit = function () {
                    vm.cancelnSaveObj = {
                        "saveSuccess" : false,
                        "saveInProgress" : false,
                        "resultMsg" : "",
                        "modalName": '#cancel_modal'
                    };
                    vm.saveProgress = '';
                    vm.displayMigName = false;
                    vm.migrationName = 'My Migration';
                    vm.stepname = dataStoreService.getPageName() || $window.localStorage.pageName;
                };

                /**
                 * @ngdoc method
                 * @name cancelMigration
                 * @methodOf migrationApp.controller:rssaveprogressCtrl
                 * @description
                 * It will open cancel migration popup and go back to migration dashboard page.
                 */
                vm.cancelMigration = function() {
                    //var selectedItems = dataStoreService.getItems();
                    var selectedItems = [];
                    if($window.localStorage.selectedServers !== undefined){
                        selectedItems = JSON.parse($window.localStorage.selectedServers);
                        $('#cancel_modal').modal('show');
                    }else{
                        dataStoreService.resetAll();
                        $rootRouter.navigate(["MigrationStatus"]);
                    }
                };

                /**
                 * @ngdoc method
                 * @name submitCancel
                 * @methodOf migrationApp.controller:rssaveprogressCtrl
                 * @description
                 * Cancel Migration of resources and go back to migration dashboard page.
                 */
                vm.submitCancel = function() {
                    if(vm.saveProgress == 'yes'){
                        vm.saveItems(vm.cancelnSaveObj);
                        vm.displayMigName = false;
                    }
                    else{
                        dataStoreService.resetAll();
                        if($window.localStorage.selectedServers !== undefined)
                            $window.localStorage.removeItem('selectedServers');
                        dataStoreService.resetAll();
                        $rootRouter.navigate(["MigrationStatus"]);
                        $('#cancel_modal').modal('hide');
                    }
                };

                /**
                 * @ngdoc method
                 * @name saveItems
                 * @methodOf migrationApp.controller:rssaveprogressCtrl
                 * @param {Object} buttonDetails _Object_ assign appropriate values as per API response for save or cancel functionality.
                 * @description
                 * Invokes "/api/users/uidata/" API call for fetching existing saved instances.
                 */
                vm.saveItems = function(buttonDetails) {
                    var saveInstance = {
                        recommendations : vm.stepname !== "MigrationResourceList"?JSON.parse($window.localStorage.selectedServers):{},
                        // scheduling_details : vm.stepname === "ConfirmMigration"?dataStoreService.getScheduleMigration():{},
                        step_name: vm.stepname ,
                        migration_schedule: {
                            migrationName:vm.migrationName,
                            time:vm.stepname === "ConfirmMigration"?dataStoreService.getScheduleMigration().time:'',
                            timezone:vm.stepname === "ConfirmMigration"?dataStoreService.getScheduleMigration().timezone:''
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
                                    dataStoreService.resetAll();
                                    // if($window.localStorage.selectedServers !== undefined)
                                    //     $window.localStorage.removeItem('selectedServers');
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
                return vm;
            }]
        }); // end of component definition
})();