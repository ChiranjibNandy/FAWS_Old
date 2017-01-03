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
            controller: [ function () {
                var vm = this;

                vm.selected = _removeTime(vm.selected || moment());
                vm.month = vm.selected.clone();

                var start = vm.selected.clone();
                start.date(1);
                _removeTime(start.day(0));

                _buildMonth(vm, start, vm.month);

                vm.select = function(day) {
                    debugger;
                    vm.selected = day.date;  
                };

                vm.next = function() {
                    var next = vm.month.clone();
                    _removeTime(next.month(next.month()+1)).date(1);
                    vm.month.month(vm.month.month()+1);
                    _buildMonth(vm, next, vm.month);
                };

                vm.previous = function() {
                    var previous = vm.month.clone();
                    _removeTime(previous.month(previous.month()-1).date(1));
                    vm.month.month(vm.month.month()-1);
                    _buildMonth(vm, previous, vm.month);
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
