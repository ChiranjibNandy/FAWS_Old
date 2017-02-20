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
            controller:["authservice", "datastoreservice", "$scope","httpwrapper","$q","$rootRouter","$window",function(authservice,datastoreservice, $scope,HttpWrapper,$q,$rootRouter,$window){
                var vm = this;
                vm.items = [];
                vm.addedAccount = '';
                const username = authservice.getAuth().username;

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

                // Perfoming controller initialization steps
                vm.$onInit = function() { 
                    console.log("In racker dash");
                    datastoreservice.resetAll();
                    vm.pageArray = [];
                    vm.loading = true;
                    vm.loadError = false;
                    vm.loadTenantError = false;
                    vm.saveInProgress = false,
                    
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

                vm.removeAccount = function(accountName){
                    		var index = -1;		
                            var comArr = eval( vm.items );
                            for( var i = 0; i < comArr.length; i++ ) {
                                if( comArr[i].accountName === accountName ) {
                                    index = i;
                                    break;
                                }
                            }
                            vm.items.splice( index, 1 );	
                }

                vm.openAddAccountModalDialog = function(){
                    vm.loadTenantError = false;
                    $('#add_account_modal').modal('show');
                    vm.addedAccount = '';
                }

                vm.submitAddAccount = function() { 
                    vm.loading = true;
                    vm.loadError = false;
                    vm.loadTenantError = false;

                    vm.saveInProgress = true;

                    var tenant_id = vm.addedAccount;                

                    var requestObj = {
                        "tenant_id":tenant_id,
                        "user_id":username
                    }

                    console.log("requestObj",requestObj);

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
                    }).catch(function(error){
                        vm.loading = false;
                        vm.loadTenantError = true; 
                        
                        vm.saveInProgress = false;  
                        console.log("Error in saving tenant id");
                    });

                    $('#save_for_later').modal('show');
                }

                vm.setTenantId = function(item){
                    var tenant_id_text = item.accountName;
                    var tenant_id = tenant_id_text.substring(tenant_id_text.lastIndexOf("#")+1,tenant_id_text.lastIndexOf(")"));
                    authservice.getAuth().tenant_id = tenant_id;
                    authservice.getAuth().account_name = item.tenant_account_name;
                    $rootRouter.navigate(["MigrationResourceList"]);
                } 

                vm.setMigrationStatusTenantId = function(item){
                    var tenant_id_text = item.accountName;
                    var tenant_id = tenant_id_text.substring(tenant_id_text.lastIndexOf("#")+1,tenant_id_text.lastIndexOf(")"));
                    authservice.getAuth().tenant_id = tenant_id;
                    authservice.getAuth().account_name = item.tenant_account_name;
                    $rootRouter.navigate(["MigrationStatus"]);
                } 

                vm.setEncoreLink = function(item){
                    var tenant_id_text = item.accountName;
                    var tenant_id = tenant_id_text.substring(tenant_id_text.lastIndexOf("#")+1,tenant_id_text.lastIndexOf(")"));
                    var encoreUrl = "https://encore.rackspace.com/accounts/"+tenant_id;
                    $window.open(encoreUrl, '_blank');
                } 

            }]
        });
})();
