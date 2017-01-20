(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsmigrationtenantid
     * @description
     * Component to display the list of tenants whose resource migration has to be done. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/tenant-id.html**.  
     *   
     * Its controller {@link migrationApp.controller:rsmigrationtenantidCtrl rsmigrationtenantidCtrl} uses the below services:
     *  * {@link migrationApp.service:authservice authservice}
     */
    angular.module("migrationApp")
        .component("rsmigrationtenantid", {
            templateUrl: "/static/angtemplates/migration/tenant-id.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsmigrationtenantidCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsmigrationtenantid rsmigrationtenantid} component
             */
            controller:["authservice",function(authservice){
                var vm = this;

                vm.setTenant = function(id) {
                    authservice.getAuth().tenant_id = id;
                };
            }]
        });
})();
