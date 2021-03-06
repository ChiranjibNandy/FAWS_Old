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
            var self = this,
                rackerDetails,
                customerDetails;

            self.type = {};

            /**
             * @ngdoc property
             * @name account_name
             * @propertyOf migrationApp.service:authservice
             * @description Account name of the tenant
             */
            self.account_name = null;

            /**
             * @ngdoc property
             * @name is_racker
             * @propertyOf migrationApp.service:authservice
             * @description Boolean to determine if the logged in user is a racker or a customer
             */
            self.is_racker = null;

            /**
             * @ngdoc property
             * @name is_impersonator
             * @propertyOf migrationApp.service:authservice
             * @description Boolean to determine if the logged in user is an impersonator or a customer
             */
            self.is_impersonator = null;

            /**
             * @ngdoc property
             * @name impersonator
             * @propertyOf migrationApp.service:authservice
             * @description Username of the logged in impersonator
             */
            self.type.impersonator = null;

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

            /**
             * @ngdoc method
             * @name storeAuth
             * @methodOf migrationApp.service:authservice
             * @description 
             * Sets user details based on racker or customer login
             */
            self.storeAuth = function(userDetails){
                var details;
                self.is_racker = userDetails.is_racker;
                self.is_impersonator = userDetails.is_impersonator;
                self.account_name = userDetails.account_name;
                
                if(self.is_impersonator)
                    self.impersonator = userDetails.impersonator;
                
                if(self.is_racker){
                    rackerDetails = angular.copy(userDetails);
                    details = rackerDetails;
                }
                else{
                    customerDetails = angular.copy(userDetails);
                    details = customerDetails;
                    details.rackUsername = details.username;
                }
            };

            /**
             * @ngdoc method
             * @name getAuth
             * @methodOf migrationApp.service:authservice
             * @description 
             * Gets user details based on racker or customer login
             */
            self.getAuth = function(){
                return self.is_racker ? rackerDetails : customerDetails;
            };

            return self;
        }]); // end of service definition
})();