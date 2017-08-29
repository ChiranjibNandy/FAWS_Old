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
                controller: ["httpwrapper", "datastoreservice", "$rootRouter", "authservice", "dashboardservice", "migrationitemdataservice", "alertsservice", "$filter", "$interval", "$timeout", "$scope", "$route","$window","migrationService","$q", function(HttpWrapper, dataStoreService, $rootRouter, authservice, dashboardService, ds, alertsService, $filter, $interval, $timeout, $scope, $route,$window,migrationService,$q) {
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
                                    for (var key in status){
                                        if(typeof(status[key]) == "object" && status[key].length && key != "metadata"){
                                            angular.forEach(status[key], function (equipment) {
                                                if (equipment['id'] == type.rrn) {
                                                    if(!(status.batch_status == 'error' || status.batch_status == 'canceled' || status.batch_status == 'done')){
                                                        valid = false;
                                                    }
                                                }
                                            });
                                        };
                                    };
                                });
                            });
                        };
                    });
                    return valid;
                };

                var isValidAccount = function(batch) {
                    var valid = false;
                    vm.fawsAccountDetails = JSON.parse($window.localStorage.getItem("fawsAccounts"));
                    if(vm.fawsAccountDetails == null){
                        valid = false;
                    }
                    else{
                        var fawsTobeSelected = vm.fawsAccountDetails.awsAccounts.filter(x => x["name"]=== batch.aws_account.trim());
                        if(fawsTobeSelected.length > 0){
                            valid = true;
                            vm.fawsAccountDetails.selectedFawsAccount = fawsTobeSelected[0].name;
                            vm.fawsAccountDetails.selectedFawsAccountNumber = fawsTobeSelected[0].awsAccountNumber;
                            dataStoreService.saveFawsDetails(vm.fawsAccountDetails); //save in localstorage for future
                        }
                        else{
                            valid = false; 
                        }
                    }
                    
                    return valid;
                };

                var resetActionFlags = function() {
                    for(var i=0; i<vm.currentBatches.items.length; i++){
                        vm.currentBatches.items[i].showSettings = false;
                    }
                };

                vm.$onInit = function() {
                    vm.counter = 60;
                    $('body').removeClass('modal-open');
                    $('.modal-backdrop').remove();
                    vm.isRacker = authservice.is_racker;
                    $('title')[0].innerHTML =  "Migration Status Dashboard - Rackspace Cloud Migration";
                    vm.count = 0;
                    vm.autoRefreshEveryMinute = false;
                    vm.timerOn = false;
                    vm.savedMigrations = [];
                    vm.is_racker = authservice.getAuth().is_racker;
                    vm.afterSavedMigration = $window.localStorage.getItem("migrationSaved");
                    vm.afterNewMigration = false;
                    //getting the migration name.
                    vm.migrationName = dataStoreService.getScheduleMigration().migrationName;
                    dataStoreService.getScheduleMigration().migrationName = "";
                    dataStoreService.setPageName("MigrationStatus");
                    $window.localStorage.setItem('pageName',"MigrationStatus");
                    if(dashboardService.getAutoRefreshStatus() === null){
                        vm.autoRefreshText = "ON" ;
                        dashboardService.storeAutoRefreshStatus(vm.autoRefreshText);
                    }else{
                        vm.autoRefreshText = dashboardService.getAutoRefreshStatus() ;
                        vm.autoRefreshButton = vm.autoRefreshText === 'ON'?false:true;
                    }
                    vm.currentUser = authservice.account_name; //get Account Name
                   
                    vm.sortBy = {
                        completed_batch: '-start',
                        error_batch:'-timestamp',
                        ticket_batch:'-created'
                    };

                    document.addEventListener("click", function() {
                        vm.showQueuedBatchMenu = false;
                        $timeout(function() {
                            resetActionFlags();
                        });
                    }, true);

                   vm.getAllTickets();
                   var element = document.getElementsByClassName('custom-sort-a');
                   for(var i = 0; i < element.length; i++)
                    {
                        element[i].classList.remove('rs-table-sort');
                        element[i].classList.add('rs-table-sort-desc');
                    }
                };

                vm.$routerOnActivate = function(next, previous) {
                    if(previous && previous.urlPath.indexOf("confirm") > -1 && dataStoreService.getScheduleMigration().migrationName && $window.localStorage.migrationScheduled === "true"){
                        vm.refreshFlag=true;
                        vm.afterNewMigration = true;
                        vm.resourceCount = dataStoreService.getMigrationResourceCount();
                        vm.initiatedMigration = {
                            name: dataStoreService.getScheduleMigration().migrationName,
                            timestamp: dataStoreService.getScheduleMigration().time
                        };
                        vm.showInitiatedMigration = true;
                    } else{
                        vm.afterNewMigration = false;
                    }
                    vm.getBatches(true);
                    vm.onTimeout();
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
                    time: dataStoreService.getMigrationTime(),
                    date: dataStoreService.getMigrationDate()
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
                vm.tempBatchInitiatedBy = auth.username;
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
                    var self = this;
                    vm.loading = true;
                    dashboardService.getBatches(refresh)
                        .then(function (response) {
                            if (response && response.error == undefined){
                                var validCurrentBatchStatus = ["started", "error", "in progress", "scheduled", "paused"];
                                var validCompletedBatchStatus = ["done","canceled"];
                                jobList = response.jobs.job_status_list;
                                var tempcurrentBatches = [];
                                vm.nonSavedMigrations = [];
                                var completedBatches = [];
                                var currentBatches = [];
                                angular.forEach(jobList, function (job) {
                                    job.showRefreshForApiLoading = false;
                                    if(job.metadata.batch_name == dataStoreService.selectedTime.migrationName){
                                        vm.showInitiatedMigration =  false;
                                    }
                                    if (validCurrentBatchStatus.indexOf(job.batch_status) >= 0){
                                        tempcurrentBatches.push(job);
                                    }
                                    if (validCompletedBatchStatus.indexOf(job.batch_status) >= 0)
                                        completedBatches.push(job);
                                        job.completed_at = vm.convertUTCDateToLocalDate(new Date(job.completed_at));
                                });
                        //Create an empty array that would hold the current batch details with a few newly assigned properties for paused and in progress batches
                        var migrationProgress = tempcurrentBatches.filter(x=>x.batch_status=='started').concat(tempcurrentBatches.filter(x=>x.batch_status=='in progress'));//.concat(tempcurrentBatches.filter(x=>x.batch_status=='paused'));
                        var promises = migrationProgress.map(function(batch){
                            return HttpWrapper.send('/api/jobs/'+batch.job_id+'/progress', { "operation": 'GET' })
                            .then(function(result) {
                                if(result.succeeded_by_time_pct !== undefined)
                                    batch.succeeded_time_pct = result.succeeded_by_time_pct;
                                else if(result.succeeded_by_time_pct === undefined)
                                    batch.succeeded_time_pct = 0;
                            },function(errorResponse) {
                                batch.succeeded_time_pct = 0;
                                batch.progressFlag = "NA";
                            });
                        });
                        //Once the promise is resolved, proceed with rest of the items
                        $q.all(promises).then(function(){
                            //Restructure the array so that the custom sorting order is maintained while displaying the batches on page load
                            currentBatches = migrationProgress.concat(tempcurrentBatches.filter(x=>x.batch_status=='paused')).concat(tempcurrentBatches.filter(x=>x.batch_status=='scheduled')).concat(tempcurrentBatches.filter(x=>x.batch_status=='canceled')).concat(tempcurrentBatches.filter(x=>x.batch_status=='error'));
                            var tempSavedMigrations = [];
                            vm.savedMigrations = response.savedMigrations;
                            for(var j=0; j<response.savedMigrations.length; j++){
                                var details = JSON.parse(response.savedMigrations[j].savedDetails);
                                if(!details[0].scheduledItem){
                                    for(var k=0; k<details.length; k++){
                                        tempSavedMigrations.push(vm.prepareObjForSaved(details[k],response.savedMigrations[j].save_id));
                                    }
                                }else{
                                    for(var k=0; k<details.length; k++){
                                        vm.nonSavedMigrations.push(vm.prepareObjForSaved(details[k],response.savedMigrations[j].save_id));
                                    }
                                }
                            }
                            var savedMigrations = $filter('orderBy')(tempSavedMigrations, '-timestamp');
                            vm.currentBatches.items = currentBatches.concat(savedMigrations);//$filter('orderBy')(currentBatches, '-start').concat(savedMigrations);
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
                            vm.fawsAccountDetails = JSON.parse($window.localStorage.getItem("fawsAccounts"));
                            if (vm.fawsAccountDetails === null){
                                dataStoreService.getFawsAccounts() ///make api call to retrieve list of FAWS account for this tenant ID
                                .then(function (result) {
                                    vm.loading = false;
                                });
                            }
                            else{
                                vm.loading = false;
                            }
                            vm.manualRefresh = false;
                            lastRefreshIntervalPromise = $interval(function(){
                                vm.timeSinceLastRefresh++;
                            }, 60000);
                        });
                    }}, function (errorResponse) {
                        vm.loading = false;
                        vm.currentBatches.loadError = true;
                        vm.completedBatches.loadError = true;
                    });
                    if(!vm.autoRefreshEveryMinute){
                        vm.autoRefreshEveryMinute = true;
                        vm.intervalPromise = $interval(function () {   
                            if(dataStoreService.getPageName() === 'MigrationStatus' && vm.autoRefreshText === "ON"){
                                vm.getBatches(true);
                                vm.onTimeout();
                            }                 
                        }, 60000);
                    }        
                };

                /**
                 * @ngdoc property
                 * @name manageAutoRefresh
                 * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                 * @description This function helps to enable and disable the auto refresh.
                 */
                vm.manageAutoRefresh = function(){
                    if(vm.autoRefreshText === "ON"){
                       vm.autoRefreshText = "OFF"; 
                       vm.autoRefreshEveryMinute = true;
                       vm.autoRefreshButton = true;
                       $interval.cancel(vm.intervalPromise);
                    }else{
                       vm.autoRefreshText = "ON"; 
                       vm.autoRefreshEveryMinute = false;
                       vm.autoRefreshButton = false;
                       vm.onTimeout();
                       vm.counter = 60;
                       vm.getBatches(true);
                    }
                    dashboardService.storeAutoRefreshStatus(vm.autoRefreshText);
                };

                /**
                 * @ngdoc property
                 * @name onTimeout
                 * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                 * @description This function helps to enable and disable the auto refresh.
                 */
                vm.onTimeout = function(){
                    if(vm.mytimeout)
                        $interval.cancel(vm.mytimeout);

                    if(vm.autoRefreshText === "ON") {
                        vm.mytimeout = $interval(function() {
                            if(vm.counter===0)
                                vm.counter = 59;
                            vm.counter--;
                        },1000);
                    } 
                }

                /**
                 * @ngdoc method
                 * @name convertUTCDateToLocalDate
                 * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                 * @description 
                 * This Function helps to convert utc date time to local date time and will be used for converting completed batches time.
                 */
                vm.convertUTCDateToLocalDate = function(date) {
                    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);
                    var offset = date.getTimezoneOffset() / 60;
                    var hours = date.getHours();
                    newDate.setHours(hours - offset);
                    return newDate;   
                }

                /**
                 * @ngdoc method
                 * @name prepareObjForSaved
                 * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                 * @param {Boolean} refresh True if the alerts list needs to be refreshed
                 * @description 
                 * It prepares the object for saved instance . 
                 */
                vm.prepareObjForSaved = function(details,save_id){
                    var t = {};
                    t.save_id = save_id;
                    t.batch_name = details.instance_name;
                    t.recommendations = details.recommendations;
                    t["scheduling-details"] = details["scheduling-details"];
                    t.selected_resources = details.selected_resources;
                    t.step_name = details.step_name;
                    t.timestamp = details.timestamp;
                    t.aws_account = details["aws-account"] || "";
                    t.initiated_by = details.initiated_by;
                    t.scheduledItem = details.scheduledItem || false;
                    t.schedulingTimeDate = details.schedulingTimeDate;
                        
                    return t;
                }

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
                    var statusFlag = true;
                    alertsService.getAllTickets(refresh,statusFlag)
                                    .then(function(result) {
                                        if(result){
                                            vm.tickets.items = result || [];
                                            vm.tickets.noOfPages = Math.ceil(vm.tickets.items.length / vm.tickets.pageSize);
                                            vm.tickets.pages = new Array(vm.tickets.noOfPages);
                                        }else{
                                            vm.tickets.items = []
                                        }
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
                    dataStoreService.setResourceItemsForEditingMigration(false);
                    dataStoreService.resetAll();
                    dataStoreService.storeEligibilityResults($window.localStorage.eligibilityResults);
                    var autoRefreshButtonStatus = dashboardService.getAutoRefreshStatus();
                    $window.localStorage.clear();
                    dashboardService.storeAutoRefreshStatus(autoRefreshButtonStatus);
                    $window.localStorage.eligibilityResults = dataStoreService.retrieveEligibilityResults();
                    if($window.localStorage.selectedResources !== undefined)
                        $window.localStorage.removeItem('selectedResources');
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
                vm.continueScheduling = function (batch,modifyFlag) {
                    var autoRefreshButtonStatus = dashboardService.getAutoRefreshStatus();
                    $window.localStorage.clear();
                    dashboardService.storeAutoRefreshStatus(autoRefreshButtonStatus);
                    if(modifyFlag){
                        for(var i = 0; i<vm.nonSavedMigrations.length;i++){
                            var details = vm.nonSavedMigrations[i];
                            if(batch.metadata.batch_name === details.batch_name && details.scheduledItem){
                                dataStoreService.setJobIdForMigration({jobId:batch.job_id,saveId:vm.nonSavedMigrations[i].save_id});
                                batch = details;
                                break;
                            }
                        }
                        dataStoreService.setResourceItemsForEditingMigration(true);
                    } 
                    else{
                        dataStoreService.setResourceItemsForEditingMigration(false);
                    } 
                    
                    if (!modifyFlag && !isValidBatch(batch)) {
                        $('#abort_continue').modal('show');
                        return;
                    }
                    if(!modifyFlag && !isValidAccount(batch)) {
                        $('#aws_check').modal('show');
                        return;
                    }
                    if(batch.schedulingTimeDate){
                        dataStoreService.storeDate('date',batch.schedulingTimeDate.date);
                        dataStoreService.storeDate('time',batch.schedulingTimeDate.time);
                        dataStoreService.storeDate('timezone',batch.schedulingTimeDate.timezone);
                    }
                    dataStoreService.setDontShowStatus(true);
                    dataStoreService.selectedTime.migrationName = batch.batch_name || batch.instance_name;
                    //$window.localStorage.migrationName = batch.batch_name || batch.instance_name;
                    dataStoreService.setSaveItems(batch.selected_resources);
                    $window.localStorage.setItem('savedServers',JSON.stringify(batch.selected_resources.server));
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
                    dataStoreService.deleteSavedInstances(batch.save_id)
                        .then(function(result){
                            if(result){
                                vm.getBatches(true);
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
                        //Loop through the jQuery Elements array and then unbnd the hover function call from the completed batch headers once they get clicked
                        $('.secondary-table > thead > tr > th').each(function(i, obj) {
                            $(this).unbind('mouseenter').unbind('mouseleave')
                        });
                        
                        var element = document.getElementsByClassName('custom-sort-a');
                        for(var i = 0; i < element.length; i++)
                        {
                            element[i].classList.remove('rs-table-sort-desc');
                        }                        
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
                        //condition for direct url jumping or hitting...
                        if((oldUrl != undefined) && ((newUrl.indexOf("migration/resources") > -1)) || (newUrl.indexOf("migration/recommendation") > -1)){
                            event.preventDefault();
                            $rootRouter.navigate(["MigrationStatus"]);
                        }

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
                                if(detail === 'cancel'){
                                    for(var i = 0;i<vm.currentBatches.items.length;i++){
                                        if(batch.job_id === vm.currentBatches.items[i].job_id){
                                            vm.currentBatches.items.splice(i,1);
                                            return;
                                        }
                                    }
                                }
                                batch.batch_status = detail==='pause'? 'paused':'scheduled';
                                batch.showRefreshForApiLoading = false;
                            }else{
                                batch.showRefreshForApiLoading = false;
                                vm.message = "We encountered some issues to "+detail+" your migration. Please try again after some time."
                                $('#error_modal').modal('show');
                            }
                        });
                    };

                    vm.resetSavedMigrationFlag = function(){
                        vm.afterSavedMigration = false;
                        $window.localStorage.setItem("migrationSaved","false");
                    }
                }]
            }); // end of comeponent rsmigrationstatus
})();

