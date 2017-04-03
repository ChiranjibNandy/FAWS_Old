(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rscurrentbatchdetails
     * @description
     * Component to display the details of a batch migration which is in progress. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/batch-current.html**. It uses the controller {@link migrationApp.controller:rscurrentbatchdetailsCtrl rscurrentbatchdetailsCtrl}.  
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
            controller: ["$rootRouter", "migrationitemdataservice", "dashboardservice", "authservice", "$interval", function($rootRouter, ds, dashboardService, authservice, $interval){
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
                    vm.loading = true;

                    if(refresh){
                        vm.timeSinceLastRefresh = 0;
                        $interval.cancel(lastRefreshIntervalPromise);
                    }

                    dashboardService.getBatches(refresh)
                            .then(function(response) {
                                var job = response.jobs.job_status_list.find(function(job) {
                                    return job.job_id === job_id;
                                });
                                console.log(job);
                                vm.job = job;
                                vm.loading = false;
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
                    vm.tenant_id = auth.tenant_id;
                    vm.currentUser = auth.account_name;
                };

                vm.$routerOnActivate = function(next, previous) {
                    job_id = next.params.job_id;
                    vm.getBatchDetails();
                };

                vm.equipmentDetails = function(type, id) {
                    ds.getTrimmedAllItems(type)
                        .then(function (response) {
                            var details = response.data.filter(function (item) { return item.id == id })[0];
                            vm.itemType = type;
                            vm.itemDetails = details;
                        });
                };
            }
        ]}); // end of component rscurrentbatchdetails
})();