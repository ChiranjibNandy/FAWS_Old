'use strict';

//Using the objects created in test/pages/home.page.js

var SelectResourcesPage = require('../../pages/SelectResources/SelectResources.page');
var recommendPage = require('../../pages/RecommendationPage/recommendation.page');


describe('Recommedation Page Layout', function() {

    before(function(){
        //SelectResourcesPage.go();
        SelectResourcesPage.btnStartMigration.click();
        SelectResourcesPage.popBtnMigration.isDisplayed().then(function(isDisplayed){
            if(isDisplayed){
                SelectResourcesPage.popBtnMigration.click();
            }
            else{
                
                }
          });

        SelectResourcesPage.checkServers(3);
        SelectResourcesPage.checkServers(4);
        SelectResourcesPage.btnContinue.click();
        
    });
    
   it('should redirect the user to the Recommendations Page', function (){
       //SelectResourcesPage.goToPage(4).click();
       //browser.pause();
       expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + '/#/migration/recommendation');    
    });

    it('should show a textbox to filter the servers', function (){
        expect(recommendPage.filterTextBox.isDisplayed()).to.eventually.be.true;
        //expect(homePage.filterTextBox.isDisplayed()).to.eventually.be.true;
    });  

    it('should display the Continue button and it should be active', function (){
       expect(recommendPage.btnContinue.isEnabled()).to.eventually.be.true;
       //expect(element(by.linkText('Continue')).isEnabled()).to.eventually.be.true;    
    });
    
    it('should display the Back button and it should be active', function (){
       expect(recommendPage.btnBack.isEnabled()).to.eventually.be.true;
       //expect(element(by.linkText('Back')).isEnabled()).to.eventually.be.true;    
    });
    
    it('should display the Cancel Migration button and it should be active', function (){
       expect(recommendPage.btnCancelMigration.isEnabled()).to.eventually.be.true;
       //expect(element(by.linkText('Cancel Migration')).isEnabled()).to.eventually.be.true;  
    });

    it('should display the Current Cost', function (){
       //browser.pause();
       expect(recommendPage.labelCurrentCost.isDisplayed()).to.eventually.be.true;
       expect(recommendPage.valCurrentCost.getText()).to.eventually.contain('/month');
       expect(recommendPage.linkSeeDetailsCurrentCost.getText()).to.eventually.contain('See Details'); 
    });

    it('should display the Projected Cost', function (){
       expect(recommendPage.labelProjectedCost.getText()).to.eventually.contain('Projected Cost');
       expect(recommendPage.valCurrentCost.getText()).to.eventually.contain('/month');
       expect(recommendPage.linkSeeDetailsProjectedCost.getText()).to.eventually.contain('See Details');   
    });

     it('should show the Pricing Calculations Modal when clicked on the See Details Link from the Current Cost block', function (){
        //browser.pause();
        recommendPage.linkSeeDetailsCurrentCost.click();
        expect(recommendPage.modalPricingCalculations.isDisplayed()).to.eventually.be.true;
        expect(recommendPage.modalPricingCalculationsHeading.getText()).to.eventually.equal('Pricing Calculations');
        expect(recommendPage.modalPricingCalculationsCurrentCosts.getText()).to.eventually.equal('Current Costs - Rackspace');
        expect(recommendPage.modalPricingCalculationsProjectedCostsAWS.getText()).to.eventually.equal('Projected Costs - AWS (excludes FAWS support)');
        recommendPage.modalPricingCalculationsClose.click();
        //browser.pause();
        
    });

     it('should show the Pricing Calculations Modal when clicked on the See Details Link from the Projected Cost block', function (){
        //browser.pause();
        recommendPage.linkSeeDetailsProjectedCost.click();
        expect(recommendPage.modalPricingCalculations.isDisplayed()).to.eventually.be.true;
        expect(recommendPage.modalPricingCalculationsHeading.getText()).to.eventually.equal('Pricing Calculations');
        expect(recommendPage.modalPricingCalculationsCurrentCosts.getText()).to.eventually.equal('Current Costs - Rackspace');
        expect(recommendPage.modalPricingCalculationsProjectedCostsAWS.getText()).to.eventually.equal('Projected Costs - AWS (excludes FAWS support)');

        recommendPage.modalPricingCalculationsClose.click();
        
    });

});


describe('Selected Server(s) Details', function() {

/*    xit('should display all the columns related to the Server Details', function (){
        expect(recommendPage.columnServerDetails(3).getText()).to.eventually.contain('IP Address');
        expect(recommendPage.columnServerDetails(4).getText()).to.eventually.contain('AWS Region');
        expect(recommendPage.columnServerDetails(5).getText()).to.eventually.contain('AWS Zone');
        expect(recommendPage.columnServerDetails(6).getText()).to.eventually.contain('AWS Instance');
        expect(recommendPage.columnServerDetails(7).getText()).to.eventually.contain('Cost/Month');
        expect(recommendPage.columnServerDetails(8).getText()).to.eventually.contain('Server Name');
        expect(recommendPage.columnAction.isEnabled()).to.eventually.be.true;

    });*/
                
    it('should display all the columns related to the Server Details', function (){
        //browser.pause();
        var headers = [
          '',
          'Server Name',
          'IP Address',
          'AWS Region',
          'AWS Zone',
          'AWS Instance',
          'Cost/Month',
          'Actions',
          ''
        ];
        //expect(recommendPage.headers).to.eventually.equal(headers);
        expect(recommendPage.headers).to.eventually.eql(headers);
    });

     it('should show a popup to Modify the Configurations when clicked on the Edit icon ', function (){
        recommendPage.columnAction.click();
        expect(recommendPage.popModifyConfigurations.isDisplayed()).to.eventually.be.true;
        expect(recommendPage.btnSaveChanges.getAttribute('class')).to.eventually.contain('disabled');
        expect(recommendPage.btnClose.isEnabled()).to.eventually.be.true;


    });

     it('should show the US-East-1 and US-East-1a as the default AWS Region and AWS Zone respectively', function (){
        expect(recommendPage.awsRegionsDefaultSelection.getText()).to.eventually.equal('US-East-1');
        expect(recommendPage.awsZonesDefaultSelection.getText()).to.eventually.equal('US-East-1a');

    });

});




