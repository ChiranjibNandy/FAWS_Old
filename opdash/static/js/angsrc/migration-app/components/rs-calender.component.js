(function () {
    "use strict";

    // defining component to display each migration component (eg: server, network etc)
    angular.module("migrationApp")
        .component("rscalendaritem", {
            templateUrl: "/static/angtemplates/migration/calendar-template.html",
            bindings: {
                type: "@" // type parameter to be supplied (eg: server, network etc)
            },
            controllerAs: "vm",
            controller: ["datastoreservice", "$scope",function (dataStoreService,$scope) {
                var vm = this;

                // vm.selected = _removeTime(vm.selected || moment());
                vm.selected = moment(); //default selection is today's date
                vm.month = vm.selected.clone();
                vm.previousToggle = false;
                var start = vm.selected.clone();
                start.date(1);
                _removeTime(start.day(0));

                _buildMonth(vm, start, vm.month);

                vm.select = function(day) {
                    vm.selected = day.date;  
                    var then = vm.selected.format('YYYY/MM/DD');
                    var now = moment().format('YYYY/MM/DD');
                    if(moment(now).isAfter(then)){
                        alert('Please select date after today or today');
                    }else{
                        $scope.$emit("DateChanged", vm.selected);
                        dataStoreService.storeDate('date',vm.selected);
                    }
                };

                vm.next = function() {
                    var next = vm.month.clone();
                    _removeTime(next.month(next.month()+1)).date(1);
                    vm.month.month(vm.month.month()+1);
                    _buildMonth(vm, next, vm.month);
                    vm.checkPrevious();
                };

                vm.previous = function() {
                    var previous = vm.month.clone();
                    _removeTime(previous.month(previous.month()-1).date(1));
                    vm.month.month(vm.month.month()-1);
                    _buildMonth(vm, previous, vm.month);
                    vm.checkPrevious();
                };

                vm.checkPrevious = function(){
                    var then = vm.month.format('YYYY/MM/DD');
                    var now = moment().format('YYYY/MM/DD');
                    if(moment(now).isAfter(then)) 
                        vm.previousToggle = false;
                    else 
                        vm.previousToggle = true;
                };

                function _removeTime(date) {
                    return date.day(0).hour(0).minute(0).second(0).millisecond(0);
                };

                function _buildMonth(vm, start, month) {
                    vm.weeks = [];
                    var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
                    while (!done) {
                        vm.weeks.push({ days: _buildWeek(date.clone(), month) });
                        date.add(1, "w");
                        done = count++ > 2 && monthIndex !== date.month();
                        monthIndex = date.month();
                    }
                };

                function _buildWeek(date, month) {
                    var days = [];
                    for (var i = 0; i < 7; i++) {
                        days.push({
                            name: date.format("dd").substring(0, 1),
                            number: date.date(),
                            isCurrentMonth: date.month() === month.month(),
                            isToday: date.isSame(new Date(), "day"),
                            date: date
                        });
                        date = date.clone();
                        date.add(1, "d");
                    }
                    return days;
                };

                return vm;
            }]
        }); // end of component definition
})();
