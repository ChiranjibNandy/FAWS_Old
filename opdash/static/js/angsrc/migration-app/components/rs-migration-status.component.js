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
                controller: ["httpwrapper", "datastoreservice", "$rootRouter", function(HttpWrapper, dataStoreService, $rootRouter) {
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
                     * @name scheduledDateTime
                     * @propertyOf migrationApp.controller:rsmigrationstatusCtrl
                     * @type {Date}
                     * @description Date time of the instant when migration is scheduled
                     */
                    vm.scheduledDateTime = "17/01/2017 07:00PM";

                    vm.$routerOnActivate = function(next, previous) {
                        console.log(previous);
                        if(previous && previous.urlPath.indexOf("confirm") > -1){
                            vm.message = "Migration Confirmed for 1/17/2017 7:00 PM";
                        } else{
                            vm.message = "Migration Dashboard";
                        }
                    };

                    // gets the list of all batches initiated by the current tenant
                    var getBatches = function() {
                        var url = "/static/angassets/migration-status.json";
                        HttpWrapper.send(url,{"operation":'GET'})
                                .then(function(response) {
                                    console.log("Batch: ", response);
                                    vm.batches = response;
                                    //vm.batches = [];
                                    if(vm.batches.length === 0){
                                        $('#myModal').modal('show');
                                    }
                                }, function(errorResponse) {
                                    console.log("Error: ", errorResponse);
                                });
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
                        dataStoreService.setDontShowStatus(false);
                        $rootRouter.navigate(["MigrationResourceList"]);
                    };
                }]
            }); // end of comeponent rsmigrationstatus
})();