(function () {
    "use strict";

    // defining component to display all migration items
    angular.module("migrationApp")
        .component("rsmigrationtenantid", {
            templateUrl: "/static/angtemplates/migration/tenant-id.html",
            controllerAs: "vm",
            controller:["authservice",function(authservice){
                var vm = this;

                vm.setTenant = function(id) {
                    authservice.getAuth().tenant_id = id;
                };
            }]
        });
})();
