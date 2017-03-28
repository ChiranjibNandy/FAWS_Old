(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rscompletedbatchdetails
     * @description
     * Component to display the details of a batch migration which has completed. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/batch-migration-details.html**. It uses the controller {@link migrationApp.controller:rscompletedbatchdetailsCtrl rscompletedbatchdetailsCtrl}.  
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
                    vm.currentUser = auth.account_name;
                };

                vm.$routerOnActivate = function(next, previous) {
                    job_id = next.params.job_id;
                    getBatchDetails(job_id);
                };

                vm.equipmentDetails = function(type, id) {
                    ds.getTrimmedAllItems(type)
                        .then(function (response) {
                            var details = response.data.filter(function (item) { return item.id == id })[0];
                            if(type === "server")
                                vm.itemDetails = details;
                            else if(type === "network")
                                vm.networkDetails = details;
                        });
                };
            }
        ]}); // end of component rscompletedbatchdetails
})();