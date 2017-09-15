'use strict';

//Using the objects created in test/pages/home.page.js

var dashboardPage = require('../../pages/Dashboard/Dashboard.page');

describe('Dashboard Page', function() {


    it.skip('should show the options of Pause and Cancel Migrations when clicked on Settings icon of a Scheduled Migration', function (){

    });

    it.skip('should show the options of Continue Migration and Delete when clicked on Settings icon of a Not Scheduled Migration', function (){


    });

   it('should redirect the user to the Migration Details page when clicked on a Compeleted Migration', function (){
        //browser.pause();

        dashboardPage.completedMigrationRecord.isPresent().then(function(completed) {
          if(completed) {
        dashboardPage.completedTableStatusSort.click();
        dashboardPage.completedTableStatusSort.click();
        
        dashboardPage.completedMigrationRecord.click();
        expect(dashboardPage.completedMigrationStatusDetailsPage.getText()).to.eventually.contain('100%');
        expect(dashboardPage.completedMigrationNameDetailsPage.isDisplayed()).to.eventually.be.true;
        expect(dashboardPage.btnSeeTasks.isEnabled()).to.eventually.be.true;
        dashboardPage.linkBackToDashboard.click();

          } else {
              console.log('There are no Completed Migrations');
              expect(dashboardPage.noCompletedMigrationRecord.getText()).to.eventually.contain('You don\'t have any completed migrations.');
            }

        });

    });


   it('should show the Error in the Alert Section of the Migration Details when clicked on the Migration from Dashboard - Errors/Warnings', function (){

          dashboardPage.noErrors.isDisplayed().then(function(displayed) {
          if (displayed) {
              console.log('There are no Error records present');
          
        } else { 
            dashboardPage.errorRecordMigrationName.click();
            expect(browser.getCurrentUrl()).to.eventually.contain(browser.baseUrl + '/#/migration/current-batch/job-');
            //expect(dashboardPage.errorMigrationDetailPageStatus.getText()).to.eventually.equal('Error');
            //expect(dashboardPage.errorMigrationDetailAlerts.getText()).to.eventually.contain('error');
            //expect(dashboardPage.errorMigrationDetailAlerts.getText()).to.eventually.contain('Task');
            
            dashboardPage.btnSeeTasks.click();
            //expect(dashboardPage.errorMigrationDetailTaskList.getText()).to.eventually.contain('Error');
            dashboardPage.linkBackToDashboard.click();
          }
       });   

    }); 

   it('should redirect the user to the Ticketing page when clicked on a Ticket in the Tickets Section', function (){
        dashboardPage.linkFirstTicket.click();
        expect(browser.driver.getCurrentUrl()).to.eventually.contain('https://login.rackspace.com/?next');
    });

});




