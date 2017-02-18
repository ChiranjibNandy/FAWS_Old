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
            controller: [ "$rootRouter","datastoreservice","$scope","authservice", function($rootRouter,dataStoreService,$scope,authservice) {
                var vm = this;

                vm.$onInit = function() {
                    $('title')[0].innerHTML =  "Schedule Migration - Rackspace Cloud Migration";
                    console.log(authservice.getAuth().tenant_id);
                    vm.tenant_id = authservice.getAuth().tenant_id;
                    vm.scheduleMigration = "migrateNow";
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
                "(GMT -09:00) Alaska",
                "(GMT -08:00) Pacific Time (US &amp; Canada)",
                "(GMT -07:00) Mountain Time (US &amp; Canada)",
                "(GMT -06:00) Central Time (US &amp; Canada), Mexico City",
                "(GMT -05:00) Eastern Time (US &amp; Canada), Bogota, Lima",
                "(GMT -04:30) Caracas",
                "(GMT -04:00) Atlantic Time (Canada), La Paz, Santiago",
                "(GMT -03:00) Brazil, Buenos Aires, Georgetown",
               "(GMT -02:00) Mid-Atlantic",
                "(GMT -01:00 hour) Azores, Cape Verde Islands",
                "(GMT) Western Europe Time, London, Lisbon, Casablanca, Greenwich",
               "(GMT +01:00 hour) Brussels, Copenhagen, Madrid, Paris",
                "(GMT +02:00) Kaliningrad, South Africa, Cairo",
               "(GMT +03:00) Baghdad, Riyadh, Moscow, St. Petersburg",
               "(GMT +03:30) Tehran",
                "(GMT +04:00) Abu Dhabi, Muscat, Yerevan, Baku, Tbilisi",
                 "(GMT +04:30) Kabul",
                "(GMT +05:00) Ekaterinburg, Islamabad, Karachi, Tashkent",
                "(GMT +05:30) Mumbai, Kolkata, Chennai, New Delhi",
                "(GMT +05:45) Kathmandu",
                "(GMT +06:00) Almaty, Dhaka, Colombo",
               "(GMT +06:30) Yangon, Cocos Islands",
                "(GMT +07:00) Bangkok, Hanoi, Jakarta",
                "(GMT +08:00) Beijing, Perth, Singapore, Hong Kong",
                "(GMT +09:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk",
               "(GMT +09:30) Adelaide, Darwin",
                "(GMT +10:00) Eastern Australia, Guam, Vladivostok",
                "(GMT +11:00) Magadan, Solomon Islands, New Caledonia",
                    "(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka"];
                    var date = new Date().toTimeString();
                    var timeZone =  date.indexOf("+") === -1 ?date.substr(date.indexOf("-")+1,5):date.substr(date.indexOf("+")+1,5);
                    var exactZone = [timeZone.slice(0, 2),':', timeZone.slice(2)].join('');
                    vm.timezone = vm.timeZoneItems.filter(function(item){
                                    if(item.includes(exactZone.trim())){
                                        return item;
                                    }      
                                  })[0];
                    var m = moment();
                    var roundUp = m.minute() || m.second() || m.millisecond() ? m.add(1, 'hour').startOf('hour') : m.startOf('hour');
                    vm.time = roundUp.format('h:mma');
                    
                    vm.initTime =  new Date().toLocaleTimeString();
                   // vm.timezone = vm.timeZoneItems[0]//new Date().toTimeString(); //;
                   vm.date =new Date();
                    vm.selectedDateHeader = new Date().toLocaleString();//moment().format("MMM Do YYYY")+" at "+vm.time+" "+vm.timezone;
                    vm.selectedDate =  moment().format('ddd MMMM Do YYYY')+' '+vm.time+' '+vm.timezone;
                    // console.log(vm.finalDateForUnixTime);
                   //console.log(new Date(vm.finalDateForUnixTime));
                    vm.unixTime = parseInt((new Date().getTime()/1000), 10);
                    //  console.log(new Date(vm.finalDateForUnixTime));
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
             console.log(dataStoreService.getScheduleMigration());
            vm.editorEnabled = false;
            vm.showTimeForm = false;
            vm.showMigrate = false;
           vm.isDisableDate =false;
           vm.isModeSave= true;
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
                vm.timezoneChange = function(){
                    vm.selectedDate =  moment(vm.date).format('ddd MMMM Do YYYY')+' '+vm.time+' '+vm.timezone;
                };

                /**
                 * @ngdoc method
                 * @name continue
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 * Continue to next step: **Confirm Migration**
                 */
                vm.continue = function() {
                    // console.log(vm.selectedTime);
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
                
               vm.showTime = function(){
                   if(vm.scheduleMigration === "migrateLate"){
                       vm.showTimeForm =  true;
                   }else{
                       vm.showTimeForm =  false;
                   }
                    
               };

               vm.onSaveTime = function(){
               vm.isDisableDate =true;
                vm.isModeSave= false;
               }
         vm.onEditTime = function(){
                vm.isModeSave= true;
                vm.isDisableDate =false;
               }
                return vm;
            }

        ]}); // end of component definition
})();