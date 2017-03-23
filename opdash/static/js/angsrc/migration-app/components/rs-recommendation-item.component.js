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
            controller: ["migrationitemdataservice", "authservice", "$q", "datastoreservice", "$rootRouter","httpwrapper","$rootScope", function (ds, authservice, $q, dataStoreService, $rootRouter,HttpWrapper,$rootScope) {
                var vm = this;

                vm.$onInit = function() {
                    vm.recSelectedItems = dataStoreService.getRecommendedItems() || [];
                    
                    if(vm.type === "server"){
                        var url = '/api/ec2/regions'; 
                        HttpWrapper.send(url,{"operation":'GET'}).then(function(result){
                            vm.regions = result;
                            vm.awsRegion = 'us-east-1';
                            vm.getZones();
                        },function(error){
                            console.log('error :', error);
                        });
                        vm.data = dataStoreService.getItems(vm.type);
                        vm.data.map(function(item){
                            if(!item.selectedMapping){
                                item.selectedMapping = item.mappings[0];
                                item.isMenuOpen = false;
                            }
                        });
                        dataStoreService.setItems({server:vm.data,network:[],LoadBalancers:dataStoreService.getItems('LoadBalancers')});
                        vm.labels = [
                                        {field: "name", text: vm.type+" Name"},
                                        {field: "ip_address", text: "IP Address"},
                                        {field: "aws_region", text: "AWS Region"},
                                        {field: "aws_zone", text: "AWS Zone"},
                                        {field: "aws_instance", text: "AWS instance"},
                                        {field: "storage", text: "Storage"},
                                        {field: "cost", text: "Cost/Month"}
                                    ];
                    }else if (vm.type === "network"){
                        vm.fetchNetworks();
                    }else{
                        vm.data = dataStoreService.getItems("LoadBalancers");
                        vm.labels = [
                                        {field: "name", text: "CLB Name"},
                                        {field: "status", text: "CLB Status"},
                                        {field: "id", text: "CLB Id"},
                                        {field: "migrationStatus", text: "Migration Status"}
                                    ];
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
                  * @name fetchNetworks
                  * @methodOf migrationApp.controller:rsrecommendationitemCtrl
                  * @description 
                  * This function helps to get the networks from the selected servers object and also 
                  * have labels which we are going to populate in the networks tab table.
                  */
                vm.fetchNetworks = function(){
                    var servers = dataStoreService.getItems('server');
                    var networkNames = [];
                    vm.data = [];
                    vm.labels = [
                                    {field: "name", text: vm.type+" Name"},
                                    {field: "id", text: "ID"},
                                    {field: "status", text: "Status"}
                                ];
                    angular.forEach(servers, function (item) {
                        angular.forEach(item.details.networks, function (network) {
                            if(networkNames.indexOf(network.name) == -1) {
                                networkNames.push(network.name);
                                vm.data.push(network);
                            };
                        });
                    });
                }

                //to update the networks when we remove an server.
                if(vm.type === 'network'){
                    $rootScope.$on('pricingChanged',function(){
                        vm.fetchNetworks();
                    });
                }

                /**
                 * @ngdoc method
                 * @name getZones
                 * @methodOf migrationApp.controller:rsrecommendationitemCtrl
                 * @description 
                 * This function helps to get the zones based on the region you selected.
                 */
                vm.getZones = function(region){
                    var url =  '/api/ec2/availability_zones/'+vm.awsRegion; 
                    //If this method is called from modify modal, we will have the region , at that
                    //time we have to get pricing details.
                    if(region) vm.getPricingDetails(region);
                    HttpWrapper.send(url,{"operation":'GET'}).then(function(zones){
                        vm.awsZone = zones[0];
                        vm.zones = zones;
                    },function(error){
                        console.log("error: ",error);
                   });
                };

                /**
                 * @ngdoc method
                 * @name getPricingDetails
                 * @methodOf migrationApp.controller:rsrecommendationitemCtrl
                 * @description 
                 * This function helps to get the pricing details for the region and server selected using this api
                 * '/api/ec2/get_all_ec2_prices/<flavor-id>/<region>';
                 */
                vm.getPricingDetails = function(item){
                    var url = '/api/ec2/get_all_ec2_prices/'+item.details.flavor_details.id+'/'+vm.awsRegion;
                    HttpWrapper.send(url,{"operation":'GET'}).then(function(pricingOptions){
                        item.pricingOptions = pricingOptions;
                    });
                }
 
                /**
                 * @ngdoc method
                 * @name showModifyModal
                 * @methodOf migrationApp.controller:rsrecommendationitemCtrl
                 * @description 
                 * This function helps to populate the pricing details when the modal is clicked first time.
                 */
                vm.showModifyModal = function(item){
                    item.isMenuOpen = !item.isMenuOpen;
                    vm.getPricingDetails(item);
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
                    vm.data.filter(function(server){
                        if(server.id == id){
                            server.selectedMapping = server.pricingOptions[parseInt(vm.selectedConfiguration)];
                            server.selectedMapping.zone = vm.awsZone || server.selectedMapping.zone;
                        }    
                    });
                    dataStoreService.setItems({server:vm.data,network:[],LoadBalancers:dataStoreService.getItems('LoadBalancers')});
                    $rootScope.$emit("pricingChanged");
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
                                                item.selected = !item.selected;
                                                return item;
                                            };
                                         });    
                    //it helps to store the updated object back
                    dataStoreService.storeallItems(allData,'server');     
                    vm.data.splice(vm.data.indexOf(selectedServer[0]), 1);
                    //updating networks tab and pricing panel that an server is removed
                    $rootScope.$emit("pricingChanged");
                    $('.rs-tabs').children()[0].children[0].innerHTML = "Servers ("+vm.data.length+")";
                    if(vm.data.length === 0)  $('.rs-tabs').children()[1].children[0].innerHTML = "Networks (0)";
                    dataStoreService.setItems({server:vm.data,network:[],LoadBalancers:dataStoreService.getItems('LoadBalancers')});
                }

                vm.equipmentDetails = function(type, itemdetails) {
                    vm.itemType = type;
                    vm.itemDetails = itemdetails;
                };
                
                return vm;
            }]
        }); // end of component rsrecommendationitem
})();
