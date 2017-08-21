'use strict';

//Using the objects created in test/pages/home.page.js

var SelectResourcesPage = require('../../pages/SelectResources/SelectResources.page');
var recommendPage = require('../../pages/RecommendationPage/recommendation.page');


describe('Recommedation Page', function() {

/*    before(function(){
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

    });*/

     it('should enable the Save Changes button when the AWS Region and AWS Zone is changed', function (){
            //recommendPage.columnAction.click();
            recommendPage.awsRegionsOptionToChoose.sendKeys('ap-south-1');
            recommendPage.awsRegionsOptionToChoose.sendKeys(protractor.Key.TAB);
            //expect(recommendPage.btnSaveChanges.getAttribute('class')).to.eventually.not.contain('disabled');
    });

    it('should show the changed AWS Region and AWS Zone in the Recommedation Table', function (){
            recommendPage.awsZoneOptionToChoose.sendKeys('ap-south-1b');
            recommendPage.btnSaveChanges.click();
            expect(recommendPage.recommendationTableAWSRegionValue.getText()).to.eventually.contain('ap-south-1');
            expect(recommendPage.recommendationTableAWSZoneValue.getText()).to.eventually.contain('ap-south-1b');

    });

});