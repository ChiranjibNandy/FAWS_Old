(function () {
   "use strict";

   // defining component to display details of the items to be migrated
   angular.module("migrationApp")
       .component("rsmigrationsstatus", {
           templateUrl: "/static/angtemplates/migration/migrations-status.html",
           controllerAs: "vm",
           controller: ["migrationitemdataservice", "authservice", "$q", function (ds, authservice, $q) {
               var vm = this;
               vm.server = {};
               vm.network = {};

               vm.server.loading = true;
               vm.server.loadError = false;
               vm.server.noData = false;
               vm.network.loading = true;
               vm.network.loadError = false;
               vm.network.noData = false;

               $('title')[0].innerHTML = "Migration Status - Rackspace Cloud Backup";

               var mapServerName = function(dataList, jobsList) {
                    for(var i=0; i<jobsList.length; i++){
                        var nameItem = dataList.filter(function(item){ return item.id === jobsList[i].server_id })[0];
                        if(nameItem)
                            jobsList[i].name = nameItem.name;
                    }

                    return jobsList;
                };

                var mapNetworkName = function(dataList, jobsList) {
                    for(var i=0; i<jobsList.length; i++){
                        var nameItem = dataList.filter(function(item){ return item.subnets[0].id === jobsList[i].resources.networks[0].subnets[0].id })[0];
                        if(nameItem)
                            jobsList[i].name = nameItem.name;
                    }

                    return jobsList;
                };

                // vm.refreshpage=function(){
                //   alert("hello");
                //   //$window.location.reload();
                //   //$route.reload();
                //   $rootRouter.navigate(["MigrationsStatus"]);
                // }
                

                // When the component is active get router params and fetch data
                vm.$onInit = function() {
                    vm.tenant_id = authservice.getAuth().tenant_id;

                    // Retrieve all server migration items
                    var serverList = ds.getTrimmedAllItems("server");

                    // Retrieve all network migration items
                    var networkList = ds.getTrimmedAllItems("network");

                    // Retrieve migration item status
                    var status = ds.getServerMigrationStatus(vm.tenant_id);

                    $q.all([serverList, networkList, status]).then(function(results) {
                        var flag = true;
                        if(results[0].error || results[2].error){
                            vm.server.loading = false;
                            vm.server.loadError = true;
                            flag = false;
                        }

                        if(results[2].server_status.length === 0){
                            vm.server.noData = true;
                            vm.server.loading = false;
                            flag = false;
                        }

                        if(results[1].error || results[2].error){
                            vm.network.loading = false;
                            vm.network.loadError = true;
                            flag = false;
                        }

                        if(results[2].server_status.length === 0){
                            vm.network.noData = true;
                            vm.network.loading = false;
                            flag = false;
                        }

                        if(flag){
                            var serverDataList = results[0].data;
                            var networkDataList = results[1].data;
                            var serverJobsList = results[2].server_status;
                            var networkJobsList = results[2].network_status;

                            vm.server.migrations = mapServerName(serverDataList, serverJobsList);
                            vm.network.migrations = mapNetworkName(networkDataList, networkJobsList);
                            vm.server.loading = false;
                            vm.network.loading = false;
                        }
                    });
                }; // end of $routerOnActivate
               return vm;
           }] // end of component controller
       }); // end of component definition

})();