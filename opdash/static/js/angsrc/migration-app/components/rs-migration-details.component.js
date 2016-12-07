(function () {
    "use strict";

    // defining component to display details of the items to be migrated
    angular.module("migrationApp")
        .component("rsmigrationdetails", {
            templateUrl: "/static/angtemplates/migration/migration-details.html",
            controllerAs: "vm",
            controller: ["migrationitemdataservice", function (ds) {
                var vm = this;

                // When the component is active get router params and fetch data
                vm.$routerOnActivate = function(next, previous) {
                   vm.type = next.params.type;
                   vm.id = next.params.id;

                   ds.getMigrationDetails(vm.type, vm.id)
                           .then(function (response) {
                               console.log(response);
                               vm.migrationDetail = response.data;
                           });
                }; // end of $routerOnActivate

                return vm;
            }] // end of component controller
        }); // end of component definition
})();
