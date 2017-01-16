(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:authservice
     * @description
     * This service helps in maintaining and sharing authentication data across all components
     */
    angular.module("migrationApp")
        .service("authservice", [function() {
            var self = this;

            /**
             * @ngdoc property
             * @name username
             * @propertyOf migrationApp.service:authservice
             * @description Username of the logged in rackspace user
             */
            self.type.username = null;

            /**
             * @ngdoc property
             * @name authtoken
             * @propertyOf migrationApp.service:authservice
             * @description Authentication token required for every Rackspace API invocation
             */
            self.type.authtoken = null;

            /**
             * @ngdoc property
             * @name tenant_id
             * @propertyOf migrationApp.service:authservice
             * @description Current tenant for whom the user wants to migrate resources
             */
            self.type.tenant_id = null;

            /**
             * @ngdoc property
             * @name awsAccount
             * @propertyOf migrationApp.service:authservice
             * @description 
             * The AWS account in the destination cloud system. This is the account to which the resources are intended to be migrated.
             */
            self.type.awsAccount = null;

            /**
             * @ngdoc property
             * @name accessKey
             * @propertyOf migrationApp.service:authservice
             * @description 
             * Access key of AWS account required for migration to AWS
             */
            self.type.accessKey = null;

            /**
             * @ngdoc property
             * @name secretKey
             * @propertyOf migrationApp.service:authservice
             * @description 
             * Secret key of AWS account required for migration to AWS
             */
            self.type.secretKey = null;

            /**
             * @ngdoc property
             * @name rackUsername
             * @propertyOf migrationApp.service:authservice
             * @description 
             * Rackspace Cloud account username. This is the username of the client who wants to migrate.
             */
            self.type.rackUsername = null;

            /**
             * @ngdoc property
             * @name rackAPIKey
             * @propertyOf migrationApp.service:authservice
             * @description 
             * Rackspace Cloud API key. This is the API key of the client who wants to migrate.
             */
            self.type.rackAPIKey = null;

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
