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
            controller: ["datastoreservice", "$scope", "authservice", "$window", "$rootRouter", function (dataStoreService, $scope, authservice, $window, $rootRouter) {
                var vm = this;
                vm.$onInit = function () {
                    vm.selectedItems = {
                        server:[],
                        network:[],
                        LoadBalancers:[],
                        volume:[],
                        service:[],
                        file:[]
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
                    vm.cbsForServer = {};
                    vm.isRacker = authservice.is_racker;
                    //added text under the selected resources in the confirmation page
                    vm.showMessageForSelectedServer = false;
                    if ($window.localStorage.pageName == "ConfirmMigration") {
                        vm.showMessageForSelectedServer = true;
                    }
                    //Fetch items selected from local storage.
                    if($window.localStorage.selectedResources !== undefined){
                        angular.forEach(JSON.parse($window.localStorage.selectedResources), function(item, type){
                            vm.selectedItems[type] = item;
                        });
                    }

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
                $scope.$on("ItemsModified", function (event) {

                    vm.selectedItems = [];
                    //Checks whether servers selected are already there in local storage
                    if($window.localStorage.selectedResources !== undefined){
                        angular.forEach(JSON.parse($window.localStorage.selectedResources), function(item, type){
                            vm.selectedItems[type] = item;
                        });
                    }
                });

                /**
                 * @ngdoc method
                 * @name networksToServer
                 * @methodOf migrationApp.controller:rsselecteditemspanelCtrl
                 * @param {Object} item _Object_ list of servers selected.
                 * @description
                 * Fetch networks associated with server.
                 */
                vm.networksToServer = function (item) {
                    vm.networksForServer[item.name] = [];
                    angular.forEach(item.details.networks, function (network) {
                        vm.networksForServer[item.name].push(network.name);
                    });
                    return vm.networksForServer[item.name];
                };

                /**
                 * @ngdoc method
                 * @name cbsToServer
                 * @methodOf migrationApp.controller:rsselecteditemspanelCtrl
                 * @param {Object} item _Object_ list of servers selected.
                 * @description
                 * Fetch networks associated with server.
                 */
                vm.cbsToServer = function (item) {
                    vm.cbsForServer[item.name] = [];
                    angular.forEach(item.details.cbs_volumes, function (cbs) {
                        vm.cbsForServer[item.name].push(cbs.display_name);
                    });
                    return vm.cbsForServer[item.name];
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
                    if(vm.selectedItems[type].indexOf(item)>=0){
                       vm.selectedItems[type].splice(vm.selectedItems[type].indexOf(item), 1);
                        dataStoreService.setSelectedItems(vm.selectedItems[type], type);

                        //If not the last item, set the selected servers into local storage.
                        if(vm.selectedItems[type].length >= 1)
                            dataStoreService.setSelectedItems(vm.selectedItems[type], type)
                        else {//If is the the last item in localstorage , remove the key value pair altogether
                            // $window.localStorage.removeItem('selectedServers');
                            dataStoreService.setSelectedItems([], type);
                        // };
                            if(document.getElementsByClassName("fa fa-chevron-up")[0]){
                                var element = document.getElementsByClassName("fa fa-chevron-up")[0];
                                element.classList.remove("fa-chevron-up");
                                element.classList.add("fa-chevron-down");
                            }
                        };
                        item.selected = false;  
                        $scope.$emit("ItemRemoved", item); // broadcast event to all child components 
                    }
                }



                return vm;
            }]
        }); // end of component definition
})();
