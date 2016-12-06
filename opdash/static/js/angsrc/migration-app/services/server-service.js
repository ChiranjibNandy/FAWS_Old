// (function () {
//     "use strict";

//     angular.module("migrationApp").factory("serverService", ["$http", "$q", function ($http, $q) {
//         // local variables to help cache data
//         var loaded, servers;

//         return {
//             // get all server items from backend
//             getAll: function () {
//                 var url = "/static/angassets/servers-list.json";

//                 if (!loaded) {
//                     var serversList = [];
//                     return $http.get(url,{
//                                 transformResponse: $http.defaults.transformResponse.concat([function(data){
//                                     for(var key in data){
//                                         // iterate over servers by region
//                                         if (data.hasOwnProperty(key)) { 
//                                             // iterate over each server and extract necessary data
//                                             angular.forEach(data[key].servers, function(server) { 
//                                                 serversList.push({
//                                                     id: server.id,
//                                                     name: server.name,
//                                                     tenant_id: server.tenant_id,
//                                                     ip_address: server.accessIPv4,
//                                                     status: server.status,
//                                                     progress: server.progress
//                                                 })
//                                             });
//                                         }
//                                     }
//                                 }])
//                             })
//                             .then(function (response) {
//                                 console.log(serversList);
//                                 loaded = true;
//                                 servers = {
//                                     labels: ["Server Name", "Tenant ID", "IP Address"],
//                                     data: serversList
//                                 };
//                                 return servers;
//                             });
//                 } else {
//                     return $q.when(servers);
//                 }
//             },

//             // get server details of specific items
//             getMigrationDetails: function (ids) {
//                 var url = "/static/angassets/server-migration-details.json";
//                 return $http.get(url)
//                     .then(function (response) {
//                         var data = response.data.filter(function (item) { return ids.indexOf(item.id) >= 0 });
//                         return {
//                             labels: ["Server Name", "Description", "Migration Status", "Progress", "View log details"],
//                             data: data
//                         };
//                     });
//             }
//         }
//     }]);
// })();


(function () {
    "use strict";

    angular.module("migrationApp")
        .factory("serverService", ["$http", "$q", function ($http, $q) {
            // local variables to help cache data
            var loaded, servers;

            return {
                // get all network items from backend
                getAll: function () {
                    var url = "/static/angassets/servers-list.json";

                    if (!loaded) {
                        return $http.get(url)
                            .then(function (response) {
                                loaded = true;
                                servers = {
                                    labels: ["Server Name", "IP Address", "Migration Status"],
                                    data: response.data
                                };
                                return servers;
                            });
                    } else {
                        return $q.when(servers);
                    }
                },

                // get network details of specific items
                getMigrationDetails: function (ids) {
                    var url = "/static/angassets/server-migration-details.json";
                    return $http.get(url)
                        .then(function (response) {
                            var data = response.data.filter(function (item) { return ids.indexOf(item.id) >= 0 });
                            return {
                                labels: ["Server Name", "Description", "Migration Status", "Progress", "View log details"],
                                data: data
                            };
                        });
                }
            }
        }]); // end of service definition
})();