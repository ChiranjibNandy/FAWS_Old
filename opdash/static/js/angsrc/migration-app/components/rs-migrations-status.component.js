(function () {
   "use strict";

   // defining component to display details of the items to be migrated
   angular.module("migrationApp")
       .component("rsmigrationsstatus", {
           templateUrl: "/static/angtemplates/migration/migrations-status.html",
           controllerAs: "vm",
           controller: ["migrationitemdataservice", "authservice", "$q", function (ds, authservice, $q) {
               var vm = this;
               vm.loading = true;
               vm.loadError = false;
               vm.noData = false;
               $('title')[0].innerHTML = "Migration Status - Rackspace Cloud Backup";

               var mapServerName = function(dataList, jobsList) {
                    for(var i=0; i<jobsList.length; i++){
                        var nameItem = dataList.filter(function(item){ return item.id === jobsList[i].server_id })[0];
                        if(nameItem)
                            jobsList[i].name = nameItem.name;
                    }

                    return jobsList;
                };

                // When the component is active get router params and fetch data
                vm.$onInit = function() {
                    vm.tenant_id = authservice.getAuth().tenant_id;
                    // Retrieve all migration items of a specific type (eg: server, network etc)
                    var list = ds.getTrimmedAllItems("server"); // TODO: Need to pass 'type' dynamically

                    // Retrieve migration item status
                    var status = ds.getServerMigrationStatus(vm.tenant_id);

                    $q.all([list, status]).then(function(results) {
                        if(results[0].error || results[1].error){
                            vm.loading = false;
                            vm.loadError = true;
                            return;
                        }

                        if(results[1].server_status.length === 0){
                            vm.noData = true;
                            vm.loading = false;
                            return;
                        }

                        var dataList = results[0].data;
                        var jobsList = results[1].server_status;

                        vm.migrations = mapServerName(dataList, jobsList);
                        vm.loading = false;
                    });
                }; // end of $routerOnActivate
               return vm;
           }] // end of component controller
       }); // end of component definition

})();