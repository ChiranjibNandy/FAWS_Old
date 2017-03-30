(function() {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:alertsservice
     * @description
     * This service helps to fetch migration alerts to be notified to user
     */
    angular.module("migrationApp")
        .service("alertsservice", ["authservice", "httpwrapper", "$q", function(authservice, HttpWrapper, $q) {
            var self = this,
                loaded = false,
                currentTenant = null,
                alerts = [];

            /**
             * @ngdoc method
             * @name getAllAlerts
             * @methodOf migrationApp.service:alertsservice
             * @param {Boolean} refresh True if the alert list needs to be refreshed
             * @returns {Promise} A promise to fetch migration alerts for a tenant
             * @description 
             * This service method returns a promise to fetch an array containing the list of alerts messages
             */
            self.getAllAlerts = function(refresh) {
                var tenant_id = authservice.getAuth().tenant_id;
                var alertsApiUrl = "/api/alerts/all";

                if (refresh || !loaded || (currentTenant !== tenant_id)) {
                    return HttpWrapper.send(alertsApiUrl, { "operation": 'GET' })
                                      .then(function(result) {
                                            loaded = true;
                                            currentTenant = tenant_id;
                                            alerts = result;
                                            console.log("Alerts Service: ", result);
                                            return alerts;
                                        }, function(errorResponse) {
                                            return errorResponse;
                                        });
                } else {
                    return $q.when(alerts);
                }
            };

            return self;
        }]); // end of service definition
})();