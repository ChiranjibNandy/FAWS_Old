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
            controller: [ "$rootRouter","datastoreservice","$scope","authservice","$rootScope","$window","migrationitemdataservice","$q", function($rootRouter,datastoreservice,$scope,authservice,$rootScope,$window,ds,$q) {
                var vm = this;
                vm.tenant_id = '';
                vm.tenant_account_name = '';
                vm.$onInit = function() {
                    // vm.tenant_id = authservice.getAuth().tenant_id;
                    // vm.tenant_account_name = authservice.getAuth().account_name;
                    vm.isRacker = authservice.is_racker;
                    $('title')[0].innerHTML =  "Recommendations - Rackspace Cloud Migration";
                    vm.migrationName = datastoreservice.getScheduleMigration().migrationName;
                    //var servers = datastoreservice.getItems('server'); -- Previous Code
                    var servers = [];
                    vm.filteredValue = "";
                    if($window.localStorage.selectedResources !== undefined){
                        servers = JSON.parse($window.localStorage.selectedResources)['server'];
                        vm.dataLoadBalancers = JSON.parse($window.localStorage.selectedResources)['LoadBalancers'].length;
                        vm.dataVolume = JSON.parse($window.localStorage.selectedResources)['volume'].length;
                        vm.dataService = JSON.parse($window.localStorage.selectedResources)['service'].length;
                        vm.dataFile = JSON.parse($window.localStorage.selectedResources)['file'].length;
                        vm.dataDNS = JSON.parse($window.localStorage.selectedResources)['dns'].length;
                    }
                    //datastoreservice.getItems('server');
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
                    //vm.dataLoadBalancers = datastoreservice.getItems('LoadBalancers').length; -- Previous Code
                    // if($window.localStorage.selectedLoadBalancers !== undefined)
                    //     vm.dataLoadBalancers = JSON.parse($window.localStorage.selectedLoadBalancers).length;
                    // else
                    //     vm.dataLoadBalancers = [];//datastoreservice.getItems('LoadBalancers').length;

                    vm.editName = false;

                    datastoreservice.setPageName("MigrationRecommendation");
                    $window.localStorage.setItem('pageName',"MigrationRecommendation");
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
                    if(vm.itemType == 'network'){
                        vm.loading = true;
                        var id = itemdetails.id;
                        var region = itemdetails.source_region || itemdetails.name;	
                        //Initiate the variables so that headers are even shown before the API gets resolved.
                        vm.itemDetails = {};
                        vm.itemDetails.name = itemdetails.name; 
                        $("#resource_info").modal("show");	                      
                        ds.getTrimmedItem(type, id, region)
                            .then(function (response) {
                                vm.loading = false;
                                if(response.error !== undefined && response.error == 404)
                                    return $q.reject("Bad Data");
                                var details = response;
                                vm.itemDetails = details;
                            }).catch(function(error){
                                vm.itemDetails = itemdetails;
                                $("#resource_info").modal('show'); 
                            });
                    }
                    else {
                        vm.itemDetails = itemdetails;
                        $("#resource_info").modal('show');
                    }
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

                    //event fired for direct url jumping or hitting...
                         $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
                               if((oldUrl != undefined) && ((newUrl.indexOf("migration/confirm") > -1))){
                                 event.preventDefault();
                                        $rootRouter.navigate(["MigrationStatus"]);
                                            }
                                       });
                return vm;
            }
        ]}); // end of component definition
})();
