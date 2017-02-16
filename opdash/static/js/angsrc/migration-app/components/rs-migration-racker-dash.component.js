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
            controller:["authservice","$scope","httpwrapper",function(authservice,$scope,HttpWrapper){
                var vm = this;
                vm.items = [];
                vm.addedAccount = '';

                // vm.setTenant = function(id) {
                //     authservice.getAuth().tenant_id = id;
                // };

                // Perfoming controller initialization steps

                vm.getTenants = function(){
                     vm.items = [
                        {
                            "accountName":"User Namegoeshere (#1024810)",
                            "serviceLevel":"Managed Operations",
                            "accountLevel":"Aviator",
                            "inProgressBatches":"2",
                            "completedBatches":"0"
                        },
                        {
                            "accountName":"User Namegoeshere (#1024811)",
                            "serviceLevel":"Managed Infrastructure",
                            "accountLevel":"Navigator",
                            "inProgressBatches":"2",
                            "completedBatches":"0"
                        },
                        {
                            "accountName":"User Namegoeshere (#1024812)",
                            "serviceLevel":"Managed Infrastructure",
                            "accountLevel":"Navigator",
                            "inProgressBatches":"7",
                            "completedBatches":"0"
                        },
                        {
                            "accountName":"User Namegoeshere (#1024813)",
                            "serviceLevel":"Managed Operations",
                            "accountLevel":"Aviator",
                            "inProgressBatches":"5",
                            "completedBatches":"2"
                        },
                        {
                            "accountName":"User Namegoeshere (#1024814)",
                            "serviceLevel":"Managed Infrastructure",
                            "accountLevel":"Simplified AWS",
                            "inProgressBatches":"1",
                            "completedBatches":"0"
                        }
                    ];
                }

                vm.$onInit = function() { 
                    vm.pageArray = [];

                    // populate tenants array
                    vm.getTenants();
                 
                    // pagination controls
                    vm.currentPage = 1;
                    vm.pageSize = 3; // items per page
                    vm.totalItems = vm.items.length;
                    vm.noOfPages = Math.ceil(vm.totalItems / vm.pageSize);
                    for(var i=1;i<=vm.noOfPages;i++){
                        vm.pageArray.push(i);
                    };                     
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
                    $('#add_account_modal').modal('show');
                }

                vm.submitAddAccount = function() {
                    $('#add_account_modal').modal('hide');  
                    var tenant_id = vm.addedAccount;                
                    vm.addedAccount = '';
                
                    HttpWrapper.send('/api/tenants/get_account_info/'+tenant_id, {"operation":'GET'})
                    .then(function(result){
                        console.log("Account Name Response: ", result);
                        vm.items.push({
                            "accountName":result.rax_name,
                            "serviceLevel":result.rax_service_name,
                            "accountLevel":result.faws_service_level,
                        });
                    }, function(error) {
                        console.log("Error: Could not fetch tenant", error);
                    });
                }

            }]
        });
})();
