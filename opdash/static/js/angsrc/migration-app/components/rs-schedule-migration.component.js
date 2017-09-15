(function  ()  {    
    "use strict";

    /**
     * @ngdoc object
     * @name migrationApp.object:rsschedulemigration
     * @description
     * Component to display the _Schedule Migration_ page. This component is loaded directly on route change.  
     *   
     * This component uses the template: **angtemplates/migration/schedule-migration.html**  
     *   
     * Its controller {@link migrationApp.controller:rsschedulemigrationCtrl rsschedulemigrationCtrl} uses the below services:
     *  * $rootRouter
     *  * {@link migrationApp.service:datastoreservice datastoreservice}
     *  * $scope
     */
    angular.module("migrationApp").component("rsschedulemigration", {            
        templateUrl: "/static/angtemplates/migration/schedule-migration.html",
            controllerAs: "vm",
                    
            /**
            * @ngdoc controller
            * @name migrationApp.controller:rsschedulemigrationCtrl
            * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsschedulemigration rsschedulemigration} component
            */
            controller: ["$rootRouter",  "datastoreservice",  "$scope",  "authservice",  "$timeout",  "$rootScope", "$window",  function  ($rootRouter,  dataStoreService,  $scope,  authservice,  $timeout,  $rootScope, $window)  {                
            var vm = this;                
            
            /**
             * @ngdoc method
             * @name $onInit
             * @methodOf migrationApp.controller:rsschedulemigrationCtrl
             * @description 
             *function called on init of the rsschedulemigrationCtrl.
             */
            vm.$onInit = function () {                    
                $('title')[0].innerHTML = "Schedule Migration - Rackspace Cloud Migration";                    
                vm.error = false;
                if ($window.localStorage.timeZones == undefined) {
                    dataStoreService.allTimeZones()
                        .then(function (result) {
                            vm.timeZoneItems =  result.timezones;
                            vm.timeItems = result.timeintervals;
                            vm.timezone1 = (dataStoreService.returnDate() !== null && dataStoreService.returnDate().timezone) || vm.timeZoneItems[0].timeZoneName;
                            vm.timeIntervals = angular.copy(vm.timeItems);
                        });
                } else {
                    vm.timeZoneItems = JSON.parse($window.localStorage.timeZones).timezones;
                    vm.timeItems = JSON.parse($window.localStorage.timeZones).timeintervals;
                    vm.timezone1 = (dataStoreService.returnDate() !== null && dataStoreService.returnDate().timezone) || vm.timeZoneItems[0].timeZoneName;
                    vm.timeIntervals = angular.copy(vm.timeItems);
                }                    
                var m = moment();                    
                var roundUp = m.minute() || m.second() || m.millisecond() ? m.add(1, 'hour').startOf('hour') : m.startOf('hour');                    
                vm.time = roundUp.format('hh:mma');                    
                vm.initTime = new Date().toLocaleTimeString();                    
                vm.date = m.format("YYYY-MM-DD");
                $('#datetimepickerAdd').val(vm.date);                    
                vm.selectedDate = moment().format('MMMM Do YYYY ')  +  ' at '  +  moment().format('h:mma')  +  ' '  +  new  Date().toTimeString().slice(8,  42);
                if (dataStoreService.returnDate() !== null && dataStoreService.returnDate() !== {} && dataStoreService.returnDate().date !== "") {
                    vm.showTimeForm = true;
                    vm.date = dataStoreService.returnDate().date;
                    vm.time = dataStoreService.returnDate().time;
                    $('#datetimepickerAdd').val(vm.date);
                    $rootScope.$emit("vm.scheduleMigration", {
                        'vm.scheduleMigration': true,
                        'whichTime': "schedule"
                    });
                }
                vm.migrationName = dataStoreService.getScheduleMigration().migrationName;                
            };

            /**
             * @ngdoc method
             * @name getTime
             * @methodOf migrationApp.controller:rsschedulemigrationCtrl
             * @description 
             * Function to get the time based on am or pm
             */
            vm.getTime = function ()  {                    
                if (vm.time.indexOf('am')  >  -1) {                        
                    if (vm.time.indexOf('12')  >  -1) {                            
                        var localTime = vm.time.replace('am',  "");                            
                        return localTime.replace('12',  "00");                        
                    } 
                    else {                            
                        return vm.time.replace('am',  "");                        
                    }                       
                } 
                else {                        
                    var subStr = vm.time.substr(0, vm.time.indexOf(':'));
                    if (vm.time.indexOf('12')  >  -1)  {                        
                        var calTime = vm.time.replace(subStr, parseInt(subStr) + 0);
                    } else {
                        var calTime = vm.time.replace(subStr, parseInt(subStr) + 12);
                    }                        
                    return calTime.replace('pm',  '');                    
                }                
            }

            /**
             * @ngdoc method
             * @name showTime
             * @methodOf migrationApp.controller:rsschedulemigrationCtrl
             * @description 
             * show migration scheduled time based on migrate now check or schedule time check**
             */
            vm.showTime = function (whichTime) {                    
                if (whichTime === 'schedule' && vm.timeZoneItems) {                        
                    vm.showTimeForm = true;                        
                    vm.showMigrationTime = false;
                    var timeZoneDiff = vm.timeZoneItems[0].timeZone.slice(3, 9);
                    vm.timezone1  =  vm.timeZoneItems[0].timeZoneName;
                    vm.migrationScheduleDetails  =  {                        
                        migrationName: dataStoreService.getScheduleMigration().migrationName,
                        time: moment(moment(vm.date).format("YYYY-MM-DD") + "T" + vm.getTime().trim() + timeZoneDiff).unix(),
                        timezone: vm.timezone1,
                        live_migrate: dataStoreService.getScheduleMigration().live_migrate                    
                    };                    
                } else if (vm.timeZoneItems) {                        
                    vm.showMigrationTime = true;                        
                    vm.showTimeForm = false;                        
                    vm.selectedDate = moment().format('MM/DD/YYYY ') + ' at ' + moment().format('h:mma') + ' ' + new Date().toTimeString().slice(8, 42);
                    vm.migrationScheduleDetails = {                        
                        migrationName: dataStoreService.getScheduleMigration().migrationName,
                        time: moment().unix(),
                        timezone: new Date().toTimeString().split(" ")[1] + " " + new Date().toTimeString().split(" ")[2],
                        live_migrate: dataStoreService.getScheduleMigration().live_migrate,
                                            
                    };                    
                }
                var iSOTime = vm.migrationScheduleDetails.time;
                vm.migrationScheduleDetail = {                        
                    migrationName: dataStoreService.getScheduleMigration().migrationName,
                    time: iSOTime,
                    timezone: new Date().toTimeString().split(" ")[1] + " " + new Date().toTimeString().split(" ")[2],
                    live_migrate: dataStoreService.getScheduleMigration().live_migrate,
                };                    
                dataStoreService.setScheduleMigration(vm.migrationScheduleDetail);
                $rootScope.$emit("vm.scheduleMigration", {
                    'vm.scheduleMigration': true,
                    'whichTime': "schedule"
                });                
            };

            $scope.$watchGroup(['vm.date', 'vm.timezone1'], function () {
                if (vm.timeZoneItems && vm.timezone1) {
                    vm.error = false;
                    vm.modifiedDate = angular.copy(vm.date);
                    vm.timeIntervals = angular.copy(vm.timeItems);
                    var timeZoneParam = vm.timeZoneItems.filter(function(item){
                        return item.timeZoneName == vm.timezone1;
                    });
                    vm.timeZoneDiff = timeZoneParam[0].timeZone.slice(3, 9);
                    var d = new Date();
                    localTime = d.getTime();
                    localOffset = d.getTimezoneOffset() * 60000;
                    // obtain UTC time in msec
                    utc = localTime + localOffset;
                    // create new Date object for different city
                    // using supplied offset
                    var calOffset = timeZoneParam[0].offset;
                    var nd = new Date(utc + (3600000 * Number(calOffset)));
                    vm.modifiedDate = moment(nd).format("YYYY-MM-DD");
                    if (vm.date == vm.modifiedDate) {
                        var currentTime = nd.toLocaleTimeString('en-US', { hour12: false });
                        var timeIndex = (Number(currentTime.split(":", 2)[0]) * 4) + Math.round(Number(currentTime.split(":", 2)[1]) / 15);
                        vm.timeIntervals = vm.timeItems.slice(timeIndex + 1, vm.timeItems.length + 1);
                    } else {
                        if (Date.parse(vm.modifiedDate) > Date.parse(vm.date)) {
                            vm.error = true;
                            vm.time = "";
                            $rootScope.$emit("vm.scheduleMigration", {
                                'vm.scheduleMigration': false,
                                'whichTime': "schedule"
                            });
                        } else {
                            $rootScope.$emit("vm.scheduleMigration", {
                                'vm.scheduleMigration': true,
                                'whichTime': "schedule"
                            });
                        }
                    }
                    if (!vm.timeIntervals.length) {
                        vm.error = true;
                        vm.time = "";
                        $rootScope.$emit("vm.scheduleMigration", {
                            'vm.scheduleMigration': false,
                            'whichTime': "schedule"
                        });
                    } else {
                        if(!(dataStoreService.returnDate() !== null && dataStoreService.returnDate().time && dataStoreService.returnDate().time == vm.time && dataStoreService.returnDate().date == vm.date && dataStoreService.returnDate().timezone == vm.timezone1)) 
                            vm.time = vm.timeIntervals[0];
                        else if(dataStoreService.returnDate() !== null && dataStoreService.returnDate().time == vm.time && vm.timeIntervals.indexOf(vm.time) == -1){
                            vm.error = true;
                            $rootScope.$emit("vm.scheduleMigration", {
                                'vm.scheduleMigration': false,
                                'whichTime': "schedule"
                            });
                        }
                        if (vm.showTimeForm == true && !vm.error) {
                            $rootScope.$emit("vm.scheduleMigration", {
                                'vm.scheduleMigration': true,
                                'whichTime': "schedule"
                            });
                        }
                    }
                    if(vm.date !==  moment().format("YYYY-MM-DD")){
                         vm.modifiedDate = vm.date;
                    }
                    if (vm.timeIntervals.length && !vm.error) {
                        vm.migrationScheduleDetails = {                        
                            migrationName: dataStoreService.getScheduleMigration().migrationName,
                            time: moment(moment(vm.modifiedDate).format("YYYY-MM-DD")  +  "T"  + vm.getTime().trim()  +  vm.timeZoneDiff).unix(),
                            timezone: vm.timezone1,
                        };
                        if (vm.showTimeForm) dataStoreService.storeDate('timezone', vm.timezone1);
                        if (vm.modifiedDate && vm.showTimeForm) {
                            dataStoreService.storeDate('date', moment(vm.modifiedDate).format("YYYY-MM-DD"));
                        } 
                        if (dataStoreService.returnDate() !== null && dataStoreService.returnDate().date)
                            dataStoreService.storeDate('date', moment(dataStoreService.returnDate().date).format("YYYY-MM-DD"));
                        else if(vm.showTimeForm)
                            dataStoreService.storeDate('date', moment().format("YYYY-MM-DD"));
                        // }                    
                        dataStoreService.setScheduleMigration(vm.migrationScheduleDetails);
                    }
                }
            });

            $scope.$watch('vm.time', function () {
                if (vm.time) {
                    vm.migrationScheduleDetails = {                        
                        migrationName: dataStoreService.getScheduleMigration().migrationName,
                        time: moment(moment(vm.modifiedDate).format("YYYY-MM-DD")  +  "T"  + vm.getTime().trim()  +  (vm.timeZoneDiff || '')).unix(),
                        timezone: vm.timezone1,
                        live_migrate: dataStoreService.getScheduleMigration().live_migrate,
                    };
                    if (dataStoreService.returnDate() !== null && dataStoreService.returnDate().time && dataStoreService.returnDate().time === vm.time){
                        dataStoreService.storeDate('time', dataStoreService.returnDate().time);
                    }
                    else if(vm.showTimeForm){
                        dataStoreService.storeDate('date', moment(vm.date).format("YYYY-MM-DD"));
                        dataStoreService.storeDate('timezone', vm.timezone1);
                        dataStoreService.storeDate('time', vm.time);   
                    }                 
                    dataStoreService.setScheduleMigration(vm.migrationScheduleDetails);
                }
            });
            
            return  vm;            
        }]        
    });  // end of component definition
})();