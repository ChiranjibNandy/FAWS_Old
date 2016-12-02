(function () {
    "use strict";

    // Creating an angular app with ngComponentRouter for handling routing
    var migrationApp = angular.module("migrationApp", ["ngComponentRouter"]);

    // Defining the root component which will initiate routing handling
    migrationApp.value("$routerRootComponent", "rsMigrationRoot");

    // The header component with logo and menus
    migrationApp.component("rsAppHeader", {
        templateUrl: "/static/angTemplates/app-header.html"
    });

    // The footer component
    migrationApp.component("rsAppFooter", {
        templateUrl: "/static/angTemplates/app-footer.html"
    });

    // The root component which defines initial routing
    migrationApp.component("rsMigrationRoot", {
        transclude: true,
        template: "<ng-transclude></ng-transclude>",
        $routeConfig: [
            { path: "/static/angTemplates/migration/migration", component: "rsMigrationHome", name: "Migration" },
            { path: "/static/angTemplates/migration/login", component: "rsMigrationLogin", name: "Login" },
            { path: "/static/angTemplates/migration/tenant", component: "rsMigrationTenantid", name: "Tenant" },
            { path: ":type/:id/static/angTemplates/migration/details", component: "rsEquipmentDetails", name: "EquipmentDetails" },
            { path: ":type/static/angTemplates/migration/migration-details", component: "rsMigrationDetails", name: "MigrationDetails" },
            { path: ":type/:id/static/angTemplates/migration/log-details", component: "rsLogDetails", name: "MigrationLogDetails" },
            { path: "/**", redirectTo: ["Login"] }
        ]
    }); // end of rsMigrationRoot component definition
})();