(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        // component to show the list of resources for a tenant
        .component("rsmigrationresourceslist", {
            templateUrl: "/static/angtemplates/migration/resources-list.html",
            controllerAs: "vm",
            controller: ["authservice", "$scope", "$rootRouter", "datastoreservice", function(authservice, $scope, $rootRouter, dataStoreService) {
                var vm = this;

                vm.$onInit = function() {
                    $('title')[0].innerHTML =  "Inventory - Rackspace Cloud Migration";
                    authservice.getAuth().tenant_id = 1024814;
                    vm.auth = authservice.getAuth();
                    vm.selectedItems = [];
                    vm.filterSearch = "";
                }

                // called when an item is selected by user
                vm.addItem = function(item) {
                    if(vm.selectedItems.indexOf(item)<0)
                        vm.selectedItems.push(item);
                }

                // called when an item is removed by user
                vm.removeItem = function(item) {
                    if(vm.selectedItems.indexOf(item) >= 0){
                        $scope.$broadcast("ItemRemoved", item); // broadcast event to all child components
                        vm.selectedItems.splice(vm.selectedItems.indexOf(item), 1);
                    }
                }

                // save items selected by user
                vm.saveItems = function() {
                    alert("Saving items: To be implemented");
                };

                // continue to next step: recommendations
                vm.continue = function() {
                    if(vm.selectedItems.length > 0){
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