'use strict';

//Using the objects created in test/pages/home.page.js
var dashboardPage = require('../../pages/Dashboard/Dashboard.page');

describe('Dashboard Page Layout', function() {


    it('should show the Migrations which are not yet completed', function (){

          var headers = [
          '',
          'Batch Queue',
          'Batch Initiated By',
          'Start Date/Time',
          'Status',
          'Progress',
          'Actions'
        ];
        expect(dashboardPage.batchColumnNames).to.eventually.eql(headers);
    });

    it('should show the Migrations which have been Completed', function (){

          var headers = [
          '',
          'Completed/Cancelled Batches',
          'Batch Initiated By',
          'Start Date/Time',
          'Completed Date/Time',
          'Status'
        ];
        expect(dashboardPage.completedColumnNames).to.eventually.eql(headers);
    });

    
   it('should show the Errors and Warnings', function (){
        expect(dashboardPage.errorTable.isPresent()).to.eventually.be.true;
//browser.pause();       
        dashboardPage.errorMessageRow.isPresent().then(function (bool) {
        if (bool) {
          expect(dashboardPage.errorRecordMessage.getText()).to.eventually.contain('Task');
          expect(dashboardPage.errorRecordDate.getText()).to.eventually.contain('/201');

          
        } else {
               expect(dashboardPage.noErrors.getText()).to.eventually.contain('Hooray! You don\'t have any errors or warnings.');
          }
       });   

    });
  
    
   it('should show the number of tickets', function (){
        expect(dashboardPage.ticketTable.isPresent()).to.eventually.be.true;
    });

    it('should show the Start New Migration button', function (){
        expect(dashboardPage.btnStartMigration.isEnabled()).to.eventually.be.true;
    });  
    
    it('should display the Refresh button and it should be active', function (){
       expect(dashboardPage.btnRefresh.isEnabled()).to.eventually.be.true;
       expect(dashboardPage.refreshStatus.getText()).to.eventually.contain('Last refreshed: just now');
    });

});




