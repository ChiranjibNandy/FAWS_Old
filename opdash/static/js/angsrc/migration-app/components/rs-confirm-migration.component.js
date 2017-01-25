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
            controller: [ "$rootRouter","datastoreservice","migrationitemdataservice", "$q","httpwrapper", function($rootRouter,dataStoreService,ds,$q,HttpWrapper) {
                var vm = this;
                
                vm.$onInit = function() {
                    $('title')[0].innerHTML =  "Confirm Migration - Rackspace Cloud Migration";

                    vm.allItems = [];
                    vm.disable = false;
                    vm.types = ['server','network'];
                    var dateObject = dataStoreService.returnDate();
                    var date = dateObject.date !== ''?moment(dateObject.date).format("MMM Do YY"):moment().format("MMM Do YY");
                    vm.dateString = date+" at "+dateObject.time+" in "+dateObject.timezone;
                    
                    vm.types.map(function(type,index){
                        var data = dataStoreService.getItems(type);
                        data.map(function(item){
                            vm.allItems.push(item);
                        });
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
                    vm.disable = true;
                    vm.allItems.map(function(item){
                        equipments.push({equipmentType:item.type,id: item.id,type: "t2.micro",region: "US-East-1"});
                    });
                    requestObj = ds.prepareRequest(equipments);

                    console.log("-------------");
                    console.log(requestObj);
                    console.log("-------------");
                    HttpWrapper.save("/api/job", {"operation":'POST'}, requestObj).then(function(result){
                        console.log("results inside component");
                        console.log(result);
                        $rootRouter.navigate(["MigrationStatus"]);
                    })


                    // vm.allItems.map(function(item){
                    //     if(item.type === "server"){
                    //         //have to populate the type field in the below object
                    //         requestObj = ds.prepareRequest(item.type, {id: item.id, type: "t2.micro"});
                    //         migrateArray.push(HttpWrapper.save("/api/job", {"operation":'POST'}, requestObj));
                    //     }else{
                    //         //hardcoded the value region just to trigger migration
                    //         requestObj = ds.prepareRequest(item.type, {id: item.id, region: "US-East-1"});
                    //         migrateArray.push(HttpWrapper.save("/api/job", {"operation":'POST'}, requestObj));
                    //     }
                    // });

                    // $q.all(migrateArray).then(function(results) {
                    //     console.log("results");
                    //     console.log(results.message);
                    // });                                
                };
                return vm;
            }
        ]}); // end of component definition
})();