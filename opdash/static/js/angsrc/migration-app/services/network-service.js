(function () {
    "use strict";

    angular.module("migrationApp")
        .factory("networkService", ["$http", "$q", function ($http, $q) {
            // local variables to help cache data
            var loaded, networks;

            return {
                // get all network items from backend
                getAll: function () {
                    var url = "/static/angassets/networks-list.json";

                    if (!loaded) {
                        return $http.get(url)
                            .then(function (response) {
                                loaded = true;
                                networks = {
                                    labels: ["Network Name", "Network Type", "IP Address", "Description"],
                                    data: response.data
                                };
                                return networks;
                            });
                    } else {
                        return $q.when(networks);
                    }
                },

                // get network details of specific items
                getMigrationDetails: function (ids) {
                    var url = "/static/angassets/network-migration-details.json";
                    return $http.get(url)
                        .then(function (response) {
                            var data = response.data.filter(function (item) { return ids.indexOf(item.id) >= 0 });
                            return {
                                labels: ["Network Name", "Description", "Migration Status", "Progress", "View log details"],
                                data: data
                            };
                        });
                }
            }
        }]); // end of service definition
})();