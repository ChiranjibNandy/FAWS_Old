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
            controller: ["datastoreservice", "authservice", "$timeout","$window", function (dataStoreService, authservice, $timeout,$window) {
                var vm = this;
                vm.fawsAcctStatus = true;
                vm.tenant_id = '';
                vm.tenant_account_name = '';
                vm.fawsAcctName = '';
                vm.fawsAcctId = '';
                vm.fawsAccessKey = '';
                vm.fawsSecretKey = '';
                vm.fawsSourceKey = '';
                vm.fawsTenantId = '';
                vm.fawsCreated = false;
                vm.fawsCreationProgress = false;
                vm.showCreateAccount = false;
                vm.fawsResponse = false;
                vm.fawsError = false;
                vm.newAccountDetails = {};

                vm.tenant_id = authservice.getAuth().tenant_id; //get Tenant ID
                vm.is_racker =  authservice.getAuth().is_racker;
                vm.fawsLink = "https://mycloud.rackspace.com/cloud/"+vm.tenant_id+"/tickets#new";

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

                vm.currentPage = dataStoreService.getPageName() || $window.localStorage.pageName;
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
                    dataStoreService.getFawsAccounts() ///make api call to retrieve list of FAWS account for this tenant ID
                        .then(function (result) {
                            if((result == null || result.awsAccounts.length == 0)){     //if there are no accounts array will be empty
                                vm.awsAccountsDetails = [];
                                vm.fawsAcctStatus = false;
                            }
                            else{
                                vm.awsAccountsDetails = result.awsAccounts;
                                vm.fawsAcctStatus = true;
                                if(dataStoreService.fetchFawsDetails().selectedFawsAccount == undefined || dataStoreService.fetchFawsDetails().selectedFawsAccount == ''){
                                    vm.selectedFawsName = vm.awsAccountsDetails[0].name;
                                    vm.selectedFawsNum=vm.awsAccountsDetails[0].awsAccountNumber;
                                    vm.selectedFaws = vm.selectedFawsName + "(#" +  vm.selectedFawsNum + ")"; //to display in faws dropdown default value 
                                }
                                else{
                                    vm.selectedFawsName = dataStoreService.fetchFawsDetails().selectedFawsAccount;
                                    vm.selectedFawsNum = dataStoreService.fetchFawsDetails().selectedFawsAccountNumber;
                                    vm.selectedFaws = vm.selectedFawsName + "(#" +  vm.selectedFawsNum + ")"; //to display in faws dropdown default value
                                }
                                vm.fawsAccountDetails = {
                                        awsAccounts:vm.awsAccountsDetails,
                                        selectedFawsAccount: vm.selectedFawsName,
                                        selectedFawsAccountNumber:vm.selectedFawsNum,
                                        totalAccounts: result.awsAccountLimit - result.remainingAccounts
                                    };
                                dataStoreService.saveFawsDetails(vm.fawsAccountDetails);
                            }
                    });
                };

                vm.fawsAccountDetails = JSON.parse($window.localStorage.getItem("fawsAccounts")); //if the page was refreshed, fetch the saved details
                
                if (vm.fawsAccountDetails === null) //will be null for first time login - make api call to fetch account list
                    vm.fetchFawsAccounts();
                else{
                    vm.awsAccountsDetails = vm.fawsAccountDetails.awsAccounts;
                    vm.selectedFawsName = vm.fawsAccountDetails.selectedFawsAccount;
                    vm.selectedFawsNum = vm.fawsAccountDetails.selectedFawsAccountNumber;
                    vm.selectedFaws = vm.selectedFawsName + "(#" +  vm.selectedFawsNum + ")"; //to display in faws dropdown default value
                }

                /**
                  * @ngdoc method
                  * @name fawsAccountchanged
                  * @methodOf migrationApp.controller:tenantfawsdetailsCtrl
                  * @description 
                  * To Detect if there is any change in selection of FAWS Account.
                 */
                vm.fawsAccountchanged = function(){
                    var tempSelectedFaws = vm.selectedFaws;

                    //split the name and number from the selected value 
                    var tempName = tempSelectedFaws.split('(')[0];
                    var temp1 = tempSelectedFaws.split('#')[1];
                    var tempNum = temp1.split(')')[0];

                    vm.selectedFawsName = tempName; //local component vars
                    vm.selectedFawsNum = tempNum;                                  

                    vm.fawsAccountDetails.selectedFawsAccount = tempName; //for localstorage save
                    vm.fawsAccountDetails.selectedFawsAccountNumber = tempNum;
                    
                    dataStoreService.saveFawsDetails(vm.fawsAccountDetails); //save in localstorage for future
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
                    // var requestObj = {"project_name": vm.fawsAcctName}; //for actual creation of a new FAWS account - use only in prod
                    var requestObj = {
                        "dest_name":vm.fawsAcctName,
                        "dest_account": vm.fawsAcctId,
                        "dest_auth_accesskey": vm.fawsAccessKey,
                        "dest_auth_secretkey": vm.fawsSecretKey
                     };
                    // dataStoreService.createFawsAccount(requestObj)
                    dataStoreService.addCredsForFawsAccount(requestObj)
                        .then(function (result) {
                            vm.newAccountDetails = result;
                            // if (vm.newAccountDetails.error < 400){
                            if (result == "OK"){
                                    vm.fawsResponse = true;
                                    vm.fawsError = false;
                                    vm.fawsCreated = true;
                                    vm.fawsCreationProgress = false;
                                    vm.fetchFawsAccounts();
                            } 
                            else {
                                    vm.fawsError = true;
                                    vm.fawsResponse = false;
                                    vm.fawsCreated = false;
                                    vm.fawsCreationProgress = false;
                            }
                            vm.fawsAcctName = '';
                            vm.fawsAcctId = '';
                            vm.fawsAccessKey = '';
                            vm.fawsSecretKey = '';
                            vm.fawsSourceKey = '';
                            vm.fawsTenantId = '';
                        });
                    };

                return vm;
            }]
        }); // end of component definition
})();
