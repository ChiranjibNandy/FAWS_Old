(function () {
    "use strict";

    // defining component to display details of the items to be migrated
    angular.module("migrationApp")
        .component("rsmigrationdetails", {
            templateUrl: "/static/angtemplates/migration/migration-details.html",
            controllerAs: "vm",
            controller: ["migrationitemdataservice", "$timeout", "httpwrapper", "$rootRouter", function (ds, $timeout, HttpWrapper, $rootRouter) {
                var vm = this;

                // When the component is active get router params and fetch data
                vm.$routerOnActivate = function(next, previous) {
                    var flavor = "GPv1";
                    var ram = 1;

                    vm.type = next.params.type;
                    vm.id = next.params.id;
                    $('title')[0].innerHTML =  vm.type.charAt(0).toUpperCase() + vm.type.slice(1)+" Migration - Rackspace Cloud Backup";

                    ds.getMigrationDetails(vm.type, vm.id)
                            .then(function (response) {
                                vm.migrationDetail = response;
                                console.log(vm.migrationDetail);
                            });

                    if(vm.type === 'server'){
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
                    }

                    vm.destRegionList = [
                        {
                            regionValue: "us-east-1",
                            zoneValue: "us-east-1a",
                            regionText: "US East 1",
                            zoneText: "US East 1a"
                        }
                    ];
                }; // end of $routerOnActivate

                vm.startMigration = function() {
                    if(!vm.submitting){

                        if(vm.type==="server" && !vm.selectedAWSType){
                            vm.showPricingError = true;
                            return;
                        }

                        if(vm.type==="network" && !vm.selectedRegion){
                            vm.showRegionError = true;
                            return;
                        }

                        vm.submitting = true;
                        vm.showPricingError = false;
                        vm.migrationError = false;
                        vm.showRegionError = false;

                        var requestInfo;
                        if(vm.type === "server")
                            requestInfo = {id: vm.id, type: vm.selectedAWSType};
                        else
                            requestInfo = {id: vm.id, region: vm.selectedRegion};

                        var requestObj = ds.prepareRequest(vm.type, requestInfo);
                        console.log(requestObj);

                         HttpWrapper.save("/api/job", {"operation":'POST'}, requestObj)
                                    .then(function(response){
                                         if(!response.error){
                                             $timeout(function(){
                                                $rootRouter.navigate(["MigrationsStatus"]);
                                             }, 4000);
                                         } else {
                                             vm.migrationError = true;
                                             vm.submitting = false;
                                         }
                                    });

                        //var status = true;
//                        $timeout(function(){
//                            if(status){
//                                $rootRouter.navigate(["MigrationsStatus"]);
//                            } else {
//                                vm.migrationError = true;
//                                vm.submitting = false;
//                            }
//                        }, 2000);
                        
                    }
                };

                return vm;
            }] // end of component controller
        }); // end of component definition
})();
