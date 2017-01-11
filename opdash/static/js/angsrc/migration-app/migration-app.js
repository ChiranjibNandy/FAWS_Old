(function () {
    "use strict";

    // Creating an angular app with ngComponentRouter for handling routing
    var migrationApp = angular.module("migrationApp", ["ngComponentRouter"]);

    // Defining the root component which will initiate routing handling
    migrationApp.value("$routerRootComponent", "rsmigrationroot");

    // directive to include html templates without creating a new scope
    migrationApp.directive('staticInclude', ["$parse", "$templateRequest", "$compile", function($parse, $templateRequest, $compile) {
        return {
            restrict: 'A',
            transclude: true,
            replace: true,
            scope: false,
            link: function(scope, element, attrs, ctrl, transclude) {
                var templatePath = $parse(attrs.staticInclude)(scope);

                $templateRequest(templatePath)
                    .then(function(response) {
                    var contents = element.html(response).contents();
                    $compile(contents)(scope);
                });
            }
        };
    }]);

    // The root component which defines initial routing
    migrationApp.component("rsmigrationroot", {
        transclude: true,
        template: "<ng-transclude></ng-transclude>",
        $routeConfig: [
            { path: "/login", component: "rsmigrationlogin", name: "Login" },
            { path: "/tenant", component: "rsmigrationtenantid", name: "Tenant" },
            { path: "/equipment-details/:type/:id", component: "rsequipmentdetails", name: "EquipmentDetails" },
            { path: "/migration/resources", component: "rsmigrationresourceslist", name: "MigrationResourceList" },
            { path: "/migration/recommendation", component: "rsmigrationrecommendation", name: "MigrationRecommendation" },
            { path: "/migration/schedule", component: "rsschedulemigration", name: "ScheduleMigration" },
            { path: "/migration/confirm", component: "rsconfirmmigration", name: "ConfirmMigration" },
            { path: "/migration-status", component: "rsmigrationstatus", name: "MigrationStatus" },
            { path: "/batch-migration-details", component: "rsbatchmigrationdetails", name: "BatchMigrationDetails" },
            { path: "/**", redirectTo: ["Tenant"] }
        ]
    }); // end of rsMigrationRoot component definition
})();
