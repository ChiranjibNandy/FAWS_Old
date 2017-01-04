(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        .component("rsfooter", {
            templateUrl: "/static/angtemplates/migration/interactive-footer.html",
            bindings: {
                type: "@" // type parameter to be supplied (eg: server, network etc)
            },
            controllerAs: "vm",
            controller: [ function () {
                //functions and other things for sidebar goes here
            }]
        }); // end of component definition
})();