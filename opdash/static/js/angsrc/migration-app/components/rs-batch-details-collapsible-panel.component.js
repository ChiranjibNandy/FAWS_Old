(function() {
    "use strict";
    
    angular.module("migrationApp")
        // component to create a collapsible panel
        .component("rscollapsiblepanel", {
            transclude: true,
            require: {
                panelGroup: "^^rscollapsiblepanelgroup" // require the parent controller
            },
            bindings: {
                type: "@" // expects a type attr. eg: server, network etc
            },
            templateUrl: "/static/angtemplates/migration/batch-group-detail.html",
            controllerAs: "vm",
            controller: function() {
                var vm = this;

                vm.$onInit = function(){
                    var collapsed = true; // set initial state of panel to collapsed
                    vm.batchItems = []; // items to be displayed inside the collapsible panel

                    vm.loading = true;
                    vm.loadError = false;
                    vm.noData = false;

                    vm.panel = {
                        collapsed: collapsed
                    };

                    // add panel to panel group
                    vm.panelGroup.addPanel(vm.panel);

                    // get batch items
                    vm.panelGroup.getBatchList(vm.type)
                        .then(function(response){
                            if(response.error){
                                vm.loading = false;
                                vm.loadError = true;
                                return;
                            }
                            if(response.batchItems.length === 0){
                                vm.noData = true;
                                vm.loading = false;
                                return;
                            }

                            vm.batchItems = response.batchItems;
                            vm.estimatedTimeRemaining = response.estimatedTimeRemaining;
                            vm.status = response.status;
                            vm.progress = response.progress;
                            vm.completedCount = response.completedCount;
                            vm.loading = false;
                        });
                }
                
                // Pause one or all migrations of a particular type (server, network)
                vm.pause = function(id){
                    if(typeof id === "undefined"){ // pause all
                        alert("Pause migration of all " + vm.type + "s");
                    }else{ // pause one
                        alert("Pause migration of " + vm.type + ": " + id);
                    }
                };

                // Cancel one or all migrations of a particular type (server, network)
                vm.cancel = function(id){
                    if(typeof id === "undefined"){ // cancel all
                        alert("Cancel migration of all " + vm.type + "s");
                    }else{ // cancel one
                        alert("Cancel migration of " + vm.type + ": " + id);
                    }
                };
            }
        }); // end of component rscollapsiblepanel
})();