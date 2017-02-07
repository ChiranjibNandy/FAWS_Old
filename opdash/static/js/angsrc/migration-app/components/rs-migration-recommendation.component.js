(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsmigrationrecommendation
     * @description
     * Component to display the _Recommendations_ page showing the recommended migration for the selected resources. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/recommendations.html**.  
     *   
     * Its controller {@link migrationApp.controller:rsmigrationrecommendationCtrl rsmigrationrecommendationCtrl} uses the below services:
     *  * $rootRouter
     */
    angular.module("migrationApp")
        .component("rsmigrationrecommendation", {
            templateUrl: "/static/angtemplates/migration/recommendations.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsmigrationrecommendationCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsmigrationrecommendation rsmigrationrecommendation} component
             */
            controller: [ "$rootRouter","datastoreservice", function($rootRouter,datastoreservice) {
                var vm = this;
                
                $('title')[0].innerHTML =  "Recommendations - Rackspace Cloud Migration";
                vm.migrationName = datastoreservice.getScheduleMigration();
                vm.dataServer = datastoreservice.getItems('server').length;
                vm.dataNetwork = datastoreservice.getItems('network').length;

                /**
                 * @ngdoc method
                 * @name saveItems
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
                 * @description 
                 * Saves the chosen solution for migration of resources
                 */
                vm.saveItems = function() {
                    alert("Saving items: To be implemented");
                };

                /**
                 * @ngdoc method
                 * @name continue
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
                 * @description 
                 * Continue to next step: **Schedule Migration**
                 */
                vm.continue = function() {
                    $rootRouter.navigate(["ScheduleMigration"]);
                };

                return vm;
            }
        ]}); // end of component definition
})();