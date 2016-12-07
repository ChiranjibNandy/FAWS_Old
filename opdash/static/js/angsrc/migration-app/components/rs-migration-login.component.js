(function () {
    "use strict";

    // defining component to display all migration items
    angular.module("migrationApp")
        .component("rsmigrationlogin", {
            templateUrl: "/static/angtemplates/migration/login.html",
            bindings: {
              username: "@",
              rsa_token: "@"
            },
            controller: function($scope, $http) {
              this.$onInit = function () {
                // This sets the default values
                this.username = '';
                this.rsa_token = '';
              };
              this.onSubmit = function() {
                // validate form here
                // if valid, submit form to login here

                console.info('USERNAME:', this.username);
                console.info('RSA_TOKEN:', this.rsa_token);

                return true;

              }
            }
        });
})();
