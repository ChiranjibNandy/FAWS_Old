(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsmigrationrecommendation
     * @description
     * Component to display the _Recommendations_ page showing the recommended migration for the selected resources. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/recommendations.html**.  
     *   
     * Its controller {@link migrationApp.controller:rsmigrationrecommendationCtrl rsmigrationrecommendationCtrl} uses the below services:
     *  * $rootRouter
     */
    angular.module("migrationApp")
        .component("rsmigrationrecommendation", {
            templateUrl: "/static/angtemplates/migration/recommendations.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsmigrationrecommendationCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsmigrationrecommendation rsmigrationrecommendation} component
             */
            controller: [ "$rootRouter","datastoreservice","$scope","authservice", function($rootRouter,datastoreservice,$scope,authservice) {
                var vm = this;
                vm.tenant_id = '';
                vm.tenant_account_name = '';
                
                $('title')[0].innerHTML =  "Recommendations - Rackspace Cloud Migration";
                vm.migrationName = datastoreservice.getScheduleMigration().migrationName;
                var servers = datastoreservice.getItems('server');
                vm.dataServer = servers.length;
                var networkNames = [];
                angular.forEach(servers, function (item) {
                    angular.forEach(item.details.networks, function (network) {
                        if(networkNames.indexOf(network.name) == -1) {
                            networkNames.push(network.name);
                        };
                    });
                });  
                vm.dataNetwork = networkNames.length;
                vm.editName = false;

                vm.$onInit = function() {
                    vm.tenant_id = authservice.getAuth().tenant_id;
                    vm.tenant_account_name = authservice.getAuth().account_name;
                }


                /**
                 * @ngdoc method
                 * @name changeName
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
                 * @description 
                 * Changes the migration batch name and updates it in the service datastoreservice
                 */
                vm.changeName = function() {
                    if(vm.changedMigrationName){
                        vm.selectedTime = {
                            migrationName:vm.changedMigrationName,
                            time:'',
                            timezone:''
                        };
                        vm.migrationName = vm.changedMigrationName;
                        datastoreservice.setScheduleMigration(vm.selectedTime);
                    }
                    vm.editName = false;
                };

                /**
                 * @ngdoc method
                 * @name revertName
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
                 * @description 
                 * This function helps to restore the previously set migration name
                 */
                vm.revertName = function(){
                    vm.editName = false;
                };

                /**
                 * @ngdoc method
                 * @name saveItems
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
                 * @description 
                 * Saves the chosen solution for migration of resources
                 */
                vm.saveItems = function() {
                    alert("Saving items: To be implemented");
                };

                /**
                 * @ngdoc method
                 * @name editMigrationName
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
                 * @description 
                 * This method helps to edit the migration name to user desired name.
                 */
                vm.editMigrationName = function() {
                    vm.editName = true;
                    vm.changedMigrationName = vm.migrationName;
                };
                /**
                 * @ngdoc method
                 * @name continue
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
                 * @description 
                 * Continue to next step: **Schedule Migration**
                 */
                vm.continue = function() {
                    $rootRouter.navigate(["ScheduleMigration"]);
                };

                return vm;
            }
        ]}); // end of component definition
})();