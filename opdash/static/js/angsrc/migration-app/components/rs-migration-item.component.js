(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        .component("rsmigrationitem", {
            templateUrl: "/static/angtemplates/migration/migration-item-template.html",
            bindings: {
                type: "@" // type parameter to be supplied (eg: server, network etc)
            },
            controllerAs: "vm",
            controller: ["migrationitemdataservice", "$rootRouter", "viewlogservice", "authservice", "$q", function (ds, $rootRouter,vl, authservice, $q) {
                var vm = this;
                
                var mapServerStatus = function(dataList, statusList) {
                    for(var i=0; i<dataList.length; i++){
                        var statusItem = statusList.filter(function(item){ return item.server_id === dataList[i].id })[0];
                        if(statusItem)
                            dataList[i].migrationStatus = statusItem.status;
                    }
                    //dataList[0].migrationStatus = "done";
                    return dataList;
                };

                var mapNetworkStatus = function(dataList, statusList) {
                    for(var i=0; i<dataList.length; i++){
                        // item.id === jobsList[i].resources.networks[0].subnets[0].id
                        var statusItem = statusList.filter(function(item){ return item.resources.networks[0].subnets[0].id === dataList[i].subnets[0].id })[0];
                        if(statusItem)
                            dataList[i].migrationStatus = statusItem.status;
                    }
                    //dataList[0].migrationStatus = "done";
                    return dataList;
                };

                // Perfoming controller initialization steps
                vm.$onInit = function() {
                    vm.labels = [];
                    vm.search = {};
                    vm.items = [];
                    vm.loading = true;
                    vm.loadError = false;
                    vm.noData = false;
                    vm.sortingOrder = true;
                    vm.tenant_id = authservice.getAuth().tenant_id;
                    $('title')[0].innerHTML =  "Inventory - Rackspace Cloud Backup";

                    // Retrieve all migration items of a specific type (eg: server, network etc)
                    var list = ds.getTrimmedAllItems(vm.type);
                    
                    // Retrieve migration item status
                    var status = ds.getServerMigrationStatus(vm.tenant_id);

                    // wait for all the promises to resolve
                    $q.all([list, status]).then(function(results) {
                        if(results[0].error || results[1].error){
                            vm.loading = false;
                            vm.loadError = true;
                            return;
                        }

                        if(results[0].data.length === 0){
                            vm.noData = true;
                            vm.loading = false;
                            return;
                        }

                        var dataList = results[0].data;

                        if(vm.type === "server")
                            vm.items = mapServerStatus(dataList, results[1].server_status);
                        if(vm.type === "network")
                            vm.items = mapNetworkStatus(dataList, results[1].network_status);

                        vm.searchField = results[0].labels[0].field;
                        vm.labels = results[0].labels; // set table headers
                        angular.forEach(results[0].labels, function(label){
                            vm.search[label.field] = ""; // set search field variables
                        });
                        vm.loading = false;
                    });

                    // Setup status filters
                    vm.statusFilters = [
                        { text: "All", type: "", selected: true },
                        { text: "Active", type: "ACTIVE", selected: false },
                        { text: "Warning", type: "WARNING", selected: false },
                        { text: "Error", type: "ERROR", selected: false }
                    ];

                    vm.statusFilter = "";
                };

                vm.$routerOnActivate = function(next, previous) {
                    vm.tid = next.params.tid;
                };

                vm.sort = function(item){
                    var items = vm.items;
                    if(vm.sortingOrder){
                        items.sort(function(a,b){
                            if(a[item] < b[item]) return -1;
                            if(a[item] > b[item]) return 1;
                            return 0;
                        });
                        vm.sortingOrder = false;
                    }else{
                        items.sort(function(a,b){
                            if(a[item] > b[item]) return -1;
                            if(a[item] < b[item]) return 1;
                            return 0;
                        });
                        vm.sortingOrder = true;
                    }
                    vm.items = items;
                };

                //store slog status
                vm.storeStatus = function(type,name){
                    vl.storeLog(
                        {'name':name,
                         'type':type
                        }
                        );
                    $rootRouter.navigate(["MigrationLogDetails", {type: vm.type}])
                }

                // Get count of items by their status type
                vm.getCountByStatus = function (status) {
                    return vm.loading ? "?" : (status==="" ? vm.items.length : (vm.items ? vm.items.filter(function (item) { return item.status === status }).length : "?"));
                };

                // Move to migration details page if multiple items are selected
                vm.migrate = function(id) {
                    $rootRouter.navigate(["MigrationDetails", {type: vm.type, id: id}]);
                };

                // Move to migration details page if multiple items are selected
                vm.gotoDetails = function(id) {
                    $rootRouter.navigate(["EquipmentDetails", {type: vm.type, id: id}]);
                };

                // Set status filter
                vm.setStatusFilter = function(status){
                    angular.forEach(vm.statusFilters, function(filter){
                        filter.selected = (filter.type === status);
                    });
                    vm.statusFilter = status;
                };

                vm.clearSearch = function() {
                   for(var key in vm.search){
                       vm.search[key] = "";
                   }
                };

                return vm;
            }]
        }); // end of component definition
})();