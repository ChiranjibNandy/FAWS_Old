(function() {
    "use strict";
    
    angular.module("migrationApp")
        // component to create a collapsible panel
        .component("rscollapsible", {
            transclude: true,
            templateUrl: "/static/angtemplates/collapsible-item.html",
            controllerAs: "vm",
            controller: function() {
                var vm = this
                vm.panels = [];
                
                // Called when a panel is added
                vm.addPanel = function(panel) {
                    vm.panels.push(panel);
                };
            }
        }); // end of component rscollapsiblepanel
})();