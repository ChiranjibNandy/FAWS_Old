describe('Service: datastoreservice', function() {
    var httpwrapper, authservice, datastoreservice, $q, $http;

    beforeEach(function() {
        module('migrationApp');
        inject(function($injector) {
            datastoreservice = $injector.get('datastoreservice');
            httpwrapper = $injector.get('httpwrapper');
            authservice = $injector.get('authservice');
            $q = $injector.get('$q');
            $http = $injector.get('$http');
            $httpBackend = $injector.get('$httpBackend');
        });
    });

    it('should exist', function() {
        expect('datastoreservice.retrieveallItems()').toBeDefined();
    });

    it('should validate API for fetching saved instances', inject(function($http) {

        var $scope = {};
        var tenant_ids = [999999, 000000, 1024814, 'tenant'];
        var authtoken = "AABvnjTBzO4Mm5uzbr6xueyg_qwTJYdExe5aoNBUi_pokzvMU4SaEyTkM4kwDLVf7evKrBs7NQROZgC7tzRkmeWeAmgs2qHqaqGJFQ7Wh07V-nUleam6BraI";
        var headers = {
                "x-auth-token": authtoken,
                "x-tenant-id": tenant_ids[2],
                "Cache-Control": "no-cache"
            }
            /* Code Under Test */
        $http.get("/api/users/uidata/Saved_Migrations", headers)
            .success(function(data, status) {
                $scope.valid = true;
                $scope.response = data;
                console.log("response is :" + JSON.stringify($scope.response));
            })
            .error(function(data, status, headers, config) {
                $scope.valid = false;
            });
        /* End */

        $httpBackend
            .when('GET', "/api/users/uidata/Saved_Migrations", headers)
            .respond(200);

        $httpBackend.flush();

        expect($scope.valid).toBe(true);
        expect($scope.response).not.toBe(undefined);
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });
});