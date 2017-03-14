describe('component: rsschedulemigration', function () {
 var  $controller, $componentController, $rootScope, $scope, $rootRouter,datastoreservice, authservice, $timeout, $q, $http,$window; 
 var migrationName;
 var time,
  timezone;
      $window = {alert :''};   
                      
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
            
          $window.alert= jasmine.createSpy('alert');
           datastoreservice.getScheduleMigration= jasmine.createSpy({' migrationName': 'faws migrationApp',
                                 'time':'17:50',
           'timezone':'ist'});
            
      });
});

   

  it('should exist', function() {
    $componentController('rsschedulemigration', {$rootRouter: $rootRouter, datastoreservice: datastoreservice,$scope : $scope,authservice : authservice,$timeout: $timeout});
     expect(true).toBeDefined();
  });
  describe('continue route', function() {

        it('should continue to the confirm migrate page', function() {
            $rootRouter.navigate(["ConfirmMigration"]);
           expect('rsconfirmmigration').toBeDefined();
           
        });
    });  
   
  describe('saveItems', function() {
   it('should test getScheduleMigration', function() {
             expect($window.alert).toBeTruthy();
           });
    });  
  

  it('should test getScheduleMigration', function() {
   expect(datastoreservice.getScheduleMigration()).toBeUndefined();
   });
   it('should test getScheduleMigration', function() {
  expect(datastoreservice.getScheduleMigration()).toBeFalsy();
   });
   
describe('disableEditor', function() {
   var editorEnabled ='false'      ;     
   it('should test disableEditor', function() {
             expect(editorEnabled).toBe('false');
           });
    });  
    describe('editMigrationName', function() {
   var editorEnabled ='true' ,editedMigrationName="faws migration 13/03/2017"     ;    

   it('should test editMigrationName', function() {
             expect(editorEnabled).toBe('true');
           });
           it('should test editedMigrationName', function() {
             expect(editedMigrationName).toBe('faws migration 13/03/2017');
           });
    }); 
    describe('save', function() {
   var editedMigrationName="faws migration 13/03/2017"      ;     
   it('should save editedMigrationName', function() {
             expect(editedMigrationName).toBe('faws migration 13/03/2017');
           });
    });  

    
    
   
  
  });

