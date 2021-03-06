(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp
     * @requires ngComponentRouter
     * @description
     * A module to facilitate and initiate migration of resources. It requires **ngComponentRouter** for handling routing through [Component router](https://docs.angularjs.org/guide/component-router).
     */
    var migrationApp = angular.module(
      "migrationApp",
      ["ngComponentRouter","ngMaterial","ngAnimate","ngAria"]).run(
        function($rootScope, $rootRouter, $routerRootComponent, $location) {

          // FOR GOOGLE ANALYTICS - JB
          $rootScope.$on("$routeChangeSuccess", function(event) {
            window.setTimeout(function() {
            //   console.info("ROOT ROUTER:", $rootRouter.lastNavigationAttempt);
              // Update GA Pageview
              ga('set', 'page', $rootRouter.lastNavigationAttempt);
              ga('send', 'pageview');
              // Update TAG Manager View
              dataLayer.push({
                  event: 'VirtualPageview',
                  virtualPageURL: $rootRouter.lastNavigationAttempt,
                  virtualPageTitle: document.title,
                  page_name: $rootRouter._childRouter.hostComponent
              });
            },0);
          });
          // END FOR GOOGLE ANALYTICS - JB
    });


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
     * This is a function to handle open in new tab.
     */
    window.oncontextmenu = function (event){
        var firstHalf = '',secondHalf='';
        if((event.target.href && event.target.href.indexOf('#') === -1)&&(event.target.id!='migrstionManagerUSerGuide') && (event.toElement.getAttribute('data-toggle') === null)){
            if(event.target.href.indexOf('8000')>0){
                firstHalf = event.target.href.substr(0,event.target.href.indexOf('8000/')+5);
                secondHalf = "#/"+event.target.href.substr(event.target.href.indexOf('8000/')+5,event.target.href.length);
            }else if(event.target.href.indexOf('net')>0){
                firstHalf = event.target.href.substr(0,event.target.href.indexOf('net')+3);
                secondHalf = "#/"+event.target.href.substr(event.target.href.indexOf('net')+4,event.target.href.length);
            }else if(event.target.href.indexOf('com')>0){
                firstHalf = event.target.href.substr(0,event.target.href.indexOf('com')+3);
                secondHalf = "#/"+event.target.href.substr(event.target.href.indexOf('com')+4,event.target.href.length);
            }
            event.target.href = firstHalf+secondHalf;
           
        }
    }

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

    migrationApp.filter('convertDateTimestampCase',function(){
        return function(input){
            if(input === undefined)
                return;
            else {
                var inputArray = input.split(' ');
                var hourFormatArray = [];
                if(inputArray[2] !== undefined){
                    hourFormatArray = inputArray[2].toUpperCase();
                    return inputArray[0].concat(' ').concat(inputArray[1]).concat(' ').concat(hourFormatArray.split('').join(''));
                }
            }
        };
    });

    migrationApp.filter('convertCase',function(){
        return function(input){
            var arrInput =[];
            if(input){
                arrInput = input.split('-');
                return arrInput[0].toUpperCase()+'-'+arrInput[1][0].toUpperCase()+arrInput[1].substr(1).toLowerCase()+'-'+arrInput[2].toLowerCase();    
            }else{
                return '';
            }
        };
    });
    migrationApp.constant('DEFAULT_VALUES', {
        "REGION":'us-east-1',
        "ZONE":'us-east-1a'
    });
    /**
    * @ngdoc directive
    * @name migrationApp.directive:datetimepicker
    * @restrict A
    * @param {String} datetimepicker Bind date picked in bootstrap3 date picker in to angular model
    * @description
    * Directive to bind Date element picked from date picker in to angular model
    * @example
    * <example module="migrationApp">
    *   <file name="index.html">
    *      <div datetimepicker></div>
    *   </file>
    * </example>
    */
    migrationApp.directive('datetimepicker', function(){
        return {
            require: '?ngModel',
            restrict: 'A',
            link: function(scope, element, attrs, ngModel){

                if(!ngModel) return; // do nothing if no ng-model

                ngModel.$render = function(){
                    element.find('input').val( ngModel.$viewValue || '' );
                }

                element.on('dp.change', function(){
                    scope.$apply(read);
                });

                read();

                function read() {
                    var value = element.find('input').val();
                    ngModel.$setViewValue(value);
                }
            }
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
            { path: "/migration/saved-batch", component: "rscurrentbatchdetails", name: "CurrentBatchDetailsForSaved" },
            { path: "/migration/completed-batch/:job_id", component: "rscompletedbatchdetails", name: "CompletedBatchDetails" },
            { path: "/migration/:job_id/:resource_type/:resource_id/tasks", component: "rsresourcetasklist", name: "ResourceTaskList" },
            { path: "/", component: "rsmigrationhome", name: "MigrationHome"}
        ]
    }); // end of rsMigrationRoot component definition
})();
