(function() {
    "use strict";
    
    angular.module("migrationApp")
            .component("rsmigrationstatus", {
                templateUrl: "/static/angtemplates/migration/migration-status.html",
                controllerAs: "vm",
                controller: ["httpwrapper", function(HttpWrapper) {
                    var vm = this;
                    vm.batches = [];
                    vm.scheduledDateTime = "17/01/2017 07:00PM";

                    var getBatches = function() {
                        var url = "/static/angassets/migration-status.json";
                        HttpWrapper.send(url,{"operation":'GET'})
                                .then(function(response) {
                                    console.log("Batch: ", response);
                                    vm.batches = response;
                                }, function(errorResponse) {
                                    console.log("Error: ", errorResponse);
                                });
                    };

                    vm.$onInit = function() {
                        getBatches();
                    };
                }]
            });
})();