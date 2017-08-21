'use strict';

//Using the objects created in pages/home.page.js

var dashboardPage = require('../../pages/Dashboard/Dashboard.page');
var SelectResourcesPage = require('../../pages/SelectResources/SelectResources.page');

describe('Validation through actions', function() {
    
        before(function(){ 
        dashboardPage.btnStartMigration.click();
        SelectResourcesPage.popBtnMigration.click();
    });

    it('should show the name of the server selected for the migration', function (){
        browser.sleep(3000);      
        //SelectResourcesPage.goToPage(4);
        SelectResourcesPage.checkServers(2);
        //expect(SelectResourcesPage.serverSelected.getText()).to.eventually.contain('test-server-migrate-09');
         
    });

    
    it.skip('should show the network associated with it', function (){
        //expect(SelectResourcesPage.networkSelected.getText()).to.eventually.contain('Test-Migration-Net');
    });


   it('should show a popup when click on the Cancel Migration button', function (){
        SelectResourcesPage.btnCancelMigration.click();
        browser.sleep(3000);
//browser.pause();        
        expect(SelectResourcesPage.popCancelModal.isDisplayed()).to.eventually.be.true;
        expect(SelectResourcesPage.btnSaveMigration.isDisplayed()).to.eventually.be.true;
        expect(SelectResourcesPage.btnDontSaveMigration.isDisplayed()).to.eventually.be.true;
    });

   it('should redirect to the Dashboard page when I select an option', function (){
       SelectResourcesPage.btnDontSaveMigration.click();
       //SelectResourcesPage.btnSubmitCancelMigration.click();
       expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + '/#/migration-status');
       
        
    });

});


