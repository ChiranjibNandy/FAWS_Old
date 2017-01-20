(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        // component to show recommendations to a user
        .component("rscompareoptions", {
            templateUrl: "/static/angtemplates/migration/compare-options.html",
            controllerAs: "vm",
            controller: ["datastoreservice",function(dataStoreService) {
                var vm = this;
                vm.servers = dataStoreService.getRecommendedItems();
                vm.labels = ["Name","instance_type","region","cost","memory","vcpu"];
                return vm;
            }
        ]}); // end of component definition
})();