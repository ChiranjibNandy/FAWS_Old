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
            controller: [ "$rootRouter","datastoreservice","$scope","authservice","$rootScope", function($rootRouter,datastoreservice,$scope,authservice,$rootScope) {
                var vm = this;
                vm.tenant_id = '';
                vm.tenant_account_name = '';
                vm.$onInit = function() {
                    // vm.tenant_id = authservice.getAuth().tenant_id;
                    // vm.tenant_account_name = authservice.getAuth().account_name;
                    vm.isRacker = authservice.is_racker;
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
                    vm.dataLoadBalancers = datastoreservice.getItems('LoadBalancers').length;
                    vm.editName = false;

                    datastoreservice.setPageName("recommendations");
                }

                /**
                 * @ngdoc method
                 * @name equipmentDetails
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
                 * @description 
                 * This method helps to pop the details modal. This method will be triggered from its child.
                 */
                vm.equipmentDetails = function(type, itemdetails) {
                    vm.itemType = type;
                    vm.itemDetails = itemdetails;
                    $("#resource_info").modal('show');
                };

                /**
                 * @ngdoc method
                 * @name goToDashboard
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
                 * @description 
                 * This method helps to navigate to dashboard page from recommendations page .
                 */
                vm.goToDashboard = function() {
                    $rootScope.$broadcast("showCancelModal");
                }
                
                return vm;
            }
        ]}); // end of component definition
})();