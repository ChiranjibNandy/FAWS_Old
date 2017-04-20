(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rsmigrationrackerreports
     * @description
     * Component to display reports pertaining to tenants.
     * 
     * This component uses the template: **angtemplates/migration/racker-reports.html**.  
     *
     */
    angular.module("migrationApp")
        .component("rsmigrationrackerreports", {
            templateUrl: "/static/angtemplates/migration/racker-reports.html",
            controllerAs: "vm",
            controller:["authservice",function(authservice){
                var vm = this;
                vm.isRacker = authservice.is_racker;
            }]
        }); // end of component rsmigrationrackerreports
})();