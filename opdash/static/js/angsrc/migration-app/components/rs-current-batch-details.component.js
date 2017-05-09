(function() {
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
            controller: ["$rootRouter", "migrationitemdataservice", "dashboardservice", "authservice", "alertsservice", "$interval", function($rootRouter, ds, dashboardService, authservice, alertsService, $interval){
                var vm = this;
                var job_id;
                var lastRefreshIntervalPromise;

                vm.timeSinceLastRefresh = 0;

                /**
                 * @ngdoc method
                 * @name getBatchDetails
                 * @methodOf migrationApp.controller:rscurrentbatchdetailsCtrl
                 * @param {Boolean} refresh True if the batch list needs to be refreshed
                 * @description 
                 * Gets details of a job
                 */
                vm.getBatchDetails = function(refresh) {
                    if(refresh){
                        vm.manualRefresh = true;
                        vm.timeSinceLastRefresh = 0;
                        $interval.cancel(lastRefreshIntervalPromise);
                    }else{
                        vm.loading = true;
                    }

                    dashboardService.getBatches(refresh)
                            .then(function(response) {
                                var job = response.jobs.job_status_list.find(function(job) {
                                    return job.job_id === job_id;
                                });
                                vm.job = job;
                                vm.loading = false;
                                vm.manualRefresh = false;
                                lastRefreshIntervalPromise = $interval(function(){
                                    vm.timeSinceLastRefresh++;
                                }, 60000);
                            }, function(errorResponse) {
                                vm.loading = false;
                                vm.loadError = true;
                            });
                };

                vm.$onInit = function(){
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
                };

                vm.$routerOnActivate = function(next, previous) {
                    job_id = next.params.job_id;
                    vm.getBatchDetails(true);
                    vm.getAllAlerts();
                };

                /**
                 * @ngdoc method
                 * @name equipmentDetails
                 * @methodOf migrationApp.controller:rscurrentbatchdetailsCtrl
                 * @param {String} type Resource type
                 * @param {String} id Resource id
                 * @description 
                 * Fetches resource details for a given resource type and id
                 */
                vm.equipmentDetails = function(type, id) {
                    ds.getTrimmedAllItems(type)
                        .then(function (response) {
                            var details = response.data.filter(function (item) { return item.id == id })[0];
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
                vm.setSortBy = function(resourceType, sortBy) {
                    if(vm.sortBy[resourceType] === sortBy && vm.sortBy[resourceType][0] !== "-")
                        vm.sortBy[resourceType] = "-" + sortBy;
                    else
                        vm.sortBy[resourceType] = sortBy;
                };

                /**
                 * @ngdoc method
                 * @name getAllAlerts
                 * @methodOf migrationApp.controller:rscurrentbatchdetailsCtrl
                 * @param {Boolean} refresh True if the alerts list needs to be refreshed
                 * @description 
                 * Gets the list of all alerts for all the migrations, if any
                 */
                vm.getAllAlerts = function(refresh) {
                    vm.loadingAlerts = true;
                    var tempAlerts = [];
                    alertsService.getAllAlerts(refresh)
                                    .then(function(result) {
                                        for(var i=0; i<result.length; i++)
                                            if(job_id === result[i].job_id)
                                                tempAlerts.push(result[i]);
                                        
                                        //console.log(job_id, tempAlerts);
                                        vm.alerts = tempAlerts;
                                        vm.loadingAlerts = false;
                                    });
                };
            }
        ]}); // end of component rscurrentbatchdetails
})();