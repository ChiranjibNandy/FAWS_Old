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
            controller: ["authservice", "$scope", "$rootRouter", "datastoreservice", "migrationitemdataservice", "httpwrapper", "$timeout","$window","$q","$rootScope","DEFAULT_VALUES",function(authservice, $scope, $rootRouter, dataStoreService, ds, HttpWrapper, $timeout,$window,$q, $rootScope,DEFAULT_VALUES) {
                var vm = this;
                vm.tenant_id = authservice.getAuth().tenant_id; //get Tenant ID
                vm.tenant_account_name = '';
                vm.saveClicked = false;

                vm.$onInit = function() {
                   // If status is true, popup for migration won't be displayed in first step of Migration.
                    $('body').removeClass('modal-open');
                    $('.modal-backdrop').remove();
                    vm.dontshowStatus = true;
                    vm.introModalLoading = true;
                    vm.noFawsAccounts = false;
                    vm.serviceLevel = "navigator";
                    var modalDisplayStatus = dataStoreService.getDontShowStatus() ; //check for flag status created for intorduction Modal.
                    var prePageName = dataStoreService.getPageName() || $window.localStorage.pageName;
                    vm.fawsAccountDetails = JSON.parse($window.localStorage.getItem("fawsAccounts"));
                    if (vm.fawsAccountDetails === null){
                        dataStoreService.getFawsAccounts()
                        .then(function (result) {
                            if(!result || (result.awsAccounts == 'undefined')){
                                vm.noFawsAccounts = true;
                                var tenant_id = authservice.getAuth().tenant_id;
                                vm.fawsLink = "https://mycloud.rackspace.com/cloud/"+tenant_id+"/tickets#new";
                            }
                            else{
                                vm.noFawsAccounts = false;
                                vm.fawsAccType = result.mode;
                            }
                            vm.introModalLoading = false;
                        });
                    }
                    else{
                        vm.introModalLoading = false;
                        vm.noFawsAccounts = false;
                        vm.fawsAccType = vm.fawsAccountDetails.mode;
                    }
                    if((modalDisplayStatus == false || $window.localStorage.dontShowStatus === false)  && (prePageName == "MigrationStatus" || prePageName == "MigrationResourceList" || prePageName == undefined)){
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
                    vm.isRacker = authservice.is_impersonator;
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
                    $window.localStorage.setItem('dontShowStatus',JSON.stringify(vm.dontshowStatus));
                    var timestmp = moment(d).format("DDMMMYYYY-hhmma");
                    /**
                     * @ngdoc property
                     * @name migrationName
                     * @propertyOf migrationApp.controller:rsmigrationresourceslistCtrl
                     * @type {String}
                     * @description Create Migration considering Timestamp.
                     */
                    vm.migrationName = $window.localStorage.migrationName || 'My Migration';
                    //$window.localStorage.migrationName = vm.migrationName;
                    vm.noName = false;
                    vm.continuing = false;
                    vm.errorInContinue = false;
                    vm.fawsCreated = false;
                    vm.fawsCreationProgress = false;
                    vm.showCreateAccount = false;
                    vm.fawsResponse = false;
                    vm.fawsError = false;
                    vm.fawsAcctName = '';
                    vm.fawsAcctId = '';
                    vm.fawsKeyValue1 = '';
                    vm.fawsKeyValue2 = '';
                    vm.fawsSourceKey = '';
                    vm.fawsTenantId = '';
                    vm.itemsLoading = true;
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
                    //Checks to see if the item is already selected and placed in the local storage
                    if($window.localStorage.selectedServers !== undefined){
                        vm.selectedItems[type] = JSON.parse($window.localStorage.selectedServers);
                        var servers = JSON.parse($window.localStorage.selectedServers);
                        for(var i =0;i < servers.length;i++){
                            if(servers[i].name  === item.name){
                                itemExists = true;
                            }
                        }
                    }
                    if(!itemExists){ //If not, add the item to the local storage
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
                        if($window.localStorage.selectedServers !== undefined)
                            vm.selectedItems.server = JSON.parse($window.localStorage.selectedServers);
                        dataStoreService.setItems(vm.selectedItems);//save items selected for migration in service.
                        $scope.$broadcast("ItemsModified");//make a function call to child component to enable checkobox for selected items.
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
                    if($window.localStorage.selectedServers !== undefined)
                        vm.selectedItems[type] = JSON.parse($window.localStorage.selectedServers);
                    else
                        vm.selectedItems[type] = []; //dataStoreService.getItems(type); -- Previous Code
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
                                        if(old.length >= 1) //If not the last item, set the selected servers into local storage.
                                            $window.localStorage.setItem('selectedServers', JSON.stringify(old));
                                        else{ //If is the the last item in localstorage , remove the key value pair altogether
                                            $window.localStorage.removeItem('selectedServers');
                                            if(document.getElementsByClassName("fa fa-chevron-up")[0]){
                                                var element = document.getElementsByClassName("fa fa-chevron-up")[0];
                                                element.classList.remove("fa-chevron-up");
                                                element.classList.add("fa-chevron-down");
                                            }
                                        }
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
                    if(vm.selectedItems.server.length > 0 || vm.selectedItems.network.length > 0 || vm.selectedItems.LoadBalancers.length > 0 ){//dataStoreService.getItems('server').length > 0 || dataStoreService.getItems('LoadBalancers').length > 0 
                        vm.savencontinue();
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
                    if(vm.noFawsAccounts){
                        $('#aws_check').modal('show');
                        return;
                    } 
                    //if(vm.selectedItems.server.length > 0 || vm.selectedItems.network.length > 0 || vm.selectedItems.LoadBalancers.length > 0 || dataStoreService.getItems('server').length > 0 || dataStoreService.getItems('LoadBalancers').length > 0 ){//|| dataStoreService.getItems('server').length > 0 || dataStoreService.getItems('LoadBalancers').length > 0 -- Previous Code
                    if($window.localStorage.selectedServers !== undefined || $window.localStorage.selectedLoadBalancers !== undefined){
                        vm.continuing = true;
                        var items = JSON.parse($window.localStorage.selectedServers);

                        var arr = [];
                        var promises = items.map(function(item) {
                            if(item.selectedMapping == undefined){
                                var url = '/api/ec2/get_all_ec2_prices/'+item.details.flavor_details.id+'/'+DEFAULT_VALUES.REGION;
                                return HttpWrapper.send(url, {"operation": 'GET'}).then(function(pricingOptions) {
                                    item.selectedMapping = pricingOptions[0]; 
                                    arr.push(item);
                                });
                            }
                            else{
                                arr.push(item);
                            }
                        });
                        $q.all(promises).then(function(result) {
                            vm.selectedItems.server = arr;
                            dataStoreService.setItems(vm.selectedItems);
                            $window.localStorage.setItem('selectedServers', JSON.stringify(arr));
                            vm.continuing = false;
                            dataStoreService.setDontShowNameModal(true);
                        
                            if($window.localStorage.migrationName != undefined){
                                vm.migrationName = $window.localStorage.migrationName;
                            }
                            else{
                                $window.localStorage.migrationName = vm.migrationName;
                            }
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
                        },function(error){
                            vm.continuing = false;
                            vm.errorInContinue = true;
                        });
                    }
                    else{
                        $('#save_for_later').modal('hide');
                        $('#name_modal').modal('hide');
                        $("#no_selection").modal('show');
                        $('#intro_modal').modal('hide');
                    }
                };

                vm.eligibilityDetailsModal = function(itemdetails) {
                    vm.eligTestDetails = itemdetails;
                    $('#eligibility_modal').modal('show');
                }

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
                    } 
                   //condition for direct url jumping or hitting...
                      if((oldUrl != undefined) && (newUrl.indexOf("migration/recommendation") > -1) )
                            {
                         event.preventDefault();
                      $rootRouter.navigate(["MigrationStatus"]);
                    }


                });

                /**
                  * @ngdoc method
                  * @name createFawsAccount
                  * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                  * @description 
                  * Makes a call to api/tenants/create_faws_account API to create new FAWS account for a tenant ID.
                */
                vm.createFawsAccount = function(rack) {
                    vm.fawsCreationProgress = true;
                    var requestObj = {};
                    // dataStoreService.createFawsAccount(requestObj)
                    var promise = {};
                    if(rack){
                        requestObj = {
                            'account_name' : vm.fawsAcctName,
                            'service_level' : vm.serviceLevel
                        }
                        promise = dataStoreService.createFawsAccount(requestObj);
                    }
                    else{
                        requestObj = {
                            "dest_name":vm.fawsAcctName,
                            "dest_account": vm.fawsAcctId,
                            "dest_role_arn": vm.fawsKeyValue1,
                            "dest_external_id": vm.fawsKeyValue2
                        };
                        promise = dataStoreService.addCredsForFawsAccount(requestObj);
                    }
                    $q.all([promise]).then
                        (function (result) {
                            if (result.length > 0 && !result[0].error){
                                vm.newAccountDetails = result;
                                vm.fawsResponse = true;
                                vm.fawsError = false;
                                vm.fawsCreated = true;
                                vm.fawsCreationProgress = false;
                            }
                            else{
                                vm.fawsError = true;
                                vm.fawsResponse = false;
                                vm.fawsCreated = false;
                                vm.fawsCreationProgress = false;
                                $timeout(function () {
                                    vm.fawsError = false;
                                },3000);
                            }
                            vm.fawsAcctName = '';
                            vm.fawsAcctId = '';
                            vm.fawsKeyValue1 = '';
                            vm.fawsKeyValue2 = '';
                            vm.fawsSourceKey = '';
                            vm.fawsTenantId = '';
                    }, function (error) {
                        vm.fawsError = true;
                        vm.fawsResponse = false;
                        vm.fawsCreated = false;
                        vm.fawsCreationProgress = false;
                        $timeout(function () {
                            vm.fawsError = false;
                        },3000);
                    });
                }
                 
                vm.itemsLoadingStatus = function(status){
                    vm.itemsLoading = status;
                };

                vm.switchUser = function(){
                    vm.isRacker = !vm.isRacker;
                }

                vm.simulateNoFaws = function(){
                    vm.noFawsAccounts = !vm.noFawsAccounts;
                    var tenant_id = authservice.getAuth().tenant_id;
                    vm.fawsLink = "https://mycloud.rackspace.com/cloud/"+tenant_id+"/tickets#new";
                }

                return vm;
            }
        ]}); // end of component rsmigrationresourceslist
})();
