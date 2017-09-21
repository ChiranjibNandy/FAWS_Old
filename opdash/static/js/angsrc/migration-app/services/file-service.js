(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:fileservice
     * @description
     * Service to retrieve all data for file resources
     */
    angular.module("migrationApp").factory("fileservice", ["httpwrapper", "$q", "authservice", "$window","datastoreservice","DEFAULT_VALUES", function (HttpWrapper, $q, authservice, $window,datastoreservice,DEFAULT_VALUES) {
        // local variables to help cache data
        var loaded, files, self = this, currentTenant = null, 
            callInProgress = false,
            filePromise;

        // function to transform the data from api call for overview display
        function trimTransform (data) {
            var filesList = [];
            var apiResponse = data.data;
            
            for(var key in apiResponse){
                // iterate over files by region
                if (apiResponse[key] === null || apiResponse[key] === 'null') {
                    filesList.push({
                        rrn:'',
                        id: '',
                        name: key,
                        size: 0,
                        status:"Not Available",
                        containerCount:0,
                        objectCount:0,
                        region: key
                    });
                } else {          
                    filesList.push({
                        rrn: apiResponse[key]["rrn"],
                        id: apiResponse[key]["trans-id"],
                        name: key,
                        size: formatBytes(apiResponse[key]["bytes-used"]),
                        status:"available",
                        containerCount:apiResponse[key]["container-count"],
                        objectCount:apiResponse[key]["object-count"],
                        region: key
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

        function transformFile(file){
            for(var key in file)
                return {
                    id: file[key]["trans-id"],
                    name: key,
                    size: file[key]["bytes-used"],
                    containerCount: file[key]["container-count"],
                    };
        }

        self.getTrimmedItem = function(id,region){
            var deferred = $q.defer();
            self.getById(id, region).then(function (response) {
                if (response.error)
                    return deferred.resolve(response);
                return deferred.resolve(transformFile(response.data));
            });
            return deferred.promise;
        };

        self.getById = function (id, region) {
            var url = "/api/cloud_files/" + region;
            var tenant_id = authservice.getAuth().tenant_id;

            return HttpWrapper.send(url, { "operation": 'GET' })
                .then(function (response) {
                    currentTenant = tenant_id;
                    files = {
                        labels: [
                            { field: "name", text: "File Name" },
                            { field: "trans-id", text: "id" },
                            { field: "bytes-used", text: "Size" },
                            { field: "container-count", text: "Container Count" },
                            { field: "object-count", text: "Object Count" }
                        ],
                        data: response
                    };
                    return files;
                }, function (errorResponse) {
                    return errorResponse;
                });
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
            var tenant_id = authservice.getAuth().tenant_id;
            if (callInProgress == false && datastoreservice.getResourceLoadingStatus("file") == false) {
                callInProgress = true;
                filePromise =  HttpWrapper.send(url,{"operation":'GET'})
                    .then(function(response){
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
                        callInProgress = false;
                        datastoreservice.setResourceLoadingStatus("file", true);
                        return files;
                    }, function(errorResponse) {
                        return errorResponse;
                        callInProgress = false;
                        datastoreservice.setResourceLoadingStatus("file", false);
                    });
                return filePromise;
            } else if(callInProgress) {
                return filePromise;
            } else if (callInProgress == false && datastoreservice.getResourceLoadingStatus("file") == true) {
                return $q.when(files);
            };
        };

        //function to convert to GB
        function formatBytes(bytes,decimals) {
            return parseFloat((bytes / Math.pow(1024, 3)).toFixed(2));
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
                            "region":file.selectedMapping.region || DEFAULT_VALUES.REGION
                        }
                    }
                )
            });
            return fileReqList;
        }
        return self;
    }]);
})();
