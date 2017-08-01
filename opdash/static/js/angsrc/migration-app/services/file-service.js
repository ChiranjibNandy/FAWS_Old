(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:fileservice
     * @description
     * Service to retrieve all data for file resources
     */
    angular.module("migrationApp").factory("fileservice", ["httpwrapper", "$q", "authservice", "$window", function (HttpWrapper, $q, authservice, $window) {
        // local variables to help cache data
        var loaded, files, self = this, currentTenant = null;

        // function to transform the data from api call for overview display
        function trimTransform (data) {
            var filesList = [];
            var t = data.data;
            for(var key in t){
                // iterate over files by region
                filesList.push({
                    id: t[key]["trans-id"],
                    name: key,
                    size: formatBytes(t[key]["bytes-used"]),
                    status:"available",
                    containerCount:t[key]["container-count"],
                    objectCount:t[key]["object-count"],
                    region: key
                });
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
            var url = "/api/cloud_files";
            var tenant_id = authservice.getAuth().tenant_id;

            // if (!loaded || (currentTenant !== tenant_id)) {

            return HttpWrapper.send(url,{"operation":'GET'})
                    .then(function(response){
                        // loaded = true;
                        // currentTenant = tenant_id;
                        files = {
                            labels: [
                                        {field: "name", text: "Region"},
                                        {field: "size", text: "Size"},
                                        {field: "containerCount", text: "Number of containers"},
                                        {field:"migStatus", text:"Migration Status"},
                                        {field:"eligible", text:"Eligibility test result"}
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

        //function to convert to GB
        function formatBytes(bytes,decimals) {
            if(bytes == 0) return '0 Bytes';
            var k = 1024,
                dm = decimals || 2,
                sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        };


        /**
        * @ngdoc method
        * @name prepareFilesList
        * @methodOf migrationApp.service:fileservice
        * @returns fileservice instance request object.
        * @description
        * prepare files instance request object
        */
        self.prepareFilesList = function () {
            var fileReqList = [];
            var files = JSON.parse($window.localStorage.selectedResources)["file"];
            angular.forEach(files,function(file){
                fileReqList.push(
                    {
                        "source":{
                            "region":file.name
                        },
                        "destination":{
                            "region":"us-east-1"
                        }
                    }
                )
            });
            return fileReqList;
        }
        return self;
    }]);
})();
