(function () {
    "use strict";

    // defining component to display log details after migration of an item
    angular.module("migrationApp")
        .component("rsLogDetails", {
            templateUrl: "/static/angtemplates/migration/log-details.html",
            controllerAs: "vm",
            controller: ["migrationitemdataservice", function (ds) {
                var vm = this;

                // When the component is active get router params and fetch data
                vm.$routerOnActivate= function (next, prev){
                    vm.type = next.params.type;
                    vm.id = next.params.id;
                    vm.name = vl.getLog().name;
                    vm.logText = vl.getLog().type == 'error' ? 'It got an error while migrating ':'Migration is completed..!';
                    // fetch details based on selected migration item
                    /*ds.getAllItems(vm.type)
                        .then(function (response) {
                            vm.name = response.data.filter(function (item) { return item.id == vm.id })[0].name;
                        });*/
                }; // end of $routerOnActivate

                return vm;
            }] // end of component controller
        }); // end of component definition
})();