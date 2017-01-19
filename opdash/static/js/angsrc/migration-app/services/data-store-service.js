(function () {
    "use strict";

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

            //storing servers and networks
            this.setItems = function(items){
                self.selectedItems = items;
            }

            //stores the date, time and timezone of schedule migration page
            this.storeDate = function(type,item){
                self.selectedDate[type] = item;
            }

            //returns the saved date and details
            this.returnDate = function(){
                return self.selectedDate;
            }

            //returning selected servers and networks
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