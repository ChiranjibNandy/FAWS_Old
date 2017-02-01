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
                    $('title')[0].innerHTML =  "Inventory - Rackspace Cloud Migration";
                    authservice.getAuth().tenant_id = 1024814;
                    vm.auth = authservice.getAuth();
                    vm.selectedItems = {
                        server:[],
                        network:[]
                    };
                    vm.filterSearch = "";
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
                    if(vm.selectedItems[type].indexOf(item)<0)
                        vm.selectedItems[type].push(item);
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
                    if(vm.selectedItems[type].indexOf(item)>=0){
                        $scope.$broadcast("ItemRemoved", item); // broadcast event to all child components
                        vm.selectedItems[type].splice(vm.selectedItems[type].indexOf(item), 1);
                    }
                }

                /**
                 * @ngdoc method
                 * @name saveItems
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description 
                 * Save selected resources for further processing
                 */
                vm.saveItems = function() {
                    alert("Saving items: To be implemented");
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
                        $rootRouter.navigate(["MigrationRecommendation"]);
                    }
                    else
                        alert("Please select some items to migrate");
                };

                return vm;
            }
        ]}); // end of component rsmigrationresourceslist
})();
