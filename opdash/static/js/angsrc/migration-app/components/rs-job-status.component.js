(function () {
    "use strict";

    // defining component to display details of a migration item
    angular.module("migrationApp")
        .component("rsjobstatus", {
            templateUrl: "/static/angtemplates/migration/job-status.html",
            controllerAs: "vm",
            controller: ["migrationitemdataservice","serverservice","authservice", function (ds,ss,as) {
                var vm = this;
                
                // When the component is active get router params and fetch data
                vm.$routerOnActivate = function(next, previous) {
                    vm.type = next.params.type;
                    vm.id = next.params.id;
                    $('title')[0].innerHTML =  vm.type.charAt(0).toUpperCase() + vm.type.slice(1) + " Details - Rackspace Cloud Backup";
                    
                    // fetch details based on selected migration item
                    ds.getDetailedList(vm.type)
                        .then(function (response) {
                            console.log(response);
                            vm.equipment = response.data.filter(function (item) { return item.id == vm.id })[0];
                            console.log(vm.equipment);
                        });

                    if(vm.type == 'server'){
                        ds.getServerMigrationStatus(as.getAuth().tenant_id)
                            .then(function(response){
                                var jobId = response.server_status
                                                .filter(function(item){
                                                    if(item.server_id == vm.id)
                                                        return item;
                                                });
                                if(jobId.length > 0){
                                    vm.jobId = jobId[0].id;
                                    ss.getJobTasks(jobId[0].id)
                                        .then(function(response){
                                            vm.jobStatus = response.data.results.instances[vm.id].status; 
                                            console.log(vm.jobStatus);
                                            vm.tasks = response.data.results.instances[vm.id].tasks;
                                            vm.showData = true;
                                        });
                                }                                            
                            });
                    }
                }; // end of $routerOnActivate

                return vm;
            }] // end of component controller
        }); // end of component definition
})();