(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rstenantfawsdetails
     * @description
     * Component to have a Tenant ID and Associated FAWS accounts in every page.  
     *   
     * This component uses the template: **angtemplates/migration/tenant-faws-details.html**. It uses the controller {@link migrationApp.controller:tenantfawsdetailsCtrl tenantfawsdetailsCtrl}.  
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rstenantfawsdetails error-message="Some error message"></rstenantfawsdetails>
     *   </file>
     * </example>
     */
    angular.module("migrationApp")
        .component("rstenantfawsdetails", {
            templateUrl: "/static/angtemplates/migration/tenant-faws-details.html",
            bindings: {
                editmigration: "@"
            },
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:tenantfawsdetailsCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rstenantfawsdetails rstenantfawsdetails} component
             */
            controller: ["datastoreservice", "authservice", "$timeout", function (dataStoreService, authservice, $timeout) {
                var vm = this;
                vm.fawsAcctStatus = true;
                vm.tenant_id = '';
                vm.tenant_account_name = '';
                vm.fawsAcctName = '';
                vm.fawsCreated = false;
                vm.fawsCreationProgress = false;
                vm.showCreateAccount = false;
                vm.fawsResponse = false;
                vm.fawsError = false;
                vm.newAccountDetails = {};

                vm.tenant_id = authservice.getAuth().tenant_id; //get Tenant ID
                   
                if(authservice.getAuth().is_racker == false){   //get Account Name
                    var actname = dataStoreService.getAccountName(vm.tenant_id); //this service method is setting the accountname through api
                    actname.then(function() {
                        vm.tenant_account_name = authservice.getAuth().account_name;
                    }); //waiting api promise to resolve
                }
                else{  //if logged in as a racker then it was sent by racker-dashboard page
                        vm.tenant_account_name = authservice.getAuth().account_name;
                } //end of if condition

                vm.auth = authservice.getAuth();

                vm.currentPage = dataStoreService.getPageName();
                if (vm.currentPage == "MigrationResourceList")
                    vm.showCreateAccount = true;
                else 
                    vm.showCreateAccount = false;

                /**
                  * @ngdoc method
                  * @name fetchFawsAccounts
                  * @methodOf migrationApp.controller:tenantfawsdetailsCtrl
                  * @description 
                  * Fetches FAWS accounts associated with tenant/customer ID.
                */
                vm.fetchFawsAccounts = function() {
                    dataStoreService.getFawsAccounts()
                        .then(function (result) {
                            if((result == null || result.awsAccounts.length == 0)){
                                vm.awsAccountsDetails = [];
                                vm.fawsAcctStatus = false;
                            }
                            else{
                                vm.awsAccountsDetails = result.awsAccounts;
                                vm.fawsAcctStatus = true;
                                if(dataStoreService.fetchFawsDetails().selectedFawsAccount == undefined || dataStoreService.fetchFawsDetails().selectedFawsAccount == ''){
                                    vm.selectedFaws = vm.awsAccountsDetails[0].name + " " + "(#" + vm.awsAccountsDetails[0].awsAccountNumber + ")";
                                }
                                else{
                                    vm.selectedFaws = dataStoreService.fetchFawsDetails().selectedFawsAccount;
                                }
                                vm.fawsAccountDetails = {
                                        awsAccounts:vm.awsAccountsDetails,
                                        selectedFawsAccount: vm.selectedFaws,
                                        totalAccounts: result.awsAccountLimit - result.remainingAccounts
                                    };
                                dataStoreService.saveFawsDetails(vm.fawsAccountDetails);
                            }
                    });
                };

                vm.fetchFawsAccounts();

                /**
                  * @ngdoc method
                  * @name fawsAccountchanged
                  * @methodOf migrationApp.controller:tenantfawsdetailsCtrl
                  * @description 
                  * To Detect if there is any change in selection of FAWS Account.
                 */
                vm.fawsAccountchanged = function(){
                    dataStoreService.fawsAccounts.selectedFawsAccount = vm.selectedFaws;
                };

                /**
                  * @ngdoc method
                  * @name displayFawsAccounModal
                  * @methodOf migrationApp.controller:tenantfawsdetailsCtrl
                  * @description 
                  * To Display modal to create new FAWS Account.
                */
                vm.displayFawsAccounModal = function() {
                    vm.fawsResponse = false;
                    vm.fawsError = false;
                    vm.fawsCreated = false;
                    $('#create-faws-account-modal').modal('show');
                };

                /**
                  * @ngdoc method
                  * @name createFawsAccount
                  * @methodOf migrationApp.controller:tenantfawsdetailsCtrl
                  * @description 
                  * Makes a call to api/tenants/create_faws_account API to create new FAWS account for a tenant ID.
                */
                vm.createFawsAccount = function() {
                    vm.fawsCreationProgress = true;
                                        
                    //var requestObj = {"test": vm.fawsAcctName}; //for testing FAWS account creation API 
                    var requestObj = {"project_name": vm.fawsAcctName}; //for actual creation of a new FAWS account - use only in prod
                    
                    dataStoreService.createFawsAccount(requestObj)
                        .then(function (result) {
                            vm.newAccountDetails = result;
                            if (vm.newAccountDetails.error != 400){
                                    vm.fawsResponse = true;
                                    vm.fawsError = false;
                                    vm.fawsCreated = true;
                                    vm.fawsCreationProgress = false;
                                    vm.fetchFawsAccounts();
                                    vm.fawsAcctName = '';
                            } 
                            else {
                                    vm.fawsError = true;
                                    vm.fawsResponse = false;
                                    vm.fawsCreated = false;
                                    vm.fawsCreationProgress = false;
                                    vm.fawsAcctName = '';
                            }
                        });
                    };

                return vm;
            }]
        }); // end of component definition
})();
