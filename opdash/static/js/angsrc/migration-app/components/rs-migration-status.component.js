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
                controller: ["httpwrapper", function(HttpWrapper) {
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

                    // gets the list of all batches initiated by the current tenant
                    var getBatches = function() {
                        var url = "/static/angassets/migration-status.json";
                        HttpWrapper.send(url,{"operation":'GET'})
                                .then(function(response) {
                                    console.log("Batch: ", response);
                                    vm.batches = response;
                                }, function(errorResponse) {
                                    console.log("Error: ", errorResponse);
                                });
                    };

                    vm.$onInit = function() {
                        $('title')[0].innerHTML =  "Migration Status Dashboard - Rackspace Cloud Migration";
                        getBatches();
                    };
                }]
            }); // end of comeponent rsmigrationstatus
})();