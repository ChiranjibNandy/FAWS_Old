(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        .component("rsconfirmmigration", {
            templateUrl: "/static/angtemplates/migration/confirm-migration.html",
            controllerAs: "vm",
            controller: [ "$rootRouter","datastoreservice","migrationitemdataservice", "$q","httpwrapper", function($rootRouter,dataStoreService,ds,$q,HttpWrapper) {
                var vm = this;
                
                vm.$onInit = function() {
                    vm.allItems = [];
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
                    console.log(vm.allItems);
                };

                vm.migrate = function(){
                    var migrateArray = [];
                    var requestObj;
                    vm.allItems.map(function(item){
                        if(item.type === "server"){
                            //have to populate the type field in the below object
                            requestObj = ds.prepareRequest(item.type, {id: item.id, type: "t2.micro"});
                            migrateArray.push(HttpWrapper.save("/api/job", {"operation":'POST'}, requestObj));
                        }else{
                            //hardcoded the value region just to trigger migration
                            requestObj = ds.prepareRequest(item.type, {id: item.id, region: "US-East-1"});
                            migrateArray.push(HttpWrapper.save("/api/job", {"operation":'POST'}, requestObj));
                        }
                    });
                    $q.all(migrateArray).then(function(results) {
                        console.log("results");
                        console.log(results.message);
                    });
                };
                return vm;
            }
        ]}); // end of component definition
})();