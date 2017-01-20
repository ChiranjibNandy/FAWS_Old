(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rscollapsiblepanel
     * @param {String} type The type of resource for which the panel has to be rendered (server, network etc)
     * @requires migrationApp.object:rscollapsiblepanelgroup
     * @description
     * To display a collapsible panel in batch migration details page. This is a panel with a heading and a body. 
     * The body of the panel can be expanded or collapsed by clicking a button on the header.
     * This component requires the parent component {@link migrationApp.object:rscollapsiblepanelgroup rscollapsiblepanelgroup}  
     *   
     * This component uses the template: **angtemplates/migration/batch-group-detail.html**. It uses the controller {@link migrationApp.controller:rscollapsiblepanelCtrl rscollapsiblepanelCtrl}.  
     *   
     * This component (and its features) is being used by following pages of the application:
     *  * angtemplates/migration/batch-migration-details.html
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rscollapsiblepanelgroup>
     *          <rscollapsiblepanel type="server"></rscollapsiblepanel>
     *      </rscollapsiblepanelgroup>
     *   </file>
     * </example>
     */
    angular.module("migrationApp")
        .component("rscollapsiblepanel", {
            transclude: true,
            require: {
                panelGroup: "^^rscollapsiblepanelgroup" // require the parent controller
            },
            bindings: {
                type: "@" // expects a type attr. eg: server, network etc
            },
            templateUrl: "/static/angtemplates/migration/batch-group-detail.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rscollapsiblepanelCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rscollapsiblepanel rscollapsiblepanel} component
             */
            controller: function() {
                var vm = this;

                vm.$onInit = function(){
                    var collapsed = true; // set initial state of panel to collapsed

                    /**
                     * @ngdoc property
                     * @name batchItems
                     * @propertyOf migrationApp.controller:rscollapsiblepanelCtrl
                     * @type {Array}
                     * @description List of resources included in a batch migration
                     */
                    vm.batchItems = [];

                    vm.loading = true;
                    vm.loadError = false;
                    vm.noData = false;

                    vm.panel = {
                        collapsed: collapsed
                    };

                    // add panel to panel group
                    vm.panelGroup.addPanel(vm.panel);

                    // get batch items
                    vm.panelGroup.getBatchList(vm.type)
                        .then(function(response){
                            if(response.error){
                                vm.loading = false;
                                vm.loadError = true;
                                return;
                            }
                            if(response.batchItems.length === 0){
                                vm.noData = true;
                                vm.loading = false;
                                return;
                            }

                            vm.batchItems = response.batchItems;
                            vm.estimatedTimeRemaining = response.estimatedTimeRemaining;
                            vm.status = response.status;
                            vm.progress = response.progress;
                            vm.completedCount = response.completedCount;
                            vm.loading = false;
                        });
                }
                
                /**
                 * @ngdoc method
                 * @name pause
                 * @methodOf migrationApp.controller:rscollapsiblepanelCtrl
                 * @param {String} [id] Optional: ID of the resource whose migration has to be paused
                 * @description 
                 * Pauses migration of the given resource. Pauses all migration of the current resource type, if nothing is specified.
                 */
                vm.pause = function(id){
                    if(typeof id === "undefined"){ // pause all
                        alert("Pause migration of all " + vm.type + "s");
                    }else{ // pause one
                        alert("Pause migration of " + vm.type + ": " + id);
                    }
                };

                /**
                 * @ngdoc method
                 * @name cancel
                 * @methodOf migrationApp.controller:rscollapsiblepanelCtrl
                 * @param {String} [id] Optional: ID of the resource whose migration has to be cancelled
                 * @description 
                 * Cancels migration of the given resource. Cancels all migration of the current resource type, if nothing is specified.
                 */
                vm.cancel = function(id){
                    if(typeof id === "undefined"){ // cancel all
                        alert("Cancel migration of all " + vm.type + "s");
                    }else{ // cancel one
                        alert("Cancel migration of " + vm.type + ": " + id);
                    }
                };
            }
        }); // end of component rscollapsiblepanel
})();