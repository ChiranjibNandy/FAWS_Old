(function () {
    "use strict";

    /** 
     * @ngdoc object
     * @name migrationApp
     * @requires ngComponentRouter
     * @description
     * A module to facilitate and initiate migration of resources. It requires **ngComponentRouter** for handling routing through [Component router](https://docs.angularjs.org/guide/component-router).
     */
    var migrationApp = angular.module("migrationApp", ["ngComponentRouter"]);

    // Defining the root component which will initiate routing handling
    migrationApp.value("$routerRootComponent", "rsmigrationroot");

    /**
     * @ngdoc directive
     * @name migrationApp.directive:staticInclude
     * @restrict A
     * @param {String} staticInclude Path to file to be included
     * @description
     * Directive to include html templates without creating a new scope. The included template shares the same scope as its parent.
     * This circumvents the issue with [**ngInclude**](https://docs.angularjs.org/api/ng/directive/ngInclude), which creates an isolate scope for every file inclusion.
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <div static-include="'path/to/file.html'"></div>
     *   </file>
     * </example>
     */
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

    /**
     * @ngdoc object
     * @name migrationApp.component:rsmigrationroot
     * @description
     * This is the parent of all components. Its main job is to act as a center place for the routes defined in FAWS UI application.
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rs-migration-root><div ng-outlet></div></rs-migration-root>
     *   </file>
     * </example>
     */
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
