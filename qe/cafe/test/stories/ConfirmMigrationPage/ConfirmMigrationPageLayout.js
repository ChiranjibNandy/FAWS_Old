'use strict';

//Using the objects created in test/pages/home.page.js

var SelectResourcesPage = require('../../pages/SelectResources/SelectResources.page');
var recommendPage = require('../../pages/RecommendationPage/recommendation.page');
var ConfirmPage = require('../../pages/ConfirmMigrationPage/confirm.page');


describe('Schedule and Confirm Migration Page Layout', function() {

    before(function(){
        //dashboardPage.btnStartMigration.click();
        //SelectResourcesPage.go();
        SelectResourcesPage.btnStartMigration.click();
        SelectResourcesPage.popBtnMigration.isDisplayed().then(function(isDisplayed){
            if(isDisplayed){
                SelectResourcesPage.popBtnMigration.click();
            }
            else{
                
                }
          });


        //SelectResourcesPage.goToPage(3);
        //browser.pause();
        SelectResourcesPage.checkServers(2);
        SelectResourcesPage.btnContinue.click();
        recommendPage.btnContinue.click();
        //$('[ng-click="vm.continueToSchedule()"]').click();
        //element(by.id('precheck_modal')).element(by.linkText('Continue')).click();
        ConfirmPage.popPreCheckBtnContinue.click();



    });

    it('should show the AWS Account name and the dropdown should be disabled', function (){      
        expect(ConfirmPage.awsAccount.isDisplayed()).to.eventually.be.true;
        expect(ConfirmPage.awsAccount.getAttribute('class')).to.eventually.contain('disabled');

    });

    it('should show the Migration Name and it should be editable', function (){      
        expect(ConfirmPage.migrationName.isDisplayed()).to.eventually.be.true;
        expect(ConfirmPage.migrationName.getAttribute('class')).to.eventually.not.contain('disabled');

    });
 
    it('should show the Resource Selected Panel', function (){
        expect(ConfirmPage.labelResourcesSelected.getText()).to.eventually.equal('Resources Selected');
        expect(ConfirmPage.labelServersSelected.getText()).to.eventually.contain('Servers');
        expect(ConfirmPage.iconResourceSelectedModify.isDisplayed()).to.eventually.to.be.true;

    });

    it('should show the Projected Costs Panel', function (){
        expect(ConfirmPage.labelProjectedCost.getText()).to.eventually.equal('Projected Cost');
        expect(ConfirmPage.valProjectedCost.getText()).to.eventually.contain('$');
    });

    it('should show the Schedule Migration Panel', function (){
        expect(ConfirmPage.labelScheduleMigration.getText()).to.eventually.equal('Schedule Migration');
        expect(ConfirmPage.labelInitiateMigrationNow.getText()).to.eventually.equal('Initiate Migration Now');
        expect(ConfirmPage.labelScheduleMigrationLater.getText()).to.eventually.equal('Schedule for Later');
        
        ConfirmPage.labelScheduleMigrationLater.click();       
        expect(ConfirmPage.dateTimePicker.isDisplayed()).to.eventually.be.true;
        expect(ConfirmPage.dropdownScheduleTime.isDisplayed()).to.eventually.be.true;
        expect(ConfirmPage.dropdownScheduleTimeZone.isDisplayed()).to.eventually.be.true;

    });


    it('should show the Back button and it should be enabled', function (){
        expect(ConfirmPage.btnBack.isDisplayed()).to.eventually.be.true;
        expect(ConfirmPage.btnBack.isEnabled()).to.eventually.be.true;
    });


    it('should show the Cancel Migration button and it should be enabled', function (){
        expect(ConfirmPage.btnCancelMigration.isDisplayed()).to.eventually.be.true;
        expect(ConfirmPage.btnCancelMigration.isEnabled()).to.eventually.be.true;

    });


    it('should show the Confirm & Schedule button and it should be disabled', function (){
        expect(ConfirmPage.btnScheduleMigration.isDisplayed()).to.eventually.be.true;
        expect(ConfirmPage.btnScheduleMigration.isEnabled()).to.eventually.be.false;

    });

    it('should show the Terms and Conditions checkbox and it should be unchecked', function (){
        expect(ConfirmPage.checkBoxTermsConditions.isDisplayed()).to.eventually.be.true;
        expect(ConfirmPage.checkBoxTermsConditions.getAttribute('aria-checked')).to.eventually.equal('false');
        
    });
   
});


xdescribe('Selected Server(s) Details', function() {

/*    it('should display all the columns related to the Server Details', function (){
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

     it('should show a popup to Modify the Configurations when clicked on the Edit icon', function (){
        recommendPage.columnAction.click();
        expect(recommendPage.popModifyConfigurations.isDisplayed()).to.eventually.be.true;
        expect(recommendPage.btnSaveChanges.isEnabled()).to.eventually.be.false;
        expect(recommendPage.btnClose.isEnabled()).to.eventually.be.true;


    });

     it('should show the US-East-1 and US-East-1a as the default AWS Region and AWS Zone respectively', function (){
        browser.pause();
        expect(recommendPage.awsRegionsDefaultSelection.getInnerHtml()).to.eventually.deep.equal([ 'US-East-1', 'US-East-1', '', '' ]);
        expect(recommendPage.awsZonesDefaultSelection.getInnerHtml()).to.eventually.deep.equal([ 'US-East-1a', 'US-East-1a', '', '' ]);

    });

});




