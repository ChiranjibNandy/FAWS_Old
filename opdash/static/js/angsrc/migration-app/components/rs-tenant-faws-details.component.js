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
                if (vm.currentPage == "select-resources")
                    vm.showCreateAccount = true;
                else 
                    vm.showCreateAccount = false;
                    
                vm.fetchFawsAccounts = function() {
                    dataStoreService.getFawsAccounts()
                        .then(function (result) {
                            //vm.awsAccountsDetails = (result.awsAccounts || '[]');
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
                                console.log("faws selected: "+vm.selectedFaws);
                            }
                    });
                };

                vm.fetchFawsAccounts();

                vm.fawsAccountchanged = function(){
                    dataStoreService.fawsAccounts.selectedFawsAccount = vm.selectedFaws;
                };

                vm.displayFawsAccounModal = function() {
                    vm.fawsResponse = false;
                    vm.fawsError = false;
                    vm.fawsCreated = false;
                    $('#create-faws-account-modal').modal('show');
                };

                vm.createFawsAccount = function() {
                    vm.fawsCreationProgress = true;
                                        
                    //var requestObj = {"test": vm.fawsAcctName}; //for testing FAWS account creation API 
                    var requestObj = {"project_name": vm.fawsAcctName}; //for actual creation of a new FAWS account - use only in prod
                    
                    dataStoreService.createFawsAccount(requestObj)
                        .then(function (result) {
                            vm.newAccountDetails = result;
                            if (vm.newAccountDetails.error != 400){
                                    console.log(vm.newAccountDetails);
                                    vm.fawsResponse = true;
                                    vm.fawsError = false;
                                    vm.fawsCreated = true;
                                    vm.fawsCreationProgress = false;
                                    vm.fetchFawsAccounts();
                                    // $timeout(function () {
                                    // $("#create-faws-account-modal").modal('hide');
                                    vm.fawsAcctName = '';
                                    // vm.fawsResponse = false;
                                    // }, 2000);
                            } 
                            else {
                                    vm.fawsError = true;
                                    vm.fawsResponse = false;
                                    vm.fawsCreated = false;
                                    vm.fawsCreationProgress = false;
                                    // $timeout(function () {
                                    // $("#create-faws-account-modal").modal('hide');
                                    vm.fawsAcctName = '';
                                    // vm.fawsResponse = false;
                                    // }, 2000);
                            }
                        });
                    };

                return vm;
            }]
        }); // end of component definition
})();
