(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rseditbatchname
     * @description
     * This component is a common component which can be used across many pages, This component allows the user to edit the batch migration name.
     *   
     * This component uses the template: **angtemplates/migration/edit-batch-name.html**.  
     *   
     * This component (and its features) is being used by following pages of the application:
     *  * angtemplates/migration/recommendations.html
     *  * angtemplates/migration/schedule-migration.html
     *   
     * Its controller {@link migrationApp.controller:rseditbatchnameCtrl rseditbatchnameCtrl} uses the below services:
     *  * {@link migrationApp.service:datastoreservice datastoreservice}
     *  * $rootRouter
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rseditbatchname></rseditbatchname>
     *   </file>
     * </example>
     */
    angular.module("migrationApp")
        .component("rseditbatchname", {
            templateUrl: "/static/angtemplates/edit-batch-name.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rseditbatchnameCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsrecommendationitem rsrecommendationitem} component
             */
            controller: ["datastoreservice",function(dataStoreService) {
                var vm = this;

                vm.$onInit = function() {
                    vm.editName = false;
                    vm.migrationName = dataStoreService.getScheduleMigration().migrationName;
                };

                /**
                 * @ngdoc method
                 * @name editMigrationName
                 * @methodOf migrationApp.controller:rseditbatchnameCtrl
                 * @description 
                 * This method helps to edit the migration name to user desired name.
                 */
                vm.editMigrationName = function() {
                    vm.editName = true;
                    vm.changedMigrationName = vm.migrationName;
                };

                /**
                 * @ngdoc method
                 * @name changeName
                 * @methodOf migrationApp.controller:rseditbatchnameCtrl
                 * @description 
                 * Changes the migration batch name and updates it in the service datastoreservice
                 */
                vm.changeName = function() {
                    //when name of the batch is changed, the object selectedTime will be updated 
                    //in data store service
                    if(vm.changedMigrationName){
                        vm.selectedTime = {
                            migrationName:vm.changedMigrationName,
                            time:'',
                            timezone:''
                        };
                        vm.migrationName = vm.changedMigrationName;
                        dataStoreService.setScheduleMigration(vm.selectedTime);
                    }
                    vm.editName = false;
                };

                /**
                 * @ngdoc method
                 * @name revertName
                 * @methodOf migrationApp.controller:rseditbatchnameCtrl
                 * @description 
                 * This function helps to restore the previously set migration name
                 */
                vm.revertName = function(){
                    vm.editName = false;
                };
                return vm;
            }]
        }); // end of component rsrecommendationitem
})();
