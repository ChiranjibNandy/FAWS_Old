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

                    var auth = authservice.getAuth();
                    vm.tenant_id = auth.tenant_id;
                    vm.tenant_name = auth.rackUsername;
                    vm.userOrTenant = auth.is_racker ? "Tenant" : "User";

                    vm.selectedItems = {};
                    vm.selectedItems.servers = ["cloud-endure-demo-A_db_slave", "cloud-endure-demo-B_db_slave"];
                    vm.selectedItems.files = ["File 1", "File 2", "File 3"];
                    vm.selectedItems.blocks = ["Block 1", "Block 2", "Block 3", "Block 4"];
                    vm.selectedItems.cdns = ["CDN 1"];

                    vm.destination = "AWS EC2";
                    vm.scheduledDateTime = "1/11/2017";
                    vm.cost = 431.85;

                    // vm.allItems = [];
                    // vm.disable = false;
                    // vm.types = ['server','network'];
                    // var dateObject = dataStoreService.returnDate();
                    // var date = dateObject.date !== ''?moment(dateObject.date).format("MMM Do YY"):moment().format("MMM Do YY");
                    // vm.dateString = date+" at "+dateObject.time+" in "+dateObject.timezone;
                    
                    // vm.types.map(function(type,index){
                    //     var data = dataStoreService.getItems(type);
                    //     data.map(function(item){
                    //         vm.allItems.push(item);
                    //     });
                    // });
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
                    vm.disable = true;
                    vm.allItems.map(function(item){
                        equipments.push({equipmentType:item.type,id: item.id,type: "t2.micro",region: "US-East-1"});
                    });
                    requestObj = ds.prepareRequest(equipments);

                    console.log(requestObj);
                    // HttpWrapper.save("/api/job", {"operation":'POST'}, requestObj).then(function(result){
                    //     console.log(result);
                    //     $rootRouter.navigate(["MigrationStatus"]);
                    // });
                };
                return vm;
            }
        ]}); // end of component definition
})();