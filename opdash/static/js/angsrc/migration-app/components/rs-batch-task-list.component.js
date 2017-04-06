(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rsbatchtasklist
     * @description
     * Component to display the details of a batch migration. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/batch-task-list.html**. It uses the controller {@link migrationApp.controller:rsbatchtasklistCtrl rsbatchtasklistCtrl}.  
     */
    angular.module("migrationApp")
        .component("rsbatchtasklist", {
            transclude: true,
            templateUrl: "/static/angtemplates/migration/batch-task-list.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsbatchtasklistCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsbatchtasklist rsbatchtasklist} component
             */
            controller: ["alertsservice", "authservice", "$interval", function(alertsService, authService, $interval){
                var vm = this;
                var lastRefreshIntervalPromise;

                vm.getJobTasks = function(refresh) {
                    if(refresh){
                        vm.manualRefresh = true;
                        vm.timeSinceLastRefresh = 0;
                        $interval.cancel(lastRefreshIntervalPromise);
                    }

                    alertsService.getJobTasks(vm.job_id, refresh)
                        .then(function(response) {
                            vm.tasks = response.tasks;
                            vm.batchName = response.batchName;

                            vm.loading = false;
                            vm.manualRefresh = false;
                            vm.loadError = false;

                            lastRefreshIntervalPromise = $interval(function(){
                                vm.timeSinceLastRefresh++;
                            }, 60000);
                        }, function (errorResponse) {
                            vm.loading = false;
                            vm.manualRefresh = false;
                            vm.loadError = true;
                            //console.log("Task List Error: ", errorResponse);
                        });
                };

                vm.$onInit = function() {
                    var auth = authService.getAuth();
                    vm.tenant_id = auth.tenant_id;
                    vm.currentUser = auth.account_name;

                    vm.loading = true;
                    vm.loadError = false;
                    vm.manualRefresh = false;
                    vm.timeSinceLastRefresh = 0;
                };

                vm.$routerOnActivate = function(next, previous){
                    vm.job_id = next.params.job_id;
                    vm.getJobTasks();
                };
            }
            ]}); // end of component rsbatchtasklist
})();