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
     *  * {@link migrationApp.service:datastoreservice datastoreservice}
     *  * $rootRouter
     *  * {@link migrationApp.service:authservice authservice}
     *  * {@link migrationApp.service:dashboardservice dashboardservice}
     *  * {@link migrationApp.service:migrationitemdataservice migrationitemdataservice}
     *  * {@link migrationApp.service:alertsservice alertsservice}
     *  * $filter
     *  * $interval
     *  * $timeout
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
                controller: ["httpwrapper", "datastoreservice", "$rootRouter", "authservice", "dashboardservice", "migrationitemdataservice", "alertsservice", "$filter", "$interval", "$timeout", "$scope", "$route","$window","migrationService", function(HttpWrapper, dataStoreService, $rootRouter, authservice, dashboardService, ds, alertsService, $filter, $interval, $timeout, $scope, $route,$window,migrationService) {
                    var vm = this, 
                        jobList = [],
                        lastRefreshIntervalPromise,
                        totalCurrentBatches = null;

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

                var resetActionFlags = function() {
                    for(var i=0; i<vm.currentBatches.items.length; i++){
                        vm.currentBatches.items[i].showSettings = false;
                    }
                };

                vm.$onInit = function() {
                    $('body').removeClass('modal-open');
                    $('.modal-backdrop').remove();
                    vm.isRacker = authservice.is_racker;
                    $('title')[0].innerHTML =  "Migration Status Dashboard - Rackspace Cloud Migration";
                    vm.count = 0;
                    vm.is_racker = authservice.getAuth().is_racker;
                    vm.afterNewMigration = false;
                    
                    dataStoreService.setPageName("MigrationStatus");
                    $window.localStorage.setItem('pageName',"MigrationStatus");

                    if(authservice.getAuth().is_racker == false){   //get Account Name
                        var actname = dataStoreService.getAccountName(vm.tenant_id); //this service method is setting the accountname through api
                        actname.then(function() {
                            vm.currentUser = authservice.getAuth().account_name;
                        }); //waiting api promise to resolve
                    }
                    else{  //if logged in as a racker then it was sent by racker-dashboard page
                         vm.currentUser = authservice.getAuth().account_name;
                    } //end of if condition
                    vm.sortBy = {
                        current_batch: '-batch_status',
                        completed_batch: '-start'
                    };

                    document.addEventListener("click", function() {
                        vm.showQueuedBatchMenu = false;
                        $timeout(function() {
                            resetActionFlags();
                        });
                    }, true);
                };

                vm.$routerOnActivate = function(next, previous) {
                    if(previous && previous.urlPath.indexOf("confirm") > -1 && dataStoreService.selectedTime.migrationName && $window.localStorage.migrationScheduled === "true"){
                        vm.refreshFlag=true;
                        vm.afterNewMigration = true;
                        vm.resourceCount = dataStoreService.getMigrationResourceCount();
                        vm.initiatedMigration = {
                            name: dataStoreService.selectedTime.migrationName,
                            timestamp: dataStoreService.selectedTime.time
                        };
                        vm.showInitiatedMigration = true;
                    } else{
                        vm.afterNewMigration = false;
                    }
                    vm.getBatches(true);
                    vm.getAllAlerts();
                    vm.getAllTickets();
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

                /**
                 * @ngdoc property
                 * @name tickets
                 * @propertyOf migrationApp.controller:rsmigrationstatusCtrl
                 * @type {Object}
                 * @description Tickets list model
                 */
                vm.tickets = {};
                vm.tickets.items = [];
                vm.tickets.currentPage = 1;
                vm.tickets.pageSize = 3;

                /**
                 * @ngdoc property
                 * @name errors
                 * @propertyOf migrationApp.controller:rsmigrationstatusCtrl
                 * @type {Object}
                 * @description Errors list model
                 */
                vm.errors = {};
                vm.errors.items = [];
                vm.errors.currentPage = 1;
                vm.errors.pageSize = 3;

                var auth = authservice.getAuth();
                vm.userOrTenant = auth.is_racker ? "Tenant" : "User";
                vm.tenant_id = auth.tenant_id;
                vm.batchInitiatedBy = auth.username;
                vm.loading = true;
                vm.timeSinceLastRefresh = 0;
                vm.alerts = [];
                vm.loadingAlerts = true;


                /**
                 * @ngdoc method
                 * @name getTotalBatches
                 * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                 * @description
                 * Gets a total of all batches, the current and completed ones.
                 * @returns {number} The sum of current and completed batches.
                 */
                vm.getTotalBatches = function(){
                    return vm.currentBatches.items.length +
                           vm.completedBatches.items.length;
                };

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
                                //else
                                    //console.log("Batch: ", response);
                                var validCurrentBatchStatus = ["started", "error", "in progress", "scheduled", "paused"];
                                var validCompletedBatchStatus = ["done"];
                                jobList = response.jobs.job_status_list;
                                var currentBatches = [];
                                var completedBatches = [];
                                angular.forEach(jobList, function (job) {
                                    job.showRefreshForApiLoading = false;
                                    if(job.batch_name == dataStoreService.selectedTime.migrationName)
                                        vm.showInitiatedMigration =  false;
                                    if (validCurrentBatchStatus.indexOf(job.batch_status) >= 0)
                                        currentBatches.push(job);
                                    if (validCompletedBatchStatus.indexOf(job.batch_status) >= 0)
                                        completedBatches.push(job);
                                });

                                var tempSavedMigrations = [];
                                for(var j=0; j<response.savedMigrations.length; j++){
                                    var t = {};
                                    t.batch_name = response.savedMigrations[j].instance_name;
                                    t.recommendations = response.savedMigrations[j].recommendations;
                                    t["scheduling-details"] = response.savedMigrations[j]["scheduling-details"];
                                    t.selected_resources = response.savedMigrations[j].selected_resources;
                                    t.step_name = response.savedMigrations[j].step_name;
                                    t.timestamp = response.savedMigrations[j].timestamp;
                                    
                                    tempSavedMigrations.push(t);
                                }

                                var savedMigrations = $filter('orderBy')(tempSavedMigrations, '-timestamp');
                                vm.currentBatches.items = $filter('orderBy')(currentBatches, '-start').concat(savedMigrations);
                                vm.currentBatches.noOfPages = Math.ceil(vm.currentBatches.items.length / vm.currentBatches.pageSize);
                                vm.currentBatches.pages = new Array(vm.currentBatches.noOfPages);
                                
                                vm.completedBatches.items = $filter('orderBy')(completedBatches, '-start');
                                vm.completedBatches.noOfPages = Math.ceil(completedBatches.length / vm.completedBatches.pageSize);
                                vm.completedBatches.pages = new Array(vm.completedBatches.noOfPages);

                                // adjustment to show and queued migrations
                                if(totalCurrentBatches===null){
                                    totalCurrentBatches = vm.currentBatches.items.length;
                                } else if (totalCurrentBatches!==null && totalCurrentBatches < vm.currentBatches.items.length){
                                    vm.showInitiatedMigration = false;
                                }

                                // temporary fix to show completed batch date time
                                var estCompletionTime = 20 * 60; // i.e., 20 mins in milliseconds
                                var currTime = moment().unix();
                                var tempEndTime = currTime; // i.e. 5 secs before current time
                                angular.forEach(vm.completedBatches.items, function (item) {
                                    if(item.start + estCompletionTime >= currTime) {
                                        item.end = tempEndTime;
                                    } else {
                                        item.end = item.start + estCompletionTime;
                                    }
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

                /**
                 * @ngdoc method
                 * @name getAllAlerts
                 * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                 * @param {Boolean} refresh True if the alerts list needs to be refreshed
                 * @description 
                 * Gets the list of all alerts for all the migrations, if any
                 */
                vm.getAllAlerts = function(refresh) {
                    vm.loadingAlerts = true;
                    alertsService.getAllAlerts(refresh)
                                    .then(function(result) {
                                        if(result.error !==500){
                                            vm.errors.items = result || [];
                                            vm.errors.noOfPages = Math.ceil(vm.errors.items.length / vm.errors.pageSize);
                                            vm.errors.pages = new Array(vm.errors.noOfPages);
                                            vm.loadingAlerts = false;
                                        }else{
                                            vm.errors.items.length=0;
                                            vm.loadingAlerts = false;
                                        }
                                    });
                };

                /**
                 * @ngdoc method
                 * @name getAllTickets
                 * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                 * @param {Boolean} refresh True if the tickets list needs to be refreshed
                 * @description 
                 * Gets the list of all tickets, if any
                 */
                vm.getAllTickets = function(refresh) {
                    vm.loadingTickets = true;
                    alertsService.getAllTickets(refresh)
                                    .then(function(result) {
                                        vm.tickets.items = result || [];
                                        vm.tickets.noOfPages = Math.ceil(vm.tickets.items.length / vm.tickets.pageSize);
                                        vm.tickets.pages = new Array(vm.tickets.noOfPages);
                                        vm.loadingTickets = false;
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
                    dataStoreService.resourceItemsForEditingMigration.shouldTrigger = false;
                    dataStoreService.resetAll();
                    $window.localStorage.clear();
                    if($window.localStorage.selectedServers !== undefined)
                        $window.localStorage.removeItem('selectedServers');
                    // dataStoreService.setDontShowStatus(!(dataStoreService.getShowWelcomeModal()));
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
                    dataStoreService.resourceItemsForEditingMigration.shouldTrigger = false;
                    if (!isValidBatch(batch)) {
                        $('#abort_continue').modal('show');
                        return;
                    }

                    dataStoreService.setDontShowStatus(true);
                    dataStoreService.selectedTime.migrationName = batch.batch_name;
                    $window.localStorage.migrationName = batch.batch_name;
                    
                    if (batch.step_name === "MigrationResourceList") {
                        dataStoreService.setItems(batch.selected_resources);
                        $window.localStorage.setItem('selectedServers',JSON.stringify(batch.selected_resources.server));
                    } else if (batch.step_name === "MigrationRecommendation") {
                        dataStoreService.setItems(batch.recommendations);
                        $window.localStorage.setItem('selectedServers',JSON.stringify(batch.recommendations));
                    } else if (batch.step_name === "ScheduleMigration" || batch.step_name === "ConfirmMigration") {
                        dataStoreService.setItems(batch.recommendations);
                        $window.localStorage.setItem('selectedServers',JSON.stringify(batch.recommendations));
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
                                if(batch.timestamp === savedMigrations[i].timestamp && batch.batch_name === savedMigrations[i].instance_name){
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
                                    if(batch.batch_name === vm.currentBatches.items[i].batch_name){
                                        index = i;
                                        break;
                                    }
                                }
                                if(index!==-1){
                                    vm.currentBatches.items.splice(index, 1);
                                    vm.currentBatches.noOfPages = Math.ceil(vm.currentBatches.items.length / vm.currentBatches.pageSize);
                                    vm.currentBatches.pages = new Array(vm.currentBatches.noOfPages);
                                    
                                    if(vm.currentBatches.currentPage > vm.currentBatches.pages.length)
                                        vm.currentBatches.currentPage--;
                                }
                            }else{
                                batch.deleting = false;
                            }
                        });
                    };

                    /**
                     * @ngdoc method
                     * @name setSortBy
                     * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                     * @param {String} batch Possible parameters: 'current' or 'completed'
                     * @param {String} sortBy Any of the available fields inside a batch by which we need to sort
                     * @description 
                     * Sets the sort parameter for current and completed batch list
                     */
                    vm.setSortBy = function(batch, sortBy) {
                        if(vm.sortBy[batch] === sortBy && vm.sortBy[batch][0] !== "-")
                            vm.sortBy[batch] = "-" + sortBy;
                        else
                            vm.sortBy[batch] = sortBy;
                    };

                    /**
                     * @ngdoc method
                     * @name showActionList
                     * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                     * @param {Object} batch The batch object for which the menu is to be displayed
                     * @description 
                     * Resets menu for all current batches and sets it for an individual one
                     */
                    vm.showActionList = function(batch) {
                        resetActionFlags();
                        $timeout(function(){
                            batch.showSettings = true;
                        }, 50);
                    };

                    //to detect browser back click and prevent the functionality for wrong events
                    $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
                        if((oldUrl.indexOf("/migration-status") > -1) && (newUrl.indexOf("migration/confirm") > -1)){
                            event.preventDefault();
                            $('#browser_back').modal('show');
                        };
                    });

                    /**
                     * @ngdoc method
                     * @name pauseAndCancelMigration
                     * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                     * @param {Object} batch The batch object for which the menu is to be displayed
                     * @description 
                     * This function will call an api to pause,unpause and delete a "Scheduled Migration".
                     */
                    vm.pauseAndCancelMigration = function(batch,detail,isModify){
                        batch.showRefreshForApiLoading = true;
                        migrationService.pauseMigration(batch.job_id,detail).then(function(result){
                            if(result){
                                vm.getBatches(true);
                                //going to enable this as soon as cancel works
                                //if(isModify) vm.modifyMigration(batch);
                            }else{
                                batch.showRefreshForApiLoading = false;
                                if(isModify)
                                    vm.message = "We are facing some issues to cancel and modify your migration. Please try again after some time."
                                else
                                    vm.message = "We are facing some issues to "+detail+" your migration. Please try again after some time."
                                $('#error_modal').modal('show');
                            }
                        });
                    };

                    /**
                     * @ngdoc method
                     * @name modifyMigration
                     * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                     * @param {Object} batch The batch object for which the menu is to be displayed
                     * @description 
                     * This function will be able to trigger the edit migration by saving the instances details and
                     * navigating to the select resources page
                     */
                    vm.modifyMigration = function(batch){
                        dataStoreService.resourceItemsForEditingMigration.server = batch.instances;
                        dataStoreService.resourceItemsForEditingMigration.shouldTrigger = true;
                        dataStoreService.selectedTime.migrationName = batch.batch_name
                        $rootRouter.navigate(["MigrationResourceList"]);
                    };
                }]
            }); // end of comeponent rsmigrationstatus
})();