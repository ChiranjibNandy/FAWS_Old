(function () {
    "use strict";

    angular.module("migrationApp")
        .service("viewlogservice", [function() {
            var self = this;

            //store log here
            this.storeLog = function(type){
                self.type = type;
            }

            //get log here
            this.getLog = function(){
                return self.type;
            }
            return self;
        }]); // end of service definition
})();