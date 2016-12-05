(function () {
    "use strict";

    // defining component to display all migration items
    angular.module("migrationApp")
        .component("rsmigrationlogin", {
            templateUrl: "/static/angtemplates/migration/login.html",
            bindings: {
              username: "@",
              password: "@"
            },
            controller: function($scope, $element, $attrs) {
              this.$onInit = function () {
                // This sets the default values
                this.username = '';
                this.password = '';
              };
              this.onSubmit = function() {
                // validate form here
                // if valid, submit form to login here
                console.info('USERNAME:', this.username);
                console.info('PASSWORD:', this.password);
              }
            }

        });
})();
