(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        .component("rsmigrationitem", {
            templateUrl: "/static/angtemplates/migration/migration-item-template.html",
            bindings: {
                type: "@", // type parameter to be supplied (eg: server, network etc)
                filtervalue:"<"
            },
            require: {
                parent: "^^rsmigrationresourceslist"
            },
            controllerAs: "vm",
            controller: ["migrationitemdataservice", "$rootRouter", "authservice", "$q", "$scope", function (ds, $rootRouter, authservice, $q, $scope) {
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
                    vm.selectedItems = [];
                    vm.search = {};
                    vm.items = [];
                    vm.loading = true;
                    vm.loadError = false;
                    vm.noData = false;
                    vm.sortingOrder = true;
                    vm.isAllselected = false;
                    vm.tenant_id = authservice.getAuth().tenant_id;
                    console.log("filterValues "+vm.filtervalue);

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
                        { text: "Servers", type: "ACTIVE", selected: false },
                        { text: "Networks", type: "WARNING", selected: false }
                    ];

                    vm.statusFilter = "";

                    $scope.$on("ItemRemoved", function(event, item){
                        if(item.type === vm.type){
                            item.selected = false;
                            vm.isAllSelected = false;
                        }
                    });
                };

                // Select/Deselect all items
                vm.changeSelectAll = function (item, fromGlobal) {
                    if(item.selected){
                        item.type = vm.type;
                        vm.parent.addItem(item);
                    }else{
                        item.type = vm.type;
                        vm.parent.removeItem(item);
                    }

                    if(!fromGlobal) {
                        var count = 0;
                        for(var i=0; i<vm.items.length; i++) {
                            if(vm.items[i].selected) count++;
                            else break;
                        }
                        vm.isAllSelected = count === vm.items.length;
                    }
                };

                // Update item selection based on Select/Deselect all 
                vm.changeItemSelection = function () {
                    angular.forEach(vm.items, function (item) {
                        item.selected = vm.isAllSelected;
                        vm.changeSelectAll(item, true);
                    });
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
               /* vm.storeStatus = function(type,name){
                    vl.storeLog(
                        {'name':name,
                         'type':type
                        }
                        );
                    $rootRouter.navigate(["MigrationLogDetails", {type: vm.type}])
                }*/

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
                    $rootRouter.navigate(["JobStatus", {type: vm.type, id: id}]);
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
