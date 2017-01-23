(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsmigrationlogin
     * @param {String} [username] Username of the user trying to login
     * @param {String} [rsa_token] RSA Token of the user trying to login
     * @param {String} [errorMessage] Error message to be displayed
     * @description
     * Component to display the login page.  
     *   
     * This component uses the template: **angtemplates/migration/login.html**. It uses the controller {@link migrationApp.controller:rsmigrationloginCtrl rsmigrationloginCtrl}.  
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rsmigrationlogin error-message="Some error message"></rsmigrationlogin>
     *   </file>
     * </example>
     */
    angular.module("migrationApp")
        .component("rsmigrationlogin", {
            templateUrl: "/static/angtemplates/migration/login.html",
            bindings: {
              username: "@",
              rsa_token: "@",
              errorMessage: "@"
            },
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsmigrationloginCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsmigrationlogin rsmigrationlogin} component
             */
            controller: function($scope, $http) {
              var vm = this;

              vm.$onInit = function () {
                // This sets the default values
                this.username = '';
                this.rsa_token = '';
                this.user_type = "racker";
              };

              /**
               * @ngdoc method
               * @name onSubmit
               * @methodOf migrationApp.controller:rsmigrationloginCtrl
               * @description 
               * Called to submit the login form
               */
              vm.onSubmit = function(loginForm) {
                vm.submitted = true;
                if(this.username && this.rsa_token){
                    document.getElementById("loginForm").submit();
                }
              }
            }
        });
})();
