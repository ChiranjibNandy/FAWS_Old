(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:datastoreservice
     * @description
     * This service is used to store data. This helps in accessing user data across pages.
     */
    angular.module("migrationApp")
        .service("datastoreservice", [function() {
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
                loadbalancers:[]
            };
            /**
              * @ngdoc property
              * @name dontShowStatus
              * @propertyOf migrationApp.service:datastoreservice
              * @type {Array}
              * @description Flag to avoid repeated dispaly of sliding window at initial step of migration
             */
            self.dontShowStatus = false;
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
                network:[]
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
                return self.resourceItems[type];
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
                 return self.selectedItems[type];
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

            self.resetAll = function(){
                self.resourceItems = {
                    server:[],
                    network:[],
                    files:[],
                    loadbalancers:[]
                };
                self.labelsServer = [];
                self.labelsNetwork = [];
                self.selectedItems.server = [];
                self.selectedItems.network = [];
                self.labelsServer = [];
                self.labelsNetwork = [];
                self.selectedDate = {};
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
                if(dt){}
                    return moment(dt).format("M/DD/YYYY");
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
                if(dt){}
                    return moment(dt).format("hh:mm a");
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

            return self;
        }]); // end of service definition
})();