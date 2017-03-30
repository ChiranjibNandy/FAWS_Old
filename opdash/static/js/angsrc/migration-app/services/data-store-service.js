(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:datastoreservice
     * @description
     * This service is used to store data. This helps in accessing user data across pages.
     */
    angular.module("migrationApp")
        .service("datastoreservice", ["httpwrapper","authservice", function (HttpWrapper, authservice) {
            var self = this;
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
                files:[],
                LoadBalancers:[]
            };
            /**
              * @ngdoc property
              * @name dontShowStatus
              * @propertyOf migrationApp.service:datastoreservice
              * @type {Array}
              * @description Flag to avoid repeated dispaly of sliding window at initial step of migration
             */
            self.dontShowStatus = false;
            self.dontShowNameModal = false
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
                LoadBalancers:[]
            };
            self.selectedRecommendedItems = [];
            self.selectedDate = {
                date:'',
                time:'',
                timezone:''
            };
            self.fileItems = [];
            /**
              * @ngdoc property
              * @name selectedTime
              * @propertyOf migrationApp.service:datastoreservice
              * @type {Array}
              * @description Set of selectedTime for the scheduled migration page
             */
            self.selectedTime = {
               migrationName:'',
                time:'',
                timezone:'',
            };

            /**
              * @ngdoc property
              * @name userPreferences
              * @propertyOf migrationApp.service:datastoreservice
              * @type {Array}
              * @description Logging user preferences for every migration.
             */
            self.userPreferences = {
                displayIntroModal:false,
                selectedItems:{},
                schedulingDetails:{}
            };
            /**
             * @ngdoc method
             * @name setItems
             * @methodOf migrationApp.service:datastoreservice
             * @param {Array} items The list of resources to be saved for further processing
             * @description 
             * Saves list of resources the user wants to migrate.
             */
            this.setItems = function(items){
                self.selectedItems = items;
            }

            /**
             * @ngdoc method
             * @name storeallItems
             * @methodOf migrationApp.service:datastoreservice
             * @param {Array} items The list of all resources to be saved for displaying after first time loading
             * @description 
             * Saves list of all resources once application is loaded.
             */
            this.storeallItems = function(items, type){
                self.resourceItems[type] = items;
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
                    return self.resourceItems[type];
                }
                else{
                    return self.resourceItems;
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
            this.storeDate = function(type,item){
                self.selectedDate[type] = item;
            }

            /**
             * @ngdoc method
             * @name returnDate
             * @methodOf migrationApp.service:datastoreservice
             * @returns {Object} The stored datetime and timezone
             * @description 
             * Returns the stored datetime and timezone of the migration to be scheduled
             */
            this.returnDate = function(){
                return self.selectedDate;
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
            this.getItems = function(type){
                //return self.selectedItems.filter(function(item){return item.type === type;});
                 if(type){
                    return self.selectedItems[type];
                }
                else{
                    return self.selectedItems;
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
            this.setRecommendedItems = function(items){
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
            this.getRecommendedItems = function(){
                return self.selectedRecommendedItems;
            }

            this.setRecommendedTotalCost = function(){
                 self.RecommendedTotalCost = 431.81 ;
            }
            this.getRecommendedTotalCost = function(){
                 return self.RecommendedTotalCost ;
            }
            this.setCurrentPricing = function(){
                 self.CurrentPricing = 485 ;
            }
            this.getCurrentPricing = function(){
               return self.CurrentPricing ;
            }

             /**
             * @ngdoc method
             * @name setScheduleMigration
             * @methodOf migrationApp.service:datastoreservice
             * @param {Array} items The list of resources to be saved for further processing
             * @description 
             * Saves list of resources the user wants to migrate.
             */
            this.setScheduleMigration = function(items){
                self.selectedTime = items;
            }
            this.getScheduleMigration = function(){
                return self.selectedTime;
            }

            this.setDontShowStatus = function(status){
               self.dontShowStatus = status;
            }

            this.getDontShowStatus = function(){
               return self.dontShowStatus;
            }

            this.setDontShowNameModal = function(status){
               self.dontShowNameModal = status;
            }

            this.getdontShowNameModal = function(){
               return self.dontShowNameModal;
            }

            self.resetAll = function(){
                self.resourceItems = {
                    server:[],
                    network:[],
                    files:[],
                    LoadBalancers:[]
                };
                self.dontShowNameModal = false;
                self.labelsServer = [];
                self.labelsNetwork = [];
                self.selectedItems.server = [];
                self.selectedItems.network = [];
                self.selectedItems.LoadBalancers = [];
                self.labelsServer = [];
                self.labelsNetwork = [];
                self.selectedDate = {};
                self.selectedTime = {
                    migrationName:'',
                    time:'',
                    timezone:''
                };
                self.selectedRecommendedItems = [];
                self.RecommendedTotalCost = null;
                self.CurrentPricing = null;
            };

            /**
             * @ngdoc method
             * @name getMigrationDate
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Returns migration date based on Epoch timestamp
             */
            self.getMigrationDate = function() {
                var dt = self.selectedTime.time * 1000;
                if(dt){
                    return moment(dt).format("M/DD/YYYY");
                }
            };

            /**
             * @ngdoc method
             * @name getMigrationDate
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Returns migration date based on Epoch timestamp
             */
            self.getMigrationTime = function() {
                var dt = self.selectedTime.time * 1000;
                if(dt){
                    return moment(dt).format("hh:mm a");
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
                // initialize with server count
                var migrationResourceCount = self.selectedItems.server.length;

                // evaluate network count and add to the total count
                angular.forEach(self.selectedItems.server, function(item) {
                    migrationResourceCount += item.details.networks.length;
                });
                return migrationResourceCount;
            };

            /**
             * @ngdoc method
             * @name getSavedItems
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Invokes "/api/users/uidata/" API call for fetching exisitng saved instances. 
            */
            this.getSavedItems = function() {
                var getSavedInstancesUrl = "/api/users/uidata/Saved_Migrations";
                return HttpWrapper.send(getSavedInstancesUrl, {"operation":'GET'})
                                  .then(function(result){
                                      if(result == null){
                                          result = JSON.stringify({
                                              'savedDetails': []
                                          });
                                      }
                                      return result;
                                  },function(error) {
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
            this.saveItems = function(saveInstance) {
                return self.getSavedItems()
                           .then(function(result){
                               var requestObj = self.objForSaveLater(JSON.parse(result.savedDetails || '[]'), saveInstance);
                               return !result ? result : self.postSavedInstances(requestObj);
                           });
            };

            /**
                 * @ngdoc method
                 * @name postSavedInstances
                 * @methodOf migrationApp.service:datastoreservice
                 * @description 
                 * Invokes "/api/users/uidata/add" API call for posting saved instance.
            */
            this.postSavedInstances = function(requestObj) {
                var self = this;
                //var requestObj = self.objForSaveLater(response, saveInstance);
                return HttpWrapper.save("/api/users/uidata/add", {"operation":'POST'}, requestObj)
                    .then(function(result){
                        return true;
                    },function(error) {
                        return false;
                    });
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
            this.objForSaveLater = function(preSavedDetails, saveInstance){
                var self = this;
                self.setScheduleMigration(saveInstance.migration_schedule)
                var savedetails_json = 
                    [{
                        "instance_name":self.getScheduleMigration().migrationName,
                        "timestamp":moment().format('MMDYYYYhmmss'), //(so we know when was it saved)
                        "selected_resources": self.getItems(),
                        "recommendations":saveInstance.recommendations,
                        "scheduling-details":saveInstance.scheduling_details,
                        "step_name":saveInstance.step_name
                    }];
                if(preSavedDetails.length > 0){
                    angular.forEach(preSavedDetails, function (instance, key) {
                        if(instance.instance_name == self.getScheduleMigration().migrationName) {
                            preSavedDetails.splice(key, 1);
                            return;
                        };
                    });
                    preSavedDetails.push(savedetails_json[0]);
                    savedetails_json = preSavedDetails;
                }
                var reqObj = {
                                "tenant_id": authservice.getAuth().tenant_id.toString(),
                                "context": "Saved_Migrations",
                                "savedDetails": JSON.stringify(savedetails_json)
                }
                return reqObj;
            };

            /**
             * @ngdoc method
             * @name getAccountName
             * @methodOf migrationApp.service:datastoreservice
             * @param {String} tenant_id tenant_id for which the details are to be fetched 
             * @description 
             * Invokes "/api/tenants/get_account_info/<tenant_id> API call to fetch the account details of a Tenant.
             */
            self.getAccountName = function(tid){
                // var tid =authservice.getAuth().tenant_id;
                var urlactinfo = "/api/tenants/get_account_info";
                
                return HttpWrapper.send(urlactinfo, { "operation": 'GET' })
                    .then(function (response) {
                        authservice.getAuth().account_name = response.rax_name; //set the account_name in authservice
                        // return response.data;
                    });
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
                
                return HttpWrapper.send(urltenid, { "operation": 'GET' })
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
            self.getDistinctNetworks = function() {
                var networksList = [];
                angular.forEach(self.getItems('server'), function (server) {
                    var region = server.region;
                    angular.forEach(server.details.networks, function (network) {
                        if(networksList.indexOf(network.id) == -1) {
                            network.region = region;
                            network.destRegion = server.selectedMapping.region;
                            networksList.push(network);
                        };
                    });
                });

                return networksList;
            };

            /**
             * @ngdoc method
             * @name getProjectedPricing
             * @methodOf migrationApp.service:datastoreservice
             * @description 
             * Gets projected cost based on selected migrations
            */
            self.getProjectedPricing = function() {
                var instances = self.getItems('server');
                var totalProjectedPricing = 0;
                instances.forEach(function(item){
                    totalProjectedPricing += parseFloat(item.selectedMapping.cost);
                });

                return totalProjectedPricing;
            };

            return self;
        }]); // end of service definition
})();