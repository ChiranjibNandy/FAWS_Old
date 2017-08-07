(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rsTabs
     * @param {String} alignment Tab alignment (_horizontal_ or _vertical_)
     * @requires migrationApp.object:rsTabs
     * @description
     * Component to group multiple tabs. This is a generic component that can be used (in conjunction with {@link migrationApp.object:rsTab rsTab}) in other uses cases where a tab layout is needed.  
     *   
     * This component transcludes the content provided inside it and displays it as a tab. It uses the controller {@link migrationApp.controller:rsTabsCtrl rsTabsCtrl}  
     * 
     * This component (and its features) is being used by following pages of the application:
     *  * angtemplates/migration/resources-list.html
     *  * angtemplates/migration/recommendations.html
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rs-tabs alignment="vertical"></rs-tabs>
     *   </file>
     * </example>
     */
    angular.module("migrationApp")
        .component("rsTabs", {
            transclude: true,
            bindings: {
                alignment: "@"
            },
            templateUrl: ["$element", "$attrs", function($element, $attrs) {
                return "/static/angtemplates/" + $attrs.alignment + "-tabs.html";
            }],
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsTabsCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsTabs rsTabs} component
             */
            controller: ["$rootScope",function($rootScope) {
                var vm = this;

                /**
                 * @ngdoc property
                 * @name tabs
                 * @propertyOf migrationApp.controller:rsTabsCtrl
                 * @type {Array}
                 * @description Set of tabs in the tab group
                 */
                vm.tabs = [];
                vm.currentTab = '';

                /**
                 * @ngdoc method
                 * @name addTab
                 * @methodOf migrationApp.controller:rsTabsCtrl
                 * @param {Object} tab Tab be added to group
                 * @description 
                 * Method to add a tab to group
                 */
                vm.addTab = function(tab) {
                    vm.tabs.push(tab);

                    if(vm.tabs.length === 1) {
                        tab.active = true;
                        vm.currentTab = tab.name;
                        setTimeout(function() {
                            $rootScope.$broadcast("tabChanged",vm.currentTab);
                        }, 0);
                    }
                };

                /**
                 * @ngdoc method
                 * @name selectTab
                 * @methodOf migrationApp.controller:rsTabsCtrl
                 * @param {Object} selectedTab The tab that has been selected
                 * @description 
                 * Called when a tab is selected
                 */
                vm.selectTab = function(selectedTab){
                    angular.forEach(vm.tabs, function(tab) {
                        if(tab.active && tab !== selectedTab) {
                            tab.active = false;
                        }
                    });

                    selectedTab.active = true;
                    vm.currentTab = selectedTab.name;
                    $rootScope.$broadcast("tabChanged",vm.currentTab);
                }
            }
        ]}); // end of component rsTabs
})();