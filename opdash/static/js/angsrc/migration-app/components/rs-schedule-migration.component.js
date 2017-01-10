(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        .component("rsschedulemigration", {
            templateUrl: "/static/angtemplates/migration/schedule-migration.html",
            controllerAs: "vm",
            controller: [ "$rootRouter","datastoreservice", function($rootRouter,dataStoreService) {
                var vm = this;

                vm.$onInit = function() {
                    vm.timeItems = ["12:00pm","12:30pm","1:00am"];
                    vm.timeZoneItems = ["EST","CST","TST"];
                    vm.time = vm.timeItems[0];
                    console.log(vm.day);
                    console.log(vm.selected);
                    vm.timezone = vm.timeZoneItems[0];

                    var d = new Date();
                    var timestmp = moment(d).format("DDMMMYYYY-hhmma");
                    vm.migrationName = 'Migration-' + timestmp;
                };

                vm.saveItems = function() {
                    alert("Saving items: To be implemented");
                };

                vm.timeChange = function(){
                    dataStoreService.storeDate('time',vm.time);
                };

                vm.timezoneChange = function(){
                    dataStoreService.storeDate('timezone',vm.timezone);
                };

                vm.continue = function() {
                    $rootRouter.navigate(["ConfirmMigration"]);
                };

                return vm;
            }
        ]}); // end of component definition
})();