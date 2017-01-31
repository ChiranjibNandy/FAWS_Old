(function() {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rscontact
     * @description
     * Component to display contact options. For now will include creating a ticket and displaying a list of phone numbers.
     *
     * This component uses the template: **angtemplates/migration/contact.html**
     *
     * This component (and its features) is being used by following pages of the application:
     *  * angtemplates/migration/migration-status.html
     * @example
     * coming soon...
     */
    angular.module("migrationApp")
        .component("rscontact", {
            templateUrl: "/static/angtemplates/migration/contact.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rscontact
             * @description Controller to get handle interaction with api to get phone numbers
             */
            controller: ["datastoreservice", "migrationitemdataservice", "$scope", "authservice", function (dataStoreService, migrationItemDataService, $scope, authService) {

                var vm = this;
                var auth = authService.getAuth();
                vm.tenant_id = auth.tenant_id;

                vm.$onInit = function() {
                    migrationItemDataService.getDetailedList('contactNumbers')
                        .then(function (response) {
                            vm.contactNumbers = response;
                            console.log(response);
                        });
                 }

                $scope.showPopover = function(element) {
                    $scope.popoverIsVisible = true;
                };

                $scope.hidePopover = function (element) {
                    $scope.popoverIsVisible = false;
                };

                return vm;
            }]
        }); // end of component rscontact
})();