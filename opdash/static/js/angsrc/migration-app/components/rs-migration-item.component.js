(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        .component("rsMigrationItem", {
            templateUrl: "/static/angTemplates/migration/migration-item-template.html",
            bindings: {
                type: "@" // type parameter to be supplied (eg: server, network etc)
            },
            controllerAs: "vm",
            controller: ["migrationItemDataService", "$rootRouter", function (ds, $rootRouter) {
                var vm = this;
                
                // Perfoming controller initialization steps
                vm.$onInit = function() {
                    // 'Select All' checkbox is not selected initially
                    vm.isAllselected = false;

                    // Retrieve all migration items of a specific type (eg: server, network etc)
                    ds.getAllItems(vm.type).then(function (response) {
                        vm.items = response.data;
                        vm.labels = response.labels;
                        vm.changeSelectAll();
                    });
                };

                // Select/Deselect all items
                vm.changeSelectAll = function () {
                    for (var i = 0; i < vm.items.length; i++) {
                        if (!vm.items[i].selected) {
                            break;
                        }
                    }
                    vm.isAllselected = (i == vm.items.length);
                };

                // Update item selection based on Select/Deselect all 
                vm.changeItemSelection = function () {
                    angular.forEach(vm.items, function (item) {
                        item.selected = vm.isAllselected;
                    });
                };

                // Get count of items by their status type
                vm.getCountByStatus = function (status) {
                    return vm.items ? vm.items.filter(function (item) { return item.status === status }).length : "?";
                };

                // Move to migration details page if multiple items are selected 
                vm.migrate = function(type) {
                    // TODO: add condition for multiple item selction
                    $rootRouter.navigate(["MigrationDetails", {type: vm.type}])
                };

                return vm;
            }]
        }); // end of component definition
})();