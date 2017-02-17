(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsconfirmmigration
     * @description
     * Component to display the _Confirm Migration_ page. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/batch-migration-details.html**  
     *   
     * Its controller {@link migrationApp.controller:rsconfirmmigrationCtrl rsconfirmmigrationCtrl} uses the below services:
     *  * $rootRouter
     *  * {@link migrationApp.service:datastoreservice datastoreservice}
     *  * {@link migrationApp.service:migrationitemdataservice migrationitemdataservice}
     *  * $q
     *  * {@link migrationApp.service:httpwrapper httpwrapper}
     */
    angular.module("migrationApp")
        .component("rsconfirmmigration", {
            templateUrl: "/static/angtemplates/migration/confirm-migration.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsconfirmmigrationCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsconfirmmigration rsconfirmmigration} component
             */
            controller: [ "$rootRouter","datastoreservice","migrationitemdataservice", "$q","httpwrapper", "authservice", function($rootRouter,dataStoreService,ds,$q,HttpWrapper, authservice) {
                var vm = this;
                
                vm.$onInit = function() {
                    $('title')[0].innerHTML =  "Confirm Migration - Rackspace Cloud Migration";
                    console.log(dataStoreService.selectedDate);
                    var auth = authservice.getAuth();
                    vm.tenant_id = auth.tenant_id;
                    vm.tenant_name = auth.rackUsername;
                    vm.userOrTenant = auth.is_racker ? "Tenant" : "User";

                    vm.selectedItems = {};
                    vm.selectedItems.servers = dataStoreService.getItems("server");
                    vm.selectedItems.files = [];
                    vm.selectedItems.blocks = [];
                    vm.selectedItems.loadBalancers = [];
                    vm.selectedItems.cdns = [];
                    vm.selectedItems.dnss = [];
                    vm.selectedItems.databases = [];

                    vm.destination = "AWS EC2";
                    vm.batchName = dataStoreService.getScheduleMigration().migrationName;
                    vm.tempBatchName = vm.batchName;
                    var dt = new Date();
                    vm.scheduledDate = dataStoreService.getMigrationDate();
                    vm.scheduledTime = dataStoreService.getMigrationTime();
                    vm.scheduledTimezone = dataStoreService.selectedTime.timezone;
                    vm.cost = 431.85;
                    vm.migrating = false;
                    vm.errorInMigration = false;

                    vm.allItems = [];
                    vm.types = ['server','network'];
                    // var dateObject = dataStoreService.returnDate();
                    // var date = dateObject.date !== ''?moment(dateObject.date).format("MMM Do YY"):moment().format("MMM Do YY");
                    // vm.dateString = date+" at "+dateObject.time+" in "+dateObject.timezone;
                    
                    vm.types.map(function(type,index){
                        var data = dataStoreService.getItems(type);
                        if(data){
                            data.map(function(item){
                                vm.allItems.push(item);
                            });
                        }
                    });
                };

                /**
                 * @ngdoc method
                 * @name migrate
                 * @methodOf migrationApp.controller:rsconfirmmigrationCtrl
                 * @description 
                 * Starts a batch to migrate all resources selected by user
                 */
                vm.migrate = function(){
                    var equipments = [];
                    var requestObj;
                    vm.migrating = true;
                    vm.allItems.map(function(item){
                        equipments.push({equipmentType:item.type,id: item.id,type: "t2.micro",region: "US-East-1"});
                    });
                    requestObj = ds.prepareRequest(equipments, vm.batchName);
                    console.log(requestObj);
                    //$rootRouter.navigate(["MigrationStatus"]);
                    HttpWrapper.save("/api/job", {"operation":'POST'}, requestObj)
                                .then(function(result){
                                    console.log("Migration Response: ", result);
                                    $rootRouter.navigate(["MigrationStatus"]);
                                }, function(error) {
                                    console.log("Error: Could not trigger migration", error);
                                    vm.migrating = false;
                                    vm.errorInMigration = true;
                                });
                };

                vm.showMigrationNameDialog = function() {
                    console.log($('#name_modal2'));
                    $('#name_modal2').modal('show');
                };

                vm.showCancelDialog = function() {
                    $('#cancel_modal').modal('show');
                };

                vm.save = function() {
                    vm.batchName = vm.tempBatchName;
                    vm.editorEnabled = false;
                };

                vm.disableEditor = function() {
                    vm.tempBatchName = vm.batchName;
                    vm.editorEnabled = false;
                };

                return vm;
            }
        ]}); // end of component definition
})();