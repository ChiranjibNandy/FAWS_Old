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
                taskListLoaded = false,
                currentTenant = null,
                currentJobID = null,
                currentResourceID = null,
                alerts = [],
                batchName,
                taskList = [],
                tickets,
                ticketsLoaded = false;

            /**
             * @ngdoc method
             * @name getAllAlerts
             * @methodOf migrationApp.service:alertsservice
             * @param {Boolean} refresh True if the alert list needs to be refreshed
             * @returns {Promise} A promise to fetch migration alerts for a tenant
             * @description 
             * This service method returns a promise to fetch an array containing the list of alerts messages
             */
            self.getAllAlerts = function(refresh,job_id) {
                var tenant_id = authservice.getAuth().tenant_id;
                var alertsApiUrl = "";
                if(job_id === undefined)
                    alertsApiUrl = "/api/alerts/all";
                else
                    alertsApiUrl = "/api/alerts/job/"+job_id;
                //var alertsApiUrl = "/static/angassets/alerts.json";
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
                                                    msgs[k].batch_name = result[j]["batch-name"];
                                                }
                                                tempAlerts = tempAlerts.concat(msgs);
                                            }
                                            alerts = tempAlerts;
                                             return alerts;
                                        }, function(errorResponse) {
                                            return [];
                                        });
               
            };

            /**
             * @ngdoc method
             * @name getResourceTasks
             * @methodOf migrationApp.service:alertsservice
             * @param {Object} params Object with details of the job and resource for which the associated tasks are to be retreived
             * @param {Boolean} refresh True if the task list needs to be refreshed
             * @returns {Promise} A promise to fetch tasks involved in migrating a resource
             * @description 
             * This service method returns a promise to fetch an array containing the list of tasks involved in migrating a resource
             */
            self.getResourceTasks = function(params, refresh) {
                var url = "/api/tasks/" + params.job_id + "/" + params.resource_type + "s/" + params.resource_id;

                if (refresh || !taskListLoaded || (currentJobID !== params.job_id || currentResourceID !== params.resource_id)) {
                    return HttpWrapper.send(url, { "operation": 'GET' })
                                      .then(function(result) {
                                            taskListLoaded = true;
                                            currentJobID = params.job_id;
                                            currentResourceID = params.resource_id;
                                            if(result.resources[0])
                                                taskList = result.resources[0].tasks;
                                            else
                                                taskList = [];
                                            batchName = result["batch-name"];
                                            return { batchName: batchName, tasks: taskList };
                                        }, function(errorResponse) {
                                            return errorResponse;
                                        });
                } else {
                    return $q.when({ batchName: batchName, tasks: taskList });
                }
            }

            /**
             * @ngdoc method
             * @name getAllTickets
             * @methodOf migrationApp.service:alertsservice
             * @param {Boolean} refresh True if the tickets list needs to be refreshed
             * @returns {Promise} A promise to fetch the list of tickets
             * @description 
             * This service method returns a promise to fetch an array containing the list of tickets raised for a tenant
             */
            self.getAllTickets = function(refresh,statusFlag) {
                var url = "/api/tickets/get_all";
                if (refresh || statusFlag|| !ticketsLoaded) {
                    return HttpWrapper.send(url, { "operation": 'GET' })
                                      .then(function(result) {
                                            ticketsLoaded = true;
                                            tickets = result.tickets;
                                            return result;
                                        }, function(errorResponse) {
                                            return false;
                                        });
                } else {
                    return $q.when(tickets);
                }
            }

            return self;
        }]); // end of service definition
})();