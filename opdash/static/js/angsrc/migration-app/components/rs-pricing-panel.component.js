(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rspricingpanelcomponent
     * @description
     * Component to display the list of tenants whose resource migration has to be done. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/pricing-panel.html**.  
     *   
     * Its controller {@link migrationApp.controller:rspricingCtrl rspricingCtrl} uses the below services:
     *  * {@link migrationApp.service:authservice authservice}
     */
    angular.module("migrationApp")
        .component("rspricingpanel", {
            templateUrl: "/static/angtemplates/migration/pricing-panel.html",
             bindings: {
                page: "@",
                selecteditem: "="
            },
            //   require: {
            //      parent: "^^rsmigrationresourceslist,^^rsmigrationrecommendation"
            // },
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rspricingCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rspricingpanel rspricingpanel} component
             */
            controller:["datastoreservice","$rootRouter",function(dataStoreService,$rootRouter){
                var vm = this;
                vm.$onInit = function() {
                    dataStoreService.setRecommendedTotalCost();
                    dataStoreService.setCurrentPricing ();
                    vm.totalCost = dataStoreService.getRecommendedTotalCost();
                    vm.currentPricing = dataStoreService.getCurrentPricing ();
                    vm.savings = (vm.currentPricing - vm.totalCost); 
                    // vm.data = dataStoreService.getItems(vm.selectedItem);
                    // dataStoreService.setItems(vm.selectedItem);
                    // dataStoreService.getItems(vm.type);
                };
                   
                      /**
                 * @ngdoc method
                 * @name saveItems
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
                 * @description 
                 * Saves the chosen solution for migration of resources
                 */
                vm.saveItems = function() {
                    alert("Saving items: To be implemented");
                };

                /**
                 * @ngdoc method
                 * @name continue
                 * @methodOf migrationApp.controller:rsmigrationrecommendationCtrl
                 * @description 
                 * Continue to next step: **Schedule Migration**
                 */
                vm.continue = function() {
                debugger;
                    console.log(vm.page);
                    console.log(vm.selecteditem);
                    dataStoreService.getItems(vm.selecteditem);
                       if(vm.page==="resources"){
                  if(vm.selecteditem.length>0){
                      dataStoreService.setItems(vm.selecteditem);
                        $rootRouter.navigate(["MigrationRecommendation"]);
                   }
                   else
                      {alert("Please select some items to migrate");
                    } 
                     } 
                     else if(vm.page==="recommendation"){
                    $rootRouter.navigate(["ScheduleMigration"]);
                     }
                    else if(vm.page==="scheduleMigration"){
                      $rootRouter.navigate(["ConfirmMigration"]);
                     }
                };
vm.back = function() {
    if(vm.page==="recommendation"){
                    $rootRouter.navigate(["MigrationResourceList"]);
                     }
                     else if(vm.page==="scheduleMigration"){
$rootRouter.navigate(["MigrationRecommendation"]);

                     }
}

                return vm;
              
            }]
        });
})();