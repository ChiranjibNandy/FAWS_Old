(function() {
    "use strict";
    
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
            controller: function() {
                var vm = this;
                
                vm.$onInit = function() {
                    vm.panel = {
                        title: vm.title,
                        collapsed:true
                    };
                    
                    vm.collapsiblePanel.addPanel(vm.panel);
                }
            }
        }); // end of component rsTab
})();