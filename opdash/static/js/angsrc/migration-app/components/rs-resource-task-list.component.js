(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rsresourcetasklist
     * @description
     * Component to display the list of tasks associated with migrating a resource. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/resource-task-list.html**. 
     * Its controller {@link migrationApp.controller:rsresourcetasklistCtrl rsresourcetasklistCtrl} uses the below services:
     * {@link migrationApp.service:alertsservice alertsservice}
     * {@link migrationApp.service:authservice authservice}
     * $interval
     * $rootRouter
     * {@link migrationApp.service:migrationitemdataservice migrationitemdataservice}
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
            controller: ["alertsservice", "authservice", "$interval", "$rootRouter", "migrationitemdataservice","$scope","httpwrapper","$window","$q", function(alertsService, authService, $interval, $rootRouter, ds,$scope,HttpWrapper,$window,$q){
                var vm = this;
                var lastRefreshIntervalPromise;
                var backRoute = null;
                var backRouteParams = {};

                //Initiate some flags to show progress bars
                vm.progressFlag = false; 
                vm.succeeded_time_pct = 0;

                /**
                 * @ngdoc method
                 * @name getResourceTasks
                 * @methodOf migrationApp.controller:rsresourcetasklistCtrl
                 * @param {Boolean} refresh True if the tasks list needs to be refreshed
                 * @description 
                 * Fetches the list of tasks for a migrating resource
                 */
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
                                vm.batch_name = response.batchName;
                                vm.tasks = response.tasks;
                            if($window.localStorage.batch_job_status === 'in progress' || $window.localStorage.batch_job_status === 'done'){
                                var promise = HttpWrapper.send('/api/jobs/'+params.job_id+'/progress', { "operation": 'GET' });
                            }
                            $q.all([promise]).then(function(response){
                                if(response[0] !== undefined)
                                    if(response[0].succeeded_by_time_pct !== undefined){
                                        //If it is not undefined, hold the completion percentage 
                                        vm.succeeded_time_pct = response[0].succeeded_by_time_pct;
                                        //Set the flag to true
                                        vm.progressFlag = true;
                                    }
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
                            },function(errorResponse){
                                //If the API call errors out, set the completion percentage to 0
                                vm.succeeded_time_pct = response.succeeded_by_time_pct;
                                //Set the flag to true
                                vm.progressFlag = false;
                            });
                        }, function (errorResponse) {
                            vm.loading = false;
                            vm.manualRefresh = false;
                            vm.loadError = true;
                        });
                };

                vm.$onInit = function() {
                    var auth = authService.getAuth();
                    vm.isRacker = auth.is_racker;
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

                /**
                 * @ngdoc method
                 * @name back
                 * @methodOf migrationApp.controller:rsresourcetasklistCtrl
                 * @param {Boolean} refresh True if the tasks list needs to be refreshed
                 * @description 
                 * Navigates back to its previous page (current or completed batch details page). 
                 * Falls back to status dashboard page in case of invalid parameters
                 */
                vm.back = function() {
                    if(backRoute !== null)
                        $rootRouter.navigate([backRoute, {job_id: backRouteParams.job_id}]);
                    else
                        $rootRouter.navigate(['MigrationStatus']);
                };


              //event fired for direct url jumping or hitting...
                 $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
                   if((oldUrl != undefined) && ((newUrl.indexOf("migration/recommendation") > -1)) ||(newUrl.indexOf("migration/resources") > -1) || (newUrl.indexOf("migration/confirm") > -1)){
                        event.preventDefault();
                          $rootRouter.navigate(["MigrationStatus"]);}
                              });


            }
            ]}); // end of component rsbatchtasklist
})();
