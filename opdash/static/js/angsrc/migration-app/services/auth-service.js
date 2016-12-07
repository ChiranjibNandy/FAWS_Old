(function () {
    "use strict";

    angular.module("migrationApp")
        .service("authservice", [function() {
            var self = this;

            //store log here
            this.storeAuth = function(type){
                self.type = type;
            }

            //get log here
            this.getAuth = function(){
                return self.type;
            }
            return self;
        }]); // end of service definition
})();