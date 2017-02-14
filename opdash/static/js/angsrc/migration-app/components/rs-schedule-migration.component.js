(function () {
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsschedulemigration
     * @description
     * Component to display the _Schedule Migration_ page. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/schedule-migration.html**  
     *   
     * Its controller {@link migrationApp.controller:rsschedulemigrationCtrl rsschedulemigrationCtrl} uses the below services:
     *  * $rootRouter
     *  * {@link migrationApp.service:datastoreservice datastoreservice}
     *  * $scope
     */
    angular.module("migrationApp")
        .component("rsschedulemigration", {
            templateUrl: "/static/angtemplates/migration/schedule-migration.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsschedulemigrationCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsschedulemigration rsschedulemigration} component
             */
            controller: [ "$rootRouter","datastoreservice","$scope", function($rootRouter,dataStoreService,$scope) {
                var vm = this;

                vm.$onInit = function() {
                    $('title')[0].innerHTML =  "Schedule Migration - Rackspace Cloud Migration";
                    vm.tenant_id = 1024814;//  authservice.getAuth().tenant_id;
                    vm.timeItems = ["12:00am","12:15am","12:30am","12:45am","1:00am","1:15am","1:30am","1:45am","2:00am","2:15am","2:30am","2:45am","3:00am","3:15am","3:30am","3:45am","4:00am","4:15am","4:30am","4:45am",
                    "5:00am","5:15am","5:30am","5:45am",
                    "06:00am","6:15am","6:30am","6:45am",
                    "7:00am","7:15am","7:30am","7:45am",
                    "8:00am","8:15am","8:30am","8:45am",
                    "9:00am","9:15am","9:30am","9:45am","10:00am","10:15am",
                    "10:30am","10:45","11:00am","11:15am","11:30am","11:45am",
                    "12:00pm","12:15pm","12:30pm","12:45pm","1:00pm","1:15pm","1:30pm","1:45pm",
                    "2:00pm","2:15pm","2:30pm","2:45pm",
                    "3:00pm","3:15pm","3:30pm","3:45pm","4:00pm","4:15pm",
                    "4:30pm","4:45pm","5:00pm","5:15pm","5:30pm","5:45pm","6:00pm","6:15pm",
                    "6:30pm","6:45pm","7:00pm","7:15pm","7:30pm","7:45pm",
                    "8:00pm","8:15pm","8:30pm","8:45pm","9:00pm","9:15pm",
                    "9:30pm","9:45pm","10:00pm","10:15pm","10:30pm","10:45pm","11:00pm","11:15pm","11:30pm","11:45pm"];
                    vm.timeZoneItems = ["(GMT -12:00) Eniwetok, Kwajalein",
                "(GMT -11:00) Midway Island, Samoa",
                "(GMT -10:00) Hawaii",
                "(GMT -9:00) Alaska",
                "(GMT -8:00) Pacific Time (US &amp; Canada)",
                "(GMT -7:00) Mountain Time (US &amp; Canada)",
                "(GMT -6:00) Central Time (US &amp; Canada), Mexico City",
                "(GMT -5:00) Eastern Time (US &amp; Canada), Bogota, Lima",
                "(GMT -4:30) Caracas",
                "(GMT -4:00) Atlantic Time (Canada), La Paz, Santiago",
                "(GMT -3:00) Brazil, Buenos Aires, Georgetown",
               "(GMT -2:00) Mid-Atlantic",
                "(GMT -1:00 hour) Azores, Cape Verde Islands",
                "(GMT) Western Europe Time, London, Lisbon, Casablanca, Greenwich",
               "(GMT +1:00 hour) Brussels, Copenhagen, Madrid, Paris",
                "(GMT +2:00) Kaliningrad, South Africa, Cairo",
               "(GMT +3:00) Baghdad, Riyadh, Moscow, St. Petersburg",
               "(GMT +3:30) Tehran",
                "(GMT +4:00) Abu Dhabi, Muscat, Yerevan, Baku, Tbilisi",
                 "(GMT +4:30) Kabul",
                "(GMT +5:00) Ekaterinburg, Islamabad, Karachi, Tashkent",
                "(GMT +5:30) Mumbai, Kolkata, Chennai, New Delhi",
                "(GMT +5:45) Kathmandu",
                "(GMT +6:00) Almaty, Dhaka, Colombo",
               "(GMT +6:30) Yangon, Cocos Islands",
                "(GMT +7:00) Bangkok, Hanoi, Jakarta",
                "(GMT +8:00) Beijing, Perth, Singapore, Hong Kong",
                "(GMT +9:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk",
               "(GMT +9:30) Adelaide, Darwin",
                "(GMT +10:00) Eastern Australia, Guam, Vladivostok",
                "(GMT +11:00) Magadan, Solomon Islands, New Caledonia",
                    "(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka"]
                    vm.time =  vm.timeItems[0];//new Date().toLocaleTimeString(); ;
                    vm.timezone = vm.timeZoneItems[0]//new Date().toTimeString(); //;
                    vm.selectedDate = new Date().toString();
                    vm.unixTime = Math.floor(new Date().getTime()/ 1000);
                    vm.selectedDateHeader = new Date().toLocaleString();//moment().format("MMM Do YYYY")+" at "+vm.time+" "+vm.timezone;
                    vm.date = moment().format("MMM Do YYYY");
                    dataStoreService.storeDate('time',vm.time);
                    dataStoreService.storeDate('timezone',vm.timezone);
                    var d = new Date();
                   vm.migrationName = dataStoreService.getScheduleMigration().migrationName;
                     dataStoreService.getScheduleMigration();//'Migration-' + new Date().toString();
                     //(d.getUTCMonth()+1) +"-"+ d.getUTCDate()+"-"+ d.getUTCFullYear() + + " " + d.getUTCHours() + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds();;
                    $scope.$watch('vm.migrationName', function() {              
              vm.selectedTime = {
                   migrationName: vm.migrationName,
                   time:vm.unixTime,
                   timezone:vm.timezone,
               
            };
             dataStoreService.setScheduleMigration(vm.selectedTime);
            vm.editorEnabled = false;
    });
         
                    $scope.$on("DateChanged", function(event, item){
                        vm.date = item;
                        vm.selectedDate = moment(item).format("MMM Do YYYY")+" at "+vm.time+" in "+vm.timezone;
                    });
                };

                vm.saveItems = function() {
                      $('#cancel_modal').modal('show');
                    alert("Saving items: To be implemented");
                };
                /**
                 * @ngdoc method
                 * @name timeChange
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 * Saves the chosen time for migration
                 */
                // vm.timeChange = function(){
                //     dataStoreService.storeDate('time',vm.time);
                //     vm.selectedDate = moment(vm.date).format("MMM Do YYYY")+" at "+vm.time+" in "+vm.timezone;
                // };

                /**
                 * @ngdoc method
                 * @name timezoneChange
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 * Saves the chosen timezone for migration
                 */
                // vm.timezoneChange = function(){
                //     dataStoreService.storeDate('timezone',vm.timezone);
                //     vm.selectedDate = moment(vm.date).format("MMM Do YYYY")+" at "+vm.time+" in "+vm.timezone;
                // };

                /**
                 * @ngdoc method
                 * @name continue
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 * Continue to next step: **Confirm Migration**
                 */
                vm.continue = function() {
                    console.log(vm.selectedTime);
                    $rootRouter.navigate(["ConfirmMigration"]);
                };
 /**
                 * @ngdoc method
                 * @name editMigrationName
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 * Edit migration name**
                 */
                 vm.editMigrationName = function() {
                 vm.editorEnabled = true;
                 vm.editedMigrationName = vm.migrationName;
                      };
                      /**
                 * @ngdoc method
                 * @name disableEditor
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 * Cancel edit migration name**
                 */
                vm.disableEditor = function() {
                 vm.editorEnabled = false;
                   };
                   /**
                 * @ngdoc method
                 * @name save
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 * Save edited migration name**
                 */
                vm.save = function() {
                vm.migrationName  = vm.editedMigrationName;
                vm.disableEditor();
                };
                return vm;
            }
        ]}); // end of component definition
})();