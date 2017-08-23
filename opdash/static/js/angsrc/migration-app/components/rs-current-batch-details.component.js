(function () {
    "use strict";
    /**
    * @ngdoc object
    * @name migrationApp.object:rscurrentbatchdetails
    * @description
    * Component to display the details of a batch migration which is in progress. This component is loaded directly on route change.
    *
    * This component uses the template: **angtemplates/migration/batch-current.html**.
    *
    * Its controller {@link migrationApp.controller:rscurrentbatchdetailsCtrl rscurrentbatchdetailsCtrl} uses the below services:
    * $rootRouter
    * {@link migrationApp.service:migrationitemdataservice migrationitemdataservice}
    * {@link migrationApp.service:dashboardservice dashboardservice}
    * {@link migrationApp.service:authservice authservice}
    * {@link migrationApp.service:alertsservice alertsservice}
    */
    angular.module("migrationApp")
        .component("rscurrentbatchdetails", {
            transclude: true,
            templateUrl: "/static/angtemplates/migration/current-batch-details.html",
            controllerAs: "vm",
            /**
            * @ngdoc controller
            * @name migrationApp.controller:rscurrentbatchdetailsCtrl
            * @description Controller to handle all view-model interactions of {@link migrationApp.object:rscurrentbatchdetails rscurrentbatchdetails} component
            */
            controller: ["$rootRouter", "migrationitemdataservice", "dashboardservice", "authservice", "alertsservice", "$interval", "$scope", "httpwrapper", "$q", "$window", function ($rootRouter, ds, dashboardService, authservice, alertsService, $interval, $scope, HttpWrapper, $q, $window) {
                var vm = this;
                var job_id;
                var lastRefreshIntervalPromise;

                vm.timeSinceLastRefresh = 0;
                vm.progressFlag = false;

                /**
                * @ngdoc method
                * @name getBatchDetails
                * @methodOf migrationApp.controller:rscurrentbatchdetailsCtrl
                * @param {Boolean} refresh True if the batch list needs to be refreshed
                * @description
                * Gets details of a job
                */
                vm.getBatchDetails = function (refresh) {
                    if (refresh) {
                        vm.manualRefresh = true;
                        vm.timeSinceLastRefresh = 0;
                        $interval.cancel(lastRefreshIntervalPromise);
                    } else {
                        vm.loading = true;
                        vm.manualRefresh = false;
                    }
                    vm.getAllAlerts(true,vm.job_id);
                    vm.getAllBatchTasks(vm.job_id);
                    dashboardService.getCurrentBatcheForJobId(vm.job_id)
                        .then(function (job) {
                            vm.job = job;

                            if (job.batch_status === 'in progress' || job.batch_status === 'done')
                                //Makes a promise to fetch the progress API details for in progress and completed batches
                                var promise = HttpWrapper.send('/api/jobs/' + job.job_id + '/progress', { "operation": 'GET' });
                            //Once the promise is resolved, proceed with rest of the items
                            $q.all([promise])
                                .then(function (result) {
                                    //If the job status is not in progress, promise resolves to undefined
                                    if (result[0] !== undefined) {
                                        //Create a property that would hold the progress detail for in progress and completed batches
                                        if (result[0].succeeded_by_time_pct !== undefined) {
                                            //Set the progress flag to true to indicate the batch holds the progress call results
                                            vm.progressFlag = true;
                                            job.batch_succeeded_time_pct = result[0].succeeded_by_time_pct;
                                            if(result[0].instances)
                                                for (var key in result[0].instances.resources) {
                                                    angular.forEach(job.instances, function (instance) {
                                                        if (instance.id === key) {
                                                            instance.instance_succeeded_time_pct = result[0].instances.resources[key].succeeded_by_time_pct;
                                                        }
                                                    });
                                                }
                                            if(result[0].volumes)
                                                for (var key in result[0].volumes.resources) {
                                                    angular.forEach(job.volumes, function (volume) {
                                                        if (volume.id === key) {
                                                            volume.volume_succeeded_time_pct = result[0].volumes.resources[key].succeeded_by_time_pct;
                                                        }
                                                    });
                                                }
                                            if(result[0].cdn) 
                                                for (var key in result[0].cdn.resources) {
                                                    angular.forEach(job.cdn, function (cdn) {
                                                        if (cdn.id === key) {
                                                            cdn.cdn_succeeded_time_pct = result[0].cdn.resources[key].succeeded_by_time_pct;
                                                        }
                                                    });
                                                }  
                                           if(result[0].file) 
                                                for (var key in result[0].file.resources) {
                                                    angular.forEach(job.file, function (file) {
                                                        if (file.id === key) {
                                                            file.file_succeeded_time_pct = result[0].file.resources[key].succeeded_by_time_pct;
                                                        }
                                                    });
                                                }                                            
                                            if (result[0].networks)
                                                job.network_succeeded_by_time_pct = result[0].networks.succeeded_by_time_pct;
                                        }
                                        else if (result[0].succeeded_by_time_pct === undefined) {
                                            vm.progressFlag = true;
                                            job.batch_succeeded_time_pct = 0;
                                        }
                                    } else {
                                        //If no progress API call was made for the batch, set the flag to false
                                        vm.progressFlag = false;
                                    }
                                    vm.job = job;
                                    $window.localStorage.setItem('batch_job_status', job.batch_status);
                                    vm.loading = false;
                                    vm.manualRefresh = false;
                                    lastRefreshIntervalPromise = $interval(function () {
                                        vm.timeSinceLastRefresh++;
                                    }, 60000);
                                }, function (errorResponse) {
                                    //job.succeeded_time_pct = 0;
                                    //Create a flag that indicates something has gone wrong while fetching progress API details
                                    vm.progressFlag = false;
                                });
                        }, function (errorResponse) {
                            vm.loading = false;
                            vm.loadError = true;
                        });
                };

                vm.$onInit = function () {
                    var auth = authservice.getAuth();
                    vm.isRacker = authservice.is_racker;
                    vm.tenant_id = auth.tenant_id;
                    vm.currentUser = auth.account_name;
                    vm.sortBy = {
                        server: 'name',
                        network: 'name'
                    };
                    vm.alerts = [];
                    vm.loadingAlerts = true;
                    vm.batchTasks = [];
                    vm.loadingBatchTasks = true;
                    vm.job = [];
                    vm.loading = true;
                    vm.manualRefresh = false;
                    vm.job_id = '';
                };

                vm.$routerOnActivate = function (next, previous) {
                    vm.job_id = next.params.job_id;
                    vm.getBatchDetails();
                };

                vm.getAllBatchTasks = function (job_id) {
                    dashboardService.getBatchTasks(job_id).then(function (result) {
                        if (result) {
                            vm.loadingBatchTasks = false;
                            for (var i = 0; i < result["job-tasks"].length; i++) {
                                if (result["job-tasks"][i].section === "start_workflow") {
                                    vm.batchTasks = result["job-tasks"][i].tasks;
                                    break;
                                }
                            }
                        } else {
                            vm.loadingBatchTasks = true;
                        }
                    });
                };

                /**
                * @ngdoc method
                * @name equipmentDetails
                * @methodOf migrationApp.controller:rscurrentbatchdetailsCtrl
                * @param {String} type Resource type
                * @param {Object} item Resource
                * @description
                * Fetches resource details for a given resource type and id
                */
                vm.equipmentDetails = function (type, item) {
                    var id = item.id;
                    var region = item.source_region || item.name;
                        ds.getTrimmedItem(type, id, region)
                        .then(function (response) {
                            var details = response;
                            vm.itemType = type;
                            vm.itemDetails = details;
                            $("#resource_info").modal("show");
                        });
                };

                /**
                * @ngdoc method
                * @name setSortBy
                * @methodOf migrationApp.controller:rscurrentbatchdetailsCtrl
                * @param {String} batch Any of the resource types available
                * @param {String} sortBy Any of the available fields of a resource by which we need to sort
                * @description
                * Sets the sort parameter for a given resource type
                */
                vm.setSortBy = function (resourceType, sortBy) {
                    if (vm.sortBy[resourceType] === sortBy && vm.sortBy[resourceType][0] !== "-")
                        vm.sortBy[resourceType] = "-" + sortBy;
                    else
                        vm.sortBy[resourceType] = sortBy;
                };
                //event fired for direct url jumping or hitting...
                $scope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
                    if ((oldUrl != undefined) && ((newUrl.indexOf("migration/recommendation") > -1)) || (newUrl.indexOf("migration/resources") > -1) || (newUrl.indexOf("migration/confirm") > -1)) {
                        event.preventDefault();
                        $rootRouter.navigate(["MigrationStatus"]);
                    }
                });
                /**
                * @ngdoc method
                * @name getAllAlerts
                * @methodOf migrationApp.controller:rscurrentbatchdetailsCtrl
                * @param {Boolean} refresh True if the alerts list needs to be refreshed
                * @description
                * Gets the list of all alerts for all the migrations, if any
                */
                vm.getAllAlerts = function (refresh,job_id) {
                    vm.loadingAlerts = true;
                    var tempAlerts = [];
                    alertsService.getAllAlerts(refresh,job_id)
                        .then(function (result) {
                            if (result.error !== 500) {
                                for (var i = 0; i < result.length; i++)
                                    if (job_id === result[i].job_id)
                                        tempAlerts.push(result[i]);

                                vm.alerts = tempAlerts;
                                vm.loadingAlerts = false;
                            } else {
                                vm.alerts.length = 0;
                                vm.loadingAlerts = false;
                            }
                        });
                };

                vm.saveResourceDetailsRouteParams = function(resource,type){
                    $window.localStorage.setItem('resource_status',(resource.status.state || resource.status));
                    $window.localStorage.setItem('resource_name',resource.name);
                    $window.localStorage.setItem('resource_batch_name',vm.job.batch_name);
                    $rootRouter.navigate(["ResourceTaskList", {
                        job_id: vm.job.job_id,
                        resource_id:resource.id,
                        resource_type:type
                    }]);
                };

            }
            ]
        }); // end of component rscurrentbatchdetails
})();
