(function () {
    "use strict";

    // defining component to display details of the items to be migrated
    angular.module("migrationApp")
        .component("rsmigrationdetails", {
            templateUrl: "/static/angtemplates/migration/migration-details.html",
            controllerAs: "vm",
            controller: ["migrationitemdataservice", "$timeout", "httpwrapper", "$rootRouter","$interval", function (ds, $timeout, HttpWrapper, $rootRouter,$interval) {
                var vm = this;

                // When the component is active get router params and fetch data
                vm.$routerOnActivate = function(next, previous) {
                    var flavor;
                    var aws_region = "us-east-1";

                    vm.type = next.params.type;
                    vm.id = next.params.id;
                    $('title')[0].innerHTML =  vm.type.charAt(0).toUpperCase() + vm.type.slice(1)+" Migration - Rackspace Cloud Migration";

                    ds.getMigrationDetails(vm.type, vm.id)
                            .then(function (response) {
                                vm.migrationDetail = response;
                                console.log('MIGRATION DETAIL:', vm.migrationDetail);


                    if(vm.type === 'server'){
                        ds.getPricingDetails(vm.type, vm.migrationDetail.details.flavor.id, aws_region)
                            .then(function (response) {
                                var instance_types = response.data;
                                var key, instance_type;
                                var priceDataList = [];
                                for(key in instance_types) {
                                  instance_type = instance_types[key];
                                    priceDataList.push({
                                        instance_type: instance_type.instance_type,
                                        memory: instance_type.memory,
                                        cost: instance_type.cost
                                    });
                                }
                                vm.priceDataList = priceDataList;
                            });
                    }
                    });

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
                        console.log("begin migration", requestObj);

                         HttpWrapper.save("/api/job", {"operation":'POST'}, requestObj)
                                    .then(function(response){
                                        if(!response.error){
                                            var m=["Preparing job request...","Submitting job request...","Waiting for response from server...","Submitted job succesfully..."];
                                            var i=0;
                                            
                                            $interval(function(){
                                                document.getElementById("submitmsg").innerHTML=m[i];
                                                i=i+1;
                                            },2000,4,false);

                                     $timeout(function(){
                                                $rootRouter.navigate(["MigrationsStatus"]);
                                            }, 10000);
                                        } else {
                                                vm.migrationError = true;
                                                vm.submitting = false;
                                            }
                                    });

                    // var status = true;
                       // $timeout(function(){
                           // if(status){
                           //  var m=["Preparing job request...","Submitting job request...","Waiting for response from server...","Submitted job succesfully..."];
                           //  var i=0;
                           //  $interval(function(){
                           //              document.getElementById("submitmsg").innerHTML=m[i];
                           //              i=i+1;
                                   
                           //  },2000,4,false);

                            // var handle=$timeout(function(){
                            //                     document.getElementById("submitmsg").innerHTML="Preparing job request...";
                            //                 }, 2000,false);

                           //$timeout.cancel(handle);
                           // document.getElementById("submitmsg").innerHTML="Preparing job request...";
                           //  var handle=$timeout(function(){
                           //                      document.getElementById("submitmsg").innerHTML="Submitting job request...";
                           //                  }, 2000,false);
                           //  $timeout.cancel(handle);
                           //  var handle=$timeout(function(){
                           //                      document.getElementById("submitmsg").innerHTML="Waiting for response from server...";
                           //                  }, 2000,false);
                           //  $timeout.cancel(handle);
                           //  var handle=$timeout(function(){
                           //                      document.getElementById("submitmsg").innerHTML="Submitted job succesfully...";
                           //                  }, 2000,false);
                           // $timeout.cancel(handle);

                               // $rootRouter.navigate(["MigrationsStatus"]);
                           // } else {
                           //     vm.migrationError = true;
                           //     vm.submitting = false;
                           // }
                       // }, 2000);

                    }
                };

                return vm;
            }] // end of component controller
        }); // end of component definition
})();
