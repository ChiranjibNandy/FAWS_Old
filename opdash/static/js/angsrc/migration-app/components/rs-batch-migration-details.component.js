(function() {
    "use strict";
    
    angular.module("migrationApp")
        // component to display batch migration details
        .component("rsbatchmigrationdetails", {
            transclude: true,
            templateUrl: "/static/angtemplates/migration/batch-migration-details.html",
            controllerAs: "vm",
            controller: function() {
                var vm = this;
                $('title')[0].innerHTML =  "Batch Migration Details - Rackspace Cloud Migration";

                vm.batchName = "(Batch name)";

                // Go back to migration dashboard
                vm.back = function() {
                    alert("Go back to migration dashboard");
                };

                // Pause all migrations
                vm.pauseAll = function() {
                    alert("Pause all migrations");
                };

                // Cancel all migrations
                vm.cancelAll = function() {
                    alert("Cancel all migrations");
                };
            }
        }); // end of component rsbatchmigrationdetails
})();