(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsinteractivefooter
     * @description
     * Component to have a interactive footer in every page.  
     *   
     * This component uses the template: **angtemplates/migration/interactive-footer.html**. It uses the controller {@link migrationApp.controller:rsinteractivefooterCtrl rsinteractivefooterCtrl}.  
     * @example
     * <example module="migrationApp">
     *   <file name="index.html">
     *      <rsinteractivefooter error-message="Some error message"></rsinteractivefooter>
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
             * @name migrationApp.controller:rsinteractivefooterCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsinteractivefooter rsinteractivefooter} component
             */
            controller: ["datastoreservice", function (dataStoreService) {
                var vm = this;
                document.getElementById("subNav").style.display = "block";
                var subMenus = $("#subNav .mdl-stepper-step");
                console.log("page num: "+parseInt(vm.pagenum));
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
