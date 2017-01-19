(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        // component to show recommendations to a user
        .component("rscompareoptions", {
            templateUrl: "/static/angtemplates/migration/compare-options.html",
            controllerAs: "vm",
            controller: [function() {
                var vm = this;

                return vm;
            }
        ]}); // end of component definition
})();