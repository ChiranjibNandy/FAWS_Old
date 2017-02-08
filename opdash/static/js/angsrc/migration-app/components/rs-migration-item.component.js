(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsmigrationitem
     * @param {String} type Type of resource (server, network etc)
     * @requires migrationApp.object:rsmigrationresourceslist
     * @description
     * Component to display list of resources of the given type.  
     *   
     * This component uses the template: **angtemplates/migration/migration-item-template.html**  
     *   
     * This component (and its features) is being used by following pages of the application:
     *  * angtemplates/migration/resources-list.html
     *   
     * Its controller {@link migrationApp.controller:rsmigrationitemCtrl rsmigrationitemCtrl} uses the below services:
     *  * {@link migrationApp.service:migrationitemdataservice migrationitemdataservice}
     *  * $rootRouter
     *  * {@link migrationApp.service:authservice authservice}
     *  * $q
     *  * $scope
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rsmigrationitem type="server"></rsmigrationitem>
     *   </file>
     * </example>
     */
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
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsmigrationitemCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsmigrationitem rsmigrationitem} component
             */
            controller: ["migrationitemdataservice", "datastoreservice", "serverservice", "$rootRouter", "authservice", "$q", "$scope", function (ds, datastoreservice, ss, $rootRouter, authservice, $q, $scope) {
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
                        //item.id === jobsList[i].resources.networks[0].subnets[0].id
                        var statusItem = statusList.filter(function(item){ return item.resources.networks[0].subnets[0].id === dataList[i].subnets[0].id })[0];
                        if(statusItem)
                            dataList[i].migrationStatus = statusItem.status;

                    }
                    //dataList[0].migrationStatus = "done";
                    return dataList;
                };

                // Perfoming controller initialization steps
                vm.$onInit = function() {
                    /**
                     * @ngdoc property
                     * @name labels
                     * @propertyOf migrationApp.controller:rsmigrationitemCtrl
                     * @type {Array}
                     * @description Set of table headers used while displaying the list of resources
                     */
                    vm.labels = [];

                    /**
                     * @ngdoc property
                     * @name selectedItems
                     * @propertyOf migrationApp.controller:rsmigrationitemCtrl
                     * @type {Array}
                     * @description Set of selected resources of the given type
                     */
                    vm.selectedItems = {};

                    /**
                     * @ngdoc property
                     * @name items
                     * @propertyOf migrationApp.controller:rsmigrationitemCtrl
                     * @type {Array}
                     * @description Set of resources of the given type
                     */
                    vm.items = [];
                    vm.pageArray = [];
                    vm.search = {};
                    vm.loading = true;
                    vm.loadError = false;
                    vm.noData = false;
                    vm.sortingOrder = true;
                    vm.isAllselected = false;
                    vm.tenant_id = authservice.getAuth().tenant_id;
                    vm.isRacker = authservice.is_racker;
                    /**
                     * @ngdoc property
                     * @name resources_retrieved
                     * @propertyOf migrationApp.controller:rsmigrationitemCtrl
                     * @type {Array}
                     * @description Set of resources retrieved during first time loading of application
                     */
                    var resources_retrieved = datastoreservice.retrieveallItems(vm.type);
                    
                    //check if resources already retrieved
                    if(resources_retrieved.length == 0){
                        //During first time loading of resources
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
                            if(vm.type === "files")
                                vm.items = mapNetworkStatus(dataList, results[1].network_status);
                            if(vm.type === "loadBalancers")
                                vm.items = mapNetworkStatus(dataList, results[1].network_status);
                            //Store all retrieved resources in factory variable
                            datastoreservice.storeallItems(vm.items, vm.type);   
                            // pagination controls
                            vm.currentPage = 1;
                            vm.pageSize = 5; // items per page
                            vm.totalItems = vm.items.length;
                            vm.noOfPages = Math.ceil(vm.totalItems / vm.pageSize);
                            for(var i=1;i<=vm.noOfPages;i++){
                                vm.pageArray.push(i);
                            };      
                            vm.searchField = results[0].labels[0].field;
                            vm.labels = results[0].labels; // set table headers
                            //Store all labels in factory variable
                            datastoreservice.storeallItems(vm.labels, "label"+vm.type);
                            angular.forEach(results[0].labels, function(label){
                                vm.search[label.field] = ""; // set search field variables
                            });
                            vm.loading = false;
                        });
                    } else{
                        //For repeated fetch of resources after first time loading.
                        vm.items = datastoreservice.retrieveallItems(vm.type);
                        // pagination controls
                        vm.currentPage = 1;
                        vm.pageSize = 5; // items per page
                        vm.totalItems = vm.items.length;
                        vm.noOfPages = Math.ceil(vm.totalItems / vm.pageSize);
                        for(var i=1;i<=vm.noOfPages;i++){
                            vm.pageArray.push(i);
                        };

                        vm.labels = datastoreservice.retrieveallItems("label"+vm.type); // set table headers
                        vm.loading = false;
                        
                        var servers_selected = datastoreservice.getItems(vm.type);
                        angular.forEach(servers_selected, function (item_selected) {
                             vm.parent.addItem(item_selected, vm.type);
                         });
                    }

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
                    $('#rs-main-panel').css('height','298px');
                };

                /**
                 * @ngdoc method
                 * @name changeSelectAll
                 * @methodOf migrationApp.controller:rsmigrationitemCtrl
                 * @param {Object} item _Object_ describing the selected resource
                 * @param {Boolean} fromGlobal Flag to indicate if the change is being done programatically or by user interaction
                 * @description 
                 * Select/Deselect all resources of the given type
                 */
                vm.changeSelectAll = function (item, fromGlobal) {
                    if(item.selected){
                        item.type = vm.type;
                        vm.parent.addItem(item, vm.type);
                    }else{
                        item.type = vm.type;
                        vm.parent.removeItem(item, vm.type);
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

                /**
                 * @ngdoc method
                 * @name changeItemSelection
                 * @methodOf migrationApp.controller:rsmigrationitemCtrl
                 * @description 
                 * Update item selection based on Select/Deselect all
                 */
                vm.changeItemSelection = function () {
                    angular.forEach(vm.items, function (item) {
                        item.selected = vm.isAllSelected;
                        vm.changeSelectAll(item, true);
                    });
                };

                /**
                 * @ngdoc method
                 * @name sort
                 * @methodOf migrationApp.controller:rsmigrationitemCtrl
                 * @description 
                 * Function to sort resource list
                 */
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

                /**
                 * @ngdoc method
                 * @name equipmentDetails
                 * @methodOf migrationApp.controller:rsmigrationitemCtrl
                 * @description 
                 * display equipment details for a perticular resource.
                 */
                vm.equipmentDetails = function(type, itemdetails) {
                    vm.type = type;
                    vm.itemDetails = itemdetails;
                    // vm.equipStatus = status;
                    // vm.equipRam = ram;
                    // vm.equipFlavorDetails = flavorDetails;
                    // vm.equipRegion = region;
                    // vm.equipNetworks = networks;
                    // vm.equipProgress = vm.equipRam/2000*100;
                    /**
                     * @ngdoc property
                     * @name equipment
                     * @propertyOf migrationApp.controller:rsequipmentdetailsCtrl
                     * @type {Object}
                     * @description Object containing details about the equipment
                     */
                    vm.equipment = {};

                    /**
                     * @ngdoc property
                     * @name tasks
                     * @propertyOf migrationApp.controller:rsequipmentdetailsCtrl
                     * @type {Array}
                     * @description Array containing set of tasks involved in migrating the resource 
                     */
                    vm.tasks = [];
                    // fetch details based on selected migration item
                    ds.getDetailedList(vm.type)
                        .then(function (response) {
                            vm.equipment = response.data.filter(function (item) { return item.id == vm.id })[0];
                        });

                    if(vm.type == 'server'){
                        ds.getServerMigrationStatus(authservice.getAuth().tenant_id)
                            .then(function(response){
                                var jobId = response.server_status
                                                .filter(function(item){
                                                    if(item.server_id == vm.id)
                                                        return item;
                                                });
                                if(jobId.length > 0){
                                    vm.jobId = jobId[0].id;
                                    ss.getJobTasks(jobId[0].id)
                                        .then(function(response){
                                            vm.jobStatus = response.data.results.instances[vm.id].status;
                                            vm.tasks = response.data.results.instances[vm.id].tasks;
                                            vm.showData = true;
                                        });
                                }                                            
                            });
                    }
                }
                return vm;
            }]
        }); // end of component definition
})();
