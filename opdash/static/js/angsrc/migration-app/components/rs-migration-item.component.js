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
                    vm.loading = true;
                    vm.loadError = false;
                    vm.noData = false;

                    // Retrieve all migration items of a specific type (eg: server, network etc)
                    ds.getTrimmedAllItems(vm.type)
                        .then(function (response) {
                            if(response.error){
                                vm.loading = false;
                                vm.loadError = true;
                                return;
                            }

                            if(response.data.length === 0){
                                vm.noData = true;
                                vm.loading = false;
                                return;
                            }

                            vm.items = response.data;
                            vm.searchField = response.labels[0].field;
                            vm.labels = response.labels; // set table headers
                            angular.forEach(response.labels, function(label){
                                vm.search[label.field] = ""; // set search field variables
                            });
                            vm.loading = false;
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

                vm.$routerOnActivate = function(next, previous) {
                    vm.tid = next.params.tid;
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

                //store slog status
                vm.storeStatus = function(type,name){
                    vl.storeLog(
                        {'name':name,
                         'type':type
                        }
                        );
                    $rootRouter.navigate(["MigrationLogDetails", {type: vm.type}])
                }

                // Get count of items by their status type
                vm.getCountByStatus = function (status) {
                    return vm.loading ? "?" : (status==="" ? vm.items.length : (vm.items ? vm.items.filter(function (item) { return item.migrationStatus === status }).length : "?"));
                };

                // Move to migration details page if multiple items are selected
                vm.migrate = function(id) {
                    $rootRouter.navigate(["MigrationDetails", {type: vm.type, id: id}]);
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