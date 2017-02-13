(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsselecteditemspanel
     * @description
     * Component to have a selected items panel in every page.  
     *   
     * This component uses the template: **angtemplates/migration/items-selected.html**. It uses the controller {@link migrationApp.controller:rsselecteditemspanelCtrl rsselecteditemspanelCtrl}.  
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rsselecteditemspanel error-message="Some error message"></rsselecteditemspanel>
     *   </file>
     * </example>
     */
    angular.module("migrationApp")
        .component("rsselecteditemspanel", {
            templateUrl: "/static/angtemplates/migration/items-selected.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsselecteditemspanelCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsselecteditemspanel rsselecteditemspanel} component
             */
            controller: ["datastoreservice", "$scope", "authservice", function (dataStoreService, $scope, authservice) {
                var vm = this;
                vm.$onInit = function() {
                    vm.selectedItems = {
                        server:[],
                        network:[]
                    };
                    vm.networkCount = 0;
                    vm.networksList = [];
                    vm.networksForServer = {};
                    vm.isRacker = authservice.is_racker;
                    vm.selectedItems.server = dataStoreService.getItems('server');
                };

                $scope.$on("ItemsModified", function(event){
                    vm.selectedItems.server = dataStoreService.getItems('server');
                });
                
                $scope.$watch('vm.selectedItems.server.length', function () {
                    vm.networkCount = 0;
                    vm.networksList = [];
                    
                    angular.forEach(vm.selectedItems.server, function (item) {
                        angular.forEach(item.details.networks, function (network) {
                            if(vm.networksList.indexOf(network.name) == -1) {
                                vm.networkCount += 1;
                                vm.networksList.push(network.name);
                            };
                        });
                    });
                });

                vm.networksToServer = function(item) {
                    vm.networksForServer[item.name] = [];
                    angular.forEach(item.details.networks, function (network) {
                        vm.networksForServer[item.name].push(network.name);
                    });
                    return vm.networksForServer[item.name];
                };

                vm.removeItem = function(item, type) {
                    if(vm.selectedItems[type].indexOf(item)>=0){
                        $scope.$emit("ItemRemoved", item); // broadcast event to all child components
                        vm.selectedItems[type].splice(vm.selectedItems[type].indexOf(item), 1);
                        dataStoreService.setItems(vm.selectedItems);
                        item.selected = false;
                    }
                }

                return vm;
            }]
        }); // end of component definition
})();
