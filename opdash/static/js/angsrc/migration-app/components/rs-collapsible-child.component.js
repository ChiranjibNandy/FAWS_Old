(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rscollapsiblechild
     * @param {String} title The title for the header of the panel
     * @requires migrationApp.object:rscollapsible
     * @description
     * To display a collapsible panel. This component requires the parent component {@link migrationApp.object:rscollapsible rscollapsible}.  
     * This is a generic component and can be used anywhere along with the parent component {@link migrationApp.object:rscollapsible rscollapsible}.  
     *   
     * This component transcludes the content provided inside it and displays it as a collapsible panel which can be expanded and shrinked on a button click in the header. It uses the controller {@link migrationApp.controller:rsTabCtrl rsTabCtrl}  
     * 
     * This component (and its features) is being used by following pages of the application:
     *  * angtemplates/migration/compare-options.html
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rscollapsiblechild title="server"></rscollapsiblechild>
     *   </file>
     * </example>
     */
    angular.module("migrationApp")
        // component to display a tab
        .component("rscollapsiblechild", {
            transclude: true,
            require: {
                collapsiblePanel: '^^rscollapsible'
            },
            bindings: {
                title: "@"
            },
            template: "<div class='item-group' ng-show='!vm.panel.collapsed'><div class='rs-row item'><div ng-transclude></div></div></div>",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rscollapsiblechildCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rscollapsiblechild rscollapsiblechild} component
             */
            controller: function() {
                var vm = this;
                
                vm.$onInit = function() {
                    /**
                     * @ngdoc property
                     * @name panel
                     * @propertyOf migrationApp.controller:rscollapsiblechildCtrl
                     * @type {Object}
                     * @description Object with panel details containing panel title and its state (collapsed/shrinked)
                     */
                    vm.panel = {
                        title: vm.title,
                        collapsed:true
                    };
                    
                    //caling parent to add new panel
                    vm.collapsiblePanel.addPanel(vm.panel);
                }
            }
        }); // end of component rscollapsiblechild
})();