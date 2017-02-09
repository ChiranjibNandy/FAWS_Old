(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:contactservice
     * @description
     * Service to retrieve contact information
     */
    angular.module("migrationApp")
           .factory("contactservice", ["httpwrapper", "$q", "authservice", function (HttpWrapper, $q, authservice) {

            self = this;

            self.getContactNumbers = function(region){

                var url = "/api/support/contact_numbers";

                return HttpWrapper.send(url,{"operation":'GET'})
                                .then(function(response){
                                    return response;
                                }, function(errorResponse) {
                                    return errorResponse;
                                });
            }

            return self;
        }]); // end of service definition
})();