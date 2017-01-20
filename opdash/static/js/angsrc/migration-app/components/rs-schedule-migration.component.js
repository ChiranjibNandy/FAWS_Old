(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsschedulemigration
     * @description
     * Component to display the _Schedule Migration_ page. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/schedule-migration.html**  
     *   
     * Its controller {@link migrationApp.controller:rsschedulemigrationCtrl rsschedulemigrationCtrl} uses the below services:
     *  * $rootRouter
     *  * {@link migrationApp.service:datastoreservice datastoreservice}
     *  * $scope
     */
    angular.module("migrationApp")
        .component("rsschedulemigration", {
            templateUrl: "/static/angtemplates/migration/schedule-migration.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsschedulemigrationCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsschedulemigration rsschedulemigration} component
             */
            controller: [ "$rootRouter","datastoreservice","$scope", function($rootRouter,dataStoreService,$scope) {
                var vm = this;

                vm.$onInit = function() {
                    $('title')[0].innerHTML =  "Schedule Migration - Rackspace Cloud Migration";

                    vm.timeItems = ["12:00pm","12:30pm","1:00am"];
                    vm.timeZoneItems = ["EST- GMT-05:00","CST- GMT-06:00","PST- GMT-08:00"];
                    vm.time = vm.timeItems[0];
                    vm.timezone = vm.timeZoneItems[0];
                    vm.selectedDate = moment().format("MMM Do YYYY")+" at "+vm.time+" "+vm.timezone;
                    vm.date = moment().format("MMM Do YYYY");
                    dataStoreService.storeDate('time',vm.time);
                    dataStoreService.storeDate('timezone',vm.timezone);
                    var d = new Date();
                    var timestmp = moment(d).format("DDMMMYYYY-hhmma");
                    vm.migrationName = 'Migration-' + timestmp;
                    $scope.$on("DateChanged", function(event, item){
                        vm.date = item;
                        vm.selectedDate = moment(item).format("MMM Do YYYY")+" at "+vm.time+" in "+vm.timezone;
                    });
                };

                vm.saveItems = function() {
                    alert("Saving items: To be implemented");
                };

                /**
                 * @ngdoc method
                 * @name timeChange
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 * Saves the chosen time for migration
                 */
                vm.timeChange = function(){
                    dataStoreService.storeDate('time',vm.time);
                    vm.selectedDate = moment(vm.date).format("MMM Do YYYY")+" at "+vm.time+" in "+vm.timezone;
                };

                /**
                 * @ngdoc method
                 * @name timezoneChange
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 * Saves the chosen timezone for migration
                 */
                vm.timezoneChange = function(){
                    dataStoreService.storeDate('timezone',vm.timezone);
                    vm.selectedDate = moment(vm.date).format("MMM Do YYYY")+" at "+vm.time+" in "+vm.timezone;
                };

                /**
                 * @ngdoc method
                 * @name continue
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 * Continue to next step: **Confirm Migration**
                 */
                vm.continue = function() {
                    $rootRouter.navigate(["ConfirmMigration"]);
                };

                return vm;
            }
        ]}); // end of component definition
})();