(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        .component("rsmigrationrecommendation", {
            templateUrl: "/static/angtemplates/migration/recommendations.html",
            controllerAs: "vm",
            controller: [ "$rootRouter", function($rootRouter) {
                var vm = this;

                vm.saveItems = function() {
                    alert("Saving items: To be implemented");
                };

                vm.continue = function() {
                    $rootRouter.navigate(["ScheduleMigration"]);
                };

                return vm;
            }
        ]}); // end of component definition
})();