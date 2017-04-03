(function() {
    "use strict";
    
    /**
     * @ngdoc object
     * @name migrationApp.object:rsbatchtasklist
     * @description
     * Component to display the details of a batch migration. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/batch-task-list.html**. It uses the controller {@link migrationApp.controller:rsbatchtasklistCtrl rsbatchtasklistCtrl}.  
     */
    angular.module("migrationApp")
        .component("rsbatchtasklist", {
            transclude: true,
            templateUrl: "/static/angtemplates/migration/batch-task-list.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsbatchtasklistCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsbatchtasklist rsbatchtasklist} component
             */
            controller: ["$rootRouter",function($rootRouter){
                var vm = this;
                
            }
            ]}); // end of component rsbatchtasklist
})();