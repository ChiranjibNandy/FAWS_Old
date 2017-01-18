(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        .component("rsschedulemigration", {
            templateUrl: "/static/angtemplates/migration/schedule-migration.html",
            controllerAs: "vm",
            controller: [ "$rootRouter","datastoreservice","$scope", function($rootRouter,dataStoreService,$scope) {
                var vm = this;

                vm.$onInit = function() {
                    $('title')[0].innerHTML =  "Schedule Migration - Rackspace Cloud Migration";

                    vm.timeItems = ["12:00pm","12:30pm","1:00am"];
                    vm.timeZoneItems = ["EST","CST","TST"];
                    vm.time = vm.timeItems[0];
                    vm.timezone = vm.timeZoneItems[0];
                    vm.selectedDate = moment().format("MMM Do YYYY")+" at "+vm.time+" in "+vm.timezone;
                    vm.date = moment().format("MMM Do YYYY");
                    dataStoreService.storeDate('time',vm.time);
                    dataStoreService.storeDate('timezone',vm.timezone);
                    var d = new Date();
                    var timestmp = moment(d).format("DDMMMYYYY-hhmma");
                    vm.migrationName = 'Migration-' + timestmp;
                    $scope.$on("DateChanged", function(event, item){
                        vm.date = item;
                        vm.selectedDate = moment(item).format("MMM Do YYYY")+" at "+vm.time+" in "+vm.timezone;
                    });
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