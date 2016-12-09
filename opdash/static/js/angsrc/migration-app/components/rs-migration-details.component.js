(function () {
    "use strict";

    // defining component to display details of the items to be migrated
    angular.module("migrationApp")
        .component("rsmigrationdetails", {
            templateUrl: "/static/angtemplates/migration/migration-details.html",
            controllerAs: "vm",
            controller: ["migrationitemdataservice", function (ds) {
                var vm = this;

                // When the component is active get router params and fetch data
                vm.$routerOnActivate = function(next, previous) {
                   var flavor = "GPv1";
                    var ram = 1;

                    vm.type = next.params.type;
                    vm.id = next.params.id;
                    vm.migrationAccount = {
                        awsAccount: "",
                        accessKey: "",
                        secretKey: ""
                    };
                    vm.radioSelected = false;

                    ds.getMigrationDetails(vm.type, vm.id)
                            .then(function (response) {
                                vm.migrationDetail = response.data;
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

                vm.isPricingSelected = function(){
                    if(vm.selectedAWSType){
                        vm.radioSelected = true;
                        vm.selected = true;
                    } 
                    else{
                        vm.radioSelected = false;
                        vm.selected = false;
                    }
                };

                return vm;
            }] // end of component controller
        }); // end of component definition
})();
