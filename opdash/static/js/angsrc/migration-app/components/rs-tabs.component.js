(function() {
    "use strict";
    
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
            controller: function() {
                var vm = this;
                vm.tabs = [];
                
                vm.addTab = function(tab) {
                    vm.tabs.push(tab);

                    if(vm.tabs.length === 1) {
                        tab.active = true;
                    }
                };

                vm.selectTab = function(selectedTab){
                    angular.forEach(vm.tabs, function(tab) {
                        if(tab.active && tab !== selectedTab) {
                            tab.active = false;
                        }
                    });

                    selectedTab.active = true;
                }
            }
        });
})();