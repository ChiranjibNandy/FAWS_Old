(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rsbatchmigrationdetails
     * @description
     * Component to display the details of a batch migration. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/batch-migration-details.html**. It uses the controller {@link migrationApp.controller:rsbatchmigrationdetailsCtrl rsbatchmigrationdetailsCtrl}.  
     */
    angular.module("migrationApp")
        .component("rsbatchmigrationdetails", {
            transclude: true,
            templateUrl: "/static/angtemplates/migration/batch-migration-details.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsbatchmigrationdetailsCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsbatchmigrationdetails rsbatchmigrationdetails} component
             */
            controller: function() {
                var vm = this;
                $('title')[0].innerHTML =  "Batch Migration Details - Rackspace Cloud Migration";

                /**
                 * @ngdoc property
                 * @name batchName
                 * @propertyOf migrationApp.controller:rsbatchmigrationdetailsCtrl
                 * @type {String}
                 * @description Batch name whose details are being shown
                 */
                vm.batchName = "(Batch name)";

                /**
                 * @ngdoc method
                 * @name back
                 * @methodOf migrationApp.controller:rsbatchmigrationdetailsCtrl
                 * @description 
                 * Go back to migration dashboard page
                 */
                vm.back = function() {
                    alert("Go back to migration dashboard");
                };

                /**
                 * @ngdoc method
                 * @name pauseAll
                 * @methodOf migrationApp.controller:rsbatchmigrationdetailsCtrl
                 * @description 
                 * Pause all migrations in the current batch
                 */
                vm.pauseAll = function() {
                    alert("Pause all migrations");
                };

                /**
                 * @ngdoc method
                 * @name cancelAll
                 * @methodOf migrationApp.controller:rsbatchmigrationdetailsCtrl
                 * @description 
                 * Cancel all migrations in the current batch
                 */
                vm.cancelAll = function() {
                    alert("Cancel all migrations");
                };
            }
        }); // end of component rsbatchmigrationdetails
})();