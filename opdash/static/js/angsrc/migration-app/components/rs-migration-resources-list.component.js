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
            controller: ["authservice", "$scope", "$rootRouter", "datastoreservice", function(authservice, $scope, $rootRouter, dataStoreService) {
                var vm = this;

                vm.$onInit = function() {
                    var status = dataStoreService.getDontShowStatus();
                    if(status == false){
                        $('#intro_modal').modal('show');
                    }        
                    $('title')[0].innerHTML =  "Inventory - Rackspace Cloud Migration";
                    authservice.getAuth().tenant_id = 1024814;
                    vm.auth = authservice.getAuth();
                    vm.isRacker = authservice.is_racker;
                    vm.selectedItems = {
                        server:[],
                        network:[]
                    };
                    vm.filterSearch = "";
                    vm.saveProgress = "";
                    var d = new Date();
                    var timestmp = moment(d).format("DDMMMYYYY-hhmma");
                    vm.migrationName = 'Migration-' + timestmp;
                    vm.noName = false;
                    vm.numOfItems = {
                        server:0,
                        network:0,
                        file:0
                    };
                }

                vm.numOfResources = function(type, itemLen) {
                    console.log("emit called: "+itemLen);
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

                $scope.$on("ItemRemoved", function(event, item){
                    console.log("broadcast invoked");
                    $scope.$broadcast("ItemRemovedForChild", item); // broadcast event to all child components
                });

                vm.removeItem = function(item, type) {
                    if(vm.selectedItems[type].indexOf(item)>=0){
                        vm.selectedItems[type].splice(vm.selectedItems[type].indexOf(item), 1);
                        dataStoreService.setItems(vm.selectedItems);
                        $scope.$broadcast("ItemRemovedForChild", item); // broadcast event to all child components
                        $scope.$broadcast("ItemsModified");
                    }
                }
                console.log("time stamp: "+Math.floor(new Date().getTime()/ 1000));
                
                /**
                 * @ngdoc method
                 * @name saveItems
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description 
                 * Save selected resources for further processing 
                 */
                vm.saveItems = function() {
                    vm.saveDetails={
                        "timestmp":Math.floor(new Date().getTime()/ 1000), //(so we know when was it saved)
                        "selected_resources": dataStoreService.getItems('server'),
                        "recommendations":'',
                        "scheduling-details":'',
                        "step":"1"
                    };
                    console.log("saved details: "+vm.saveDetails);
                    //HttpWrapper.save("/api/job", {"operation":'POST'}, requestObj)
                    //             .then(function(result){
                    //                 console.log(result);
                    //                 $rootRouter.navigate(["MigrationStatus"]);
                    //             });
                    $('#save_for_later').modal('show');
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
                    if(vm.migrationName){
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
                        dataStoreService.setDontShowStatus(true);
                        $rootRouter.navigate(["MigrationRecommendation"]);
                    }
                    else{
                        vm.noName = true;
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
                    $('#save_for_later').modal('hide');
                    $('#name_modal').modal('hide');
                    $('#cancel_modal').modal('hide');
                    $('#intro_modal').modal('hide');
                    $('#no_selection').modal('hide');
                    $rootRouter.navigate(["MigrationStatus"]);
                }

                return vm;
            }
        ]}); // end of component rsmigrationresourceslist
})();
