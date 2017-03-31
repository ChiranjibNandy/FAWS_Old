(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rsTab
     * @param {String} title The title for the tab
     * @requires migrationApp.object:rsTabs
     * @description
     * To display a tab. This component requires the parent component {@link migrationApp.object:rsTabs rsTabs}.  
     * This is a generic component and can be used anywhere along with the parent component {@link migrationApp.object:rsTabs rsTabs}.  
     *   
     * This component transcludes the content provided inside it and displays it as a tab. It uses the controller {@link migrationApp.controller:rsTabCtrl rsTabCtrl}  
     * 
     * This component (and its features) is being used by following pages of the application:
     *  * angtemplates/migration/resources-list.html
     *  * angtemplates/migration/recommendations.html
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rs-tab title="server"></rs-tab>
     *   </file>
     * </example>
     */
    angular.module("migrationApp")
        .component("rsTab", {
            transclude: true,
            require: {
                tabs: '^^rsTabs'
            },
            bindings: {
                title: "@",
                showtab: "@"
            },
            template: "<div ng-show='vm.tab.active' ng-transclude></div>",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsTabCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsTab rsTab} component
             */
            controller: function() {
                var vm = this;
                
                vm.$onInit = function() {
                    /**
                     * @ngdoc property
                     * @name tab
                     * @propertyOf migrationApp.controller:rsTabCtrl
                     * @type {Object}
                     * @description Object with tab details containing tab title and its state (active/inactive)
                     */
                    vm.tab = {
                        title: vm.title,
                        active: false
                    };

                    // add current tab to the group
                    if(vm.showtab == "true") vm.tabs.addTab(vm.tab);
                }
            }
        }); // end of component rsTab
})();