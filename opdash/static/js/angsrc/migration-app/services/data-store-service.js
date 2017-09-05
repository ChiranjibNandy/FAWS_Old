(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:datastoreservice
     * @description
     * This service is used to store data. This helps in accessing user data across pages.
     */
    angular.module("migrationApp")
        .service("datastoreservice", ["httpwrapper", "authservice", "$q", "$window", "DEFAULT_VALUES", function (HttpWrapper, authservice, $q, $window, DEFAULT_VALUES) {
            var loaded, fawsAccounts, self = this,
                currentTenant = null;
            /**
             * @ngdoc property
             * @name resourceItems
             * @propertyOf migrationApp.service:datastoreservice
             * @type {Array}
             * @description Set of resources received during first time API call
             */
            self.resourceItems = {
                server:[],
                network:[],
                volume:[],
                LoadBalancers:[],
                service:[],
                file:[],
                dns:[]
            };

            /**
             * @ngdoc property
             * @name resourceItemsForEditingMigration
             * @propertyOf migrationApp.service:datastoreservice
             * @type {Array}
             * @description Set of resources that helps to retrieve the data when modifying a migration
             */
            self.resourceItemsForEditingMigration = {
                shouldTrigger: false,
                jobId: '',
                saveId: ''
            };

            /**
             * @ngdoc property
             * @name dontShowStatus
             * @propertyOf migrationApp.service:datastoreservice
             * @type {Array}
             * @description Flag to avoid repeated dispaly of sliding window at initial step of migration
             */
            self.dontShowStatus = false;
            self.dontShowNameModal = false;
            self.pageFlag = "";
            self.labelsServer = [];
            self.labelsNetwork = [];
            /**
             * @ngdoc property
             * @name selectedItems
             * @propertyOf migrationApp.service:datastoreservice
             * @type {Array}
             * @description set of resources selected by user.
             */
            self.selectedItems = {
                server:[],
                network:[],
                LoadBalancers:[],
                volume:[],
                service:[],
                file:[],
                dns:[]
            };

            self.saveItems = {
                server:[],
                network:[],
                LoadBalancers:[],
                volume:[],
                service:[],
                file:[],
                dns:[]
            };

            self.itemLoaded = {
                server:false,
                network:false,
                LoadBalancers:false,
                volume:false,
                service:false,
                file:false,
                dns:false,
                jobStatus: false
            };

            self.selectedRecommendedItems = [];
            self.selectedDate = {
                date: '',
                time: '',
                timezone: ''
            };
            self.fileItems = [];
            self.dnsItems = [];
            /**
             * @ngdoc property
             * @name selectedTime
             * @propertyOf migrationApp.service:datastoreservice
             * @type {Array}
             * @description Set of selectedTime for the scheduled migration page
             */
            self.selectedTime = {
                migrationName: '',
                time: '',
                timezone: '',
                live_migrate: false,
            };

            /**
             * @ngdoc property
             * @name userPreferences
             * @propertyOf migrationApp.service:datastoreservice
             * @type {Array}
             * @description Logging user preferences for every migration.
             */
            self.userPreferences = {
                displayIntroModal: false,
                selectedItems: {},
                schedulingDetails: {}
            };

            /**
             * @ngdoc property
             * @name fawsAccounts
             * @propertyOf migrationApp.service:datastoreservice
             * @type {Array}
             * @description Set of FAWS Accounts associated with a tenant.
             */
            self.fawsAccounts = {
                awsAccounts: [],
                selectedFawsAccount: '',
                selectedFawsAccountNumber: '',
                totalAccounts: 0
            };

            /**
             * @ngdoc method
             * @name setSelectedItems
             * @methodOf migrationApp.service:datastoreservice
             * @param {Array} items The list of resources to be saved for further processing
             * @description 
             * Saves list of resources the user wants to migrate.
             */
            this.setSelectedItems = function(items, type){
                if($window.localStorage.selectedResources !== undefined){
                    self.selectedItems = JSON.parse($window.localStorage.selectedResources);
                }
                self.selectedItems[type] = items;
                $window.localStorage.selectedResources = JSON.stringify(self.selectedItems);
            }

            /**
             * @ngdoc method
             * @name setSaveItems
             * @methodOf migrationApp.service:datastoreservice
             * @param {Array} items The list of resources to be saved for further processing
             * @description 
             * Saves list of resources the user wants to continue with the migration.
             */
            this.setSaveItems = function (items) {
                this.saveItems = items;
                $window.localStorage.savedResources = JSON.stringify(this.saveItems);
            }

            /**
             * @ngdoc method
             * @name getSaveItems
             * @methodOf migrationApp.service:datastoreservice
             * @param {Array} items The list of resources to be saved for further processing
             * @description 
             * Returns list of resources the user wants to continue with the migration.
             */
            this.getSaveItems = function (type) {
                return ($window.localStorage.savedResources !== undefined && JSON.parse($window.localStorage.savedResources)[type]) || this.saveItems[type];
            }

            /**
             * @ngdoc method
             * @name storeallItems
             * @methodOf migrationApp.service:datastoreservice
             * @param {Array} items The list of all resources to be saved for displaying after first time loading
             * @description 
             * Saves list of all resources once application is loaded.
             */
            this.storeallItems = function (items, type) {
                self.resourceItems[type] = items;
                $window.localStorage.allResources = JSON.stringify(self.resourceItems);
            }

            /**
             * @ngdoc method
             * @name retrieveallItems
             * @methodOf migrationApp.service:datastoreservice
             * @param {Array} items The list of all resources that were saved after application was loaded.
             * @description 
             * Retrieves list of all resources that were saved after application was loaded.
             */
            this.retrieveallItems = function(type){
                if(type){
                    return ($window.localStorage.allResources !== undefined && JSON.parse($window.localStorage.allResources)[type]) || self.resourceItems[type];
                }
                else{
                    return ($window.localStorage.allResources !== undefined && JSON.parse($window.localStorage.allResources)) || self.resourceItems;
                }
            }

            /**
             * @ngdoc method
             * @name storeDate
             * @methodOf migrationApp.service:datastoreservice
             * @param {String} type The type of value to be stored (date, time, timezone etc)
             * @param {String} item Value to be stored
             * @description 
             * Stores datetime and timezone data needed for scheduling migration
             */
            this.storeDate = function (type, item) {
                self.selectedDate[type] = item;
                $window.localStorage.setItem("selectedDate", JSON.stringify(self.selectedDate));
            }

            /**
             * @ngdoc method
             * @name returnDate
             * @methodOf migrationApp.service:datastoreservice
             * @returns {Object} The stored datetime and timezone
             * @description 
             * Returns the stored datetime and timezone of the migration to be scheduled
             */
            this.returnDate = function () {
                return JSON.parse($window.localStorage.getItem("selectedDate"));
            }

            /**
             * @ngdoc method
             * @name getItems
             * @methodOf migrationApp.service:datastoreservice
             * @param {String} type Type of the resource whose list is to be retrieved
             * @returns {Array} List of resources selected for the given _type_
             * @description 
             * Retrieves the saved list of resources of the specified _type_.
             */
            this.getItems = function (type) {
                if(type){
                    return ($window.localStorage.selectedResources !== undefined && JSON.parse($window.localStorage.selectedResources)[type]) || self.selectedItems[type];
                }
                else{
                    return ($window.localStorage.selectedResources !== undefined && JSON.parse($window.localStorage.selectedResources)) || self.selectedItems;
                }
            }

            //store items in the recommendation page
            /**
             * @ngdoc method
             * @name setRecommendedItems
             * @methodOf migrationApp.service:datastoreservice
             * @param {Array} items The list of recommended resources to be saved for further processing
             * @description 
             * Saves list of recommended resources the user wants to migrate.
             */
            this.setRecommendedItems = function (items) {
                self.selectedRecommendedItems = items;
            }

            //return items in the recommendation page
            /**
             * @ngdoc method
             * @name getRecommendedItems
             * @methodOf migrationApp.service:datastoreservice
             * @param {String} type Type of the recommended resource whose list is to be retrieved
             * @returns {Array} List of recommended resources selected for the given _type_
             * @description 
             * Retrieves the saved list of recommended resources of the specified _type_.
             */
            this.getRecommendedItems = function () {
                return self.selectedRecommendedItems;
            }

            this.getRecommendedTotalCost = function () {
                return self.RecommendedTotalCost;
            }

            this.getCurrentPricing = function () {
                return self.CurrentPricing;
            }

            /**
             * @ngdoc method
             * @name setScheduleMigration
             * @methodOf migrationApp.service:datastoreservice
             * @param {Array} items The list of resources to be saved for further processing
             * @description 
             * Saves list of resources the user wants to migrate.
             */
            this.setScheduleMigration = function (items) {
                self.selectedTime = items;
                $window.localStorage.setItem("selectedTime",JSON.stringify(items));
            };

            this.getScheduleMigration = function(){
                if($window.localStorage.selectedTime !== undefined)
                    self.selectedTime = JSON.parse($window.localStorage.selectedTime);                
                return self.selectedTime;
            };

            this.setDontShowStatus = function (status) {
                self.dontShowStatus = status;
            }

            this.getDontShowStatus = function () {
                return self.dontShowStatus;
            }

            this.setDontShowNameModal = function (status) {
                self.dontShowNameModal = status;
            }

            this.getdontShowNameModal = function () {
                return self.dontShowNameModal;
            }

            this.setPageName = function (status) {
                self.pageFlag = status;
            }

            this.getPageName = function () {
                if(self.pageFlag === ""){
                    return $window.localStorage.getItem('pageName');
                }else{
                    return self.pageFlag;
                }
            }

            /**
             * @ngdoc method
             * @name saveFawsDetails
             * @methodOf migrationApp.service:datastoreservice
             * @param {Array} items The list of FAWS accounts associated with a tenant
             * @description 
             * Saves list of FAWS accounts for a Tenant ID.
             */
            this.saveFawsDetails = function (items) {
                self.fawsAccounts = items;
                $window.localStorage.setItem("fawsAccounts", JSON.stringify(items));
            }

            /**
             * @ngdoc method
             * @name fetchFawsDetails
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Returns list of FAWS accounts for a Tenant ID.
             */
            this.fetchFawsDetails = function () {
                return self.fawsAccounts;
            }

            self.resetAll = function () {
                self.resourceItems = {
                    server:[],
                    network:[],
                    volume:[],
                    LoadBalancers:[],
                    service:[],
                    file:[],
                    dns:[]
                };
                self.dontShowNameModal = false;
                self.labelsServer = [];
                self.labelsNetwork = [];
                self.selectedItems = {
                    server:[],
                    network:[],
                    volume:[],
                    LoadBalancers:[],
                    service:[],
                    file:[],
                    dns:[]
                };
                self.saveItems = {
                    server:[],
                    network:[],
                    LoadBalancers:[],
                    volume:[],
                    service:[],
                    file:[],
                    dns:[]
                };
                self.itemLoaded = {
                    server:false,
                    network:false,
                    LoadBalancers:false,
                    volume:false,
                    service:false,
                    file:false,
                    dns:false,
                    jobStatus: false
                };
                self.labelsServer = [];
                self.labelsNetwork = [];
                self.selectedDate = {};
                self.selectedTime = {
                    migrationName: '',
                    time: '',
                    timezone: ''
                };
                self.selectedRecommendedItems = [];
                self.RecommendedTotalCost = null;
                self.CurrentPricing = null;
                self.fawsAccounts = {
                    awsAccounts: [],
                    selectedFawsAccount: '',
                    selectedFawsAccountNumber: '',
                    totalAccounts: 0
                };
            };

            /**
             * @ngdoc method
             * @name getMigrationDate
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Returns migration date based on Epoch timestamp
             */
            self.getMigrationDate = function () {
                var today = moment().format("MM-DD-YYYY");
                var selectedValue = moment.unix(self.selectedTime.time).format("MM-DD-YYYY");

                if (today === selectedValue) {
                    return "today";
                } else {
                    return moment.unix(self.selectedTime.time).format("ddd, MMM Do YYYY"); //example- Sat, Jun 17th 2017
                }
            };

            /**
             * @ngdoc method
             * @name getMigrationDate
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Returns migration date based on Epoch timestamp
             */
            self.getMigrationTime = function () {
                var tm = moment.unix(self.selectedTime.time).format("h:mm:ss a"); //3:25:50 pm"
                if (tm) {
                    return tm;
                }
            };

            /**
             * @ngdoc method
             * @name getMigrationResourceCount
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Get count of migrating resources
             */
            self.getMigrationResourceCount = function() {              
                if($window.localStorage.selectedResources != undefined){
                    // initialize with resource count
                    var migrationResourceCount = 0;
                    if(JSON.parse($window.localStorage.selectedResources)['server'].length > 0)
                        migrationResourceCount += JSON.parse($window.localStorage.selectedResources)['server'].length;//self.selectedItems.server.length + self.selectedItems.LoadBalancers.length;
                    if(JSON.parse($window.localStorage.selectedResources)['volume'].length > 0)
                        migrationResourceCount += JSON.parse($window.localStorage.selectedResources)['volume'].length;
                    if(JSON.parse($window.localStorage.selectedResources)['service'].length > 0)
                        migrationResourceCount += JSON.parse($window.localStorage.selectedResources)['service'].length;
                    if(JSON.parse($window.localStorage.selectedResources)['file'].length > 0)
                        migrationResourceCount += JSON.parse($window.localStorage.selectedResources)['file'].length;
                    if(JSON.parse($window.localStorage.selectedResources)['dns'].length > 0)
                        migrationResourceCount += JSON.parse($window.localStorage.selectedResources)['dns'].length;
                    
                    var resourcesCountArray = [];
                    
                    //loop through all the servers selected and networks associated with the servers.
                    var servers = JSON.parse($window.localStorage.selectedResources)['server'];
                    angular.forEach(servers, function (item) {
                        angular.forEach(item.details.networks, function (network) {
                            //making separate list of networks associated with servers.
                            if (resourcesCountArray.indexOf(network.name) == -1) {
                                migrationResourceCount += 1;
                                resourcesCountArray.push(network.name);
                            };
                        });
                    });
                    return migrationResourceCount;
                }
            };

            /**
             * @ngdoc method
             * @name getSavedItems
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Invokes "/api/users/uidata/" API call for fetching exisitng saved instances. 
             */
            this.getSavedItems = function () {
                var getSavedInstancesUrl = "/api/jobs/saved";
                return HttpWrapper.send(getSavedInstancesUrl, {
                        "operation": 'GET'
                    })
                    .then(function (result) {
                        if (result == null) {
                            result = JSON.stringify({
                                'savedDetails': []
                            });
                        }
                        return result;
                    }, function (error) {
                        return false;
                    });
            }

            /**
             * @ngdoc method
             * @name saveItems
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Saves migration resources and schedules to be used for later reference
             */
            this.saveItemsForSave = function (saveInstance) {
                var requestObj = self.objForSaveLater(saveInstance);
                return self.postSavedInstances(requestObj);
            };

            /**
             * @ngdoc method
             * @name postSavedInstances
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Invokes "/api/jobs/saved" API call for posting saved instance.
             */
            this.postSavedInstances = function (requestObj) {
                var self = this;
                //var requestObj = self.objForSaveLater(response, saveInstance);
                return HttpWrapper.save("/api/jobs/saved", {
                        "operation": 'POST'
                    }, requestObj)
                    .then(function (result) {
                        return true;
                    }, function (error) {
                        return false;
                    });
            };

            /**
             * @ngdoc method
             * @name deleteSavedInstances
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Invokes "/api/jobs/saved/"+id API call for posting saved instance.
            */
            this.deleteSavedInstances = function (id) {
                var self = this;
                //var requestObj = self.objForSaveLater(response, saveInstance);
                return HttpWrapper.delete("/api/jobs/saved/" + id)
                    .then(function (result) {
                        return true;
                    }, function (error) {
                        return false;
                    });
            };

            this.getModifiedItems = function (resources) {
                var equipments = {
                    server: [],
                    network: [],
                    file: [],
                    volume: [],
                    service: [],
                    LoadBalancers: [],
                    dns:[]
                };
                for (var equ in resources) {
                    angular.forEach(resources[equ], function (item) {
                        equipments[equ].push({
                            'rrn': item.rrn,
                            'name': item.name,
                            'selectedMapping': {
                                'region': item.selectedMapping ? item.selectedMapping.region : DEFAULT_VALUES.REGION,
                                'zone': item.selectedMapping ? item.selectedMapping.zone : '',
                                'instance_type': item.selectedMapping ? item.selectedMapping.instance_type : ''
                            }
                        });
                    });
                };
                return equipments;
            };

            /**
             * @ngdoc method
             * @name objForSaveLater
             * @methodOf migrationApp.service:datastoreservice
             * @param {String} preSavedDetails previous saved instances of migration  
             * @param {String} recommendations recommendations for selected resources
             * @param {String} scheduling_details scheduling details of migration to be saved
             * @param {String} stepName Step of the Migration instance to be saved
             * @returns {Object} A POST request _object_ for saving instance of Migration.
             * @description 
             * This service method returns an object that will be posted to /api/users/uidata/add API.
             */
            this.objForSaveLater = function (saveInstance) {
                var self = this;
                self.setScheduleMigration(saveInstance.migration_schedule);
                var savedetails_json = [{
                    "instance_name": self.getScheduleMigration().migrationName,
                    "timestamp": moment().format("M/DD/YYYY HH:MM a"), //(so we know when was it saved)
                    "selected_resources": self.getModifiedItems(self.getItems()), //(populating only what we need)
                    "recommendations": saveInstance.recommendations,
                    "scheduling-details": saveInstance.migration_schedule,
                    "step_name": saveInstance.step_name,
                    "scheduledItem": saveInstance.scheduledItem || false,
                    "aws-account": JSON.parse($window.localStorage.getItem("fawsAccounts")).selectedFawsAccount,
                    "initiated_by": authservice.getAuth().username,
                    "schedulingTimeDate": self.returnDate()
                }];
                var reqObj = {
                    "tenant_id": authservice.getAuth().tenant_id.toString(),
                    "savedDetails": JSON.stringify(savedetails_json)
                }
                return reqObj;
            };
            
            /**
             * @ngdoc method
             * @name getAccountTenantid
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Invokes "/api/tenants/get_tenant_id/<auth_token> API call to fetch the Tenant_id of the user.
             */
            self.getAccountTenantid = function () {
                var urltenid = "/api/tenants/get_tenant_id/" + authservice.getAuth().authtoken;

                return HttpWrapper.send(urltenid, {
                        "operation": 'GET'
                    })
                    .then(function (response) {
                        authservice.getAuth().tenant_id = response; //set the tenant_id in authservice
                        // return response.data;
                    });
            };

            /*
             * @name getDistinctNetworks
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Gets the list of distinct networks across all selected servers
             */
            self.getDistinctNetworks = function () {
                var networksList = [];
                var servers = JSON.parse($window.localStorage.selectedResources)['server'];
                angular.forEach(servers, function (server) { //extract the network details of each server
                    var region = server.region;
                    var instanceRrn = server.rrn;

                    angular.forEach(server.details.networks, function (network) {
                            network.region = region;
                            network.destRegion = server.selectedMapping.region;
                            network.destZone = server.selectedMapping.zone;
                            network.instanceRrn = instanceRrn;
                            networksList.push(network);
                    });//end of inner for loop
                }); //end of outer for loop

                return networksList;
            };

            /**
             * @ngdoc method
             * @name getProjectedPricing
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Gets projected cost based on selected migrations
             */
            self.getProjectedPricing = function () {
                var instances = [];
                //Check if the selected servers are alreday there in localStorage
                if($window.localStorage.selectedResources !== undefined)
                    instances = JSON.parse($window.localStorage.selectedResources)['server'];
                var totalProjectedPricing = 0;
                instances.forEach(function (item) {

                    if (item.details.hasOwnProperty('rax_uptime')) {
                        var aws_uptime_cost = parseFloat(parseFloat(item.selectedMapping.cost) * parseFloat(item.details.rax_uptime)).toFixed(2);
                        var aws_bandwidth_cost = parseFloat(parseFloat(item.selectedMapping.cost) * parseFloat(item.details.rax_bandwidth)).toFixed(2);
                        var storage_rate = parseFloat(parseFloat(item.details.rax_storage_size) * parseFloat(item.selectedMapping.storage_rate)).toFixed(2);
                        totalProjectedPricing += parseFloat(parseFloat(aws_uptime_cost) + parseFloat(aws_bandwidth_cost) + parseFloat(storage_rate));
                    } else {
                        var storage_rate = parseFloat(parseFloat(item.details.rax_storage_size) * parseFloat(item.selectedMapping.storage_rate)).toFixed(2);
                        totalProjectedPricing += parseFloat(parseFloat(item.selectedMapping.cost * (720)) + parseFloat(storage_rate));
                    }
                });

                return totalProjectedPricing;
            };

            self.getUserProfile = function () {
                var userLog_json = {
                    "Tenantid": authservice.getAuth().tenant_id.toString(),
                    "Preferences": {
                        "introModalDisplayStatus": self.showWelcomeModal,
                        "showMigrationNameWindow": self.dontShowNameModal
                    },
                    "UserLog": [{
                        "MigrationName": self.getScheduleMigration().migrationName,
                        "Timestamp": moment().format('MMDYYYYhmmss'),
                        "Resourceslist": self.getItems(),
                        "Status": "Saved",
                        "Triggredby": authservice.getAuth().account_name
                    }]
                };
                var profileObj = {
                    "tenant_id": authservice.getAuth().tenant_id.toString(),
                    "context": "Profile_Logging",
                    "savedDetails": JSON.stringify(userLog_json)
                };
                return profileObj;
            };

            this.fetchUserProfile = function () {
                var getSavedInstancesUrl = "/api/users/uidata/Profile_Logging";
                return HttpWrapper.send(getSavedInstancesUrl, {
                        "operation": 'GET'
                    })
                    .then(function (result) {
                        if (result == null) {
                            result = JSON.stringify({
                                'savedDetails': []
                            });
                        }
                        return result;
                    }, function (error) {
                        return false;
                    });
            };

            /**
             * @ngdoc method
             * @name getFawsAccounts
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Gets FAWS Accounts associated with a tenant.
             */
            this.getFawsAccounts = function () {
                var self = this;
                var getFawsAccountsUrl = "/api/tenants/get_faws_accounts";
                var tenant_id = authservice.getAuth().tenant_id;
                return HttpWrapper.send(getFawsAccountsUrl, {
                        "operation": 'GET'
                    })
                    .then(function (result) {
                        currentTenant = tenant_id;
                        if ((result == null || result.awsAccounts.length == 0)) { //if there are no accounts array will be empty
                            var fawsAccountDetails = null;
                        } else {
                            var awsAccountsDetails = result.awsAccounts;
                            var fawsAccountDetails = {
                                awsAccounts: awsAccountsDetails,
                                selectedFawsAccount: awsAccountsDetails[0].name,
                                selectedFawsAccountNumber: awsAccountsDetails[0].awsAccountNumber,
                                totalAccounts: result.awsAccountLimit - result.remainingAccounts,
                                mode: result.mode
                            };
                        }
                        self.saveFawsDetails(fawsAccountDetails);
                        return fawsAccountDetails;
                    }, function (error) {
                        return false;
                    });
            };

            /**
             * @ngdoc method
             * @name createFawsAccount
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Invokes "/api/tenants/create_faws_account" API call for creating FAWS account.
             */
            this.createFawsAccount = function (requestObj) {
                var self = this;
                return HttpWrapper.save("/api/tickets/new_account", {
                        "operation": 'POST'
                    }, requestObj)
                    .then(function (result) {
                        return result;
                    }, function (error) {
                        return error;
                    });
            };

            this.addCredsForFawsAccount = function (requestObj) {
                var self = this;
                return HttpWrapper.save("/api/tenants/credentials", {
                        "operation": 'POST'
                    }, requestObj)
                    .then(function (result) {
                        return result;
                    }, function (error) {
                        return error;
                    });
            };

            this.deleteAWSAccount = function (accountId) {
                var self = this;
                return HttpWrapper.delete("/api/tenants/credentials/" + accountId, {
                        "operation": 'delete'
                    })
                    .then(function (result) {
                        return result;
                    }, function (error) {
                        return error;
                    });
            };

            self.setResourceItemsForEditingMigration = function (value) {
                self.resourceItemsForEditingMigration.shouldTrigger = value;
                $window.localStorage.setItem("shouldTrigger", value);
            };

            self.setJobIdForMigration = function (value) {
                self.resourceItemsForEditingMigration.jobId = value.jobId;
                self.resourceItemsForEditingMigration.saveId = value.saveId;
                $window.localStorage.setItem("resourceItemsForEditingMigration", JSON.stringify(self.resourceItemsForEditingMigration));
            };

            self.getJobIdForMigration = function (value) {
                var resourceItems = JSON.parse($window.localStorage.getItem("resourceItemsForEditingMigration"));
                return resourceItems[value];
            };

            self.getResourceItemsForEditingMigration = function () {
                return $window.localStorage.getItem("shouldTrigger");
            };

            self.storeEligibilityResults = function (value) {
                self.eligibilityResults = value;
            };

            self.retrieveEligibilityResults = function () {
                return self.eligibilityResults;
            };

            this.allTimeZones = function () {
                var url = "/static/angassets/time-zones.json";
                return HttpWrapper.send(url, {
                        "operation": 'GET'
                    })
                    .then(function (result) {
                        $window.localStorage.timeZones = JSON.stringify(result);
                        return result;
                    }, function (error) {
                        return error;
                    });
            };
            
            /**
             * @ngdoc method
             * @name setFirstLoginFlag
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Set a flag after login(only) which is used to make jobs status API call.
             */
            this.setFirstLoginFlag = function() {
                $window.localStorage.firstLogin = true;
            }

            /**
             * @ngdoc method
             * @name getFirstLoginFlag
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Get first login flag status.
             */
            this.getFirstLoginFlag = function() {
                return ($window.localStorage.firstLogin || false);
            }

            /**
             * @ngdoc method
             * @name setResourceLoadingStatus
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Set status of a flag that keeps track of completion of API calls(API calls for fetching servers, CDN's, CBS, files.
             */
            this.setResourceLoadingStatus = function(type, val){
                self.itemLoaded[type] = val;
                $window.localStorage.itemLoaded = JSON.stringify(self.itemLoaded);
            }

            /**
             * @ngdoc method
             * @name getResourceLoadingStatus
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Get status of a flag that keeps track of completion of API calls(API calls for fetching servers, CDN's, CBS, files.
             */
            this.getResourceLoadingStatus = function(type){
                return (($window.localStorage.itemLoaded !== undefined && JSON.parse($window.localStorage.itemLoaded)[type]) || self.itemLoaded[type]);
            }

            return self;
        }]); // end of service definition
})();
