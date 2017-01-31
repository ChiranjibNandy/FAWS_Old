(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsrecommendationitem
     * @param {String} type Type of resource (server, network etc)
     * @requires migrationApp.object:rsmigrationrecommendation
     * @description
     * Component to display the recommendation for migration for the given resource type. It also allows the user to change from the available migrations.  
     *   
     * This component uses the template: **angtemplates/migration/recommendation-item-template.html**.  
     *   
     * This component (and its features) is being used by following pages of the application:
     *  * angtemplates/migration/recommendations.html
     *   
     * Its controller {@link migrationApp.controller:rsrecommendationitemCtrl rsrecommendationitemCtrl} uses the below services:
     *  * {@link migrationApp.service:migrationitemdataservice migrationitemdataservice}
     *  * {@link migrationApp.service:authservice authservice}
     *  * $q
     *  * {@link migrationApp.service:datastoreservice datastoreservice}
     *  * $rootRouter
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rsrecommendationitem type="server"></rsrecommendationitem>
     *   </file>
     * </example>
     */
    angular.module("migrationApp")
        .component("rsrecommendationitem", {
            templateUrl: "/static/angtemplates/migration/recommendation-item-template.html",
            bindings: {
                type: "@", // type parameter to be supplied (eg: server, network etc)
                filtervalue:"<"
            },
            require: {
                parent: "^^rsmigrationrecommendation"
            },
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsrecommendationitemCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsrecommendationitem rsrecommendationitem} component
             */
            controller: ["migrationitemdataservice", "authservice", "$q", "datastoreservice", "$rootRouter", function (ds, authservice, $q, dataStoreService, $rootRouter) {
                var vm = this;

                vm.$onInit = function() {
                    vm.recSelectedItems = dataStoreService.getRecommendedItems() || [];
                    //vm.recSelectedItems = [];
                    vm.data = dataStoreService.getItems(vm.type);
                    if(vm.data.length >0)
                        vm.noData = false;
                    else
                        vm.noData = true;
                    vm.labels = [
                                    {field: "name", text: vm.type+" Name"},
                                    {field: "ip_address", text: "IP Address"},
                                    {field: "aws_region", text: "AWS Region"},
                                    {field: "aws_zone", text: "AWS Zone"},
                                    {field: "aws_instance", text: "AWS instance"}
                                ];
                    if(vm.type == "server") 
                        vm.showModify = true;                                
                    else
                        vm.showModify = false;
                    $('#rs-main-panel').css('height','310px');
                };

                // Update item selection based on Select/Deselect all 
                vm.changeItemSelection = function () {
                    angular.forEach(vm.data, function (item) {
                        item.recSelected = vm.isAllSelected;
                        vm.changeSelectAll(item,true);
                    });
                };

                // Select/Deselect all items
                vm.changeSelectAll = function (item, fromGlobal) {
                    if(item.recSelected){
                        item.type = vm.type;
                        if(vm.recSelectedItems.indexOf(item) === -1){
                            vm.recSelectedItems.push(item);
                        }
                    }else{
                        item.type = vm.type;
                        vm.recSelectedItems.splice(vm.recSelectedItems.indexOf(item), 1);
                    }
                    if(!fromGlobal) {
                        var count = 0;
                        for(var i=0; i<vm.data.length; i++) {
                            if(vm.data[i].recSelected) count++;
                            else break;
                        }
                        vm.isAllSelected = count === vm.data.length;
                    }
                };

                // vm.removeItem = function(item){
                //     vm.recSelectedItems.splice(vm.recSelectedItems.indexOf(item), 1);
                //     item.recSelected = false;
                // }

                //modifing the selected servers
                vm.modify = function(){
                    if(vm.recSelectedItems.length > 0){
                        dataStoreService.setRecommendedItems(vm.recSelectedItems);
                        $rootRouter.navigate(["CompareOptions"]);
                    }else{
                        alert("Please select servers to compare");
                    }
                };

                return vm;
            }]
        }); // end of component rsrecommendationitem
})();
