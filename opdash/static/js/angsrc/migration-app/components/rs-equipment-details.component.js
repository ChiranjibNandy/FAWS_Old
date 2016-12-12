(function () {
    "use strict";

    // defining component to display details of a migration item
    angular.module("migrationApp")
        .component("rsequipmentdetails", {
            templateUrl: "/static/angtemplates/migration/equipment-details.html",
            controllerAs: "vm",
            controller: ["migrationitemdataservice", function (ds) {
                var vm = this;
                
                // When the component is active get router params and fetch data
                vm.$routerOnActivate = function(next, previous) {
                    vm.type = next.params.type;
                    vm.id = next.params.id;
                    $('title')[0].innerHTML =  vm.type.charAt(0).toUpperCase() + vm.type.slice(1) + " Details - Rackspace Cloud Backup";
                    
                    // fetch details based on selected migration item
                    ds.getDetailedList(vm.type)
                        .then(function (response) {
                            console.log(response);
                            vm.equipment = response.data.filter(function (item) { return item.id == vm.id })[0];
                            console.log(vm.equipment);
                        });
                }; // end of $routerOnActivate

                return vm;
            }] // end of component controller
        }); // end of component definition
})();