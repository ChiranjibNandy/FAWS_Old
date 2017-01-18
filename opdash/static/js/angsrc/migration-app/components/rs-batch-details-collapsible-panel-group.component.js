(function() {
    "use strict";
    
    angular.module("migrationApp")
        // component to group all collapsible panels
        .component("rscollapsiblepanelgroup", {
            transclude: true,
            template: "<div class='collapsible-panel-group' ng-transclude></div>",
            controllerAs: "vm",
            controller: ["migrationitemdataservice", "$q", "httpwrapper", "authservice", function(ds, $q, HttpWrapper, authservice) {
                var vm = this, 
                    loaded = false,
                    loading = false, 
                    data,
                    deferred = $q.defer(),
                    subTasks = [];

                var mapServerName = function(dataList, jobsList) {
                    for(var i=0; i<jobsList.length; i++){
                        var nameItem = dataList.filter(function(item){ return item.id === jobsList[i].server_id })[0];
                        if(nameItem)
                            jobsList[i].name = nameItem.name;
                    }
                    return jobsList;
                };

                var mapNetworkName = function(dataList, jobsList) {
                    for(var i=0; i<jobsList.length; i++){
                        var nameItem = dataList.filter(function(item){ return item.subnets[0].id === jobsList[i].resources.networks[0].subnets[0].id })[0];
                        if(nameItem)
                            jobsList[i].name = nameItem.name;
                    }
                    return jobsList;
                };

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

                vm.getBatchList = function(type) {
                    var batchItems, isEmpty;
                    var tenant_id = "1024814";

                    // Retrieve all migration items of a certain type
                    var list = ds.getTrimmedAllItems(type);

                    // Retrieve migration item status
                    var status = ds.getServerMigrationStatus(tenant_id);

                    return $q.all([list, status]).then(function(results) {
                        if(results[0].error || results[1].error){
                            return { error: "Could not load data" };
                        }

                        if(type==="server" && results[1].server_status.length === 0){
                            isEmpty = true;
                            batchItems = [];
                        }
                        else if(type==="network" && results[1].network_status.length === 0){
                            isEmpty = true;
                            batchItems = [];
                        }

                        if(!isEmpty && type === "server")
                            batchItems = mapServerName(results[0].data, results[1].server_status);
                        else if(!isEmpty && type === "network")
                            batchItems = mapNetworkName(results[0].data, results[1].network_status);

                        console.log(type, " : ", batchItems);
                        return {
                            batchItems: batchItems
                        };
                    })
                };
            }]
        }); // end of component rscollapsiblepanelgroup
})();