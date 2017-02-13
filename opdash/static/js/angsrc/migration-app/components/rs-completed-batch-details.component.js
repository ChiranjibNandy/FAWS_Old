(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rscompletedbatchdetails
     * @description
     * Component to display the details of a batch migration which has completed. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/batch-migration-details.html**. It uses the controller {@link migrationApp.controller:rscompletedbatchdetailsCtrl rscompletedbatchdetailsCtrl}.  
     */
    angular.module("migrationApp")
        .component("rscompletedbatchdetails", {
            transclude: true,
            templateUrl: "/static/angtemplates/migration/completed-batch-details.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rscompletedbatchdetailsCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rscompletedbatchdetails rscompletedbatchdetails} component
             */
            controller: ["$rootRouter",function($rootRouter){
                var vm = this;
                var batch_id;

                vm.$routerOnActivate = function(next, previous) {
                    batch_id = next.params.batch_id;
                    console.log(batch_id);
                };
            }
        ]}); // end of component rscompletedbatchdetails
})();