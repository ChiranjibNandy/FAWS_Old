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
            controller: ["migrationitemdataservice", "authservice", "$q", "datastoreservice", "$rootRouter","httpwrapper","$rootScope","$window", function (ds, authservice, $q, dataStoreService, $rootRouter,HttpWrapper,$rootScope,$window) {
                var vm = this;

                vm.$onInit = function() {
                    // vm.recSelectedItems = dataStoreService.getRecommendedItems() || [];
                    vm.propertyName = "name";
                    vm.errorInApi = false;
                    vm.reverse = false;
                    vm.disable = true;
                    if(vm.type === "server"){
                        var url = '/api/ec2/regions'; 
                        HttpWrapper.send(url,{"operation":'GET'}).then(function(result){
                            vm.regions = result;
                            vm.awsRegion = result[0];
var firstLoad =true;
                            vm.getZones();
                            vm.disable = true;
                            $('#rs-main-panel').css('height','310px');
                        },function(error){
                            console.log('Error in getting regions :', error);
                            vm.errorInApi = true;
                        });
                        //vm.data = dataStoreService.getItems(vm.type); -- Previous Code
                        if($window.localStorage.selectedServers !== undefined)
                            vm.data = JSON.parse($window.localStorage.selectedServers);
                        else
                           vm.data = [];//dataStoreService.getItems(vm.type); 
                        //$window.localStorage.selectedServers = JSON.stringify(vm.data);
                        vm.labels = [
                                        {field: "name", text: vm.type+" Name", sortingNeeded:true},
                                        {field: "ip_address", text: "IP Address", sortingNeeded:true},
                                        {field: "region", text: "AWS Region", sortingNeeded:true},
                                        {field: "zone", text: "AWS Zone", sortingNeeded:true},
                                        {field: "instance_type", text: "AWS instance", sortingNeeded:true},
                                        {field: "cost", text: "Cost/Month", sortingNeeded:true},
                                        {field: "action", text: "Actions", sortingNeeded:false}
                                    ];
                    }else if (vm.type === "network"){
                        vm.fetchNetworks();
                    }else{
                        //vm.data = dataStoreService.getItems("LoadBalancers");
                        if($window.localStorage.selectedLoadBalancers !== undefined)
                            vm.data = JSON.parse($window.localStorage.selectedLoadBalancers);
                        else
                            vm.data = []//;dataStoreService.getItems("LoadBalancers");
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
                };

                vm.getAwsDetails = function(equipment){
                    
                    
                };

                /**
                  * @ngdoc method
                  * @name disableConfirm
                  * @methodOf migrationApp.controller:rsrecommendationitemCtrl
                  * @description 
                  * This method will diable confirm button in the recommendations modal. Based on the 
                  * selection again confirm button will be enabled.
                  */
                vm.disableConfirm = function(){
                    vm.disable = false;
                }

                /**
                  * @ngdoc method
                  * @name fetchNetworks
                  * @methodOf migrationApp.controller:rsrecommendationitemCtrl
                  * @description 
                  * This function helps to get the networks from the selected servers object and also 
                  * have labels which we are going to populate in the networks tab table.
                  */
                vm.fetchNetworks = function(){
                    var servers = [];
                    //var servers = dataStoreService.getItems('server');
                    if($window.localStorage.selectedServers !== undefined)
                        servers = JSON.parse($window.localStorage.selectedServers);
                    else
                        servers = dataStoreService.getItems('server');
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
                
                /**
                  * @ngdoc method
                  * @name fetchNetworks
                  * @methodOf migrationApp.controller:rsrecommendationitemCtrl
                  * @description 
                  * This function assists us with the sorting of columns in all the tabs.
                  */
                vm.sortBy = function(propertyName) {
                    vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
                    vm.propertyName = propertyName;
                };

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
			if(region){
vm.disableConfirm();
}
                      
                    },function(error){
                        vm.errorInApi = true;
                        console.log("Error in getting zones: ",error);
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
                        //item.pricingOptions.concat(item.details);
                    },function(error){
                        vm.errorInApi = true;
                        console.log("Error in pricing details "+error);
                    });
                }
 
                /**
                 * @ngdoc method
                 * @name showModifyModal
                 * @methodOf migrationApp.controller:rsrecommendationitemCtrl
                 * @description 
                 * This function helps to populate the pricing details when the modal is clicked first time.
                 */
                vm.showModifyModal = function(item,id){
                    if(!vm.errorInApi){
                        vm.disable = true;
                        $(id).modal('show');
                        vm.getPricingDetails(item);
                    }else{
                        $("#error-in-api").modal('show');
                    }
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
                            var selectedConfiguration = parseInt(vm.selectedConfiguration) || 0;
                            server.selectedMapping = server.pricingOptions[selectedConfiguration];
                            server.selectedMapping.zone = vm.awsZone || server.selectedMapping.zone;
                        }    
                    });
                    dataStoreService.setItems({server:vm.data,network:[],LoadBalancers:dataStoreService.getItems('LoadBalancers')});
                    if(vm.data.length !== 0)
                        $window.localStorage.setItem('selectedServers',JSON.stringify(vm.data));
                    $rootScope.$emit("pricingChanged");
                    $('#modify_modal'+id).modal('hide');
                };

                /**
                 * @ngdoc method
                 * @name equipmentDetails
                 * @methodOf migrationApp.controller:rsrecommendationitemCtrl
                 * @description 
                 * This function helps us to trigger a function in its parent, which in turn helps 
                 * to show the modal of equipment details.
                 */
                vm.equipmentDetails = function(type, itemdetails) {
                    if (type === "loadbalancers") type = "LoadBalancers";
                    vm.parent.equipmentDetails(type, itemdetails);
                };
                
                return vm;
            }]
        }); // end of component rsrecommendationitem
})();
