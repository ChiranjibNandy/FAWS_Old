(function () {
    "use strict";

    // defining component to display all migration items
    angular.module("migrationApp")
        .component("rsmigrationlogin", {
            templateUrl: "/static/angtemplates/migration/login.html",
            controllerAs: "vm",
            controller: function() {
              this.username = 'thisisusername';
              this.password = '';
              return {
                login: function() {
                  console.info('USERNAME:', this.username);

                }
              }
            }

        });
})();
