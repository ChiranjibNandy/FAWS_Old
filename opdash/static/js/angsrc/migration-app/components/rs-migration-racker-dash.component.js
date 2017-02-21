(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsmigrationrackerdashboard
     * @description
     * Component to display the list of tenants whose resource migration has to be done. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/racker-dash.html**.  
     *   
     * Its controller {@link migrationApp.controller:rsmigrationrackerdashCtrl rsmigrationrackerdashCtrl} uses the below services:
     *  * {@link migrationApp.service:authservice authservice}
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
            controller:["authservice", "datastoreservice", "$scope","httpwrapper","$q","$rootRouter","$window","$timeout",function(authservice,datastoreservice, $scope,HttpWrapper,$q,$rootRouter,$window,$timeout){
                var vm = this;
                vm.items = [];
                vm.addedAccount = '';
                const username = authservice.getAuth().username;

                //gets the tenant info when a racker logs in
                /**
                 * @ngdoc method
                 * @name getTenants
                 * @methodOf migrationApp.controller:rsmigrationrackerdashCtrl
                 * @description 
                 * Fetches the tenant info list when a racker logs in.
                 */
                vm.getTenants = function(){                   
                     return HttpWrapper.send('/api/tenants/get_user_tenants/'+username, {"operation":'GET'})
                    .then(function(result){
                        vm.loading = false;
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
                    }).catch(function(error) {
                        vm.loading = false;
                        vm.loadError = true;
                        console.log("Error: Could not fetch tenant", error);
                    });

                }

                //performs controller initialization steps
                vm.$onInit = function() { 
                    console.log("In racker dash");
                    datastoreservice.resetAll();
                    vm.pageArray = [];
                    vm.loading = true;
                    vm.loadError = false;
                    vm.loadTenantError = false;
                    vm.saveInProgress = false,
                    vm.showFetch = false;
                    
                    vm.account_name = null;
                    authservice.getAuth().tenant_id= null;
                    // console.log("Onload Tenant_id=",authservice.getAuth().tenant_id);
                    
                    // populate tenants array
                    var getTenantDetails = vm.getTenants();

                    //Waits till all the promises are resolved , then only loads the pricing details
                    $q.all([getTenantDetails]).then(function(results) {
                        vm.loading = false;

                        // pagination controls
                        vm.currentPage = 1;
                        vm.pageSize = 3; // items per page
                        vm.totalItems = vm.items.length;
                        vm.noOfPages = Math.ceil(vm.totalItems / vm.pageSize);
                        for(var i=1;i<=vm.noOfPages;i++){
                            vm.pageArray.push(i);
                        };  
                    }, function(error){
                        vm.loading = false;
                        vm.loadError = true;
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

                        $timeout(function () {
                            vm.showFetch = false;
                            vm.fetchResponse = "";
                        }, 4000); 

                    }).catch(function(error){
                        vm.loading = false;
                        vm.loadError = true;
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
                vm.submitAddAccount = function() { 
                    vm.loading = true;
                    vm.loadError = false;
                    vm.loadTenantError = false;
                    vm.showFetch = true;
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
                    var tenant_id_text = item.accountName;
                    var tenant_id = tenant_id_text.substring(tenant_id_text.lastIndexOf("#")+1,tenant_id_text.lastIndexOf(")"));
                    authservice.getAuth().tenant_id = tenant_id;
                    authservice.getAuth().account_name = item.tenant_account_name;
                    $rootRouter.navigate(["MigrationResourceList"]);
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

            }]
        });
})();
