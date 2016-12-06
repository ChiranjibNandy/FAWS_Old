(function () {
    "use strict";

    // defining component to display details of a migration item
    angular.module("migrationApp")
        .component("rsEquipmentDetails", {
            templateUrl: "/static/angtemplates/migration/equipment-details.html",
            controllerAs: "vm",
            controller: ["migrationItemDataService", function (ds) {
                var vm = this;
                
                // When the component is active get router params and fetch data
                vm.$routerOnActivate = function(next, previous) {
                    vm.type = next.params.type;
                    vm.id = next.params.id;

                    // fetch details based on selected migration item
                    ds.getAllItems(vm.type)
                        .then(function (response) {
                            vm.name = response.data.filter(function (item) { return item.id == vm.id })[0].name;
                        });
                }; // end of $routerOnActivate

                return vm;
            }] // end of component controller
        }); // end of component definition
})();