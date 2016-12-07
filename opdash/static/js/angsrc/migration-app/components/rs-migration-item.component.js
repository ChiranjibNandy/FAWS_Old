(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        .component("rsmigrationitem", {
            templateUrl: "/static/angtemplates/migration/migration-item-template.html",
            bindings: {
                type: "@" // type parameter to be supplied (eg: server, network etc)
            },
            controllerAs: "vm",
            controller: ["migrationitemdataservice", "$rootRouter", "viewlogservice",function (ds, $rootRouter,vl) {
                var vm = this;
                
                // Perfoming controller initialization steps
                vm.$onInit = function() {
                    vm.labels = [];
                    vm.search = {};
                    vm.items = [];

                    // 'Select All' checkbox is not selected initially
                    vm.isAllselected = false;

                    // Retrieve all migration items of a specific type (eg: server, network etc)
                    ds.getTrimmedAllItems(vm.type).then(function (response) {
                        vm.items = response.data;
                        vm.searchField = response.labels[0].field;
                        vm.labels = response.labels; // set table headers
                        angular.forEach(response.labels, function(label){
                            vm.search[label.field] = ""; // set search field variables
                        });
                        
                        vm.changeSelectAll();
                    });

                    // Setup status filters
                    vm.statusFilters = [
                        { text: "All", type: "", selected: true },
                        { text: "Completed", type: "completed", selected: false },
                        { text: "In Progress", type: "inProgress", selected: false },
                        { text: "Error", type: "error", selected: false },
                        { text: "Disabled", type: "disabled", selected: false }
                    ];

                    vm.statusFilter = "";
                };


                vm.sort = function(item){
                    var items = vm.items;
                    items.sort(function(a,b){
                        if(a[item] < b[item]) return -1;
                        if(a[item] > b[item]) return 1;
                        return 0;
                    })
                    vm.items = items;
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

                //store slog status
                vm.storeStatus = function(type,name){
                    vl.storeLog(
                        {'name':name,
                         'type':type
                        }
                        );
                    $rootRouter.navigate(["MigrationLogDetails", {type: vm.type}])
                }

                // Update item selection based on Select/Deselect all 
                vm.changeItemSelection = function () {
                    angular.forEach(vm.items, function (item) {
                        item.selected = vm.isAllselected;
                    });
                };

                // Get count of items by their status type
                vm.getCountByStatus = function (status) {
                    return vm.items ? vm.items.filter(function (item) { return item.migrationStatus === status }).length : "?";
                };

                // Move to migration details page if multiple items are selected
                vm.migrate = function(type) {
                    // TODO: add condition for multiple item selction
                    $rootRouter.navigate(["MigrationDetails", {type: vm.type}])
                };

                // Set status filter
                vm.setStatusFilter = function(status){
                    angular.forEach(vm.statusFilters, function(filter){
                        filter.selected = (filter.type === status);
                    });
                    vm.statusFilter = status;
                };

                vm.clearSearch = function() {
                   for(var key in vm.search){
                       vm.search[key] = "";
                   }
                };

                return vm;
            }]
        }); // end of component definition
})();