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
            controller: ["migrationitemdataservice", "authservice", "$q", "datastoreservice", "$rootRouter","httpwrapper","$rootScope","$window","DEFAULT_VALUES","$filter","$scope", function (ds, authservice, $q, dataStoreService, $rootRouter,HttpWrapper,$rootScope,$window,DEFAULT_VALUES,$filter,$scope) {
                var vm = this;

                vm.$onInit = function() {
                    // vm.recSelectedItems = dataStoreService.getRecommendedItems() || [];
                    vm.propertyName = "name";
                    vm.errorInApi = false;
                    vm.reverse = false;
                    vm.disable = true;
                    vm.loadingZone = false;
                    vm.loadingPrice = false;
                    vm.filteredArr = [];

                    if(vm.type === "server"){
                        var url = '/api/ec2/regions'; 
                        HttpWrapper.send(url,{"operation":'GET'}).then(function(result){
                            vm.regions = result;
                            // vm.awsRegion = DEFAULT_VALUES.REGION;
                            vm.disable = true;
                            $('#rs-main-panel').css('height','310px');
                        },function(error){
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
                vm.disableConfirm = function(index){
                    vm.disable = false;
                    if(index !== undefined){
                        vm.selectedConfiguration = index;
                    }
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
                    vm.disable = true;
                    vm.loadingZone = true;
                    var url =  '/api/ec2/availability_zones/'+vm.awsRegion; 
                    //If this method is called from modify modal, we will have the region , at that
                    //time we have to get pricing details.
                    if(region) vm.getPricingDetails(region);
                    HttpWrapper.send(url,{"operation":'GET'}).then(function(zones){
                        vm.loadingZone = false;
                        vm.awsZone = zones[0];
                        vm.zones = zones;
                        if(region){
                            vm.disableConfirm();
                        }
                      
                    },function(error){
                        vm.loadingZone = false;
                        vm.errorInApi = true;
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
                    vm.loadingPrice = true;
                    var url = '/api/ec2/get_all_ec2_prices/'+item.details.flavor_details.id+'/'+vm.awsRegion;
                    HttpWrapper.send(url,{"operation":'GET'}).then(function(pricingOptions){
                        vm.loadingPrice = false;
                        item.pricingOptions = pricingOptions;
                        if(item.pricingOptions.length == 0){
                            vm.selectedConfigurationType = "";
                        }
                        //item.pricingOptions.concat(item.details);
                    },function(error){
                        vm.loadingPrice = false;
                        vm.errorInApi = true;
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
                        vm.awsRegion = item.selectedMapping.region;
                        vm.awsZone = item.selectedMapping.zone || 'us-east-1a';
                        vm.selectedConfigurationType = item.selectedMapping.instance_type
                        vm.getZones();
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
                    vm.selectedConfiguration = 0;
                    if(vm.data.length !== 0)
                        $window.localStorage.setItem('selectedServers',JSON.stringify(vm.data));
                    $rootScope.$emit("pricingChanged");
                    $('#modify_modal'+id).modal('hide');
                };

                vm.totalCost = function(item){
                    var storage_rate = parseFloat(parseFloat(item.details.rax_storage_size) * parseFloat(item.selectedMapping.storage_rate)).toFixed(2);
                    var aws_bandwidth_cost = 0;
                    if(item.details.rax_bandwidth !== undefined)
                        aws_bandwidth_cost = parseFloat(parseFloat(item.selectedMapping.cost) * parseFloat(item.details.rax_bandwidth)).toFixed(2);
                    else
                        aws_bandwidth_cost = parseFloat(parseFloat(item.selectedMapping.cost) * 0).toFixed(2);
                    var aws_uptime_cost = parseFloat(parseFloat(item.selectedMapping.cost) * parseFloat(item.details.rax_uptime || 720)).toFixed(2);

                    return (parseFloat(aws_uptime_cost) + parseFloat(aws_bandwidth_cost)+ parseFloat(storage_rate)).toFixed(2);
                }

                //Get Instance Wise Total Cost at the modify configuration page
                vm.getTotalInstanceCost = function(server,item){
                    var storage_rate = parseFloat(parseFloat(item.details.rax_storage_size) * parseFloat(server.storage_rate)).toFixed(2);
                    var aws_bandwidth_cost = 0;
                    if(item.details.rax_bandwidth !== undefined)
                        aws_bandwidth_cost = parseFloat(parseFloat(server.cost) * parseFloat(item.details.rax_bandwidth)).toFixed(2);
                    else
                        aws_bandwidth_cost = parseFloat(parseFloat(server.cost) * 0).toFixed(2);
                    var aws_uptime_cost = parseFloat(parseFloat(server.cost) * parseFloat(item.details.rax_uptime || 720)).toFixed(2);

                    return (parseFloat(aws_uptime_cost) + parseFloat(aws_bandwidth_cost)+ parseFloat(storage_rate)).toFixed(2);
                }
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

                $scope.$watch('vm.filtervalue', function (query) {
                    vm.filteredArr = $filter("filter")(vm.data, query);
                    // pagination controls
                    vm.currentPage = 1;
                    vm.pageArray = [];
                    vm.pageSize = 5; // items to be displayed per page
                    vm.totalItems = vm.filteredArr.length; // number of items received.
                    vm.noOfPages = Math.ceil(vm.totalItems / vm.pageSize);
                    for(var i=1;i<=vm.noOfPages;i++){
                        vm.pageArray.push(i);
                    };    
                });
                
                return vm;
            }]
        }); // end of component rsrecommendationitem
})();
