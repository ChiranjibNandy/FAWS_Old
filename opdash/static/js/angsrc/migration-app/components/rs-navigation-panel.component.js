(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:navigationpanel
     * @description
     * Component to have a navigation panel in every page.  
     *   
     * This component uses the template: **angtemplates/migration/navigation-panel.html**. It uses the controller {@link migrationApp.controller:navigationpanelCtrl navigationpanelCtrl}.  
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <navigationpanel error-message="Some error message"></navigationpanel>
     *   </file>
     * </example>
     */
    angular.module("migrationApp")
        .component("rsnavigationpanel", {
            templateUrl: "/static/angtemplates/migration/navigation-panel.html",
            bindings: {
                pagenum: "<" // type parameter to be supplied (eg: server, network etc)
            },
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:navigationpanelCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:navigationpanel navigationpanel} component
             */
            controller: ["datastoreservice", function (dataStoreService) {
                var vm = this;
                        return vm;
            }]
        }); // end of component definition
})();
