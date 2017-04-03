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
                //var alertsApiUrl = "/api/alerts/all";
                var alertsApiUrl = "/static/angassets/alerts.json";

                if (refresh || !loaded || (currentTenant !== tenant_id)) {
                    return HttpWrapper.send(alertsApiUrl, { "operation": 'GET' })
                                      .then(function(result) {
                                            loaded = true;
                                            currentTenant = tenant_id;
                                            var tempAlerts = [];

                                            for(var j=0; j<result.length; j++){
                                                var msgs = angular.copy(result[j].messages);
                                                for(var k=0; k<msgs.length; k++){
                                                    msgs[k].job_id = result[j]["job-id"];
                                                    msgs[k].resource_id = result[j]["resource-id"];
                                                    msgs[k].resource_name = result[j]["resource-name"];
                                                    msgs[k].resource_type = result[j]["resource-type"];
                                                }
                                                tempAlerts = tempAlerts.concat(msgs);
                                            }
                                            alerts = tempAlerts;
                                            console.log("Alerts: ", alerts);
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