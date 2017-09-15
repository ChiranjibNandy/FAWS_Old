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
            controller: ["authservice", "$scope", "$rootRouter", "datastoreservice", "migrationitemdataservice", "httpwrapper", "$timeout","$window","$q","$rootScope","DEFAULT_VALUES","featureservice",function(authservice, $scope, $rootRouter, dataStoreService, ds, HttpWrapper, $timeout,$window,$q, $rootScope,DEFAULT_VALUES,featureService) {
                var vm = this;
                vm.tenant_id = authservice.getAuth().tenant_id; //get Tenant ID
                vm.tenant_account_name = '';
                vm.saveClicked = false;
                vm.$onInit = function() {
                   // If status is true, popup for migration won't be displayed in first step of Migration.
                    $('body').removeClass('modal-open');
                    $('.modal-backdrop').remove();
                    vm.allowTabs = false;
                    vm.dontshowStatus = false;
                    vm.introModalLoading = true;
                    vm.noFawsAccounts = false;
                    vm.serviceLevel = "navigator";
                    vm.acceptTermsAndConditions= false;
                    vm.getFeatureFlags();
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
                    
                    if((modalDisplayStatus == 'true' )  && (prePageName == "MigrationStatus" || prePageName == "MigrationResourceList" || prePageName == undefined)){
                        $('#intro_modal').modal('show');
                        dataStoreService.setDontShowStatus(true);//set introduction modal flag to true after first time display.
                        // $window.localStorage.setItem('dontShowStatus',JSON.stringify(vm.dontshowStatus));
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
                        LoadBalancers:[],
                        volume:[],
                        service:[],
                        file:[],
                        dns:[]
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
                    //$window.localStorage.setItem('dontShowStatus',JSON.stringify(vm.dontshowStatus));
                    var timestmp = moment(d).format("DDMMMYYYY-hhmma");
                    /**
                     * @ngdoc property
                     * @name migrationName
                     * @propertyOf migrationApp.controller:rsmigrationresourceslistCtrl
                     * @type {String}
                     * @description Create Migration considering Timestamp.
                     */
                    vm.migrationName = dataStoreService.getScheduleMigration().migrationName || 'My Migration';
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

                vm.getFeatureFlags = function(){
                    featureService.getFeatureFlags().then(function(result){
                        if(result){
                            vm.featureFlags = result;
                        }
                        vm.allowTabs = true;
                    });
                };

                /**
                 * @ngdoc method
                 * @name addItem
                 * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                 * @param {Object} item Object describing the selected resource
                 * @description
                 * Called by child component when an item is selected
                 */
                vm.addItem = function(item, type) {
                    var itemExists = false;
                    //Checks to see if the item is already selected and placed in the local storage
                    if($window.localStorage.selectedResources !== undefined && JSON.parse($window.localStorage.selectedResources)[type].length){
                        vm.selectedItems[type] = JSON.parse($window.localStorage.selectedResources)[type];
                        for(var i =0;i < vm.selectedItems[type].length;i++){
                            if(vm.selectedItems[type][i].rrn  === item.rrn){
                                itemExists = true;
                            }
                        }
                    }
                    if(!itemExists){ //If not, add the item to the local storage
                        vm.selectedItems[type].push(item);
                        var selectedItems = [];
                        if($window.localStorage.selectedResources !== undefined && JSON.parse($window.localStorage.selectedResources)[type].length)
                            selectedItems = JSON.parse($window.localStorage.selectedResources)
                        if(!selectedItems[type]){
                            var arr = [item];
                            dataStoreService.setSelectedItems(arr, type);
                        }
                        else{
                            dataStoreService.setSelectedItems(selectedItems[type].concat(item), type)
                        }
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
                    if($window.localStorage.selectedResources !== undefined && JSON.parse($window.localStorage.selectedResources)[type].length)
                        vm.selectedItems[type] = JSON.parse($window.localStorage.selectedResources)[type];
                    else
                        vm.selectedItems[type] = [];
                    //look for item to be removed in array of selected items and splice it from the array.
                    angular.forEach(vm.selectedItems[type], function (item_selected, key) {
                        if(item_selected.id == item.id){
                            vm.selectedItems[type].splice(key, 1);
                            dataStoreService.setSelectedItems(vm.selectedItems[type], type);
                            var old = $window.localStorage.getItem('selectedResources');
                            if(old !== undefined)
                                old = JSON.parse(old)[type];
                            angular.forEach(old,function(item_selected,key){
                                if(item_selected.id == item.id){
                                    old.splice(key,1);
                                    if(old.length >= 1) //If not the last item, set the selected servers into local storage.
                                        dataStoreService.setSelectedItems(old, type)
                                    else{ //If is the the last item in localstorage , remove the key value pair altogether
                                        dataStoreService.setSelectedItems([], type);
                                        if(document.getElementsByClassName("fa fa-chevron-up")[0]){
                                            var element = document.getElementsByClassName("fa fa-chevron-up")[0];
                                            element.classList.remove("fa-chevron-up");
                                            element.classList.add("fa-chevron-down");
                                        }
                                    }
                                }
                            });
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
                    if($window.localStorage.selectedResources !== undefined && (JSON.parse($window.localStorage.selectedResources)['server'].length || JSON.parse($window.localStorage.selectedResources)['volume'].length || JSON.parse($window.localStorage.selectedResources)['service'].length || JSON.parse($window.localStorage.selectedResources)['file'].length || JSON.parse($window.localStorage.selectedResources)['dns'].length)){
                        vm.continuing = true;
                        var items = JSON.parse($window.localStorage.selectedResources)['server'];

                        var arr = [];

                        var billingIdsArray = [];
                        //Iterate through all the items and push the resource ids into an array
                        angular.forEach(items, function (item) {
                            billingIdsArray.push(item.id);
                        });

                        //Make the billing API call only for servers
                        ds.getBillingInfo(billingIdsArray)
                            .then(function(response){
                                var promises = null;
                                if(response !== undefined){
                                    var serversList = [];
                                    for (var key in response) {
                                        // iterate over response of the billing call by region
                                        if (response.hasOwnProperty(key) && response[key] !== null) {
                                            // iterate over each server and extract necessary data
                                            angular.forEach(response[key],function(server) {
                                                serversList.push(server);
                                            });
                                        }
                                    }                              
                                    angular.forEach(serversList,function(res){
                                        angular.forEach(items, function (item) {
                                            //Compare the id of the response object and that of the items array
                                            if(res.id == item.id){
                                                //If the ids match, merge both the objects properties
                                                jQuery.extend(item, res);
                                                //Find the id of the item, inside the items array and replace the item with the merged object 
                                                var i = items.map(function(x) {return x.id; }).indexOf(res.id);
                                                items[i] = item;
                                            }
                                        });
                                    });
                        
                                    promises = items.map(function(item) {
                                        if(item.selectedMapping == undefined || item.selectedMapping.cost == undefined){
                                            var reg = item.selectedMapping ? item.selectedMapping.region : DEFAULT_VALUES.REGION;
                                            var url = '/api/ec2/get_all_ec2_prices/'+item.details.flavor_details.id+'/'+reg;
                                            return HttpWrapper.send(url, {"operation": 'GET'}).then(function(pricingOptions) {
                                                item.selectedMapping = pricingOptions[0];
                                                item.selectedMapping.zone = 'us-east-1a'; 
                                                arr.push(item);
                                            });
                                        }
                                        else{
                                            arr.push(item);
                                        }
                                    });
                                }
                                $q.all(promises).then(function(result) {
                                    vm.selectedItems.server = arr;
                                    dataStoreService.setSelectedItems(vm.selectedItems.server, 'server');                            
                                    //Declare a tempItems array that would hold phase 2 resources
                                    var tempItems = [];

                                    if(JSON.parse($window.localStorage.selectedResources)['volume'].length > 0){
                                        tempItems = vm.populatePhase2ResourcesArray('volume',items);
                                        items = items.concat(tempItems);
                                        vm.selectedItems.volume = tempItems;
                                        dataStoreService.setSelectedItems(vm.selectedItems.volume,'volume');
                                    }
                                    if(JSON.parse($window.localStorage.selectedResources)['service'].length > 0){
                                        tempItems = vm.populatePhase2ResourcesArray('service',items);
                                        items = items.concat(tempItems);
                                        vm.selectedItems.service = tempItems;
                                        dataStoreService.setSelectedItems(vm.selectedItems.service,'service');
                                    }
                                    if(JSON.parse($window.localStorage.selectedResources)['file'].length > 0){
                                        tempItems = vm.populatePhase2ResourcesArray('file',items);
                                        items = items.concat(tempItems);
                                        vm.selectedItems.file = tempItems;
                                        dataStoreService.setSelectedItems(vm.selectedItems.file,'file');
                                    }
                                    if(JSON.parse($window.localStorage.selectedResources)['dns'].length > 0){
                                        tempItems = vm.populatePhase2ResourcesArray('dns',items);
                                        items = items.concat(tempItems);
                                        vm.selectedItems.dns = tempItems;
                                        dataStoreService.setSelectedItems(vm.selectedItems.dns,'dns');
                                    }
                                    vm.continuing = false;
                                    dataStoreService.setDontShowNameModal(true);
                                    vm.selectedTime = {
                                            migrationName:vm.migrationName,
                                            time:'',
                                            timezone:'',
                                            live_migrate:false,
                                        };
                                    dataStoreService.setScheduleMigration(vm.selectedTime);
                                    $('#save_for_later').modal('hide');
                                    $('#name_modal').modal('hide');
                                    $('#cancel_modal').modal('hide');
                                    $('#intro_modal').modal('hide');
                                    $('#no_selection').modal('hide');
                                    //On continuing to the recommendations page, we have to set all the region fetched flags 
                                    //to false so that all the calls can be made afresh
                                    ds.storeRegionFetchedFlags('server',false);
                                    ds.storeRegionFetchedFlags('volume',false);
                                    ds.storeRegionFetchedFlags('service',false);
                                    ds.storeRegionFetchedFlags('file',false);
                                    ds.storeRegionFetchedFlags('dns',false);
                                    $rootRouter.navigate(["MigrationRecommendation"]);    
                                },function(error){
                                    vm.continuing = false;
                                    vm.errorInContinue = true;
                                });
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
                    var promise = {};
                    if(rack){
                        requestObj = {
                            'account_name' : vm.fawsAcctName,
                            'service_level' : "navigator"
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
                                var elem = document.getElementById("welcomeModal");
                                elem.parentNode.removeChild(elem);
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
                };

                /**
                  * @ngdoc method
                  * @name createFawsAccount
                  * @methodOf migrationApp.controller:rsmigrationresourceslistCtrl
                  * @description 
                  * Populates phase 2 resources array.
                */
                vm.populatePhase2ResourcesArray = function(type,items){
                    var tempItems = JSON.parse($window.localStorage.selectedResources)[type];
                    tempItems = tempItems.map(function(item){
                        item.selectedMapping = {};
                        item.selectedMapping.region = DEFAULT_VALUES.REGION;
                        //If the resource type is volume, we need to build the object to hold selected zone and the zones array
                        if(type === 'volume'){
                            item.selectedMapping.zones = [];
                        }
                        return item;
                    });
                    return tempItems;
                };

                //look for tab click event and display continue and cancel migration buttons after resources are loaded.
                $scope.$on("tabChanged", function(event, type){
                    if(type != 'server'){
                        vm.itemsLoadingStatus(!(dataStoreService.retrieveallItems(type).length > 0));   
                    }
                });

                vm.showWelcomeModal =function(){
                    var url = '/api/user/settings';
                      HttpWrapper.patch("/api/user/settings", {
                                "operation": 'PATCH'
                            }, [{
                                  "key": "show_welcome_modal",
                                  "action": "save",
                                  "value": !dataStoreService.getDontShowStatus()
                             }])
                            .then(function (result) {
                            }, function (error) {
                                
                            });
                                
                }

                return vm;
            }
        ]}); // end of component rsmigrationresourceslist
})();
