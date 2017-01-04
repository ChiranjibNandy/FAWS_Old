(function() {
    "use strict";
    
    angular.module("migrationApp")
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

                    vm.tabs.addTab(vm.tab);
                }
            }
        });
})();