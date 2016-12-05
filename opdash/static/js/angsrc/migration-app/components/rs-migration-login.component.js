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
            controller: function($scope, $http) {
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

                return true;

              }
/*
              this.login = function(username, password) {
                console.info('HERE I AM!');
                $http({
                  method: 'POST',
                  url: '/login',
                  data: {
                    username: username,
                    password: password
                  }
                }).then(function successCallback(response) {
                    // this callback will be called asynchronously
                    // when the response is available
                    console.info('LOGIN POST SUCCESSFUL!');
                  }, function errorCallback(response) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                    console.info('LOGIN POST FAILED!');
                  });
              }
*/
            }
        });
})();
