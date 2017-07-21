(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:fileservice
     * @description
     * Service to retrieve all data for file resources
     */
    angular.module("migrationApp").factory("fileservice", ["httpwrapper", "$q", "authservice", function (HttpWrapper, $q, authservice) {
        // local variables to help cache data
        var loaded, files, self = this, currentTenant = null;

        // function to transform the data from api call for overview display
        function trimTransform (data) {
            var filesList = [];
            var t = data.data;
            for(var key in t){
                // iterate over networks by region
                if (t.hasOwnProperty(key) && t[key].length > 0) {
                    // iterate over each network and extract necessary data
                    angular.forEach(t[key], function(file) {
                        filesList.push({
                            id: file.id,
                            name: file.name,
                            created: file.created_at,
                            description:file.description,
                            size: file.size,
                            status:file.status,
                            attachments:file.attachments
                        });
                    });
                }
            }

            return {
                labels: data.labels,
                data: filesList
            };
        }
        
        /**
         * @ngdoc method
         * @name getTrimmedList
         * @methodOf migrationApp.service:fileservice
         * @returns {Promise} a promise to fetch the list of files.
         * @description 
         * Get a list of files for a tenant. It returns only a definite set of properties of a file for its representation.
         */
        self.getTrimmedList = function() {
            var deferred = $q.defer();
            self.getAll().then(function(response) {
                if(response.error)
                    return deferred.resolve(response);
                return deferred.resolve(trimTransform(response));
            });
            return deferred.promise;
        };

        /**
         * @ngdoc method
         * @name getAll
         * @methodOf migrationApp.service:fileservice
         * @returns {Promise} a promise to fetch all files.
         * @description 
         * Gets the entire list of files in its raw JSON form, from the api.
         */
        self.getAll = function () {
            //var url = "/static/angassets/files-list.json";
            var url = "/api/cloud_files/";
            // var tenant_id = authservice.getAuth().tenant_id;

            // if (!loaded || (currentTenant !== tenant_id)) {

            return HttpWrapper.send(url,{"operation":'GET'})
                            .then(function(response){
                                // loaded = true;
                                // currentTenant = tenant_id;
                                files = {
                                    labels: [
                                                {field: "name", text: "file Name"},
                                                // {field: "ip_address", text: "IP Address"},
                                                {field: "size", text: "Size"},
                                                {field: "file status", text: "file Status"},
                                                // {field:"migration status", text:"Migration Status"},
                                                // {field:"eligibility test", text:"Eligibility test result"}
                                            ],
                                    data: response
                                };
                                return files;
                            }, function(errorResponse) {
                                return errorResponse;
                            });

            // } else {
            //     return $q.when(files);
            // }
        };

        return self;
    }]);
})();
