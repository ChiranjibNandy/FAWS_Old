(function () {
    "use strict";

    // Creating an angular app with ngComponentRouter for handling routing
    var migrationApp = angular.module("migrationApp", ["ngComponentRouter"]);
//    var migrationApp = angular.module("migrationApp", []);

    // Defining the root component which will initiate routing handling
    migrationApp.value("$routerRootComponent", "rsmigrationroot");

    // The header component with logo and menus
    migrationApp.component("rsAppHeader", {
        templateUrl: "/static/angtemplates/app-header.html"
    });

    // The footer component
    migrationApp.component("rsAppFooter", {
        templateUrl: "/static/angtemplates/app-footer.html"
    });

    // The root component which defines initial routing
    migrationApp.component("rsmigrationroot", {
        transclude: true,
        template: "<ng-transclude></ng-transclude>",
        $routeConfig: [
            { path: "/static/angtemplates/migration/migration", component: "rsmigrationhome", name: "Migration" },
            { path: "/static/angtemplates/migration/login", component: "rsmigrationlogin", name: "Login" },
            { path: "/static/angtemplates/migration/tenant", component: "rsmigrationtenantid", name: "Tenant" },
            { path: ":type/:id/static/angtemplates/migration/details", component: "rsequipmentdetails", name: "EquipmentDetails" },
            { path: ":type/static/angtemplates/migration/migration-details", component: "rsmigrationdetails", name: "MigrationDetails" },
            { path: ":type/:id/static/angtemplates/migration/log-details", component: "rslogdetails", name: "MigrationLogDetails" },
            { path: "/**", redirectTo: ["Tenant"] }
        ]
    }); // end of rsMigrationRoot component definition
})();
