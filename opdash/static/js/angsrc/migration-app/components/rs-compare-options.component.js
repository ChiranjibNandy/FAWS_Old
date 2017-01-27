(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rscompareoptions
     * @description
     * Component to display the compare-options page for selected servers and networks.  
     *   
     * This component uses the template: **angtemplates/migration/compare-options.html**. It uses the controller {@link migrationApp.controller:datastoreserviceCtrl datastoreserviceCtrl}.  
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <datastoreservice error-message="Some error message"></datastoreservice>
     *   </file>
     * </example>
     */
    angular.module("migrationApp")
        // component to show recommendations to a user
        .component("rscompareoptions", {
            templateUrl: "/static/angtemplates/migration/compare-options.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rscompareoptionsCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rscompareoptions rscompareoptions} component
             */
            controller: ["datastoreservice","httpwrapper", "$rootRouter",function(dataStoreService,HttpWrapper,$rootRouter) {
                var vm = this;

                vm.$onInit = function(){
                    vm.servers = dataStoreService.getRecommendedItems();
                    vm.labels = ["Name","instance_type","region","cost","memory","vcpu"];
                }
                
                //this function gets triggers when we press the compare button.
                vm.compare= function() {
                    $rootRouter.navigate(["MigrationRecommendation"]);
                };

                return vm;
            }
        ]}); // end of component definition
})();