(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsmigrationstatus
     * @description
     * Component to display the _Migration Status Dashboard_ page. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/migration-status.html**.  
     *   
     * Its controller {@link migrationApp.controller:rsmigrationstatusCtrl rsmigrationstatusCtrl} uses the below services:
     *  * {@link migrationApp.service:httpwrapper httpwrapper}
     */
    angular.module("migrationApp")
            .component("rsmigrationstatus", {
                templateUrl: "/static/angtemplates/migration/migration-status.html",
                controllerAs: "vm",
                /**
                 * @ngdoc controller
                 * @name migrationApp.controller:rsmigrationstatusCtrl
                 * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsmigrationstatus rsmigrationstatus} component
                 */
                controller: ["httpwrapper", "datastoreservice", "$rootRouter", "authservice", "dashboardservice", "migrationitemdataservice", "alertsservice", "$filter", "$interval", function(HttpWrapper, dataStoreService, $rootRouter, authservice, dashboardService, ds, alertsService, $filter, $interval) {
                    var vm = this;
                    var jobList = [];
                    var lastRefreshIntervalPromise;

                var isValidBatch = function (batch) {
                    var valid = true;
                    angular.forEach(batch.selected_resources, function (item) {
                        if(item.length != 0){
                            angular.forEach(item, function (type) {
                                angular.forEach(jobList, function (status) {
                                    angular.forEach(status.instances, function (instance) {
                                        if (instance['name'] == type.name) {
                                            if (instance['status'] != 'error') {
                                                valid = false;
                                            }
                                        }
                                    });
                                });
                            });
                        };
                    });
                    return valid;
                };

                vm.$onInit = function() {
                    $('title')[0].innerHTML =  "Migration Status Dashboard - Rackspace Cloud Migration";
                    vm.count = 0;
                    vm.is_racker = authservice.getAuth().is_racker;
                    vm.sortBy = {
                        current_batch: 'start',
                        completed_batch: 'start'
                    };
                };

                vm.$routerOnActivate = function(next, previous) {
                    if(previous && previous.urlPath.indexOf("confirm") > -1){
                        vm.refreshFlag=true;
                        vm.afterNewMigration = true;
                        vm.resourceCount = dataStoreService.getMigrationResourceCount();
                    } else{
                        vm.afterNewMigration = false;
                    }
                    vm.getBatches();
                    vm.getAllAlerts();
                };

                /**
                 * @ngdoc property
                 * @name schedule
                 * @propertyOf migrationApp.controller:rsmigrationstatusCtrl
                 * @type {Object}
                 * @description Date and time of when migration is scheduled
                 */
                vm.schedule = {
                    time: dataStoreService.getMigrationDate(),
                    date: dataStoreService.getMigrationTime()
                };

                /**
                 * @ngdoc property
                 * @name resourceCount
                 * @propertyOf migrationApp.controller:rsmigrationstatusCtrl
                 * @type {Integer}
                 * @description Total count of resources to be migrated
                 */
                vm.resourceCount = 0;

                /**
                 * @ngdoc property
                 * @name currentBatches
                 * @propertyOf migrationApp.controller:rsmigrationstatusCtrl
                 * @type {Object}
                 * @description Incompleted batches model
                 */
                vm.currentBatches = {};
                vm.currentBatches.items = [];
                vm.currentBatches.currentPage = 1;
                vm.currentBatches.pageSize = 5;

                /**
                 * @ngdoc property
                 * @name completedBatches
                 * @propertyOf migrationApp.controller:rsmigrationstatusCtrl
                 * @type {Object}
                 * @description Completed batches model
                 */
                vm.completedBatches = {};
                vm.completedBatches.items = [];
                vm.completedBatches.currentPage = 1;
                vm.completedBatches.pageSize = 5;

                var auth = authservice.getAuth();
                vm.userOrTenant = auth.is_racker ? "Tenant" : "User";
                vm.tenant_id = auth.tenant_id;
                vm.currentUser = auth.account_name;
                vm.loading = true;
                vm.timeSinceLastRefresh = 0;
                vm.alerts = [];
                vm.loadingAlerts = true;

                /**
                 * @ngdoc method
                 * @name getBatches
                 * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                 * @param {Boolean} refresh True if the batch list needs to be refreshed
                 * @description 
                 * Gets the list of all batches initiated by the current tenant
                 */
                vm.getBatches = function (refresh) {
                    if (refresh){
                        vm.manualRefresh = true;
                        vm.timeSinceLastRefresh = 0;
                        $interval.cancel(lastRefreshIntervalPromise);
                    }

                    if (!vm.refreshFlag)
                        vm.count = 6;

                    var intervalPromise = $interval(function () {
                        vm.count++;
                        if (vm.count > 4) {
                            $interval.cancel(intervalPromise);
                            vm.refreshFlag = false;
                        }
                        if (!refresh)
                            vm.loading = true;

                        dashboardService.getBatches(refresh)
                            .then(function (response) {
                                if (response.error)
                                    console.log("No data recieved");
                                else
                                    console.log("Batch: ", response);

                                var validCurrentBatchStatus = ["started", "error", "in progress", "scheduled"];
                                var validCompletedBatchStatus = ["done"];
                                jobList = response.jobs.job_status_list;
                                var currentBatches = [];
                                var completedBatches = [];
                                angular.forEach(jobList, function (job) {
                                    if (validCurrentBatchStatus.indexOf(job.batch_status) >= 0)
                                        currentBatches.push(job);
                                    if (validCompletedBatchStatus.indexOf(job.batch_status) >= 0)
                                        completedBatches.push(job);
                                });
                                var savedMigrations = $filter('orderBy')(response.savedMigrations, '-timestamp');
                                vm.currentBatches.items = $filter('orderBy')(currentBatches, '-start').concat(savedMigrations);
                                vm.currentBatches.noOfPages = Math.ceil(vm.currentBatches.items.length / vm.currentBatches.pageSize);
                                vm.currentBatches.pages = new Array(vm.currentBatches.noOfPages);

                                vm.completedBatches.items = $filter('orderBy')(completedBatches, '-start');
                                vm.completedBatches.noOfPages = Math.ceil(completedBatches.length / vm.completedBatches.pageSize);
                                vm.completedBatches.pages = new Array(vm.completedBatches.noOfPages);

                                // temporary fix to show completed batch date time
                                angular.forEach(vm.completedBatches.items, function (item) {
                                    dataStoreService.endTime = dataStoreService.endTime ? dataStoreService.endTime : moment().unix();
                                    item.end = dataStoreService.endTime;
                                });

                                vm.loading = false;
                                vm.manualRefresh = false;
                                lastRefreshIntervalPromise = $interval(function(){
                                    vm.timeSinceLastRefresh++;
                                }, 60000);
                            }, function (errorResponse) {
                                vm.loading = false;
                                vm.currentBatches.loadError = true;
                                vm.completedBatches.loadError = true;
                                console.log("Dashboard Error: ", errorResponse);
                            });
                    }, 3000);
                };

                vm.getAllAlerts = function(refresh) {
                    vm.loadingAlerts = true;
                    alertsService.getAllAlerts(refresh)
                                    .then(function(result) {
                                        vm.alerts = result;
                                        vm.loadingAlerts = false;
                                    });
                };

                /**
                 * @ngdoc method
                 * @name startNewMigration
                 * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                 * @description 
                 * Resets all previous resource data and helps to starts a new migration
                 */
                vm.startNewMigration = function () {
                    dataStoreService.resetAll();
                    $rootRouter.navigate(["MigrationResourceList"]);
                };

                /**
                 * @ngdoc method
                 * @name continueScheduling
                 * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                 * @param {Object} batch The batch that needs to be scheduled
                 * @description 
                 * Initiates scheduling of migration for a saved migration
                 */
                vm.continueScheduling = function (batch) {
                    console.log(batch);

                    if (!isValidBatch(batch)) {
                        $('#abort_continue').modal('show');
                        return;
                    }

                    //var allData = dataStoreService.retrieveallItems();
                    // angular.forEach(allData, function (items_type) {
                    //     if(items_type.length != 0){
                    //         angular.forEach(items_type, function (item) {
                    //             item.selected = false;
                    //             angular.forEach(batch.selected_resources, function (batch_item_type) {
                    //                 if(batch_item_type.length != 0){
                    //                     angular.forEach(batch_item_type, function (selected) {
                    //                         if (selected['id'] == item.id) {
                    //                             item.selected = true;
                    //                         }
                    //                     });
                    //                 };
                    //             });
                    //         });
                    //     }
                    // });

                    //dataStoreService.storeallItems(allData.server, 'server');
                    //dataStoreService.storeallItems(allData.LoadBalancers, 'LoadBalancers');
                    dataStoreService.setDontShowStatus(true);
                    dataStoreService.selectedTime.migrationName = batch.instance_name;
                    //console.log("batch details: "+JSON.stringify(batch.selected_resources));
                    if (batch.step_name === "MigrationResourceList") {
                        dataStoreService.setItems(batch.selected_resources);
                    } else if (batch.step_name === "MigrationRecommendation") {
                        dataStoreService.setItems(batch.recommendations);
                    } else if (batch.step_name === "ScheduleMigration" || batch.step_name === "ConfirmMigration") {
                        dataStoreService.setItems(batch.recommendations);
                        dataStoreService.selectedTime = batch["scheduling-details"];
                    }

                    $rootRouter.navigate([batch.step_name]);
                };

                /**
                 * @ngdoc method
                 * @name deleteSavedSchedule
                 * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                 * @param {Object} batch The unsheduled saved batch that needs to be deleted
                 * @description 
                 * Deletes a saved unscheduled migration
                 */
                vm.deleteSavedSchedule = function (batch) {
                    batch.deleting = true;
                    dataStoreService.getSavedItems()
                        .then(function (result) {
                            var savedMigrations = JSON.parse(result.savedDetails || '[]');

                            // remove from server
                            var index = -1;
                            for(var i=0; i<savedMigrations.length; i++){
                                if(batch.timestamp === savedMigrations[i].timestamp && batch.instance_name === savedMigrations[i].instance_name){
                                    index = i;
                                    break;
                                }
                            }
                            index!==-1 && savedMigrations.splice(index, 1);
                            result.savedDetails = JSON.stringify(savedMigrations);
                            
                            if(dataStoreService.postSavedInstances(result)){
                                // remove from local
                                index = -1;
                                for(var i=0; i<vm.currentBatches.items.length; i++){
                                    if(batch.instance_name === vm.currentBatches.items[i].instance_name){
                                        index = i;
                                        break;
                                    }
                                }
                                index!==-1 && vm.currentBatches.items.splice(index, 1);
                            }else{
                                batch.deleting = false;
                            }
                        });
                    };

                    vm.setSortBy = function(batch, sortBy) {
                        if(vm.sortBy[batch] === sortBy && vm.sortBy[batch][0] !== "-")
                            vm.sortBy[batch] = "-" + sortBy;
                        else
                            vm.sortBy[batch] = sortBy;
                    };
                }]
            }); // end of comeponent rsmigrationstatus
})();