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
            controller: ["$rootRouter", "migrationitemdataservice", "dashboardservice", function($rootRouter, ds, dashboardService){
                var vm = this;

                /**
                 * @ngdoc method
                 * @name getBatchDetails
                 * @methodOf migrationApp.controller:rscurrentbatchdetailsCtrl
                 * @param {String} job_id The job id of the batch to get details of
                 * @param {Boolean} refresh True if the batch list needs to be refreshed
                 * @description 
                 * Gets details of a job
                 */
                vm.getBatchDetails = function(refresh) {
                    vm.loading = true;
                    dashboardService.getBatches(refresh)
                            .then(function(response) {
                                var job = response.jobs.job_status_list.find(function(job) {
                                    return job.job_id === vm.job_id;
                                });
                                console.log(job);
                                vm.job = job;
                                vm.loading = false;
                            }, function(errorResponse) {
                                vm.loading = false;
                                vm.loadError = true;
                            });
                };

                vm.$routerOnActivate = function(next, previous) {
                    vm.job_id = next.params.job_id;
                    vm.getBatchDetails();
                };

                vm.equipmentDetails = function(type, id) {
                    ds.getTrimmedAllItems(type)
                        .then(function (response) {
                            console.log("Network data", response);
                            var details = response.data.filter(function (item) { return item.id == id })[0];
                            if(type === "server")
                                vm.itemDetails = details;
                            else
                                vm.networkDetails = details;
                        });
                };
            }
        ]}); // end of component rscurrentbatchdetails
})();