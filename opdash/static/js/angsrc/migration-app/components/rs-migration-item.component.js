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
            controller: ["migrationitemdataservice", "datastoreservice", "serverservice", "httpwrapper", "$rootRouter", "authservice", "$q", "$scope","$window", function (ds, datastoreservice, ss, HttpWrapper, $rootRouter, authservice, $q, $scope,$window) {
                var vm = this;

                /**
                 * @ngdoc method
                 * @name mapServerStatus
                 * @methodOf migrationApp.controller:rsmigrationitemCtrl
                 * @param {Object} dataList _Object_ list of servers to displayed
                 * @param {Object} statusList _Object_ Batch report to fetch migration status of each servers.
                 * @description 
                 * Map each server with its corresponding migration status.
                 */
                var mapServerStatus = function(dataList, statusList) {
                    angular.forEach(dataList, function (server) {
                        server.canMigrate = true;
                        server.migStatus = 'error';
                        //map status of a server received from Batch response with respect to the server id. 
                        angular.forEach(statusList, function (status) {
                            angular.forEach(status.instances, function (instance) {
                                if(instance['name'] == server.name){
                                    server.migStatusJobId = status.job_id;
                                    //Start--to be removed after demo3
                                    if(status.batch_status == 'error'){
                                        server.canMigrate = true;
                                        server.migStatus = status.batch_status;
                                    }
                                    else{
                                    //End--to be removed after demo3
                                        if(instance['status'] != 'error'){
                                            //set status of a server to false if batch migration response is other than 'error'
                                            server.canMigrate = false;
                                            server.migStatus = instance['status'];
                                        }
                                        else{
                                            server.canMigrate = true;
                                            server.migStatus = instance['status'];
                                        }
                                    };
                                }
                            });
                        });
                    });
                    return dataList;
                };

                /** 
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
                */

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
                    /**
                     * @ngdoc property
                     * @name pageArray
                     * @propertyOf migrationApp.controller:rsmigrationitemCtrl
                     * @type {Array}
                     * @description number of items to be showed per page
                     */
                    vm.pageArray = [];
                    vm.search = {};
                    vm.loading = true;
                    vm.loadError = false;
                    vm.noData = false;
                    vm.sortingOrder = true;
                    vm.isAllselected = false;
                    // vm.disableSelectAll = false;
                    vm.reverse = false;
                    vm.propertyName = "name";
                    vm.activeItemCount = 0;
                    /**
                     * @ngdoc property
                     * @name tenant_id
                     * @propertyOf migrationApp.controller:rsmigrationitemCtrl
                     * @type {String}
                     * @description Tenant ID of the customer
                     */
                    vm.tenant_id = authservice.getAuth().tenant_id;
                    /**
                     * @ngdoc property
                     * @name isRacker
                     * @propertyOf migrationApp.controller:rsmigrationitemCtrl
                     * @type {Boolean}
                     * @description returns true if user is not customer.
                     */
                    vm.isRacker = authservice.is_racker;
                    if(vm.type === "Files"){
                        vm.noData = true;
                        vm.loading = false;
                        return;   
                    };
                    /**
                     * @ngdoc property
                     * @name resources_retrieved
                     * @propertyOf migrationApp.controller:rsmigrationitemCtrl
                     * @type {Array}
                     * @description Set of resources retrieved during first time loading of application
                     */
                    var resources_retrieved = datastoreservice.retrieveallItems(vm.type);
                    //check if resources already retrieved

                    //if(resources_retrieved.length == 0){ -- Previous Block
                    if($window.localStorage.allServers === undefined){
                        //During first time loading of resources
                        // Retrieve all migration items of a specific type (eg: server, network etc)
                        var list = ds.getTrimmedAllItems(vm.type);
                        
                        // Retrieve migration item status
                        var status = ds.getResourceMigrationStatus(vm.tenant_id);

                        // wait for all the promises to resolve
                        $q.all([list, status]).then(function(results) {
                            if(results[0].error|| results[1].error){
                                vm.loading = false;
                                vm.loadError = true;
                                return;
                            }
                            //display 'No data found' message when API response is empty.
                            if(results[0].data.length === 0){
                                vm.noData = true;
                                vm.loading = false;
                                return;
                            }

                            var dataList = results[0].data;
                            vm.activeItemsArr = [];
                            vm.items = mapServerStatus(dataList, results[1].job_status_list);
                            //check if all the servers can be migrated else disable checkbox(to select all items) at the header of item selection table.
                            angular.forEach(vm.items, function (item) {
                                if(item.selected == true){
                                    item.selected = false;
                                }
                                if(item.canMigrate == true && item.status.toLowerCase() == 'active'){ 
                                    vm.activeItemCount++;
                                    var activeInstance = {
                                        "id":item.id,
                                        "region":item.region.toUpperCase()
                                    }
                                    vm.activeItemsArr.push(activeInstance);
                                }
                            });
                            // if(vm.type === "server")
                            //     vm.items = mapServerStatus(dataList, results[1].server_status);
                            // if(vm.type === "network")
                            //     vm.items = mapNetworkStatus(dataList, results[1].network_status);
                            // if(vm.type === "files")
                            //     vm.items = mapNetworkStatus(dataList, results[1].network_status);
                            // if(vm.type === "loadBalancers")
                            //     vm.items = mapNetworkStatus(dataList, results[1].network_status);
                            //Store all retrieved resources in factory variable
                            
                            //var savedItems = datastoreservice.getItems(vm.type); -- Previous Code
                            
                            //eligibility precheck API call
                            /*
                            ds.eligibilityPrecheck(vm.activeItemsArr)
                                .then(function (result) {
                                    if (result.error < 400){
                                        vm.loading = false;
                                        angular.forEach(result.results.instances, function (descriptions, ID) {
                                            angular.forEach(descriptions, function (instance) {
                                                var keepGoing = true;
                                                angular.forEach(vm.items, function (item) {
                                                    if(keepGoing) {
                                                        if(ID == item.id && instance.type != "success"){ 
                                                            item.canMigrate = false;
                                                            keepGoing = false;
                                                        }

                                                    };
                                                });
                                            });
                                        });
                                    } 
                                    else {
                                        vm.loading = false;
                                        //vm.loadError = true; to be enabled once precheck call is up.  
                                    }
                                });
                                */

                            var savedItems = [];
                            if($window.localStorage.selectedServers !== undefined)
                                savedItems = JSON.parse($window.localStorage.selectedServers);
                            else
                                savedItems = datastoreservice.getItems(vm.type);
                            if(savedItems.length != 0){
                                angular.forEach(vm.items, function (item) {
                                    for(var i=0;i<savedItems.length;i++){
                                        item.selected = false;
                                        if(savedItems[i].name == item.name){
                                            item.selected = true;
                                            break
                                        };
                                    };
                                });
                            };
                            datastoreservice.storeallItems(vm.items, vm.type);
                            $window.localStorage.allServers = JSON.stringify(vm.items);
                            // pagination controls
                            vm.currentPage = 1;
                            vm.pageSize = 5; // items to be displayed per page
                            vm.totalItems = vm.items.length; // number of items received.
                            vm.noOfPages = Math.ceil(vm.totalItems / vm.pageSize);
                            for(var i=1;i<=vm.noOfPages;i++){
                                vm.pageArray.push(i);
                            };    
                            vm.searchField = results[0].labels[0].field;
                            vm.labels = results[0].labels; // set table headers
                            //Store all labels in factory variable
                            datastoreservice.storeallItems(vm.labels, "label"+vm.type);
                            $window.localStorage.setItem("serverLabels",JSON.stringify(vm.labels));
                            angular.forEach(results[0].labels, function(label){
                                vm.search[label.field] = ""; // set search field variables
                            });
                            //to be removed after precheck API works fine
                            vm.loading = false;
                        }, function(error){
                            vm.loading = false;
                            vm.loadError = true;
                        });
                    } else{
                        //For repeated fetch of resources after first time loading.
                        
                        //vm.items = datastoreservice.retrieveallItems(vm.type); -- Previous Code
                        if($window.localStorage.allServers !== undefined)
                            vm.items = JSON.parse($window.localStorage.allServers);
                        else
                            vm.items = resources_retrieved;
                        angular.forEach(vm.items, function (item) {
                            if(item.canMigrate == true && item.status.toLowerCase() == 'active'){ 
                                vm.activeItemCount++;
                            }
                        });
                        // pagination controls
                        vm.currentPage = 1;
                        vm.pageSize = 5; // items per page
                        vm.totalItems = vm.items.length;
                        vm.noOfPages = Math.ceil(vm.totalItems / vm.pageSize);
                        for(var i=1;i<=vm.noOfPages;i++){
                            vm.pageArray.push(i);
                        };

                        //vm.labels = datastoreservice.retrieveallItems("label"+vm.type); // set table headers -- Previous Code
                        if($window.localStorage.serverLabels !== undefined)
                            vm.labels = JSON.parse($window.localStorage.serverLabels);
                        else
                            vm.labels = datastoreservice.retrieveallItems("label"+vm.type); // set table headers

                        vm.loading = false;
                        
                        //var servers_selected = datastoreservice.getItems(vm.type); -- Previous Code
                        var servers_selected = [];

                        if($window.localStorage.selectedServers !== undefined)
                            servers_selected = JSON.parse($window.localStorage.selectedServers);
                        else
                            servers_selected = datastoreservice.getItems(vm.type);

                        if(servers_selected.length != 0)
                            $window.localStorage.selectedServers = JSON.stringify(servers_selected);
                        if(servers_selected.length != 0){
                            angular.forEach(vm.items, function (item) {
                                for(var i=0;i<servers_selected.length;i++){
                                    item.selected = false;
                                    if(servers_selected[i].name == item.name){
                                        item.selected = true;
                                        break
                                    };
                                };
                            });
                        };
                        var count = 0;
                        angular.forEach(servers_selected, function (item_selected) {
                            count++;
                            vm.parent.addItem(item_selected, vm.type);
                        });
                        vm.isAllSelected = count === vm.activeItemCount;
                    }

                    // Setup status filters
                    vm.statusFilters = [
                        { text: "Servers", type: "ACTIVE", selected: false },
                        { text: "Networks", type: "WARNING", selected: false }
                    ];

                    vm.statusFilter = "";

                    $('#rs-main-panel').css('height','298px');
                };

                $scope.$on("ItemRemovedForChild", function(event, item){
                        if(item.type === vm.type){
                            for(var i=0; i<vm.items.length; i++) {
                                if(vm.items[i].name === item.name) vm.items[i].selected = false;
                            }
                            //item.selected = false;
                            vm.isAllSelected = false;
                        }
                });

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
                        }
                        vm.isAllSelected = count === vm.activeItemCount;
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
                        if(item.canMigrate == true && item.status.toLowerCase() == 'active') { 
                            item.selected = vm.isAllSelected;
                            vm.changeSelectAll(item, true);
                        }
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
                    vm.propertyName = item;
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
                    vm.parent.equipmentDetailsModal(type, itemdetails);
                }
                return vm;
            }]
        }); // end of component definition
})();
