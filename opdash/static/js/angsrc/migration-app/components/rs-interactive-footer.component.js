(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsinteractivefooter
     * @description
     * Component to have a interactive footer in every page.  
     *   
     * This component uses the template: **angtemplates/migration/interactive-footer.html**. It uses the controller {@link migrationApp.controller:rsinteractivefooterCtrl rsinteractivefooterCtrl}.  
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rsinteractivefooter error-message="Some error message"></rsinteractivefooter>
     *   </file>
     * </example>
     */
    angular.module("migrationApp")
        .component("rsinteractivefooter", {
            templateUrl: "/static/angtemplates/migration/interactive-footer.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsinteractivefooterCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsinteractivefooter rsinteractivefooter} component
             */
            controller: ["datastoreservice", function (dataStoreService) {
                var vm = this;

                return vm;
            }]
        }); // end of component definition
})();
