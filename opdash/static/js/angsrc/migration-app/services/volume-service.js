(function () {
    "use strict";

    /**
     * @ngdoc service
     * @name migrationApp.service:volumeservice
     * @description
     * Service to retrieve all data for volume resources
     */
    angular.module("migrationApp").factory("volumeservice", ["httpwrapper", "$q", "authservice", function (HttpWrapper, $q, authservice) {
        // local variables to help cache data
        var loaded, volumes, self = this, currentTenant = null;

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
                            attachments:volume.attachments
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

            if (!loaded || (currentTenant !== tenant_id)) {

                return HttpWrapper.send(url,{"operation":'GET'})
                                .then(function(response){
                                    loaded = true;
                                    currentTenant = tenant_id;
                                    volumes = {
                                        labels: [
                                                    {field: "name", text: "Volume Name"},
                                                    // {field: "ip_address", text: "IP Address"},
                                                    {field: "size", text: "Size"},
                                                    {field: "volume status", text: "Volume Status"},
                                                    // {field:"migration status", text:"Migration Status"},
                                                    // {field:"eligibility test", text:"Eligibility test result"}
                                                ],
                                        data: response
                                    };
                                    return volumes;
                                }, function(errorResponse) {
                                    return errorResponse;
                                });

            } else {
                return $q.when(volumes);
            }
        };

        return self;
    }]);
})();
