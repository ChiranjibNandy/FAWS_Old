(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsmigrationrackerdash
     * @description
     * Component to display the list of tenants whose resource migration has to be done. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/racker-dash.html**.  
     *   
     * Its controller {@link migrationApp.controller:rsmigrationrackerdashCtrl rsmigrationrackerdashCtrl} uses the below services:
     *  * {@link migrationApp.service:authservice authservice}
     *  * {@link migrationApp.service:datastoreservice datastoreservice}
     * $scope
     * httpwrapper
     * $q
     * $rootRouter
     * $window
     * $timeout 
     */
    angular.module("migrationApp")
        .component("rsmigrationrackerdash", {
            templateUrl: "/static/angtemplates/migration/racker-dash.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsmigrationrackerdashCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsmigrationrackerdash rsmigrationrackerdash} component
             */
            controller:["authservice", "datastoreservice", "$scope","httpwrapper","$q","$rootRouter","$window","$timeout","$rootScope",function(authservice,datastoreservice, $scope,HttpWrapper,$q,$rootRouter,$window,$timeout,$rootScope){
                var vm = this;
                vm.items = [];
                vm.addedAccount = '';
                const username = authservice.getAuth().username;

                //gets the tenant data list when a racker logs in
                /**
                 * @ngdoc method
                 * @name getTenants
                 * @methodOf migrationApp.controller:rsmigrationrackerdashCtrl
                 * @description 
                 * Fetches the tenant data list when a racker logs in.
                 */
                vm.getTenants = function(){                   
                     return HttpWrapper.send('/api/tenants/get_user_tenants/'+username, {"operation":'GET'})
                    .then(function(result){
                        vm.loading = false;
                        if(result.length === 0){
                            vm.noData = true;
                        }
                        else {
                            vm.noData = false;
                            result.forEach(function(item){
                                vm.items.push({
                                    "accountName":item.rax_name+" (#"+item.tenant_id+")",
                                    "serviceLevel":item.rax_service_level,
                                    "accountLevel":item.faws_service_level,
                                    "inProgressBatches":item.migrations_in_progress,
                                    "completedBatches":item.migrations_completed,
                                    "tenant_account_name":item.rax_name
                                });
                            });
                        }
                    }).catch(function(error) {
                        vm.loading = false;
                        vm.loadError = true;
                        console.log("Error: Could not fetch tenant", error);
                    });

                }

                //performs controller initialization steps
                vm.$onInit = function() { 
                    datastoreservice.resetAll();
                    $rootScope.$on("vm.MigrationName",function(event,value){
                        console.log(value);
                     vm.migrationName = value;
                        });
                         $rootScope.$on("vm.MigrationTime",function(event,value){
                        console.log(value);
                     vm.migrationTime = value;
                        });

                    /**
                     * @ngdoc property
                     * @name pageArray
                     * @propertyOf migrationApp.controller:rsmigrationrackerdashCtrl
                     * @type {Array}
                     * @description Holds an array of pages that display the fetched tenant data list
                     */
                    vm.pageArray = [];

                    /**
                     * @ngdoc property
                     * @name loading
                     * @propertyOf migrationApp.controller:rsmigrationrackerdashCtrl
                     * @type {Boolean}
                     * @description Displays the loading icon till the underlying API call resolves
                     */
                    vm.loading = true;

                    /**
                     * @ngdoc property
                     * @name loadError
                     * @propertyOf migrationApp.controller:rsmigrationrackerdashCtrl
                     * @type {Boolean}
                     * @description Displays an error message indicating that an error has occured while fetching the complete tenant data list
                     */
                    vm.loadError = false;

                    /**
                     * @ngdoc property
                     * @name loadTenantError
                     * @propertyOf migrationApp.controller:rsmigrationrackerdashCtrl
                     * @type {Boolean}
                     * @description Displays an error message indicating that an error has occured while adding a tenant 
                     */
                    vm.loadTenantError = false;

                     /**
                     * @ngdoc property
                     * @name saveInProgress
                     * @propertyOf migrationApp.controller:rsmigrationrackerdashCtrl
                     * @type {Boolean}
                     * @description Displays a processing indicator 
                     */                   
                    vm.saveInProgress = false,

                    /**
                     * @ngdoc property
                     * @name loadTenantError
                     * @propertyOf migrationApp.controller:rsmigrationrackerdashCtrl
                     * @type {Boolean}
                     * @description Displays an error message if any error has occured while adding a tenant 
                     */
                    vm.showFetch = false;

                      /**
                     * @ngdoc property
                     * @name noData
                     * @propertyOf migrationApp.controller:rsmigrationrackerdashCtrl
                     * @type {Boolean}
                     * @description Displays a message indicating no tenant data in the grid
                     */
                    vm.noData = false;

                      /**
                     * @ngdoc property
                     * @name loadTenantError
                     * @propertyOf migrationApp.controller:rsmigrationrackerdashCtrl
                     * @type {String}
                     * @description Holds the account name of the selected tenant 
                     */
                    vm.account_name = null;
                    authservice.getAuth().tenant_id= null;

                    /**
                     * @ngdoc property
                     * @name currentPage
                     * @propertyOf migrationApp.controller:rsmigrationrackerdashCtrl
                     * @type {Number}
                     * @description Holds current page number
                     */
                    vm.currentPage = 0;

                    /**
                     * @ngdoc property
                     * @name pageSize
                     * @propertyOf migrationApp.controller:rsmigrationrackerdashCtrl
                     * @type {Number}
                     * @description Holds the number of maximum items current a page can contain
                     */                  
                    vm.pageSize = 0;

                    /**
                     * @ngdoc property
                     * @name totalItems
                     * @propertyOf migrationApp.controller:rsmigrationrackerdashCtrl
                     * @type {Number}
                     * @description Holds the number of total items 
                     */                    
                    vm.totalItems = 0;

                    /**
                     * @ngdoc property
                     * @name noOfPages
                     * @propertyOf migrationApp.controller:rsmigrationrackerdashCtrl
                     * @type {Number}
                     * @description Holds the total number of pages that are part of the pagination control 
                     */                     
                    vm.noOfPages = 0;
                    
                    // populate tenants array
                    var getTenantDetails = vm.getTenants();

                    vm.sortVal = "";

                    //Waits till all the promises are resolved , then only loads the pricing details
                    $q.all([getTenantDetails]).then(function(results) {
                        vm.loading = false;

                        // pagination controls
                        vm.currentPage = 1;
                        vm.pageSize = 5; // items per page
                        vm.totalItems = vm.items.length;
                        vm.noOfPages = Math.ceil(vm.totalItems / vm.pageSize);
                        for(var i=1;i<=vm.noOfPages;i++){
                            vm.pageArray.push(i);
                        };  

                    }, function(error){
                        vm.loading = false;
                        vm.loadError = true;
                    });
                 
                    $(document).on("click", function() {
                        $timeout(function() {
                            resetActionFlags();
                        });
                    });
                }

                //removes the selected tenant data from the tenant info grid
                /**
                 * @ngdoc method
                 * @name removeTenantAccount
                 * @methodOf migrationApp.controller:rsmigrationrackerdashCtrl
                 * @description 
                 * removes the selected tenant data from the tenant info grid.
                 */
                vm.removeTenantAccount = function(item){
                    vm.loading = true;
                    vm.loadError = false;

                    var tenant_id_text = item.accountName;
                    var tenant_id = tenant_id_text.substring(tenant_id_text.lastIndexOf("#")+1,tenant_id_text.lastIndexOf(")"));

                    HttpWrapper.delete("/api/tenants/remove_user_tenant/"+username+"/"+tenant_id, {"operation":'delete'})
                    .then(function(result){
                        vm.loading = false;
                        vm.items =[];
                        vm.showFetch = true;
                        vm.fetchResponse = "Successfully removed tenant id";

                        result.forEach(function(item){
                            vm.items.push({
                                "accountName":item.rax_name+" (#"+item.tenant_id+")",
                                "serviceLevel":item.rax_service_level,
                                "accountLevel":item.faws_service_level,
                                "inProgressBatches":item.migrations_in_progress,
                                "completedBatches":item.migrations_completed,
                                "tenant_account_name":item.rax_name
                            });
                        });

                        // Refresh pagination controls
                        vm.currentPage = 1;
                        vm.pageSize = 5; // items per page
                        vm.totalItems = vm.items.length;
                        vm.noOfPages = Math.ceil(vm.totalItems / vm.pageSize);
                        vm.pageArray = [];
                        for(var i=1;i<=vm.noOfPages;i++){
                            vm.pageArray.push(i);
                        }; 

                        $timeout(function () {
                            vm.showFetch = false;
                            vm.fetchResponse = "";
                        }, 4000); 

                    }).catch(function(error){
                        vm.loading = false;
                        vm.loadError = true;
                        if(vm.items.length === 1){
                            vm.items.length = 0;
                            vm.loadError = false;
                            vm.totalItems = 0;
                            vm.noData = true;
                        }
                        else {
                            vm.totalItems = vm.items.length;
                            vm.noData = false;
                        }
                        
                        vm.showFetch = false;
                        vm.fetchResponse = "";
                        console.log("Error in removing tenant id");
                    });

                }

                //opens add tenant id modal 
                /**
                 * @ngdoc method
                 * @name openAddAccountModalDialog
                 * @methodOf migrationApp.controller:rsmigrationrackerdashCtrl
                 * @description 
                 * opens a modal to add new tenant id.
                 */
                vm.openAddAccountModalDialog = function(){
                    vm.loadTenantError = false;
                    $('#add_account_modal').modal('show');
                    vm.addedAccount = '';
                }

                //fetches the tenant info for the newly entered tenant id
                /**
                 * @ngdoc method
                 * @name submitAddAccount
                 * @methodOf migrationApp.controller:rsmigrationrackerdashCtrl
                 * @description 
                 * fetches the tenant info for the newly entered tenant id.
                 */
                vm.submitAddAccount = function(accountData) { 
                    vm.loading = true;
                    vm.loadError = false;
                    vm.loadTenantError = false;
                    vm.showFetch = true;
                    vm.noData = false;
                    vm.fetchResponse = "Successfully added new tenant id";

                    vm.saveInProgress = true;

                    var tenant_id = vm.addedAccount;                

                    var requestObj = {
                        "tenant_id":tenant_id,
                        "user_id":username
                    }

                    HttpWrapper.save("/api/tenants/add_user_tenant", {"operation":'POST'}, requestObj)
                    .then(function(result){
                        vm.loading = false;
                        vm.saveInProgress = false;  
                        vm.addedAccount = '';
                        vm.items =[];
                        $('#add_account_modal').modal('hide'); 

                        result.forEach(function(item){
                            vm.items.push({
                                "accountName":item.rax_name+" (#"+item.tenant_id+")",
                                "serviceLevel":item.rax_service_level,
                                "accountLevel":item.faws_service_level,
                                "inProgressBatches":item.migrations_in_progress,
                                "completedBatches":item.migrations_completed,
                                "tenant_account_name":item.rax_name
                            });
                        });

                        // Refresh pagination controls
                        vm.currentPage = 1;
                        vm.pageSize = 5; // items per page
                        vm.totalItems = vm.items.length;
                        vm.noOfPages = Math.ceil(vm.totalItems / vm.pageSize);
                        vm.pageArray = [];
                        for(var i=1;i<=vm.noOfPages;i++){
                            vm.pageArray.push(i);
                        }; 

                        $timeout(function () {
                            vm.showFetch = false;
                            vm.fetchResponse = "";
                        }, 4000); 

                    }).catch(function(error){
                        vm.loading = false;
                        vm.loadTenantError = true; 
                        vm.showFetch = false;
                        vm.fetchResponse = "";                       
                        vm.saveInProgress = false;  
                        console.log("Error in saving tenant id");
                    });

                    $('#save_for_later').modal('show');
                }

                //sets the tenant id and redirects the racker to the MigrationResourceList page
                /**
                 * @ngdoc method
                 * @name setTenantId
                 * @methodOf migrationApp.controller:rsmigrationrackerdashCtrl
                 * @description 
                 * sets the tenant id and redirects the racker to the MigrationResourceList page.
                 */
                vm.setTenantId = function(item){
                    var doSavedForLaterMigrationsExist = false;
                    var doResourceMigrationsExist = false;
                    var tenant_id_text = item.accountName;
                    var tenant_id = tenant_id_text.substring(tenant_id_text.lastIndexOf("#")+1,tenant_id_text.lastIndexOf(")"));
                    authservice.getAuth().tenant_id = tenant_id;
                    authservice.getAuth().account_name = item.tenant_account_name;

                    var getSavedInstancesUrl = "/api/users/uidata/Saved_Migrations";
                    var savedMigrationPromise = HttpWrapper.send(getSavedInstancesUrl, {"operation":'GET'})
                    .then(function(result){
                        if(result !== null && result.savedDetails.length !== 0){
                            doSavedForLaterMigrationsExist = true;
                        }
                    },function(error) {
                        doSavedForLaterMigrationsExist = false;
                    });

                    var url = "/api/jobs/all";
                    var resourceMigrationPromise = HttpWrapper.send(url,{"operation":'GET'})
                    .then(function(response){
                        if(response !== null && response.job_status_list.length !== 0){
                            doResourceMigrationsExist = true;
                        }
                    },function(error) {
                        doResourceMigrationsExist = false;
                    });

                    $q.all([savedMigrationPromise,resourceMigrationPromise]).then(function(result){
                        if(doSavedForLaterMigrationsExist === false && doResourceMigrationsExist === false){
                            $rootRouter.navigate(["MigrationResourceList"]);                          
                        }
                        else{
                            $rootRouter.navigate(["MigrationStatus"]);
                        }
                    });                    
                } 

                //sets the tenant id and redirects the racker to the MigrationStatus page
                /**
                 * @ngdoc method
                 * @name setMigrationStatusTenantId
                 * @methodOf migrationApp.controller:rsmigrationrackerdashCtrl
                 * @description 
                 * sets the tenant id and redirects the racker to the MigrationStatus page.
                 */
                vm.setMigrationStatusTenantId = function(item){
                    var tenant_id_text = item.accountName;
                    var tenant_id = tenant_id_text.substring(tenant_id_text.lastIndexOf("#")+1,tenant_id_text.lastIndexOf(")"));
                    authservice.getAuth().tenant_id = tenant_id;
                    authservice.getAuth().account_name = item.tenant_account_name;
                    $rootRouter.navigate(["MigrationStatus"]);
                } 

                //sets the tenant id and opens the encore link in a new browser tab
                /**
                 * @ngdoc method
                 * @name setEncoreLink
                 * @methodOf migrationApp.controller:rsmigrationrackerdashCtrl
                 * @description 
                 * sets the tenant id and opens the encore link in a new browser tab.
                 */
                vm.setEncoreLink = function(item){
                    var tenant_id_text = item.accountName;
                    var tenant_id = tenant_id_text.substring(tenant_id_text.lastIndexOf("#")+1,tenant_id_text.lastIndexOf(")"));
                    var encoreUrl = "https://encore.rackspace.com/accounts/"+tenant_id;
                    $window.open(encoreUrl, '_blank');
                } 

                var resetActionFlags = function() {
                    console.log("In function()");
                    for(var i=0; i<vm.items.length; i++){
                        vm.items[i].showSettings = false;
                    }
                };

                vm.showActionList = function(batch) {
                        console.log("In show action list");
                        resetActionFlags();
                        $timeout(function(){
                            batch.showSettings = true;
                        }, 50);
                };

                vm.setSortBy = function(sortByItem){
                    if(vm.sortVal === sortByItem){
                        vm.sortVal  = "-"+vm.sortVal;
                    }
                    else 
                        vm.sortVal = sortByItem;
                }

            }]
        });
})();
