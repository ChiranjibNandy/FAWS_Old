(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsequipmentdetails
     * @description
     * Component to display the details of a resource. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/equipment-details.html**  
     *   
     * Its controller {@link migrationApp.controller:rsequipmentdetailsCtrl rsequipmentdetailsCtrl} uses the below services:
     *  * {@link migrationApp.service:migrationitemdataservice migrationitemdataservice}
     *  * {@link migrationApp.service:serverservice serverservice}
     *  * {@link migrationApp.service:authservice authservice}
     */
    angular.module("migrationApp")
        .component("rsequipmentdetails", {
            templateUrl: "/static/angtemplates/migration/equipment-details.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsequipmentdetailsCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsequipmentdetails rsequipmentdetails} component
             */
            controller: ["migrationitemdataservice","serverservice","authservice", function (ds,ss,as) {
                var vm = this;
                
                // When the component is active get router params and fetch data
                vm.$routerOnActivate = function(next, previous) {
                    vm.type = next.params.type;
                    vm.id = next.params.id;

                    /**
                     * @ngdoc property
                     * @name equipment
                     * @propertyOf migrationApp.controller:rsequipmentdetailsCtrl
                     * @type {Object}
                     * @description Object containing details about the equipment
                     */
                    vm.equipment = {};

                    /**
                     * @ngdoc property
                     * @name tasks
                     * @propertyOf migrationApp.controller:rsequipmentdetailsCtrl
                     * @type {Array}
                     * @description Array containing set of tasks involved in migrating the resource 
                     */
                    vm.tasks = [];
                    
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