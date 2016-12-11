(function () {
   "use strict";

   // defining component to display details of the items to be migrated
   angular.module("migrationApp")
       .component("rsmigrationsstatus", {
           templateUrl: "/static/angtemplates/migration/migrations-status.html",
           controllerAs: "vm",
           controller: ["migrationitemdataservice", function (ds) {
               var vm = this;

               // When the component is active get router params and fetch data
               vm.$onInit = function() {
                   vm.tenant_id = user_data.tenant_id;
                   ds.getServerMigrationStatus(vm.tenant_id)
                       .then(function(result){
                           vm.migrations = result.server_status;
                       });
               }; // end of $routerOnActivate
               return vm;
           }] // end of component controller
       }); // end of component definition

})();