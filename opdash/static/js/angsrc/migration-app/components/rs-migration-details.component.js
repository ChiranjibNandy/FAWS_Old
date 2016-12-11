(function () {
    "use strict";

    // defining component to display details of the items to be migrated
    angular.module("migrationApp")
        .component("rsmigrationdetails", {
            templateUrl: "/static/angtemplates/migration/migration-details.html",
            controllerAs: "vm",
            controller: ["migrationitemdataservice", "httpwrapper", "$timeout", function (ds, $timeout, HttpWrapper) {
                var vm = this;

                // When the component is active get router params and fetch data
                vm.$routerOnActivate = function(next, previous) {
                    var flavor = "GPv1";
                    var ram = 1;

                    vm.type = next.params.type;
                    vm.id = next.params.id;

                    ds.getMigrationDetails(vm.type, vm.id)
                            .then(function (response) {
                                vm.migrationDetail = response;
                            });

                    ds.getPricingDetails(vm.type, flavor, ram)
                        .then(function (response) {
                            var tempPriceList = response.data;
                            var priceDataList = [];
                            for(var i=0; i<tempPriceList.length; i++){
                                var awsTypes = tempPriceList[i].aws_types.split(",");

                                for(var j=0; j<awsTypes.length; j++){
                                    priceDataList.push({
                                        aws_type: awsTypes[j],
                                        flavor: tempPriceList[i].flavor,
                                        ram: tempPriceList[i].ram,
                                        price: tempPriceList[i].price
                                    });
                                }
                            }
                            vm.priceDataList = priceDataList;
                        });
                }; // end of $routerOnActivate

                vm.startMigration = function() {
                    if(!vm.submitting){

                        if(!vm.selectedAWSType){
                            vm.showPricingError = true;
                            return;
                        }

                        vm.submitting = true;
                        vm.showPricingError = false;

                        var requestObj = ds.prepareRequest(vm.type, {id: vm.id, type: vm.selectedAWSType});
                        console.log(requestObj);

                        HttpWrapper.save("/api/job", {"operation":'POST'}, requestObj)
                                   .then(function(response){
                                       vm.submitting = false;
                                       console.log(response);
                                   });
                        
                    }
                };

                return vm;
            }] // end of component controller
        }); // end of component definition
})();
