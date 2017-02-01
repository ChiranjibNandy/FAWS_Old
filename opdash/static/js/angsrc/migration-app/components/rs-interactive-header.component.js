(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsinteractiveheader
     * @description
     * Component to have a interactive header in every page.  
     *   
     * This component uses the template: **angtemplates/migration/interactive-header.html**. It uses the controller {@link migrationApp.controller:rsinteractiveheaderCtrl rsinteractiveheaderCtrl}.  
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rsinteractiveheader error-message="Some error message"></rsinteractiveheader>
     *   </file>
     * </example>
     */
    angular.module("migrationApp")
        .component("rsinteractiveheader", {
            templateUrl: "/static/angtemplates/migration/interactive-header.html",
            bindings: {
                pagenum: "<" // type parameter to be supplied (eg: server, network etc)
            },
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsinteractiveheaderCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsinteractiveheader rsinteractiveheader} component
             */
            controller: ["datastoreservice", function (dataStoreService) {
                var vm = this;
                document.getElementById("subNav").style.display = "block";
                var subMenus = $("#subNav .mdl-stepper-step");
                $(subMenus).removeClass("active-step step-done");
                $(subMenus).each(function (index) { 
                    if(index > parseInt(vm.pagenum)){
                    $(subMenus[index]).addClass("disabled");
                    }
                    else if(index < parseInt(vm.pagenum)){
                        $(subMenus[index]).addClass("active-step step-done");
                        $(subMenus[index]).removeClass("disabled");
                    }

                });
                $(subMenus[parseInt(vm.pagenum)]).addClass("active-step");
                        return vm;
                    }]
        }); // end of component definition
})();
