(function () {
    "use strict";

    angular.module("migrationApp")
        .service("datastoreservice", [function() {
            var self = this;
            self.selectedItems = [];
            
            //storing servers and networks
            this.setItems = function(items){
                self.selectedItems = items;
            }

            //returning selected servers and networks
            this.getItems = function(type){
                return self.selectedItems.filter(function(item){return item.type === type;});
            }

            return self;
        }]); // end of service definition
})();