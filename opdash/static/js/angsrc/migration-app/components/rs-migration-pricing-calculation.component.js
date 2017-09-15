(function () {
    "use strict";
    /**
    * @ngdoc object
    * @name migrationApp.object:rsmigrationpricingcalculation
    * @description
    * Component to display the pricing calculation modal on recommendation and confirm and migrate page.
    *
    * This component uses the template: **angtemplates/migration/pricing-calculation.html**. It uses the controller {@link migrationApp.controller:rsmigrationpricingcalculationCtrl rsmigrationpricingcalculationCtrl}.
    */
    angular.module("migrationApp")
        .component("rsmigrationpricingcalculation", {
            transclude: true,
            templateUrl: "/static/angtemplates/migration/pricing-calculation.html",
            controllerAs: "vm",
            /**
            * @ngdoc controller
            * @name migrationApp.controller:rsmigrationpricingcalculationCtrl
            * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsmigrationpricingcalculation rsmigrationpricingcalculation} component
            */
            controller: ["$scope","$window", function ($scope,$window) {
                var vm = this;

                // make isNaN available in your view via component as syntax
                vm.isNaN = function(value) {
                    return isNaN(value);
                }
                /**
                * @ngdoc method
                * @name openUsageCostsModal
                * @methodOf migrationApp.controller:rspricingCtrl
                * @description
                * function to open the modal that displays the current and projected pricing calculations for the selected servers.
                */
                $scope.$on("openUsageCostsModal",function () {
                    vm.costCalculationItems = [];
                    vm.projectedCostCalculationItems = [];
                    vm.totalOfCostCalculationItems = 0;
                    vm.totalOfProjectedCostCalculationItems = 0;
                    vm.showCalculatedCostDialog = false;
                    var selectedPricingMappingObj = [];

                    if ($window.localStorage.selectedResources !== undefined)
                        selectedPricingMappingObj = JSON.parse($window.localStorage.selectedResources)['server'];

                    selectedPricingMappingObj.forEach(function (server) {
                        var selectedFlavor = server.selectedMapping.instance_type;
                        if (server.details.hasOwnProperty('rax_bandwidth')) {
                            vm.costCalculationItems.push({
                                "resourceName": server.details.name,
                                "rax_uptime_cost": server.details.rax_uptime_cost.toFixed(2),
                                "rax_bandwidth_cost": parseFloat(server.details.rax_bandwidth_cost).toFixed(2),
                                "rax_bandwidth": server.details.rax_bandwidth.toFixed(2),
                                "rax_uptime": server.details.rax_uptime.toFixed(2),
                                "rax_total_cost": parseFloat(parseFloat(server.details.rax_uptime_cost) + parseFloat(server.details.rax_bandwidth_cost)).toFixed(2),
                                "storage": server.details.rax_storage_size
                            });
                            vm.totalOfCostCalculationItems += (parseFloat(parseFloat(server.details.rax_uptime_cost) + parseFloat(server.details.rax_bandwidth_cost)));
                        }

                        if (!server.details.hasOwnProperty('rax_bandwidth')) {
                            vm.costCalculationItems.push({
                                "resourceName": server.details.name,
                                "rax_uptime_cost": "NA",
                                "rax_bandwidth_cost": "NA",
                                "rax_bandwidth": "NA",
                                "rax_uptime": "NA",
                                "rax_total_cost": (server.rax_price),
                                "storage": server.details.rax_storage_size || 0
                            });
                            vm.totalOfCostCalculationItems += (server.rax_price);
                        }

                        if (server.details.hasOwnProperty('rax_bandwidth')) {
                            var storage_rate = parseFloat(parseFloat(server.details.rax_storage_size) * parseFloat(server.selectedMapping.storage_rate)).toFixed(2);
                            var aws_bandwidth_cost = parseFloat(parseFloat(server.selectedMapping.cost) * parseFloat(server.details.rax_bandwidth)).toFixed(2);
                            var aws_uptime_cost = parseFloat(parseFloat(server.selectedMapping.cost) * parseFloat(server.details.rax_uptime)).toFixed(2);
                            vm.projectedCostCalculationItems.push({
                                "resourceName": server.details.name,
                                "aws_uptime_cost": aws_uptime_cost,
                                "aws_bandwidth_cost": aws_bandwidth_cost,
                                "aws_bandwidth": server.details.rax_bandwidth.toFixed(2),
                                "aws_uptime": server.details.rax_uptime.toFixed(2),
                                "aws_total_cost": parseFloat(parseFloat(aws_uptime_cost) + parseFloat(aws_bandwidth_cost) + parseFloat(storage_rate)).toFixed(2),
                                "rax_bandwidth": server.details.rax_bandwidth.toFixed(2),
                                "rax_uptime": server.details.rax_uptime.toFixed(2),
                                "storage_rate": storage_rate,
                                "rax_storage": server.details.rax_storage_size
                            });
                            vm.totalOfProjectedCostCalculationItems += (parseFloat(aws_uptime_cost) + parseFloat(aws_bandwidth_cost) + parseFloat(storage_rate));
                        }

                        if (!server.details.hasOwnProperty('rax_bandwidth')) {
                            //Checks whether the showCalculatedCostDialog flag was set in the loop before
                            if (vm.showCalculatedCostDialog === false)
                                vm.showCalculatedCostDialog = true;

                            var storage_rate = parseFloat(parseFloat(server.details.rax_storage_size) * parseFloat(server.selectedMapping.storage_rate)).toFixed(2);
                            vm.projectedCostCalculationItems.push({
                                "calculated_cost_resourcename": server.details.name,
                                "aws_uptime_cost": parseFloat(parseFloat(server.selectedMapping.cost) * parseFloat(24 * 30)).toFixed(2),
                                "aws_bandwidth": "NA",
                                "aws_uptime": "NA",
                                "aws_total_cost": parseFloat((parseFloat(server.selectedMapping.cost) * parseFloat(24 * 30)) + parseFloat(storage_rate)).toFixed(2),
                                "rax_bandwidth": "NA",
                                "rax_uptime": "720.00",
                                "storage_rate": storage_rate,
                                "rax_storage": server.details.rax_storage_size
                            });
                            vm.totalOfProjectedCostCalculationItems += (parseFloat(parseFloat(server.selectedMapping.cost) * parseFloat(24 * 30)) + parseFloat(storage_rate));
                        }
                    });
                    $('#calculator_modal').modal('show');
                });
            }
            ]
        }); // end of component rsmigrationpricingcalculation
})();