(function () {
    "use strict";

    // defining component to display details of the items to be migrated
    angular.module("migrationApp")
        .component("rsmigrationdetails", {
            templateUrl: "/static/angtemplates/migration/migration-details.html",
            controllerAs: "vm",
            controller: ["migrationItemDataService", function (ds) {
                var vm = this;

                // When the component is active get router params and fetch data
                vm.$routerOnActivate = function(next, previous) {
                    vm.type = next.params.type;

                    // fetch details based on selected migration item
                    ds.getAllItems(vm.type)
                        .then(function (response) {
                            var ids = response.data
                                .filter(function (item) { return item.selected == true })
                                .map(function (item) { return item.id; });

                            ds.getMigrationDetails(vm.type, ids)
                                .then(function (response) {
                                    vm.migrationItems = response.data;
                                    vm.labels = response.labels;
                                });
                        });
                }; // end of $routerOnActivate

                return vm;
            }] // end of component controller
        }); // end of component definition
})();
