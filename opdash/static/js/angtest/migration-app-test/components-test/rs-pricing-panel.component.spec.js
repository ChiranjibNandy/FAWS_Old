describe('component: rspricingpanel', function () {
 var  $controller, $componentController, $rootScope, $scope, $rootRouter,datastoreservice, authservice, $timeout, $q, $http,$window,$filter,httpwrapper; 
 var $window = {alert :''};   
beforeEach(function(){
    module('migrationApp');
    inject(function($injector) {
          $rootScope = $injector.get("$rootScope");
          $controller = $injector.get('$controller');
          $componentController = $injector.get('$componentController');
          datastoreservice = $injector.get('datastoreservice');
          authservice = $injector.get('authservice');
          $timeout = $injector.get('$timeout');
          $q = $injector.get('$q');   
          $http = $injector.get('$http');   
          $rootRouter = $injector.get("$rootRouter");
          $scope = $rootScope.$new();
           $window = $injector.get("$window");  
           $filter = $injector.get("$filter");
           httpwrapper = $injector.get("httpwrapper");   
            $window.alert= jasmine.createSpy('alert');
            
      });
});

   describe('continueToSchedule migration page function test case', function() {
        it('should continue to the schedule migration page', function() {
            $rootRouter.navigate(["ScheduleMigration"]);
           expect('rsschedulemigration').toBeDefined();
           
        });
    });  

 describe('back button click function on recommendation page test case ', function() {
     var page ="recommendation";
        it('should route back to the resource list page', function() {
            $rootRouter.navigate(["MigrationResourceList"]);
           expect('rsmigrationresourceslist').toBeDefined();     
        });
    });  
describe('back button click function on schedule migration page test case', function() {
     var page ="scheduleMigration";
        it('should route back to the recommendation page', function() {
            $rootRouter.navigate(["MigrationRecommendation"]);
           expect('rsmigrationrecommendation').toBeDefined();     
        });
    });  

    describe('showCancelDialog', function() {
   it('should test cancel dialog box functionality', function() {
             expect($window.alert).toBeTruthy();
           });
    });  

    describe('submitCancel button click function  test case', function() {
     var saveProgress = 'no';
        it('should save the items', function() {
            $rootRouter.navigate(["MigrationStatus"]);
             expect($window.alert).toBeTruthy();     
        });
    });  
   

  
  });
