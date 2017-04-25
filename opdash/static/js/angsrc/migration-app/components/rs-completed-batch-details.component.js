(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rscompletedbatchdetails
     * @description
     * Component to display the details of a batch migration which has completed. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/batch-migration-details.html**. 
     * Its controller {@link migrationApp.controller:rscompletedbatchdetailsCtrl rscompletedbatchdetailsCtrl} uses the below services:
     * $rootRouter
     * {@link migrationApp.service:migrationitemdataservice migrationitemdataservice}
     * {@link migrationApp.service:dashboardservice dashboardservice}
     * {@link migrationApp.service:authservice authservice}
     */
    angular.module("migrationApp")
        .component("rscompletedbatchdetails", {
            transclude: true,
            templateUrl: "/static/angtemplates/migration/completed-batch-details.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rscompletedbatchdetailsCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rscompletedbatchdetails rscompletedbatchdetails} component
             */
            controller: ["$rootRouter", "migrationitemdataservice", "dashboardservice", "authservice", function($rootRouter, ds, dashboardService, authservice){
                var vm = this;
                var job_id;

                var getBatchDetails = function(job_id) {
                    vm.loading = true;
                    dashboardService.getBatches()
                            .then(function(response) {
                                var job = response.jobs.job_status_list.find(function(job) {
                                    return job.job_id === job_id;
                                });
                                console.log(job);
                                vm.job = job;
                                vm.loading = false;
                            }, function(errorResponse) {
                                vm.loading = false;
                                vm.loadError = true;
                            });
                };

                vm.$onInit = function(){
                    var auth = authservice.getAuth();
                    vm.tenant_id = auth.tenant_id;
                    vm.isRacker = authservice.is_racker;
                    vm.currentUser = auth.account_name;

                    vm.sortBy = {
                        server: 'name',
                        network: 'name'
                    };
                };

                vm.$routerOnActivate = function(next, previous) {
                    job_id = next.params.job_id;
                    getBatchDetails(job_id);
                };

                /**
                 * @ngdoc method
                 * @name equipmentDetails
                 * @methodOf migrationApp.controller:rscompletedbatchdetailsCtrl
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
                 * @methodOf migrationApp.controller:rscompletedbatchdetailsCtrl
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
            }
        ]}); // end of component rscompletedbatchdetails
})();