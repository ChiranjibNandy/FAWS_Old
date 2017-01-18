(function() {
    "use strict";
    
    angular.module("migrationApp")
        // component to display a tab
        .component("rsTab", {
            transclude: true,
            require: {
                tabs: '^^rsTabs'
            },
            bindings: {
                title: "@"
            },
            template: "<div ng-show='vm.tab.active' ng-transclude></div>",
            controllerAs: "vm",
            controller: function() {
                var vm = this;
                
                vm.$onInit = function() {
                    vm.tab = {
                        title: vm.title,
                        active: false
                    };

                    // add current tab to the group
                    vm.tabs.addTab(vm.tab);
                }
            }
        }); // end of component rsTab
})();