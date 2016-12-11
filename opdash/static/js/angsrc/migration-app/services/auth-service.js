(function () {
    "use strict";

    angular.module("migrationApp")
        .service("authservice", [function() {
            var self = this;

            //store log here
            this.storeAuth = function(type){
                self.type = type;
                self.type.awsAccount = "aws_account";
                self.type.accessKey = "access_key";
                self.type.secretKey = "secret_key";
                self.type.rackUsername = "rack user";
                self.type.rackAPIKey = "rack key";
            }

            //get log here
            this.getAuth = function(){
                return self.type;
            }
            return self;
        }]); // end of service definition
})();