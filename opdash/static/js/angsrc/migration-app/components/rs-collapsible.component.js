(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rscollapsible
     * @description
     * Component to create collapsible panels. This is a generic component that can be used (in conjunction with {@link migrationApp.object:rscollapsiblechild rscollapsiblechild}) in other uses cases where a collapsible panel is needed.  
     *   
     * This component transcludes the content provided inside it and displays it as a panel. It uses the controller {@link migrationApp.controller:rscollapsibleCtrl rscollapsibleCtrl}  
     * 
     * This component (and its features) is being used by following pages of the application:
     *  * angtemplates/migration/compare-options.html
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rscollapsible alignment="vertical"></rscollapsible>
     *   </file>
     * </example>
     */
    angular.module("migrationApp")
        // component to create a collapsible panel
        .component("rscollapsible", {
            transclude: true,
            templateUrl: "/static/angtemplates/collapsible-item.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rscollapsibleCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rscollapsible rscollapsible} component
             */
            controller: function() {
                var vm = this
                vm.panels = [];
                
                // Called when a panel is added and keeps track of panels adding
                vm.addPanel = function(panel) {
                    vm.panels.push(panel);
                };
            }
        }); // end of component rscollapsiblepanel
})();