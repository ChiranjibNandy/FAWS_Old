(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rsresourcetasklist
     * @description
     * Component to display the list of tasks associated with migrating a resource. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/resource-task-list.html**. It uses the controller {@link migrationApp.controller:rsresourcetasklistCtrl rsresourcetasklistCtrl}.  
     */
    angular.module("migrationApp")
        .component("rsresourcetasklist", {
            transclude: true,
            templateUrl: "/static/angtemplates/migration/resource-task-list.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsresourcetasklistCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsresourcetasklist rsresourcetasklist} component
             */
            controller: ["alertsservice", "authservice", "$interval", "$rootRouter", "migrationitemdataservice", function(alertsService, authService, $interval, $rootRouter, ds){
                var vm = this;
                var lastRefreshIntervalPromise;
                var backRoute = null;
                var backRouteParams = {};

                vm.getResourceTasks = function(refresh) {
                    if(refresh){
                        vm.manualRefresh = true;
                        vm.timeSinceLastRefresh = 0;
                        $interval.cancel(lastRefreshIntervalPromise);
                    }

                    var params = {
                        job_id: vm.job_id,
                        resource_type: vm.resource_type,
                        resource_id: vm.resource_id
                    };

                    alertsService.getResourceTasks(params, refresh)
                        .then(function(response) {
                            if(response.error)
                                vm.tasks = [];
                            else
                                vm.tasks = response.tasks;

                            console.log("Tasks", response);
                            ds.getTrimmedAllItems(params.resource_type==="instance" ? "server" : params.resource_type)
                                .then(function (response) {
                                    var details = response.data.filter(function (item) { return item.id == params.resource_id })[0];
                                    vm.resourceName = details.name;
                                });

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
                    vm.isRacker = authservice.is_racker;
                    vm.tenant_id = auth.tenant_id;
                    vm.currentUser = auth.account_name;
                    vm.tasks = [];

                    vm.loading = true;
                    vm.loadError = false;
                    vm.manualRefresh = false;
                    vm.timeSinceLastRefresh = 0;
                };

                vm.$routerOnActivate = function(next, previous){
                    if(previous && previous.componentType.indexOf("current")>=0){
                        backRoute = "CurrentBatchDetails";
                        backRouteParams.job_id = previous.params.job_id;
                    }
                    else if(previous && previous.componentType.indexOf("completed")>=0){
                        backRoute = "CompletedBatchDetails";
                        backRouteParams.job_id = previous.params.job_id;
                    }

                    vm.job_id = next.params.job_id;
                    vm.resource_type = next.params.resource_type;
                    vm.resource_id = next.params.resource_id;
                    vm.getResourceTasks(true);
                };

                vm.back = function() {
                    if(backRoute !== null)
                        $rootRouter.navigate([backRoute, {job_id: backRouteParams.job_id}]);
                    else
                        $rootRouter.navigate(['MigrationStatus']);
                };
            }
            ]}); // end of component rsbatchtasklist
})();