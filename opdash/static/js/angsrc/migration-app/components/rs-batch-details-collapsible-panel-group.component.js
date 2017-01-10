(function() {
    "use strict";
    
    angular.module("migrationApp")
        // component to group all collapsible panels
        .component("rscollapsiblepanelgroup", {
            transclude: true,
            template: "<div class='collapsible-panel-group' ng-transclude></div>",
            controllerAs: "vm",
            controller: ["$q", "httpwrapper", function($q, HttpWrapper) {
                var vm = this, 
                    loaded = false,
                    loading = false, 
                    data,
                    deferred = $q.defer(),
                    subTasks = [];

                vm.panels = [];
                
                // Add a collapsible panel to group
                vm.addPanel = function(panel) {
                    vm.panels.push(panel);

                    if(vm.panels.length === 1){
                        panel.collapsed = false;
                    }
                };

                // factory function to retrieve batch items for each type
                vm.getBatchItems = function(type) {
                    var url = "/static/angassets/batch-details.json";

                    // represents a task for for each type (server, network)
                    var task = {type: type, deferred: $q.defer()};

                    // if data loading has already been initiated then don't create a new http request
                    // rather just add a new deferred and wait for it to be resolved
                    if(loading){
                        subTasks.push(task); // add a new task
                        return task.deferred.promise;
                    }
                    // For first time request, maintain an internal promise object
                    // which resolves all the other tasks once internal promise is resolved
                    else if (!loaded) {
                        loading = true;
                        subTasks.push(task); // add a new task

                        deferred.promise = HttpWrapper.send(url,{"operation":'GET'})
                            .then(function(response) {
                                loaded = true;
                                loading = false;
                                data = response;

                                // resolve all the pending tasks
                                angular.forEach(subTasks, function(task){
                                    task.deferred.resolve(data[task.type]);
                                });
                                subTasks.length = 0;
                            }, function(errorResponse) { // handle errors
                                loaded = false;
                                loading = false;
                                data = null;
                            });

                        return task.deferred.promise;
                    }else{
                        return $q.when(data[type]); // return data if already available
                    }
                };
            }]
        }); // end of component rscollapsiblepanelgroup
})();