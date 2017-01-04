(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        .component("rsrecommendationitem", {
            templateUrl: "/static/angtemplates/migration/recommendation-item-template.html",
            bindings: {
                type: "@" // type parameter to be supplied (eg: server, network etc)
            },
            require: {
                parent: "^^rsmigrationrecommendation"
            },
            controllerAs: "vm",
            controller: ["migrationitemdataservice", "$rootRouter", "authservice", "$q", "datastoreservice", function (ds, $rootRouter, authservice, $q, dataStoreService) {
                var vm = this;

                vm.$onInit = function() {
                    vm.data = dataStoreService.getItems(vm.type);
                    if(vm.data.length >0)
                        vm.noData = false;
                    else
                        vm.noData = true;
                    vm.labels = [
                                    {field: "name", text: vm.type+" Name"},
                                    {field: "ip_address", text: "IP Address"},
                                    {field: "ram", text: "RAM"},
                                    {field: "status", text: "Status"}
                                ];
                };

                return vm;
            }]
        }); // end of component definition
})();
