(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        .component("rsschedulemigration", {
            templateUrl: "/static/angtemplates/migration/schedule-migration.html",
            controllerAs: "vm",
            controller: ["$rootRouter", function ($rootRouter) {
                var vm = this;

                var d = new Date();
                var timestmp = moment(d).format("DDMMMYYYY-hhmma")
                vm.migrationName = 'Migration-' + timestmp;

                vm.saveItems = function () {
                    alert("Saving items: To be implemented");
                };

                vm.continue = function () {
                    $rootRouter.navigate(["ConfirmMigration"]);
                };

                return vm;
            }
            ]
        }); // end of component definition
})();