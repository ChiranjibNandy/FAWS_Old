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

                    var url = '/api/aws/regions/ec2';
                    HttpWrapper.send(url,{"operation":'GET'}).then(function(result){
                        vm.regions = result;

                        vm.disable = true;
                        $('#rs-main-panel').css('height','310px');
                        },function(error){
                        vm.errorInApi = true;
                    });

                    if(vm.type === "server"){
                        //vm.data = dataStoreService.getItems(vm.type); -- Previous Code
                        if($window.localStorage.selectedResources !== undefined){
                            vm.data = JSON.parse($window.localStorage.selectedResources)['server'];
                            angular.forEach(vm.data, function (item) {
                                vm.totalCost(item);
                            });
                        }
                        else
                           vm.data = [];//dataStoreService.getItems(vm.type); 
                        //$window.localStorage.selectedServers = JSON.stringify(vm.data);
                        vm.labels = [
                                        {field: "name", text: vm.type+" Name", sortingNeeded:true},
                                        {field: "ip_address", text: "IP Address", sortingNeeded:true},
                                        {field: "region", text: "AWS Region", sortingNeeded:true},
                                        {field: "zone", text: "AWS Zone", sortingNeeded:true},
                                        {field: "instance_type", text: "AWS instance", sortingNeeded:true},
                                        {field: "totalCost", text: "Cost/Month", sortingNeeded:true},
                                        {field: "action", text: "Actions", sortingNeeded:false}
                                    ];
                    }else if (vm.type === "network"){
                        vm.fetchNetworks();
                    }else if (vm.type === "volume"){
                        if($window.localStorage.selectedResources !== undefined)
                            vm.data = JSON.parse($window.localStorage.selectedResources)['volume'];
                        else
                            vm.data = []//;dataStoreService.getItems("LoadBalancers");
                        vm.labels = [
                                        {field: "name", text: "Volume Name"},
                                        {field: "size", text: "Size"},
                                        {field: "volume status", text: "Volume Status"},
                                        {field: "destRegion", text: "AWS region"},
                                        {field: "destZone", text: "AWS zone"}
                                    ];
                        //For each of the resources in the array, set the default zone to 'us-east-1a'
                        angular.forEach(vm.data,function(item){
                            item.selectedMapping.zone = item.selectedMapping.zone || 'us-east-1a';
                            //Called to prepopulate the zones array on page load for volume resource types
                            vm.getZones(item,item.type);
                        });

                    }else if (vm.type === "file"){
                        if($window.localStorage.selectedResources !== undefined)
                            vm.data = JSON.parse($window.localStorage.selectedResources)['file'];
                        else
                            vm.data = []//;dataStoreService.getItems("LoadBalancers");
                        vm.labels = [
                                        {field: "name", text: "Region"},
                                        {field: "size", text: "Size"},
                                        {field: "File status", text: "File Status"},
                                        {field: "destRegion", text: "AWS region"}
                                    ];
                    }else if (vm.type === "service"){
                        if($window.localStorage.selectedResources !== undefined)
                            vm.data = JSON.parse($window.localStorage.selectedResources)['service'];
                        else
                            vm.data = []//;dataStoreService.getItems("LoadBalancers");
                        vm.labels = [
                                        {field: "name", text: "Service Name"},
                                        {field: "id", text: "ID"},
                                        {field: "service status", text: "Service Status"},
                                        {field: "destRegion", text: "AWS region"}
                                    ];
                    }else{
                        //vm.data = dataStoreService.getItems("LoadBalancers");
                        if($window.localStorage.selectedResources !== undefined)
                            vm.data = JSON.parse($window.localStorage.selectedResources)['LoadBalancers'];
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
                    if($window.localStorage.selectedResources !== undefined)
                        servers = JSON.parse($window.localStorage.selectedResources)['server'];
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
                    // vm.reverse = (vm.propertyName === propertyName) ? !vm.reverse : false;
                    // vm.propertyName = propertyName;
                    vm.propertyName = propertyName;
                    var items = vm.data;
                    if(vm.sortingOrder){
                        items.sort(function(a,b){
                            if(["region", "totalCost", "zone", "instance_type"].indexOf(propertyName) > -1){
                                if(a.selectedMapping[propertyName] < b.selectedMapping[propertyName]) return -1;
                                if(a.selectedMapping[propertyName] > b.selectedMapping[propertyName]) return 1;
                            }
                            else{
                                if(a[propertyName] < b[propertyName]) return -1;
                                if(a[propertyName] > b[propertyName]) return 1;
                            }
                            return 0;
                        });
                        vm.sortingOrder = false;
                    }else{
                        items.sort(function(a,b){
                            if(["region", "totalCost", "zone", "instance_type"].indexOf(propertyName) > -1){
                                if(a.selectedMapping[propertyName] > b.selectedMapping[propertyName]) return -1;
                                if(a.selectedMapping[propertyName] < b.selectedMapping[propertyName]) return 1;
                            }
                            else{
                                if(a[propertyName] > b[propertyName]) return -1;
                                if(a[propertyName] < b[propertyName]) return 1;
                            }
                            return 0;
                        });
                        vm.sortingOrder = true;
                    }
                    vm.data = items;
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
                vm.getZones = function(item,type){
                    vm.disable = true;
                    vm.loadingZone = true;
                    var url = '';
                    //For volume resource types, the typeof vm.awsRegion defaults to undefined, so the region is read from item.selectedMapping.region 
                    if (typeof vm.awsRegion === 'undefined')
                        url = '/api/aws/availability_zones/'+item.selectedMapping.region+'/ec2';
                    else
                        url = '/api/aws/availability_zones/'+vm.awsRegion+'/ec2';
                    //If this method is called from modify modal, we will have the region , at that
                    //time we have to get pricing details.
                    if(item && (typeof type === 'undefined')) vm.getPricingDetails(item);
                    HttpWrapper.send(url,{"operation":'GET'}).then(function(zones){
                        vm.loadingZone = false;
                        //We clear the zones array each time we change the region
                        //If the zones array is empty and typeof vm.awsZone defaults to 'undefined', populate the zones array and item.selectedMapping.zone
                        if(typeof vm.awsZone === 'undefined' && item.selectedMapping.zones.length === 0){
                            // if(item.selectedMapping.zone !== 'us-east-1a')
                            item.selectedMapping.zone = zones[0];
                            item.selectedMapping.zones = zones;
                            vm.setZone(item);
                        }
                        //If the zones array already holds few of the items, we need not to set th zone explicitly as the first element on the array
                        //This would not reset the previously selected zone for the item
                        else if(typeof vm.awsZone === 'undefined' && item.selectedMapping.zones.length > 0){
                            vm.setZone(item);
                        }
                        //If it is called from the modify modal
                        else{
                            vm.awsZone = zones[0];
                            vm.zones = zones;
                        }
                        if(item){
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
                        vm.selectedConfigurationType = item.selectedMapping.instance_type;
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
                            vm.totalCost(server);
                        }    
                    });
                    vm.selectedConfiguration = 0;
                    if(vm.data.length !== 0)
                        //$window.localStorage.setItem('selectedServers',JSON.stringify(vm.data));
                        dataStoreService.setSelectedItems(vm.data,vm.data[0].type);
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
                    item.selectedMapping.totalCost = (parseFloat(aws_uptime_cost) + parseFloat(aws_bandwidth_cost)+ parseFloat(storage_rate)).toFixed(2);
                    // return item.selectedMapping.totalCost;
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
                    vm.filteredArr = vm.data.filter(item => item.name.toLowerCase().indexOf(vm.filtervalue.toLowerCase())!=-1 || (item.ip_address || '').indexOf(vm.filtervalue)!=-1 || ((item.selectedMapping && item.selectedMapping.region) || '').toLowerCase().indexOf(vm.filtervalue.toLowerCase())!=-1 || ((item.selectedMapping && item.selectedMapping.zone) || 'us-east-1a').toLowerCase().indexOf(vm.filtervalue.toLowerCase())!=-1 || ((item.selectedMapping && item.selectedMapping.instance_type) || '').toLowerCase().indexOf(vm.filtervalue.toLowerCase())!=-1 || ((item.selectedMapping && item.selectedMapping.totalCost) || 0) == vm.filtervalue);
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
                
                /**
                 * @ngdoc method
                 * @name filterCustomSearch
                 * @methodOf migrationApp.controller:rsrecommendationitemCtrl
                 * @description 
                 * This function helps us customize the filter 
                 * inorder to search for resources depending on the column headers shown in the resource tabs
                 */
                vm.filterCustomSearch = function (item){
                    if (vm.filtervalue === undefined || vm.filtervalue == "") return true;
                    if (item.name.toLowerCase().indexOf(vm.filtervalue.toLowerCase())!=-1 || item.ip_address.indexOf(vm.filtervalue)!=-1 || item.selectedMapping.region.toLowerCase().indexOf(vm.filtervalue.toLowerCase())!=-1 || (item.selectedMapping.zone || 'us-east-1a').toLowerCase().indexOf(vm.filtervalue.toLowerCase())!=-1 || item.selectedMapping.instance_type.toLowerCase().indexOf(vm.filtervalue.toLowerCase())!=-1 || item.selectedMapping.totalCost == vm.filtervalue) {
                        return true;
                    }
                    return false;
                };

                vm.setRegion = function (item){
                    item.selectedMapping.zones = [];
                    if(vm.data.length > 0)
                        dataStoreService.setSelectedItems(vm.data,vm.data[0].type);
                };

                vm.setZone = function (item){
                    angular.forEach(vm.data,function(arrayItem){
                        if(arrayItem.id === item.id){
                            arrayItem.selectedMapping.zone = item.selectedMapping.zone;
                        }
                    });
                if(vm.data.length > 0)
                    dataStoreService.setSelectedItems(vm.data,vm.data[0].type);
                };
                
                return vm;
            }]
        }); // end of component rsrecommendationitem
})();
