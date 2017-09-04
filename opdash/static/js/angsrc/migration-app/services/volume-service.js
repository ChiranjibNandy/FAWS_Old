(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:volumeservice
     * @description
     * Service to retrieve all data for volume resources
     */
    angular.module("migrationApp").factory("volumeservice", ["httpwrapper", "$q", "authservice","$window","datastoreservice","DEFAULT_VALUES", function (HttpWrapper, $q, authservice,$window,datastoreservice,DEFAULT_VALUES) {
        // local variables to help cache data
        var loaded, volumes, self = this, currentTenant = null, 
            callInProgress = false,
            volumePromise;

        // function to transform the data from api call for overview display
        function trimTransform (data) {
            var volumesList = [];
            var t = data.data;
            for(var key in t){
                // iterate over networks by region
                if (t.hasOwnProperty(key) && t[key].length > 0) {
                    // iterate over each network and extract necessary data
                    angular.forEach(t[key], function(volume) {
                        volumesList.push({
                            id: volume.id,
                            name: volume.name,
                            created: volume.created_at,
                            description:volume.description,
                            size: volume.size,
                            status:volume.status,
                            attachments:volume.attachments,
                            region:key
                        });
                    });
                }
            }

            return {
                labels: data.labels,
                data: volumesList
            };
        }
        
        /**
         * @ngdoc method
         * @name getTrimmedList
         * @methodOf migrationApp.service:volumeservice
         * @returns {Promise} a promise to fetch the list of volumes.
         * @description 
         * Get a list of volumes for a tenant. It returns only a definite set of properties of a volume for its representation.
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
         * @methodOf migrationApp.service:volumeservice
         * @returns {Promise} a promise to fetch all volumes.
         * @description 
         * Gets the entire list of volumes in its raw JSON form, from the api.
         */
        self.getAll = function () {
            //var url = "/static/angassets/volumes-list.json";
            var url = "/api/cbs/volumes";
            var tenant_id = authservice.getAuth().tenant_id;
            if (callInProgress == false && datastoreservice.getResourceLoadingStatus("volume") == false) {
                callInProgress = true;
                volumePromise = HttpWrapper.send(url,{"operation":'GET'})
                    .then(function(response){
                        datastoreservice.setResourceLoadingStatus("volume", true);
                        currentTenant = tenant_id;
                        volumes = {
                            labels: [
                                        {field: "name", text: "Volume Name"},
                                        {field: "size", text: "Size"},
                                        {field: "status", text: "Volume Status"},
                                        {field:"migStatus", text:"Migration Status"},
                                        {field:"eligible", text:"Eligibility test result"}
                                    ],
                            data: response
                        };
                        callInProgress = false;
                        return volumes;
                    }, function(errorResponse) {
                        callInProgress = false;
                        datastoreservice.setResourceLoadingStatus("volume", false);
                        return errorResponse;
                    });
                return volumePromise;
            } else if (callInProgress) {
                return volumePromise;
            } else if (callInProgress == false && datastoreservice.getResourceLoadingStatus("volume") == true) {
                return $q.when(volumes);
            };
        };

        function transformVolume(volume){
            return {
                id: volume.id,
                name: volume.name,
                size: volume.size,
                status: volume.status,
                created_at: moment(volume.created_at).format('DD/MM/YYYY HH:mm:ss'),
                attachments: volume.attachments
            };
        }

        self.getTrimmedItem = function(id,region){
            var deferred = $q.defer();
            self.getById(id,region).then(function (response) {
                if (response.error)
                    return deferred.resolve(response);
                return deferred.resolve(transformVolume(response.data));
            });
            return deferred.promise;
        };

        self.getById = function (id,region) {
            var url = "/api/cbs/volume/"+ region.toLowerCase()+"/"+ id;
            var tenant_id = authservice.getAuth().tenant_id;

            return HttpWrapper.send(url, { "operation": 'GET' })
                .then(function (response) {
                    currentTenant = tenant_id;
                    volumes = {
                        labels: [
                            { field: "name", text: "Volume Name" },
                            { field: "id", text: "id" },
                            { field: "size", text: "Size" },
                            { field: "created_at", text: "Created On" },
                            { field: "source_region", text: "Source Region" },
                            { field: "status", text: "Status" },
                            { field: "rrn", text: "rrn" },
                            { field: "description", text: "Description" },
                        ],
                        data: response
                    };
                    return volumes;
                }, function (errorResponse) {
                    return errorResponse;
                });
        };        

        /**
        * @ngdoc method
        * @name prepareVolList
        * @methodOf migrationApp.service:volumeservice
        * @returns volumeservice instance request object.
        * @description
        * prepare volume instance request object
        */
        self.prepareVolList = function () {
            var volReqList = [];
            var volumes = JSON.parse($window.localStorage.selectedResources)["volume"];
            angular.forEach(volumes,function(volume){
                volReqList.push(
                    {
                        "source":{
                            "id":volume.id,
                            "region":volume.region.toUpperCase(),
                            "type":volume.type
                        },
                        "destination":{
                            "region":volume.selectedMapping.region || DEFAULT_VALUES.REGION,
                            "aws":{
                                "volume":{
                                    "zone":volume.selectedMapping.zone || DEFAULT_VALUES.ZONE,
                                    "ebs_type":"IOL"
                                },
                                "s3":{
                                    "region":volume.selectedMapping.region || DEFAULT_VALUES.REGION
                                }
                            }
                        }
                    }
                )
            });
            return volReqList;
        }

        return self;
    }]);
})();
