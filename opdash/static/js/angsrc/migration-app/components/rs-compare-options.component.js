(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        // component to show recommendations to a user
        .component("rscompareoptions", {
            templateUrl: "/static/angtemplates/migration/compare-options.html",
            controllerAs: "vm",
            controller: ["datastoreservice","httpwrapper", "$rootRouter",function(dataStoreService,HttpWrapper,$rootRouter) {
                var vm = this;

                vm.$onInit = function(){
                    vm.servers = dataStoreService.getRecommendedItems();
                    vm.labels = ["Name","instance_type","region","cost","memory","vcpu"];
                    var url = "/static/angassets/compare-options.json";
                    HttpWrapper.send(url,{"operation":'GET'}).then(function(result){
                        vm.data = result.data;
                    });
                }
                
                vm.compare= function() {
                    $rootRouter.navigate(["MigrationRecommendation"]);
                };

                return vm;
            }
        ]}); // end of component definition
})();