(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsmigrationresourceslist
     * @description
     * Component to display the _Select Resources_ page. This component is loaded directly on route change.
     *
     * This component uses the template: **angtemplates/migration/resources-list.html**.
     *
     * Its controller {@link migrationApp.controller:rsmigrationresourceslistCtrl rsmigrationresourceslistCtrl} uses the below services:
     *  * {@link migrationApp.service:authservice authservice}
     *  * $scope
     *  * $rootRouter
     *  * {@link migrationApp.service:datastoreservice datastoreservice}
     */
    angular.module("migrationApp")
        .component("rsmigrationresourceslist", {
            templateUrl: "/static/angtemplates/migration/resources-list.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsmigrationresourceslistCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsmigrationresourceslist rsmigrationresourceslist} component
             */
            controller: ["authservice", "$scope", "$rootRouter", "datastoreservice", "migrationitemdataservice", "httpwrapper", "$timeout","$window", function(authservice, $scope, $rootRouter, dataStoreService, ds, HttpWrapper, $timeout,$window) {
                var vm = this;
                vm.tenant_id = '';
                vm.tenant_account_name = '';
                vm.saveClicked = false;

                vm.$onInit = function() {
                    //testing
                    // dataStoreService.fetchUserProfile()
                    //     .then(function (result) {
                    //         var profileDetails = JSON.parse(result.savedDetails || '[]');
                    //     });
                    // If status is true, popup for migration won't be displayed in first step of Migration.
                    $('body').removeClass('modal-open');
                    $('.modal-backdrop').remove();
                    var modalDisplayStatus = dataStoreService.getDontShowStatus() ; //check for flag status created for intorduction Modal.
                    var prePageName = dataStoreService.getPageName() || $window.localStorage.pageName;
                    if((modalDisplayStatus == false || $window.localStorage.dontShowStatus === "true")  && (prePageName == "MigrationStatus" || prePageName == "")){
                        $('#intro_modal').modal('show');
                        dataStoreService.setDontShowStatus(true);//set introduction modal flag to true after first time display.
                        $window.localStorage.setItem('dontShowStatus',JSON.stringify(vm.dontshowStatus));
                    }
                    
                    dataStoreService.setPageName("MigrationResourceList");
                    $window.localStorage.setItem('pageName',"MigrationResourceList");
                    $('title')[0].innerHTML =  "Inventory - Rackspace Cloud Migration";

                    /**
                     * @ngdoc property
                     * @name isRacker
                     * @propertyOf migrationApp.controller:rsmigrationresourceslistCtrl
                     * @type {Boolean}
                     * @description Returns if logged in user is a Racker. If user is customer, it returns false.
                     */
                    vm.isRacker = authservice.is_racker;
                    /**
                     * @ngdoc property
                     * @name selectedItems
                     * @propertyOf migrationApp.controller:rsmigrationresourceslistCtrl
                     * @type {Array}
                     * @description List of items that are selected for migration
                     */
                    vm.selectedItems = {
                        server:[],
                        network:[],
                        LoadBalancers:[]
                    };
                    vm.filterSearch = "";
                    vm.saveProgress = "";
                    var d = new Date();
                    //Objects created to fetch results of Save Later API call.
                    vm.cancelnSaveObj = {
                        "saveSuccess" : false,
                        "saveInProgress" : false,
                        "resultMsg" : "",
                        "modalName": '#cancel_modal'
                    };
                    vm.displayMigName = false;
                    vm.dontshowStatus = true;
                    $window.localStorage.setItem('dontShowStatus',JSON.stringify(vm.dontshowStatus));
                    var timestmp = moment(d).format("DDMMMYYYY-hhmma");
                    /**
                     * @ngdoc property
                     * @name migrationName
                     * @propertyOf migrationApp.controller:rsmigrationresourceslistCtrl
                     * @type {String}
                     * @description Create Migration considering Timestamp.
                     */
                    vm.migrationName = 'My Migration';
                    $window.localStorage.migrationName = vm.migrationName;
                    vm.noName = false;
                    vm.numOfItems = {
                        server:0,
                        network:0,
                        file:0
                    };
                }

                /**
                 * @ngdoc method
                 * @name addItem
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @param {Object} item Object describing the selected resource
                 * @description
                 * Called by child component when an item is selected
                 */
                vm.addItem = function(item, type) {
                     //vm.selectedItems[type] = dataStoreService.getItems(type); -- Previous Code
                    var itemExists = false;
                    if($window.localStorage.selectedServers !== undefined){
                        vm.selectedItems[type] = JSON.parse($window.localStorage.selectedServers);
                        var servers = JSON.parse($window.localStorage.selectedServers);
                        for(var i =0;i < servers.length;i++){
                            if(servers[i].name  === item.name){
                                itemExists = true;
                            }
                        }
                    }
                    else 
                    {
                        vm.selectedItems[type] = dataStoreService.getItems(type);
                        var servers = vm.selectedItems[type];
                        for(var i =0;i < servers.length;i++){
                            if(servers[i].name  === item.name){
                                itemExists = true;
                            }
                        }

                    }
                    if(!itemExists){
                    //if(vm.selectedItems[type].indexOf(item)<0){ -- Previous Code

                        //this hardcoded value of us-east-1 in url is needed to get the default pricing details. 
                        var url = '/api/ec2/get_all_ec2_prices/'+item.details.flavor_details.id+'/us-east-1';
                        HttpWrapper.send(url,{"operation":'GET'}).then(function(pricingOptions){
                            item.selectedMapping = pricingOptions[0];
                            vm.selectedItems[type].push(item);
                            if(type === 'server'){
                                var old = $window.localStorage.getItem('selectedServers');
                                if(old === null){
                                    var arr = [item];
                                    localStorage.setItem('selectedServers', JSON.stringify(arr));
                                }
                                else{
                                    old = JSON.parse(old);
                                    localStorage.setItem('selectedServers', JSON.stringify(old.concat(item)));
                                }
                            }
                            else if(type === 'network'){
                                var old = $window.localStorage.getItem('selectedNetworks');
                                if(old === null){
                                    var arr = [item];
                                    localStorage.setItem('selectedNetworks', JSON.stringify(arr));
                                }
                                else{
                                    old = JSON.parse(old);
                                    localStorage.setItem('selectedNetworks', JSON.stringify(old.concat(item)));
                                }
                            }
                            else if(type === 'LoadBalancers'){
                                var old = $window.localStorage.getItem('selectedLoadBalancers');
                                if(old === null){
                                    var arr = [item];
                                    localStorage.setItem('selectedLoadBalancers', JSON.stringify(arr));
                                }
                                else{
                                    old = JSON.parse(old);
                                    localStorage.setItem('selectedLoadBalancers', JSON.stringify(old.concat(item)));
                                }
                            }
                            vm.selectedItems.server = JSON.parse($window.localStorage.selectedServers);
                            dataStoreService.setItems(vm.selectedItems);//save items selected for migration in service.
                            $scope.$broadcast("ItemsModified");//make a function call to child component to enable checkobox for selected items.
                        });
                    };
                }

                /**
                 * @ngdoc method
                 * @name removeItem
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @param {Object} item Object describing the selected resource
                 * @description
                 * Called by child component when an item is removed by user
                 */
                vm.removeItem = function(item, type) {
                    //vm.selectedItems = dataStoreService.getItems();
                    if($window.localStorage.selectedServers !== undefined)
                        vm.selectedItems[type] = JSON.parse($window.localStorage.selectedServers);
                    else
                        vm.selectedItems[type] = dataStoreService.getItems(type);
                    //look for item to be removed in array of selected items and splice it from the array.
                    angular.forEach(vm.selectedItems[type], function (item_selected, key) {
                        if(item_selected.id == item.id){
                            vm.selectedItems[type].splice(key, 1);
                            dataStoreService.setItems(vm.selectedItems);
                            if(type === 'server'){
                                var old = $window.localStorage.getItem('selectedServers');
                                if(old !== null)
                                    old = JSON.parse(old);
                                angular.forEach(old,function(item_selected,key){
                                    if(item_selected.id == item.id){
                                        old.splice(key,1);
                                        localStorage.setItem('selectedServers', JSON.stringify(old));
                                    }
                                });                              
                            }
                            else if(type === 'network'){
                                var old = $window.localStorage.getItem('selectedNetworks');
                                if(old !== null)
                                    old = JSON.parse(old);
                                angular.forEach(old,function(item_selected,key){
                                    if(item_selected.id == item.id){
                                        old.splice(key,1);
                                        localStorage.setItem('selectedNetworks', JSON.stringify(old));
                                    }
                                }); 
                            }
                            else if(type === 'LoadBalancers'){
                                var old = $window.localStorage.getItem('selectedLoadBalancers');
                                if(old !== null)
                                    old = JSON.parse(old);
                                angular.forEach(old,function(item_selected,key){
                                    if(item_selected.id == item.id){
                                        old.splice(key,1);
                                        localStorage.setItem('selectedLoadBalancers', JSON.stringify(old));
                                    }
                                }); 
                            }

                            $scope.$broadcast("ItemRemovedForChild", item); // broadcast event to all child components
                            $scope.$broadcast("ItemsModified");
                            return;
                        };
                    });
                };
                //catch emit call from child components.
                $scope.$on("ItemRemoved", function(event, item){
                  $scope.$broadcast("ItemRemovedForChild", item); // broadcast event to all child components
                });

                /**
                 * @ngdoc method
                 * @name dontShow
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description
                 * Consider Dont show checkbox of introduction Modal if checked.
                 */
                vm.dontShow = function() {
                    dataStoreService.setDontShowStatus(vm.dontshowStatus);
                    $window.localStorage.setItem('dontShowStatus',JSON.stringify(vm.dontshowStatus));
                };

                /**
                 * @ngdoc method
                 * @name dontShowNameModal
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description
                 * Consider Dont show checkbox of Modal where user can name a Migration if checked.
                 */
                vm.dontShowNameModal = function() {
                    dataStoreService.setDontShowNameModal(vm.dontshowNameModal);
                };

                /**
                 * @ngdoc method
                 * @name continue
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description
                 * Continue to next step: **Recommendations**
                 */
                 vm.continue = function() {
                    // if(vm.selectedItems.server.length > 0 || vm.selectedItems.network.length > 0 || vm.selectedItems.LoadBalancers.length > 0 || dataStoreService.getItems('server').length > 0 || dataStoreService.getItems('LoadBalancers').length > 0){ -- Previous Code
                    //     vm.nameStatus = dataStoreService.getdontShowNameModal(); //check for flag status created for Modal where user can name a migration.
                    //     var migrationName = dataStoreService.getScheduleMigration().migrationName;
                    if(vm.selectedItems.server.length > 0 || vm.selectedItems.network.length > 0 || vm.selectedItems.LoadBalancers.length > 0 ){//dataStoreService.getItems('server').length > 0 || dataStoreService.getItems('LoadBalancers').length > 0 
                        vm.nameStatus = dataStoreService.getdontShowNameModal(); //check for flag status created for Modal where user can name a migration.
                        //var migrationName = dataStoreService.getScheduleMigration().migrationName;
                        var migrationName = $window.localStorage.migrationName;

                        if(vm.nameStatus || migrationName){
                            vm.migrationName = migrationName;
                            vm.savencontinue();
                        }
                        else
                            $('#name_modal').modal('show');
                    }
                    else{
                        $('#save_for_later').modal('hide');
                        $('#name_modal').modal('hide');
                        $("#no_selection").modal('show');
                        $('#intro_modal').modal('hide');
                    }
                };
                
                /**
                 * @ngdoc method
                 * @name savencontinue
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @description
                 * Assign Migration considering current Timestamp and continue to next step: **Recommendations**
                 */
                vm.savencontinue = function() {
                    // if(vm.selectedItems.server.length > 0 || vm.selectedItems.network.length > 0 || vm.selectedItems.LoadBalancers.length > 0 || dataStoreService.getItems('server').length > 0 || dataStoreService.getItems('LoadBalancers').length > 0){
                    //     if(vm.selectedItems.server.length > 0 || vm.selectedItems.LoadBalancers.length > 0){
                    //         dataStoreService.setItems(vm.selectedItems);
                    //     }   
                    if(vm.selectedItems.server.length > 0 || vm.selectedItems.network.length > 0 || vm.selectedItems.LoadBalancers.length > 0 || dataStoreService.getItems('server').length > 0 || dataStoreService.getItems('LoadBalancers').length > 0 ){//|| dataStoreService.getItems('server').length > 0 || dataStoreService.getItems('LoadBalancers').length > 0 
                        if(vm.selectedItems.server.length > 0 || vm.selectedItems.LoadBalancers.length > 0 ){
                            dataStoreService.setItems(vm.selectedItems);
                        }                
                        // dataStoreService.setDontShowStatus(true);
                        dataStoreService.setDontShowNameModal(true);
                    
                        var migrationName = $window.localStorage.migrationName;
                            vm.selectedTime = {
                                    migrationName:vm.migrationName,
                                    time:'',
                                    timezone:''
                                };
                            dataStoreService.setScheduleMigration(vm.selectedTime);
                            $('#save_for_later').modal('hide');
                            $('#name_modal').modal('hide');
                            $('#cancel_modal').modal('hide');
                            $('#intro_modal').modal('hide');
                            $('#no_selection').modal('hide');
                            $rootRouter.navigate(["MigrationRecommendation"]);
                        // }
                    }
                    else{
                        $('#save_for_later').modal('hide');
                        $('#name_modal').modal('hide');
                        $("#no_selection").modal('show');
                        $('#intro_modal').modal('hide');
                    }
                };

                vm.equipmentDetailsModal = function(type, itemdetails) {
                    vm.itemType = type;
                    vm.itemDetails = itemdetails;
                    $('#resource_info').modal('show');
                }

                //to detect browser back click and prevent the functionality for wrong events
                $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl) {
                    if((oldUrl.indexOf("migration/resources") > -1) && (newUrl.indexOf("migration/confirm") > -1)){
                        event.preventDefault();
                        $('#cancel_modal').modal('show');
                        //$rootRouter.navigate(["MigrationResourceList"]);
                    }
                });
                return vm;
            }
        ]}); // end of component rsmigrationresourceslist
})();
