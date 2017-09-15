'use strict';

//Using the objects created in test/pages/home.page.js

var homePage = require('../../pages/SelectResources/SelectResources.page');


//The 'describe' keyword contains the tests in the form of 'it'.

describe('FAWS Home Page Layout', function() {

   
    before(function(){
        homePage.btnStartMigration.click();
    });
    
/*
Below spec verifies whether all the checkboxes adjacent to the server name in the Migration Page are unchecked.  Using forEach loop for looping through each checkbox.
*/
    
    it('should show all the server checboxes as unchecked', function (){
        
        homePage.allCheckBoxes.isSelected().then(function (data) {
            data.forEach(function (bool) {
                expect(bool).to.be.false;
            });
        });
        
    });
    
 
    it('should show 5 servers at a time', function (){
        expect(homePage.allCheckBoxes.count()).to.eventually.equal(5);
    });
    
    it('should show the Continue button and it should be active', function (){
       expect(homePage.btnContinue.isEnabled()).to.eventually.be.true;
    });

    it('should show the Cancel Migration button and it should be active', function (){
        expect(homePage.btnCancelMigration.isEnabled()).to.eventually.be.true;
    });

    it('should show a textbox to filter the servers', function (){
        expect(homePage.filterTextBox.isDisplayed()).to.eventually.be.true;
    });
    
});


describe('Page validations', function() {
                
    it('should show a popup for selection of servers for migration', function (){
        
        homePage.btnContinue.click();
        browser.sleep(3000);
        expect(homePage.popNoServerSelection.isDisplayed()).to.eventually.be.true;
        expect(homePage.popNoServerSelection.getText()).to.eventually.contain('Please select some items to migrate');
        homePage.noSelectionBtnClose.click();
    });
});




