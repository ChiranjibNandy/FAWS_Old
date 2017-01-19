(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        // component to handle recommendations for each resource type (server, network)
        .component("rsrecommendationitem", {
            templateUrl: "/static/angtemplates/migration/recommendation-item-template.html",
            bindings: {
                type: "@" // type parameter to be supplied (eg: server, network etc)
            },
            require: {
                parent: "^^rsmigrationrecommendation"
            },
            controllerAs: "vm",
            controller: ["migrationitemdataservice", "authservice", "$q", "datastoreservice", "$rootRouter", function (ds, authservice, $q, dataStoreService, $rootRouter) {
                var vm = this;

                vm.$onInit = function() {
                    vm.recSelectedItems = [];
                    vm.data = dataStoreService.getItems(vm.type);
                    if(vm.data.length >0)
                        vm.noData = false;
                    else
                        vm.noData = true;
                    vm.labels = [
                                    {field: "name", text: vm.type+" Name"},
                                    {field: "ip_address", text: "IP Address"},
                                    {field: "ram", text: "RAM"},
                                    {field: "status", text: "Status"}
                                ];
                    if(vm.type == "server") 
                        vm.showModify = true;                                
                    else
                        vm.showModify = false;
                    $('#rs-main-panel').css('height','412px');
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
                        vm.recSelectedItems.push(item);
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

                //modifing the selected servers
                vm.modify = function(){
                    dataStoreService.setRecommendedItems(vm.recSelectedItems);
                    $rootRouter.navigate(["CompareOptions"]);
                };

                return vm;
            }]
        }); // end of component rsrecommendationitem
})();
