(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        .component("rssidebar", {
            templateUrl: "/static/angtemplates/migration/sidebar.html",
            bindings: {
                type: "<", // type parameter to be supplied (eg: server, network etc)
                data: "="
            },
            controllerAs: "vm",
            controller: ["selectservice","$rootRouter", function (ss,$rootRouter) {
                var vm = this;

                //functions and other things for sidebar goes here
                vm.saveItems = function(){
                    ss.store(vm.type,vm.data);    
                }
                vm.continue = function(){
                    vm.saveItems();
                    $rootRouter.navigate(['Migration', {tenant_id: '1024814',from_page: 'recommendations'}]);
                }
            }]
        }); // end of component definition
})();
