(function () {
    "use strict";

    angular.module("migrationApp")
        .service("authservice", [function() {
            var self = this;

            //store log here
            this.storeAuth = function(type){
               self.type = type;
               self.type.awsAccount = "rax-9391b0f6b8264c6f8efbe2794a541548";
               self.type.accessKey = "AKIAIUHV3Q5R7JDRDRBQ";
               self.type.secretKey = "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";
               self.type.rackUsername = "RSMTDev1";
               self.type.rackAPIKey = "f42046566954470dbaa31d6378916bb1";
            }

            //get log here
            this.getAuth = function(){
                return self.type;
            }
            return self;
        }]); // end of service definition
})();