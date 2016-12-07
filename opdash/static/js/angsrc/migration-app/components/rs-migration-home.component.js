(function () {
    "use strict";

    // defining component to display all migration items
    angular.module("migrationApp")
        .component("rsmigrationhome", {
            templateUrl: "/static/angtemplates/migration/migration.html",
            controllerAs:"vm",
            controller: ["authservice",function(authservice) {
                var vm = this;
                vm.$routerOnActivate = function(next, previous) {
                   authservice.getAuth().tenant_id = next.params.tenant;
                }
            }]
        });
})();
