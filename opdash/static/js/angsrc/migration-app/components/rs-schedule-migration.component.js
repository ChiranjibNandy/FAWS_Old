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
        templateUrl:   "/static/angtemplates/migration/schedule-migration.html",
            controllerAs:   "vm",
                    
            /**
            * @ngdoc controller
            * @name migrationApp.controller:rsschedulemigrationCtrl
            * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsschedulemigration rsschedulemigration} component
            */
            controller:  ["$rootRouter",  "datastoreservice",  "$scope",  "authservice",  "$timeout",  "$rootScope", "$window",  function  ($rootRouter,  dataStoreService,  $scope,  authservice,  $timeout,  $rootScope, $window)  {                
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
                vm.timeItems = ["12:00am",  "12:15am",  "12:30am",  "12:45am",  "01:00am",  "01:15am",  "01:30am",  "01:45am",  "02:00am",  "02:15am",  "02:30am",  "02:45am",  "03:00am",  "03:15am",  "03:30am",  "03:45am",  "04:00am",  "04:15am",  "04:30am",  "04:45am", "05:00am",  "05:15am",  "05:30am",  "05:45am",  "06:00am",  "06:15am",  "06:30am",  "06:45am",  "07:00am",  "07:15am",  "07:30am",  "07:45am", "08:00am",  "08:15am",  "08:30am",  "08:45am",  "09:00am",  "09:15am",  "09:30am",  "09:45am",  "10:00am",  "10:15am",  "10:30am",  "10:45am",  "11:00am",  "11:15am",  "11:30am",  "11:45am",  "12:00pm",  "12:15pm",  "12:30pm",  "12:45pm",  "01:00pm",  "01:15pm",  "01:30pm",  "01:45pm", "02:00pm",  "02:15pm",  "02:30pm",  "02:45pm",  "03:00pm",  "03:15pm",  "03:30pm",  "03:45pm",  "04:00pm",  "04:15pm",  "04:30pm",  "04:45pm",  "05:00pm",  "05:15pm",  "05:30pm",  "05:45pm",  "06:00pm",  "06:15pm",  "06:30pm",  "06:45pm",  "07:00pm",  "07:15pm",  "07:30pm",  "07:45pm",  "08:00pm",  "08:15pm",  "08:30pm",  "08:45pm",  "09:00pm",  "09:15pm",  "09:30pm",  "09:45pm",  "10:00pm",  "10:15pm",  "10:30pm",  "10:45pm",  "11:00pm",  "11:15pm",  "11:30pm",  "11:45pm"];

                if ($window.localStorage.timeZones == undefined) {
                    dataStoreService.allTimeZones()
                        .then(function (result) {
                            vm.timeZoneItems =  result;
                            vm.timezone1  =  vm.timeZoneItems[0].timeZoneName;
                        });
                } else {
                    vm.timeZoneItems = JSON.parse($window.localStorage.timeZones);
                    vm.timezone1  =  vm.timeZoneItems[0].timeZoneName;
                }                    
                var m = moment();                    
                var roundUp = m.minute()  ||  m.second()  ||  m.millisecond()  ?  m.add(1,  'hour').startOf('hour')  :  m.startOf('hour');                    
                vm.time = roundUp.format('hh:mma');                    
                vm.initTime = new  Date().toLocaleTimeString();                    
                vm.date = m.format("YYYY-MM-DD");
                $('#datetimepickerAdd').val(vm.date);                    
                vm.selectedDate = moment().format('MMMM Do YYYY ')  +  ' at '  +  moment().format('h:mma')  +  ' '  +  new  Date().toTimeString().slice(8,  42);
                if (dataStoreService.returnDate() !== null && dataStoreService.returnDate() !== {} && dataStoreService.returnDate().date !== "") {
                    vm.showTimeForm = true;
                    $('#datetimepickerAdd').val(vm.date);
                    $rootScope.$emit("vm.scheduleMigration", {
                        'vm.scheduleMigration': true,
                        'whichTime': "schedule"
                    });
                } else {
                    dataStoreService.storeDate('date', moment().format('MMMM Do YYYY '));
                    dataStoreService.storeDate('time', moment().format('h:mma'));
                    dataStoreService.storeDate('timezone', 'IST');
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
                            
            vm.showTime = function (whichTime)  {                    
                if (whichTime === 'schedule' && vm.timeZoneItems) {                        
                    vm.showTimeForm = true;                        
                    vm.showMigrationTime = false;
                    var timeZoneDiff = vm.timeZoneItems[0].timeZone.slice(3, 9);
                    vm.timezone1  =  vm.timeZoneItems[0].timeZoneName;
                    vm.migrationScheduleDetails  =  {                        
                        migrationName:  dataStoreService.getScheduleMigration().migrationName,
                                                time:  moment(moment(vm.date).format("YYYY-MM-DD")  +  "T"  + vm.getTime()  +  timeZoneDiff).unix(),
                                                timezone: vm.timezone1,
                        live_migrate: dataStoreService.getScheduleMigration().live_migrate                    
                    };                    
                } else if (vm.timeZoneItems) {                        
                    vm.showMigrationTime  =  true;                        
                    vm.showTimeForm  =  false;                        
                    vm.selectedDate  =  moment().format('MM/DD/YYYY ')  +  ' at '  +  moment().format('h:mma')  +  ' '  +  new  Date().toTimeString().slice(8,  42);
                    vm.migrationScheduleDetails  =   {                        
                        migrationName:  dataStoreService.getScheduleMigration().migrationName,
                                                time:  moment().unix(),
                                                timezone: new  Date().toTimeString().split(" ")[1] + " " + new  Date().toTimeString().split(" ")[2],
                        live_migrate: dataStoreService.getScheduleMigration().live_migrate,
                                            
                    };                    
                }
                var iSOTime = moment.unix(vm.migrationScheduleDetails.time).toISOString();
                vm.migrationScheduleDetail  =   {                        
                    migrationName:  dataStoreService.getScheduleMigration().migrationName,
                                            time:  iSOTime,
                                            timezone: new  Date().toTimeString().split(" ")[1] + " " + new  Date().toTimeString().split(" ")[2],
                    live_migrate: dataStoreService.getScheduleMigration().live_migrate,
                                   
                };                    
                dataStoreService.setScheduleMigration(vm.migrationScheduleDetail);
                $rootScope.$emit("vm.scheduleMigration", {
                    'vm.scheduleMigration': true,
                    'whichTime': "schedule"
                });                
            };

            $scope.$watchGroup(['vm.date', 'vm.timezone1'],  function  ()  {
                if (vm.timezone1) {
                    vm.error = false;
                    vm.modifiedDate = angular.copy(vm.date);
                    vm.timeIntervals = angular.copy(vm.timeItems);
                    var timeZoneParam = vm.timeZoneItems.filter(item => item.timeZoneName == vm.timezone1);
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
                    vm.modifiedDate = moment(nd.toLocaleDateString('en-US')).format("YYYY-MM-DD");
                    if (vm.date  ==  vm.modifiedDate) {
                        var currentTime = nd.toLocaleTimeString();
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
                        vm.time = vm.timeIntervals[0];
                        if (vm.showTimeForm == true && !vm.error) $rootScope.$emit("vm.scheduleMigration", {
                            'vm.scheduleMigration': true,
                            'whichTime': "schedule"
                        });
                    }

                    if (vm.timeIntervals.length && !vm.error) {
                        vm.migrationScheduleDetails  =   {                        
                            migrationName:  dataStoreService.getScheduleMigration().migrationName,
                                                    time:  moment(moment(vm.modifiedDate).format("YYYY-MM-DD")  +  "T"  + vm.getTime()  +  vm.timeZoneDiff).unix(),
                                                    timezone: vm.timezone1,
                                                
                        };
                        dataStoreService.storeDate('timezone', vm.timezone1);
                        if (vm.modifiedDate) {
                            dataStoreService.storeDate('date', moment(vm.modifiedDate).format('MMMM Do YYYY '));
                        } else {
                            if (dataStoreService.returnDate().date)
                                dataStoreService.storeDate('date', moment(dataStoreService.returnDate().date).format('MMMM Do YYYY '));
                            else
                                dataStoreService.storeDate('date', moment().format('MMMM Do YYYY '));
                        }                    
                        dataStoreService.setScheduleMigration(vm.migrationScheduleDetails);
                    }
                }
            });

            $scope.$watch('vm.time',  function  ()  {
                if (vm.time) {
                    vm.migrationScheduleDetails  =   {                        
                        migrationName:  dataStoreService.getScheduleMigration().migrationName,
                                                time: moment(moment(vm.modifiedDate).format("YYYY-MM-DD")  +  "T"  + vm.getTime()  +  vm.timeZoneDiff).unix(),
                                                timezone: vm.timezone1,
                        live_migrate: dataStoreService.getScheduleMigration().live_migrate,
                                            
                    };
                    if (dataStoreService.returnDate().time && dataStoreService.returnDate().time === vm.time)
                        dataStoreService.storeDate('time', dataStoreService.returnDate().time);
                    else
                        dataStoreService.storeDate('time', vm.time);                    
                    dataStoreService.setScheduleMigration(vm.migrationScheduleDetails);
                }
            });

                            
            return  vm;            
        }]        
    });  // end of component definition
})();