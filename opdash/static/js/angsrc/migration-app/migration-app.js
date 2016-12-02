(function () {
    "use strict";

    // Creating an angular app with ngComponentRouter for handling routing
    var migrationApp = angular.module("migrationApp", ["ngComponentRouter"]);

    // Defining the root component which will initiate routing handling
    migrationApp.value("$routerRootComponent", "rsMigrationRoot");

    // The header component with logo and menus
    migrationApp.component("rsAppHeader", {
        templateUrl: "/static/AngTemplates/app-header.html"
    });

    // The footer component
    migrationApp.component("rsAppFooter", {
        templateUrl: "/static/AngTemplates/app-footer.html"
    });

    // The root component which defines initial routing
    migrationApp.component("rsMigrationRoot", {
        transclude: true,
        template: "<ng-transclude></ng-transclude>",
        $routeConfig: [
            { path: "/static/AngTemplates/migration/migration", component: "rsMigrationHome", name: "Migration" },
            { path: "/static/AngTemplates/migration/login", component: "rsMigrationLogin", name: "Login" },
            { path: "/static/AngTemplates/migration/tenant", component: "rsMigrationTenantid", name: "Tenant" },
            { path: ":type/:id/static/AngTemplates/migration/details", component: "rsEquipmentDetails", name: "EquipmentDetails" },
            { path: ":type/static/AngTemplates/migration/migration-details", component: "rsMigrationDetails", name: "MigrationDetails" },
            { path: ":type/:id/static/AngTemplates/migration/log-details", component: "rsLogDetails", name: "MigrationLogDetails" },
            { path: "/**", redirectTo: ["Login"] }
        ]
    }); // end of rsMigrationRoot component definition
})();