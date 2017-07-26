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
            controller: ["migrationitemdataservice", "datastoreservice", "serverservice", "httpwrapper", "$rootRouter", "authservice", "$q", "$scope","$window", "$filter","$timeout", function (ds, datastoreservice, ss, HttpWrapper, $rootRouter, authservice, $q, $scope,$window, $filter, $timeout) {
                var vm = this;

                /**
                 * @ngdoc method
                 * @name mapResourceStatus
                 * @methodOf migrationApp.controller:rsmigrationitemCtrl
                 * @param {Object} dataList _Object_ list of servers to displayed
                 * @param {Object} statusList _Object_ Batch report to fetch migration status of each servers.
                 * @description 
                 * Map each server with its corresponding migration status.
                 */
                var mapResourceStatus = function(dataList, statusList) {
                    angular.forEach(dataList, function (resource) {
                        var keepGoing = true;
                        resource.canMigrate = true;
                        resource.migStatus = 'error';
                        resource.eligible = 'Not Available';
                        resource.eligibiltyTests = {};
                        if(resource.rrn == undefined){
                            resource.rrn = resource.id;
                        }
                        if(resource.status == "available" || resource.status == "deployed"){
                            resource.status = "active"
                        }
                        //map status of a resource received from Batch response with respect to the resource id. 
                        angular.forEach(statusList, function (status) {
                            if(keepGoing) {
                                angular.forEach(status.instances, function (instance) {
                                    if(instance['name'] == resource.name){
                                        resource.migStatusJobId = status.job_id;
                                        if(!(status.batch_status == 'error' || status.batch_status == 'canceled' || status.batch_status == 'done')){
                                            resource.canMigrate = false;
                                            resource.migStatus = status.batch_status;
                                            keepGoing = false;
                                        }
                                    };
                                });
                            };
                        });
                    });
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
                    /**
                     * @ngdoc property
                     * @name pageArray
                     * @propertyOf migrationApp.controller:rsmigrationitemCtrl
                     * @type {Array}
                     * @description number of items to be showed per page
                     */
                    vm.pageArray = [];
                    vm.filteredArr = [];
                    vm.search = {};
                    vm.loading = true;
                    vm.checkingEligibility = {};
                    vm.loadError = false;
                    vm.itemsEligible = false;
                    vm.noData = false;
                    vm.sortingOrder = true;
                    vm.isAllselected = false;
                    // vm.disableSelectAll = false;
                    vm.reverse = false;
                    vm.propertyName = "name";
                    vm.activeItemCount = 0;
                    vm.eligCallInProgress = true;
                    vm.pageSize = 5; // items to be displayed per page
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

                    vm.parent.itemsLoadingStatus(true);
                    //check if resources already retrieved
                    if($window.localStorage.allResources === undefined){
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
                            vm.items = mapResourceStatus(dataList, results[1].job_status_list);
                            //check if all the servers can be migrated else disable checkbox(to select all items) at the header of item selection table.
                            angular.forEach(vm.items, function (item) {
                                if(item.selected == true){
                                    item.selected = false;
                                }
                                if(item.canMigrate == true && item.status.toLowerCase() == 'active'){ 
                                    vm.activeItemCount++;
                                }
                            });

                            //On page load, make eligibility call for first few available servers that are in first page of select resources page.
                            if(vm.type == 'server'){
                                vm.pageChangeEvent();
                            }
                            else{
                                vm.eligCallInProgress = false;
                            }
                            
                            var savedItems = [], savedServers = [];
                            if($window.localStorage.selectedResources !== undefined)
                                savedItems = JSON.parse($window.localStorage.selectedResources)[vm.type];

                            if(savedItems.length != 0){
                                angular.forEach(vm.items, function (item) {
                                    for(var i=0;i<savedItems.length;i++){
                                        item.selected = false;
                                        if(savedItems[i].rrn == item.rrn){
                                            item.selected = true;
                                            item.selectedMapping = savedItems[i].selectedMapping;
                                            vm.parent.addItem(item, vm.type);
                                            break
                                        };
                                    };
                                });
                            };
                            datastoreservice.storeallItems(vm.items, vm.type);
                            // pagination controls
                            vm.currentPage = 1;
                            vm.totalItems = vm.items.length; // number of items received.
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
                            // vm.parent.itemsLoadingStatus(false);
                            vm.itemsEligible = true;
                            vm.loading = false;
                        }, function(error){
                            vm.loading = false;
                            vm.loadError = true;
                        });
                    } else{
                        vm.itemsEligible = true;
                        vm.eligCallInProgress = false;
                        //For repeated fetch of resources after first time loading.
                        var allResources = JSON.parse($window.localStorage.allResources);
                        vm.items = allResources[vm.type];
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

                        if(allResources['label'+vm.type] !== undefined)
                            vm.labels = allResources['label'+vm.type];
                        else
                            vm.labels = datastoreservice.retrieveallItems("label"+vm.type); // set table headers

                        vm.loading = false;
                        vm.parent.itemsLoadingStatus(false);
                        
                        var items_selected = [];
                        if($window.localStorage.selectedResources !== undefined)
                            items_selected = JSON.parse($window.localStorage.selectedResources)[vm.type];
                        
                        if(items_selected.length != 0){
                            angular.forEach(vm.items, function (item) {
                                for(var i=0;i<items_selected.length;i++){
                                    item.selected = false;
                                    if((items_selected[i].rrn || items_selected[i].id) == (item.rrn || item.id)){
                                        item.selected = true;
                                        item.selectedMapping = items_selected[i].selectedMapping;
                                        vm.parent.addItem(item, vm.type);
                                        break
                                    };
                                };
                            });
                        } else{
                            angular.forEach(vm.items, function (item) {
                                item.selected = false;
                            });
                        }
                        var count = 0;
                        angular.forEach(items_selected, function (item_selected) {
                            count++;
                            vm.parent.addItem(item_selected, vm.type);
                        });
                        if(count){
                            vm.isAllSelected = count === vm.activeItemCount;
                        }
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
                                if(vm.items[i].rrn === item.rrn) vm.items[i].selected = false;
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
                        if((item.canMigrate == true && item.status.toLowerCase() == 'active' && item.eligibiltyTests.length) || (item.canMigrate == true && item.status.toLowerCase() == 'active' && vm.type != 'server')) { 
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
                    if(vm.type == 'server'){
                        vm.pageChangeEvent();
                    }
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
                var timeout = null;
                $scope.$watch('vm.filtervalue', function (query) {
                    vm.filteredArr = $filter("filter")(vm.items, query);
                    // pagination controls
                    vm.currentPage = 1;
                    vm.pageArray = [];
                    vm.pageSize = 5; // items to be displayed per page
                    vm.totalItems = vm.filteredArr.length; // number of items received.
                    vm.noOfPages = Math.ceil(vm.totalItems / vm.pageSize);
                    for(var i=1;i<=vm.noOfPages;i++){
                        vm.pageArray.push(i);
                    };
                    clearTimeout(timeout);
                    // Wait for user to stop typing
                    timeout = setTimeout(function () {
                        if(query && vm.filteredArr.length) vm.pageChangeEvent(vm.filteredArr); 
                    }, 2500);   
                });

                vm.eligibilityCheck = function(item, firstRun){
                    if(!firstRun){
                        vm.checkingEligibility[item.id] = true;
                        var checkEligibilityArr = [
                            {
                                "id":item.id,
                                "region":item.region.toUpperCase()
                            }
                        ];
                    }
                    else{
                        angular.forEach(item, function(server){
                            vm.checkingEligibility[server.id] = true;
                        });
                        checkEligibilityArr = item;
                    }
                    ds.eligibilityPrecheck(checkEligibilityArr)
                        .then(function (result) {
                            if (!result.error){
                                angular.forEach(result.results.instances, function (descriptions, ID) {
                                    angular.forEach(vm.items, function (item) {
                                        var keepGoing = true;
                                        angular.forEach(descriptions, function (testCase) {
                                            if(keepGoing) {
                                                if(ID == item.id && testCase.type == "success"){ 
                                                    item.canMigrate = true;
                                                    item.eligible = 'Passed';
                                                    item.eligibiltyTests = descriptions;
                                                }
                                                else if(ID == item.id && testCase.type != "success"){
                                                    item.eligible = 'Failed';
                                                    keepGoing = false;
                                                    //enable this once API works fine
                                                    item.canMigrate = false;
                                                    item.eligibiltyTests = descriptions;
                                                }

                                            };
                                        });
                                    });
                                });
                                //store eligibility test results for servers with test result as 'success'
                                $window.localStorage.eligibilityResults = JSON.stringify(vm.items.filter(item => item.eligible == 'Passed'))
                                // $window.localStorage.allServers = JSON.stringify(vm.items);
                                datastoreservice.storeallItems(vm.items, vm.type);
                                //to be enabled once precheck call is up
                                vm.parent.itemsLoadingStatus(false);
                                vm.itemsEligible = true;
                            }
                            else{
                                if(firstRun){
                                    angular.forEach(item, function(server){
                                        vm.items.filter(function(data){
                                            if(server.id == data.id){
                                                data.canMigrate = false;
                                            }
                                        });
                                    });
                                }
                                else{
                                    vm.items.filter(function(data){
                                        if(item.id == data.id){
                                            data.canMigrate = false;
                                        }
                                    });
                                }
                                datastoreservice.storeallItems(vm.items, vm.type);
                            }
                            //to be removed after eligibilty API works
                            if(firstRun){
                                angular.forEach(item, function(server){
                                    vm.checkingEligibility[server.id] = false;
                                });
                                vm.loading = false;
                                vm.parent.itemsLoadingStatus(false);
                                vm.itemsEligible = true;
                            }
                            else{
                                vm.checkingEligibility[item.id] = false;   
                            }
                            vm.eligCallInProgress = false;
                        },function(error) {
                            // vm.loading = false;
                            // vm.loadError = true; //to be enabled once precheck call is up.  
                            // return
                        });
                        
                        // });
                };

                /**
                 * @ngdoc method
                 * @name eligibilityDetails
                 * @methodOf migrationApp.controller:rsmigrationitemCtrl
                 * @description 
                 * display eligibility tests for a perticular resource.
                 */
                vm.eligibilityDetails = function(itemdetails) {
                    vm.parent.eligibilityDetailsModal(itemdetails);
                }

                //Look for page change event. 
                vm.pageChangeEvent = function(filterInput){
                    var arrForEligibilityTest = [];
                    if(!vm.filtervalue){
                        var items = vm.items.slice((vm.currentPage-1)*vm.pageSize, ((vm.currentPage-1)*vm.pageSize)+vm.pageSize)
                    }
                    else{
                        if(filterInput)
                            vm.tempfilteredArr = angular.copy(filterInput);
                        var items = vm.tempfilteredArr.slice((vm.currentPage-1)*vm.pageSize, ((vm.currentPage-1)*vm.pageSize)+vm.pageSize);
                        
                    }
                    angular.forEach(items, function(item){
                        if((item.canMigrate == true && item.status.toLowerCase() == 'active' && !item.eligibiltyTests.length && !vm.checkingEligibility[item.id]) || (item.status.toLowerCase() == 'active' && (item.migStatus == 'error' || item.migStatus == 'canceled' || item.migStatus == 'done') && !vm.checkingEligibility[item.id]) && !item.eligibiltyTests.length){
                            var storedEligibilityResults = [];
                            //Check for eligibility results stored during the current session.
                            if(!($window.localStorage.eligibilityResults == undefined || $window.localStorage.eligibilityResults == "undefined")){
                                var storedEligibilityResults = JSON.parse($window.localStorage.eligibilityResults).filter(val => val.id == item.id);
                            }
                            if(storedEligibilityResults.length){
                                item.canMigrate = true;
                                item.eligible = 'Passed';
                                item.eligibiltyTests = storedEligibilityResults[0].eligibiltyTests;
                                vm.parent.itemsLoadingStatus(false);
                            }
                            else{
                                var activeInstance = {
                                    "id":item.id,
                                    "region":item.region.toUpperCase()
                                }; 
                                arrForEligibilityTest.push(activeInstance);
                            }
                        }
                    });
                    if(arrForEligibilityTest.length)
                        vm.eligibilityCheck(arrForEligibilityTest, true);
                }

                return vm;
            }]
        }); // end of component definition
})();
