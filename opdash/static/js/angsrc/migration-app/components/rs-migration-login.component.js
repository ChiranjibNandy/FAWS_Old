(function () {
    "use strict";

    // defining component to display all migration items
    angular.module("migrationApp")
        .component("rsmigrationlogin", {
            templateUrl: "/static/angtemplates/migration/login.html",
            bindings: {
              username: "@",
              rsa_token: "@",
              errorMessage: "@"
            },
            controllerAs: "vm",
            controller: function($scope, $http) {
              var vm = this;

              vm.$onInit = function () {
                // This sets the default values
                this.username = '';
                this.rsa_token = '';
                this.user_type = "racker";
              };

              vm.onSubmit = function(loginForm) {
                vm.submitted = true;
                if(this.username && this.rsa_token){
                    document.getElementById("loginForm").submit();
                }
              }
            }
        });
})();
