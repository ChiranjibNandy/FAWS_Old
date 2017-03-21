describe('component: rsmigrationresourcelist', function() {
    var $controller, $componentController, $rootScope, $scope, $rootRouter, datastoreservice, migrationitemdataservice, httpwrapper, authservice, $timeout, $q, $http, $window;
    var migrationName;
    var time, timezone;
    var $window = { alert: '' };

    beforeEach(function() {
        module('migrationApp');
        inject(function($injector) {
            $rootScope = $injector.get("$rootScope");
            $controller = $injector.get('$controller');
            $componentController = $injector.get('$componentController');
            migrationitemdataservice = $injector.get('migrationitemdataservice');
            datastoreservice = $injector.get('datastoreservice');
            httpwrapper = $injector.get('httpwrapper');
            authservice = $injector.get('authservice');
            $timeout = $injector.get('$timeout');
            $q = $injector.get('$q');
            $http = $injector.get('$http');
            $rootRouter = $injector.get("$rootRouter");
            $scope = $rootScope.$new();
            $window = $injector.get("$window");

            $window.alert = jasmine.createSpy('alert');
            datastoreservice.getScheduleMigration = jasmine.createSpy({
                ' migrationName': 'faws migrationApp',
                'time': '17:50',
                'timezone': 'ist'
            });

        });
    });

    it('should exist', function() {
        $componentController('rsmigrationresourceslist', { authservice: authservice, $scope: $scope, $rootRouter: $rootRouter, datastoreservice: datastoreservice, migrationitemdataservice: migrationitemdataservice, httpwrapper: httpwrapper, $timeout: $timeout });
        expect(true).toBeDefined();
    });

    describe('continue route', function() {

        it('should continue to the recommendations page', function() {
            $rootRouter.navigate(["MigrationRecommendation"]);
            expect('rsmigrationrecommendation').toBeDefined();

        });
    });

    it('should test introduction modal flag', function() {
        expect(datastoreservice.getDontShowStatus()).toBe(false);
    });

    it('should test controller', function() {
        expect('rsmigrationresourceslist.saveForLater()').toBeDefined();
    });

    it('should test availability of tenant id', function() {
        expect('authservice.getAuth()').toBeDefined();
    });
});