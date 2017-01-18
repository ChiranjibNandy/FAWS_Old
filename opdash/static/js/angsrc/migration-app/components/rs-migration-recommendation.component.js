(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        // component to show recommendations to a user
        .component("rsmigrationrecommendation", {
            templateUrl: "/static/angtemplates/migration/recommendations.html",
            controllerAs: "vm",
            controller: [ "$rootRouter", function($rootRouter) {
                var vm = this;

                $('title')[0].innerHTML =  "Recommendations - Rackspace Cloud Migration";

                // save the user desired migration
                vm.saveItems = function() {
                    alert("Saving items: To be implemented");
                };

                // continue to next step: scheduling
                vm.continue = function() {
                    $rootRouter.navigate(["ScheduleMigration"]);
                };

                return vm;
            }
        ]}); // end of component definition
})();