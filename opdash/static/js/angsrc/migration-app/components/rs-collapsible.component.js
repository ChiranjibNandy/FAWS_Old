(function() {
    "use strict";
    
    angular.module("migrationApp")
        // component to create a collapsible panel
        .component("rscollapsible", {
            transclude: true,
            //yet to create template
            templateUrl: "/static/angtemplates/collapsible-item.html",
            controllerAs: "vm",
            controller: function() {
                var vm = this,
                    collapsed = true;
                vm.panel = {
                    collapsed:collapsed
                }
            }
        }); // end of component rscollapsiblepanel
})();