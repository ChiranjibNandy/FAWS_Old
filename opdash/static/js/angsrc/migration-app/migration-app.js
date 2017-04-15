(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp
     * @requires ngComponentRouter
     * @description
     * A module to facilitate and initiate migration of resources. It requires **ngComponentRouter** for handling routing through [Component router](https://docs.angularjs.org/guide/component-router).
     */
    var migrationApp = angular.module("migrationApp", ["ngComponentRouter","ngMaterial","ngAnimate","ngAria"]);

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
     * @ngdoc directive
     * @name migrationApp.directive:setFocus
     * @restrict AE
     * @param {String} setFocus ID of the input element to set focus to
     * @description
     * Directive to set focus to an input element (by id) on click of a button
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <div static-include="idOfElement"></div>
     *   </file>
     * </example>
     */
    migrationApp.directive('setFocus', ["$timeout", function($timeout){
        return {
            link:  function(scope, element, attrs){
                $timeout(function(){
                    element.bind('click', function(){
                        document.getElementById(attrs.setFocus).focus();
                    }); 
                });
            }
        }
    }]);

    migrationApp.filter('convertCase',function(){
            return function(input){
                var arrInput =[];
                arrInput = input.split('-');
                return arrInput[0].toUpperCase()+'-'+arrInput[1][0].toUpperCase()+arrInput[1].substr(1).toLowerCase()+'-'+arrInput[2].toLowerCase();
            }
    });

    /**
     * @ngdoc object
     * @name migrationApp.object:rsmigrationroot
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
            { path: "/racker-dashboard", component: "rsmigrationrackerdash", name: "RackerDash" },
            { path: "/racker-reports", component: "rsmigrationrackerreports", name: "RackerReports"},
            { path: "/equipment-details/:type/:id", component: "rsequipmentdetails", name: "EquipmentDetails" },
            { path: "/migration/resources", component: "rsmigrationresourceslist", name: "MigrationResourceList" },
            { path: "/migration/recommendation", component: "rsmigrationrecommendation", name: "MigrationRecommendation" },
            { path: "/migration/schedule", component: "rsschedulemigration", name: "ScheduleMigration" },
            { path: "/migration/confirm", component: "rsconfirmmigration", name: "ConfirmMigration" },
            { path: "/migration-status", component: "rsmigrationstatus", name: "MigrationStatus" },
            { path: "/migration/current-batch/:job_id", component: "rscurrentbatchdetails", name: "CurrentBatchDetails" },
            { path: "/migration/completed-batch/:job_id", component: "rscompletedbatchdetails", name: "CompletedBatchDetails" },
            { path: "/migration/task-list/:job_id/:resource_type/:resource_id", component: "rsresourcetasklist", name: "ResourceTaskList" }
        ]
    }); // end of rsMigrationRoot component definition
})();
