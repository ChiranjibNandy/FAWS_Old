(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rscurrentbatchdetails
     * @description
     * Component to display the details of a batch migration which is in progress. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/batch-current.html**. It uses the controller {@link migrationApp.controller:rscurrentbatchdetailsCtrl rscurrentbatchdetailsCtrl}.  
     */
    angular.module("migrationApp")
        .component("rscurrentbatchdetails", {
            transclude: true,
            templateUrl: "/static/angtemplates/migration/current-batch-details.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rscurrentbatchdetailsCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rscurrentbatchdetails rscurrentbatchdetails} component
             */
            controller: ["$rootRouter",function($rootRouter){
                var vm = this;
                var batch_id;

                vm.$routerOnActivate = function(next, previous) {
                    batch_id = next.params.batch_id;
                    console.log(batch_id);
                };
            }
        ]}); // end of component rscurrentbatchdetails
})();