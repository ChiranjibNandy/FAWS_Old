(function() {
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
                controller: ["httpwrapper", "datastoreservice", "$rootRouter", "authservice", "dashboardservice", "migrationitemdataservice", "$filter", "$interval", function(HttpWrapper, dataStoreService, $rootRouter, authservice, dashboardService, ds, $filter, $interval) {
                    var vm = this;
                    var jobList = [];
                    

                    var isValidBatch = function(batch) {
                        var valid = true;
                        angular.forEach(batch.selected_resources, function (server) {
                            angular.forEach(jobList, function (status) {
                                angular.forEach(status.instances, function (instance) {
                                    if(instance['name'] == server.name){
                                        if(instance['status'] != 'error'){
                                            valid = false;
                                        }
                                    }
                                });
                            });
                        });
                        
                        return valid;
                    };

                    vm.$onInit = function() {
                        $('title')[0].innerHTML =  "Migration Status Dashboard - Rackspace Cloud Migration";
                       
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

                    // vm.$routerOnActivate = function(next, previous) {
                    //     if(previous && previous.urlPath.indexOf("confirm") > -1){
                    //         vm.afterNewMigration = true;
                    //         vm.resourceCount = dataStoreService.getMigrationResourceCount();
                    //     } else{
                    //         vm.afterNewMigration = false;
                    //     }
                    // };

                    /**
                     * @ngdoc method
                     * @name getBatches
                     * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                     * @param {Boolean} refresh True if the batch list needs to be refreshed
                     * @description 
                     * Gets the list of all batches initiated by the current tenant
                     */
                    vm.getBatches = function(refresh) {
                        vm.loading = true;
                        var count = 0;

                        if (!vm.refreshFlag) count=6;
                        //for(var i=0; i<3; i++){
                            var intervalPromise = $interval(function(){
                                count++;
                                if(count==7) {
                                    $interval.cancel(intervalPromise);
                                    vm.refreshFlag=false;
                                }
                                vm.loading = true;
                                dashboardService.getBatches(refresh)
                                    .then(function(response) {
                                        console.log("Batch: ", response);
                                        var validCurrentBatchStatus = ["started", "error", "in progress", "scheduled"];
                                        var validCompletedBatchStatus = ["done"];
                                        jobList = response.jobs.job_status_list;
                                        var currentBatches = [];
                                        var completedBatches = [];

                                        angular.forEach(jobList, function(job){
                                            if(validCurrentBatchStatus.indexOf(job.batch_status)>=0)
                                                currentBatches.push(job);
                                            if(validCompletedBatchStatus.indexOf(job.batch_status)>=0)
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
                                        angular.forEach(vm.completedBatches.items, function(item){
                                            dataStoreService.endTime = dataStoreService.endTime ? dataStoreService.endTime : moment().unix();
                                            item.end = dataStoreService.endTime;
                                        });

                                        vm.loading = false;
                                    }, function(errorResponse) {
                                        vm.loading = false;
                                        vm.currentBatches.loadError = true;
                                        vm.completedBatches.loadError = true;
                                        console.log("Dashboard Error: ", errorResponse);
                                    });
                            }, 3000);
                        //}
                    };

                    /**
                     * @ngdoc method
                     * @name startNewMigration
                     * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                     * @description 
                     * Resets all previous resource data and helps to starts a new migration
                     */
                    vm.startNewMigration = function() {
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
                    vm.continueScheduling = function(batch) {
                        console.log(batch);

                        if(!isValidBatch(batch)){
                            $('#abort_continue').modal('show');
                            return;
                        }

                        var allData = dataStoreService.retrieveallItems('server'); 
                        angular.forEach(allData, function (server) {
                            server.selected = false;
                            angular.forEach(batch.selected_resources, function (selected) {
                                if(selected['id'] == server.id){
                                        server.selected = true;
                                }
                            });
                        }); 
                        
                        dataStoreService.storeallItems(allData,'server');
                        dataStoreService.setDontShowStatus(true);

                        if(batch.step_name === "MigrationResourceList"){
                            dataStoreService.setItems({'server': batch.selected_resources});
                        }
                        else if(batch.step_name === "MigrationRecommendation"){
                            dataStoreService.setItems({'server': batch.recommendations});
                        }
                        else if(batch.step_name === "ScheduleMigration" || batch.step_name === "ConfirmMigration"){
                            dataStoreService.setItems({'server': batch.recommendations});
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
                    vm.deleteSavedSchedule = function(batch) {
                        batch.deleting = true;
                        dataStoreService.getSavedItems()
                                        .then(function(result){
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
                }]
            }); // end of comeponent rsmigrationstatus
})();