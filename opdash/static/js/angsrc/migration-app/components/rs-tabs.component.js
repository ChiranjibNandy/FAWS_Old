(function() {
    "use strict";
    
    angular.module("migrationApp")
        // component to group multiple tabs
        .component("rsTabs", {
            transclude: true,
            bindings: {
                alignment: "@"
            },
            templateUrl: ["$element", "$attrs", function($element, $attrs) {
                return "/static/angtemplates/" + $attrs.alignment + "-tabs.html";
            }],
            controllerAs: "vm",
            controller: function() {
                var vm = this;
                vm.tabs = [];
                
                // Called when a tab is added
                vm.addTab = function(tab) {
                    vm.tabs.push(tab);

                    if(vm.tabs.length === 1) {
                        tab.active = true;
                    }
                };

                // Called a tab is selected
                vm.selectTab = function(selectedTab){
                    angular.forEach(vm.tabs, function(tab) {
                        if(tab.active && tab !== selectedTab) {
                            tab.active = false;
                        }
                    });

                    selectedTab.active = true;
                }
            }
        }); // end of component rsTabs
})();