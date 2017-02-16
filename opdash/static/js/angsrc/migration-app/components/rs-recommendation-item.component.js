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
                    
                    if(vm.type === "server"){
                        vm.data = dataStoreService.getItems(vm.type);
                        vm.data.map(function(item){
                            item.selectedMapping = item.mappings[0];
                        });
                        vm.labels = [
                                        {field: "name", text: vm.type+" Name"},
                                        {field: "ip_address", text: "IP Address"},
                                        {field: "aws_region", text: "AWS Region"},
                                        {field: "aws_zone", text: "AWS Zone"},
                                        {field: "aws_instance", text: "AWS instance"}
                                    ];
                    }else{
                        var servers = dataStoreService.getItems('server');
                        vm.data = [];
                        vm.labels = [
                                        {field: "name", text: vm.type+" Name"},
                                        {field: "id", text: "ID"},
                                        {field: "status", text: "Status"}
                                    ];
                        for(var i = 0 ;i < servers.length; i++){
                            var networks = servers[i].details.networks;
                            networks.map(function(network){
                                vm.data.push(network);
                            });
                        }
                    }
                    
                    // pagination controls
                    vm.pageArray = [];
                    vm.currentPage = 1;
                    vm.pageSize = 5; // items per page
                    vm.totalItems = vm.data.length;
                    vm.noOfPages = Math.ceil(vm.totalItems / vm.pageSize);
                    for(var i=1;i<=vm.noOfPages;i++){
                        vm.pageArray.push(i);
                    };      
                    if(vm.data.length >0)
                        vm.noData = false;
                    else
                        vm.noData = true;
                    
                    if(vm.type == "server") 
                        vm.showModify = true;                                
                    else
                        vm.showModify = false;
                    $('#rs-main-panel').css('height','310px');
                };

                /**
                 * @ngdoc method
                 * @name saveUpdatedObject
                 * @methodOf migrationApp.controller:rsrecommendationitemCtrl
                 * @description 
                 * This function enables when we click the save button in the modal and it updates the object 
                 * with newly selected data which is provided in the table format on popup.
                 */
                vm.saveUpdatedObject  = function(id){
                    var selectedServer = vm.data.filter(function(server){
                                            return server.id == id;
                                         });
                    selectedServer[0].selectedMapping = selectedServer[0].mappings[parseInt(vm.selectedConfiguration)];
                    selectedServer[0].selectedMapping.zone = vm.awsZone || selectedServer[0].selectedMapping.zone;
                    selectedServer[0].selectedMapping.region = vm.awsRegion || selectedServer[0].selectedMapping.region
                    $('#modify_modal'+id).modal('hide');
                };

                /**
                 * @ngdoc method
                 * @name removeServer
                 * @methodOf migrationApp.controller:rsrecommendationitemCtrl
                 * @description 
                 * This function helps to remove the selected servers and also modify the original object 
                 * of the particular server.
                 */
                vm.removeServer = function(id){
                    var allData = dataStoreService.retrieveallItems('server');     
                    var selectedServer = allData.filter(function(item){
                                            if(item.id === id){
                                                item.selected = false;
                                                return item;
                                            };
                                         });    
                    dataStoreService.storeallItems(allData,'server');     
                    vm.data.splice(vm.data.indexOf(selectedServer[0]), 1);
                    dataStoreService.setItems(vm.data);
                }

                vm.equipmentDetails = function(type, itemdetails) {
                    vm.type = type;
                    vm.itemDetails = itemdetails;
                };
                
                return vm;
            }]
        }); // end of component rsrecommendationitem
})();
