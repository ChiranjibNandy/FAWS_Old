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
                controller: ["httpwrapper", "datastoreservice", "$rootRouter", "authservice", "$filter", function(HttpWrapper, dataStoreService, $rootRouter, authservice, $filter) {
                    var vm = this;

                    /**
                     * @ngdoc property
                     * @name batches
                     * @propertyOf migrationApp.controller:rsmigrationstatusCtrl
                     * @type {Array}
                     * @description List of batch migrations initiated for the current tenant
                     */
                    vm.batches = [];

                    /**
                     * @ngdoc property
                     * @name scheduledDate
                     * @propertyOf migrationApp.controller:rsmigrationstatusCtrl
                     * @type {String}
                     * @description Date of when migration is scheduled
                     */
                    vm.scheduledDate = dataStoreService.getMigrationDate();

                    /**
                     * @ngdoc property
                     * @name scheduledTime
                     * @propertyOf migrationApp.controller:rsmigrationstatusCtrl
                     * @type {String}
                     * @description Time when migration is scheduled
                     */
                    vm.scheduledTime = dataStoreService.getMigrationTime();

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

                    vm.$routerOnActivate = function(next, previous) {
                        if(previous && previous.urlPath.indexOf("confirm") > -1){
                            vm.afterNewMigration = true;
                            vm.resourceCount = dataStoreService.getMigrationResourceCount();
                        } else{
                            vm.afterNewMigration = false;
                        }
                    };

                    // gets the list of all batches initiated by the current tenant
                    var getBatches = function() {
                        //var url = "/static/angassets/migration-status.json";
                        var tenant = authservice.getAuth().tenant_id;
                        var url = "/api/jobs/" + tenant;
                        console.log(url);

                        HttpWrapper.send(url,{"operation":'GET'})
                                .then(function(response) {
                                    console.log("Batch: ", response);
                                    var validCurrentBatchStatus = ["started", "error", "in progress", "scheduled"];
                                    var validCompletedBatchStatus = ["done"];
                                    var jobList = response.job_status_list;
                                    var currentBatches = [];
                                    var completedBatches = [];

                                    angular.forEach(jobList, function(job){
                                        if(validCurrentBatchStatus.indexOf(job.batch_status)>=0)
                                            currentBatches.push(job);
                                        if(validCompletedBatchStatus.indexOf(job.batch_status)>=0)
                                            completedBatches.push(job);
                                    });

                                    vm.currentBatches.items = $filter('orderBy')(currentBatches, '-start');
                                    vm.currentBatches.noOfPages = Math.ceil(currentBatches.length / vm.currentBatches.pageSize);
                                    vm.currentBatches.pages = new Array(vm.currentBatches.noOfPages);
                                    
                                    vm.completedBatches.items = $filter('orderBy')(completedBatches, '-start');
                                    vm.completedBatches.noOfPages = Math.ceil(completedBatches.length / vm.completedBatches.pageSize);
                                    vm.completedBatches.pages = new Array(vm.completedBatches.noOfPages);

                                    vm.loading = false;
                                }, function(errorResponse) {
                                    vm.loading = false;
                                    vm.currentBatches.loadError = true;
                                    vm.completedBatches.loadError = true;
                                    console.log("Dashboard Error: ", errorResponse);
                                });

                        // var jobApiURL = "/api/job/job-ed80806b-6983-45be-8a6e-620b5b3c97ca";
                        // HttpWrapper.send(jobApiURL,{"operation":'GET'})
                        //         .then(function(response) {
                        //             console.log("Job Details: ", response);
                        //         }, function(errorResponse) {
                        //             console.log("Job Error: ", errorResponse);
                        //         });
                    };

                    vm.$onInit = function() {
                        $('title')[0].innerHTML =  "Migration Status Dashboard - Rackspace Cloud Migration";
                        getBatches();
                    };

                    /**
                     * @ngdoc method
                     * @name getItems
                     * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                     * @description 
                     * Pauses migration of resources in this batch
                     */
                    vm.pauseBatch = function() {
                        alert("Pause migration of resources in this batch");
                    };

                    /**
                     * @ngdoc method
                     * @name cancelBatch
                     * @methodOf migrationApp.controller:rsmigrationstatusCtrl
                     * @description 
                     * Cancels migration of resources in this batch
                     */
                    vm.cancelBatch = function() {
                        alert("Cancel migration of resources in this batch");
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
                        // dataStoreService.setDontShowStatus(false);
                        $rootRouter.navigate(["MigrationResourceList"]);
                    };
                }]
            }); // end of comeponent rsmigrationstatus
})();