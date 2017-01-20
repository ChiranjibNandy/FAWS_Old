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
            self.selectedItems = [];
            self.selectedRecommendedItems = [];
            self.selectedDate = {
                date:'',
                time:'',
                timezone:''
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
                return self.selectedItems.filter(function(item){return item.type === type;});
            }

            //store items in the recommendation page
            this.setRecommendedItems = function(items){
                self.selectedRecommendedItems = items;
            }

            //return items in the recommendation page
            this.getRecommendedItems = function(){
                return self.selectedRecommendedItems;
            }

            return self;
        }]); // end of service definition
})();