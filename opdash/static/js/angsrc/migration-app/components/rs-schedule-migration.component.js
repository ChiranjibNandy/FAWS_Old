(function () {
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
    angular.module("migrationApp")
        .component("rsschedulemigration", {
            templateUrl: "/static/angtemplates/migration/schedule-migration.html",
            controllerAs: "vm",
            /**
             * @ngdoc controller
             * @name migrationApp.controller:rsschedulemigrationCtrl
             * @description Controller to handle all view-model interactions of {@link migrationApp.object:rsschedulemigration rsschedulemigration} component
             */
            controller: ["$rootRouter", "datastoreservice", "$scope", "authservice", "$timeout", "$rootScope", function ($rootRouter, dataStoreService, $scope, authservice, $timeout, $rootScope) {
                var vm = this;
                /**
                 * @ngdoc method
                 * @name $onInit
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 *function called on init of the rsschedulemigrationCtrl.
                 */
                vm.$onInit = function () {
                    $('title')[0].innerHTML = "Schedule Migration - Rackspace Cloud Migration";
                    vm.error = false;
                    vm.timeItems = ["12:00am", "12:15am", "12:30am", "12:45am", "1:00am", "1:15am", "1:30am", "1:45am", "2:00am", "2:15am", "2:30am", "2:45am", "3:00am", "3:15am", "3:30am", "3:45am", "4:00am", "4:15am", "4:30am", "4:45am",
                        "5:00am", "5:15am", "5:30am", "5:45am",
                        "6:00am", "6:15am", "6:30am", "6:45am",
                        "7:00am", "7:15am", "7:30am", "7:45am",
                        "8:00am", "8:15am", "8:30am", "8:45am",
                        "9:00am", "9:15am", "9:30am", "9:45am", "10:00am", "10:15am",
                        "10:30am", "10:45", "11:00am", "11:15am", "11:30am", "11:45am",
                        "12:00pm", "12:15pm", "12:30pm", "12:45pm", "1:00pm", "1:15pm", "1:30pm", "1:45pm",
                        "2:00pm", "2:15pm", "2:30pm", "2:45pm",
                        "3:00pm", "3:15pm", "3:30pm", "3:45pm", "4:00pm", "4:15pm",
                        "4:30pm", "4:45pm", "5:00pm", "5:15pm", "5:30pm", "5:45pm", "6:00pm", "6:15pm",
                        "6:30pm", "6:45pm", "7:00pm", "7:15pm", "7:30pm", "7:45pm",
                        "8:00pm", "8:15pm", "8:30pm", "8:45pm", "9:00pm", "9:15pm",
                        "9:30pm", "9:45pm", "10:00pm", "10:15pm", "10:30pm", "10:45pm", "11:00pm", "11:15pm", "11:30pm", "11:45pm"];
                    vm.timeZoneItems = [
                        {timeZoneName : "PST", timeZone : "GMT-0800 (Pacific Daylight Time)"},
                        {timeZoneName : "MST", timeZone : "GMT-0700 (Mountain Daylight Time)"},
                        {timeZoneName : "CST", timeZone : "GMT-0600 (Central Daylight Time)"},
                        {timeZoneName : "EST", timeZone : "GMT-0500 (Eastern Daylight Time)"},
                    ];
                    vm.timezone1 = vm.timeZoneItems[0].timeZone;
                    vm.timezone = vm.getDefaultZone();
                    var m = moment();
                    var roundUp = m.minute() || m.second() || m.millisecond() ? m.add(1, 'hour').startOf('hour') : m.startOf('hour');
                    vm.time = roundUp.format('h:mma');
                    vm.initTime = new Date().toLocaleTimeString();
                    vm.date = m.format("YYYY-MM-DD");
                    $('#datetimepickerAdd').val(vm.date);
                    vm.selectedDate = moment().format('MMMM Do YYYY ') + ' at ' + moment().format('h:mma') + ' ' + new Date().toTimeString().slice(8, 42);
                    dataStoreService.storeDate('time', vm.time);
                    dataStoreService.storeDate('timezone', vm.timezone);
                    vm.migrationName = dataStoreService.getScheduleMigration().migrationName;
                    dataStoreService.getScheduleMigration();
                    $scope.$watch('vm.migrationName', function () {
                        vm.storeSelectedTime("migrate now");
                        vm.editorEnabled = false;
                        vm.showTimeForm = false;
                        vm.showMigrationTime = false;
                        vm.showMigrate = false;
                        vm.isDisableDate = false;
                        vm.isModeSave = true;
                    });
                };

                /**
                 * @ngdoc method
                 * @name getTime
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 * Function to get the time based on am or pm
                 */
                vm.getTime = function () {
                    if (vm.time.indexOf('am') > -1) {
                        if (vm.time.indexOf('12') > -1) {
                            var localTime = vm.time.replace('am', "");
                            return localTime.replace('12', "00");
                        } else {
                            return vm.time.replace('am', "");
                        }

                    } else {
                        var subStr = vm.time.substr(0, vm.time.indexOf(':'));
                        var calTime = vm.time.replace(subStr, parseInt(subStr) + 12);
                        return calTime.replace('pm', '');
                    }
                }

                /**
                 * @ngdoc method
                 * @name storeSelectedTime
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 *function to store the selected time
                 */
                vm.storeSelectedTime = function (radioButton) {
                    var zone = vm.timezone;
                    vm.unixTime = moment().unix();
                    //setting unixTime based on radio button selection.
                    if (radioButton === "fromSave") {
                        var time = vm.getTime();
                        vm.unixTime = moment(moment($('#field').val()).format("ddd MMM D YYYY") + " " + time + " " + vm.timezone1).unix()
                        console.log(vm.unixTime);
                    }
                    else if (radioButton === "migrate now") {
                        zone = vm.getDefaultZone();
                        vm.unixTime = "";
                    }
                    vm.selectedTime = {
                        migrationName: vm.migrationName,
                        time: vm.unixTime,
                        timezone: zone,
                    };
                    dataStoreService.setScheduleMigration(vm.selectedTime);
                };
                
                /**
                 * @ngdoc method
                 * @name getDefaultZone
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 * Function to get the default time zone based on selected timezone
                 */
                vm.getDefaultZone = function () {
                    var date = new Date().toTimeString();
                    var timeZone = date.indexOf("+") === -1 ? date.substr(date.indexOf("-") + 1, 5) : date.substr(date.indexOf("+") + 1, 5);
                    var exactZone = [timeZone.slice(0, 2), ':', timeZone.slice(2)].join('');
                    return vm.timeZoneItems.filter(function (item) {
                        if (item.timeZone.includes(exactZone.trim())) {
                            return item.timeZone;
                        }
                    })[0];
                }
                
                /**
                 * @ngdoc method
                 * @name timezoneChange
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 * Saves the chosen timezone for migration when the timezine is changed.
                 */
                vm.timezoneChange = function () {
                    vm.selectedDate = moment($('#field').val()).format('MMMM Do YYYY') + ' at ' + vm.time + ' ' + vm.timezone1;
                    $rootScope.$emit("scheduleMigrationSelectedDate", vm.selectedDate);
                };

                /**
                 * @ngdoc method
                 * @name showTime
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 * show migration scheduled time based on migrate now check or schedule time check**
                 */
                vm.showTime = function (whichTime) {
                    //check to show scheduled migration time on banner based on the radio button check.
                    var migrationItems = {
                                            migrationValue:true,
                                            date:''
                                        };
                    if(whichTime === 'schedule'){
                        vm.showTimeForm = true;
                        vm.showMigrationTime = false;
                        vm.selectedDate = moment(vm.date).format('MMMM Do YYYY') + ' at ' + vm.time + ' ' + vm.timezone1;
                    }else{
                        vm.showMigrationTime = true;
                        vm.showTimeForm = false;
                        vm.selectedDate = moment().format('MM/DD/YYYY ') + ' at ' + moment().format('h:mma') + ' ' + new Date().toTimeString().slice(8, 42);
                    }
                    migrationItems.date = vm.selectedDate;
                    $rootScope.$emit("vm.scheduleMigration",migrationItems);
                };
                
                /**
                 * @ngdoc method
                 * @name onSaveTime
                 * @methodOf migrationApp.controller:rsschedulemigrationCtrl
                 * @description 
                 *  save scheduled time  **
                 */
                vm.onSaveTime = function () {
                    $timeout(function () {
                        var time = vm.getTime();
                        if (moment().diff(moment($('#field').val() + " " + time+ " " + vm.timezone1), 'minutes') > 1) {
                            vm.error = true;
                             $rootScope.$emit("vm.errorValue", vm.error);
                        } else {
                            vm.error = false;
                            vm.storeSelectedTime('fromSave');
                            vm.timezoneChange();
                            vm.isDisableDate = true;
                            vm.isModeSave = false;
                             $rootScope.$emit("vm.errorValue", vm.error);
                        }
                    }, 0);
                }
                
                vm.onEditTime = function () {
                    vm.isModeSave = true;
                    vm.isDisableDate = false;
                }

                return vm;
            }]
        }); // end of component definition
})();