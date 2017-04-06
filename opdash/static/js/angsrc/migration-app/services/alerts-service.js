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
                alerts = [],
                batchName,
                taskList = [];

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
                //var alertsApiUrl = "/api/alerts/job/job-56d50e1a-ce7f-4be8-a1fa-8cdb734cd3d6";
                //var alertsApiUrl = "/static/angassets/alerts.json";

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
                                            //console.log("Alerts: ", alerts);
                                            return alerts;
                                        }, function(errorResponse) {
                                            return errorResponse;
                                        });
                } else {
                    return $q.when(alerts);
                }
            };

            self.getJobTasks = function(job_id, refresh) {
                var url = "/api/tasks/" + job_id;

                if (refresh || !taskListLoaded || (currentJobID !== job_id)) {
                    return HttpWrapper.send(url, { "operation": 'GET' })
                                      .then(function(result) {
                                            taskListLoaded = true;
                                            currentJobID = job_id;
                                            var tempTaskList = [];
                                            var resources = result.resources;

                                            for(var j=0; j<resources.length; j++){
                                                var tasks = angular.copy(resources[j].tasks);
                                                tempTaskList = tempTaskList.concat(tasks);
                                            }
                                            taskList = tempTaskList;
                                            batchName = result["batch-name"];
                                            //console.log("Task List: ", taskList);
                                            return { batchName: batchName, taskList: taskList };
                                        }, function(errorResponse) {
                                            return errorResponse;
                                        });
                } else {
                    return $q.when({ batchName: batchName, taskList: taskList });
                }
            }

            return self;
        }]); // end of service definition
})();