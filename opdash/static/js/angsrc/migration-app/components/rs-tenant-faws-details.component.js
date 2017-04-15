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
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:tenantfawsdetailsCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rstenantfawsdetails rstenantfawsdetails} component
             */
            controller: ["datastoreservice", "authservice", function (dataStoreService, authservice) {
                var vm = this;
                vm.fawsAcctStatus = true;
                vm.tenant_id = '';
                vm.tenant_account_name = '';

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

                dataStoreService.getFawsAccounts()
                        .then(function (result) {
                            vm.awsAccountsDetails = result.awsAccounts;
                            if((vm.awsAccountsDetails == undefined || vm.awsAccountsDetails.length == 0)){
                                vm.fawsAcctStatus = false;
                            }
                            else{
                                vm.fawsAcctStatus = true;
                                var fawsAccountDetails = {
                                        awsAccounts:vm.awsAccountsDetails,
                                        totalAccounts: result.awsAccountLimit - result.remainingAccounts
                                    };
                                dataStoreService.saveFawsDetails(fawsAccountDetails);
                                vm.selectedFaws = vm.awsAccountsDetails[0].name + " " + "(#" + vm.awsAccountsDetails[0].awsAccountNumber + ")";
                            }
                });

                return vm;
            }]
        }); // end of component definition
})();