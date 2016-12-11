(function () {
    "use strict";

    // Creating an angular app with ngComponentRouter for handling routing
    var migrationApp = angular.module("migrationApp", ["ngAnimate", "ngComponentRouter"]);
   
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

    migrationApp.directive('staticInclude', function($parse, $templateRequest, $compile) {
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
    });
    // The root component which defines initial routing
    migrationApp.component("rsmigrationroot", {
        transclude: true,
        template: "<ng-transclude></ng-transclude>",
        $routeConfig: [
            { path: "/migration/:tenant_id/", component: "rsmigrationhome", name: "Migration" },
            { path: "/login", component: "rsmigrationlogin", name: "Login" },
            { path: "/tenant", component: "rsmigrationtenantid", name: "Tenant" },
            { path: "/equipment-details/:type/:id", component: "rsequipmentdetails", name: "EquipmentDetails" },
            { path: "/migration-details/:type/:id", component: "rsmigrationdetails", name: "MigrationDetails" },
            { path: "/migration/log-details/:type/:id", component: "rslogdetails", name: "MigrationLogDetails" },
            { path: "/migration-status", component: "rsmigrationsstatus", name: "MigrationsStatus" },
            { path: "/**", redirectTo: ["Tenant"] }
        ]
    }); // end of rsMigrationRoot component definition
})();
