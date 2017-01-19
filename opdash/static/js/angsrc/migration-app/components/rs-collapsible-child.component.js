(function() {
    "use strict";
    
    angular.module("migrationApp")
        // component to display a tab
        .component("rscollapsiblechild", {
            transclude: true,
            require: {
                tabs: '^^rscollapsible'
            },
            template: "<div class='collapsible-panel-group' ng-transclude></div>",
            controllerAs: "vm",
            controller: function() {
                var vm = this;
                
                vm.$onInit = function() {
                    
                }
            }
        }); // end of component rsTab
})();