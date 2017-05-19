(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsselecteditemspanel
     * @description
     * Component to have a selected items panel in every page.  
     *   
     * This component uses the template: **angtemplates/migration/items-selected.html**. It uses the controller {@link migrationApp.controller:rsselecteditemspanelCtrl rsselecteditemspanelCtrl}.  
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rsselecteditemspanel error-message="Some error message"></rsselecteditemspanel>
     *   </file>
     * </example>
     */
    angular.module("migrationApp")
        .component("rsselecteditemspanel", {
            templateUrl: "/static/angtemplates/migration/items-selected.html",
            bindings: {
                showrec: "@"
            },
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsselecteditemspanelCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsselecteditemspanel rsselecteditemspanel} component
             */
            controller: ["datastoreservice", "$scope", "authservice","$window","$rootRouter", function (dataStoreService, $scope, authservice,$window,$rootRouter) {
                var vm = this;
                vm.$onInit = function() {
                    vm.selectedItems = {
                        server:[],
                        network:[],
                        LoadBalancers:[]
                    };
                    /**
                     * @ngdoc property
                     * @name networkCount
                     * @propertyOf migrationApp.controller:rsselecteditemspanelCtrl
                     * @type {Integer}
                     * @description Number of networks associated with servers selected.
                     */
                    vm.networkCount = 0;
                    /**
                     * @ngdoc property
                     * @name networksList
                     * @propertyOf migrationApp.controller:rsselecteditemspanelCtrl
                     * @type {Array}
                     * @description Resources associated with servers selected.
                     */
                    vm.networksList = [];
                    vm.networksForServer = {};
                    vm.isRacker = authservice.is_racker;
                    //Fetch items selected from service.
                    //vm.selectedItems.server = dataStoreService.getItems('server');
                    //vm.selectedItems.LoadBalancers = dataStoreService.getItems('LoadBalancers');
                    if($window.localStorage.selectedServers !== undefined)
                        vm.selectedItems.server = JSON.parse($window.localStorage.selectedServers);
                    else
                        vm.selectedItems.server = dataStoreService.getItems('server');
                    if($window.localStorage.selectedLoadBalancers !== undefined)
                        vm.selectedItems.LoadBalancers = JSON.parse($window.localStorage.selectedLoadBalancers); 
                    else
                        vm.selectedItems.LoadBalancers = dataStoreService.getItems('LoadBalancers');                     
                    $("#accordion2").delegate('.accordion-heading a', "click", function () {
                        $('.plain-panel').find('.collapse.in').prev().find("i").removeClass("fa-chevron-up").addClass(
                            "fa-chevron-down");
                        $(this).parents('.accordion-heading').find("i.fa-chevron-down").removeClass(
                            "fa-chevron-down").addClass("fa-chevron-up");
                        $(this).parents('.plain-panel').find('.collapse.in').prev().find("i.fa-chevron-up").removeClass(
                            "fa-chevron-up").addClass("fa-chevron-down");
                    });
                };

                //Catch broadcast requests from parent(rsmigrationresourcelist) component.
                $scope.$on("ItemsModified", function(event){
                    // vm.selectedItems.server = dataStoreService.getItems('server');
                    
                    //vm.selectedItems = dataStoreService.getItems();
                    vm.selectedItems = [];
                    if($window.localStorage.selectedServers !== undefined)
                        vm.selectedItems.server = JSON.parse($window.localStorage.selectedServers);
                    else
                        vm.selectedItems.server = dataStoreService.getItems('server');
                    
                    if($window.localStorage.selectedLoadBalancers !== undefined)
                        vm.selectedItems.LoadBalancers = JSON.parse($window.localStorage.selectedLoadBalancers);
                    else
                        vm.selectedItems.LoadBalancers = [];
                });
                
                //Watch for item selection from list of resources.
                $scope.$watch('vm.selectedItems.server.length', function () {
                    vm.networkCount = 0;
                    vm.networksList = [];
                    //loop through all the servers selected and networks associated with the servers.
                    angular.forEach(vm.selectedItems.server, function (item) {
                        if(item.details.networks.length !== 0){
                            angular.forEach(item.details.networks, function (network) {
                                //making separate list of networks associated with servers.
                                if(vm.networksList.indexOf(network.name) == -1) {
                                    vm.networkCount += 1;
                                    vm.networksList.push(network.name);
                                };
                            });
                        }
                    });
                });

                /**
                 * @ngdoc method
                 * @name networksToServer
                 * @methodOf migrationApp.controller:rsselecteditemspanelCtrl
                 * @param {Object} item _Object_ list of servers selected.
                 * @description
                 * Fetch networks associated with server.
                 */
                vm.networksToServer = function(item) {
                    vm.networksForServer[item.name] = [];
                    angular.forEach(item.details.networks, function (network) {
                        vm.networksForServer[item.name].push(network.name);
                    });
                    return vm.networksForServer[item.name];
                };

                /**
                 * @ngdoc method
                 * @name selectServers
                 * @methodOf migrationApp.controller:rsselecteditemspanelCtrl
                 * @description 
                 * Navigates to resources page
                 */
                vm.selectServers = function(){
                    $("#no-equipments-modal").modal('hide');
                    $rootRouter.navigate(["MigrationResourceList"]);
                };

                /**
                 * @ngdoc method
                 * @name removeItem
                 * @methodOf migrationApp.controller:rsselecteditemspanelCtrl
                 * @param {Object} item _Object_ list of servers selected.
                 * @param {String} type String type of item to be removed.
                 * @description
                 * Remove an item from list of items selected.
                 */
                vm.removeItem = function(item, type) {
                    // if(vm.selectedItems[type].indexOf(item)>=0){
                    //     vm.selectedItems[type].splice(vm.selectedItems[type].indexOf(item), 1);
                    //     dataStoreService.setItems(vm.selectedItems);
                    //     $window.localStorage.setItem('selectedServers',JSON.stringify(vm.selectedItems['server']));
                    //     item.selected = false;
                    //     $scope.$emit("ItemRemoved", item); // broadcast event to all child components
                    // }
                    if(vm.selectedItems[type].indexOf(item)>=0){
                       vm.selectedItems[type].splice(vm.selectedItems[type].indexOf(item), 1);
                        dataStoreService.setItems(vm.selectedItems);
                        $window.localStorage.setItem('selectedServers',JSON.stringify(vm.selectedItems.server));
                        item.selected = false;  
                        $scope.$emit("ItemRemoved", item); // broadcast event to all child components 
                        if(vm.selectedItems[type].length == 0 && vm.showrec == 'true'){
                            $("#no-equipments-modal").modal('show');
                        }                    
                    }
                }

                return vm;
            }]
        }); // end of component definition
})();
