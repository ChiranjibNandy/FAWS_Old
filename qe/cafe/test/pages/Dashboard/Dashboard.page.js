//Uins the Astrolabe node package for creating Page Object Model
var Page = require('astrolabe').Page;

//Creating Page Object Model for the Migration Page
module.exports = Page.create({

// The URL of the page.  Currently the same URL is used in onPrepare function in the protractor.conf.js file, hence kept blank here
    url: { value: browser.baseUrl+'/#/migration-status' },

//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    batchTable: { 
        get: function() { 
            return element(by.css('table.no-truncate-td >thead>tr'));
        }
    },

//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    batchColumnNames: { 
        get: function() { 
            return this.batchTable.all(by.tagName('th')).getText();
        }
    },

//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    completedTable: { 
        get: function() { 
            return element(by.css('table.secondary-table >thead>tr'));
        }
    },

//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    completedColumnNames: { 
        get: function() { 
            return this.completedTable.all(by.tagName('th')).getText();
        }
    },

    completedTableStatusSort: { 
        get: function() { 
            return $('[ng-click="vm.setSortBy(\'completed_batch\', \'batch_status\')"]');
        }
    },

//The 'Cancel' button on the form to cancel the migrations of the selected servers   
    errorTable: { 
        get: function() { 
            return element.all(by.css('.rs-facet-section-body')).get(0);
            //return $('.rs-embedded-list-table');
        }
    },

    noErrors: { 
        get: function() { 
             return element(by.css('[ng-show="!vm.loadingAlerts && vm.errors.items.length===0"]'));
            //return $('.rs-embedded-list-table').element(by.deepCss('.empty-collection-info'));
            //return element.all(by.css('div.span-6')).first();
        }
    },

    errorCount: { 
        get: function() { 
            return this.errorTable.all(by.css('tbody>tr')).count();
        }
    },

    errorRecordMigrationName: { 
        get: function() { 
            return $('.rs-embedded-list-table td > a' );
        }
    },

    errorRecordDate: { 
        get: function() { 
            return this.errorTable.all(by.repeater('alert in vm.errors.items')).get(0).all(by.tagName('td')).get(2);
        }
    },

    errorRecordMessage: { 
        get: function() { 
            return this.errorTable.element(by.css('[ng-show="!vm.loadingAlerts && vm.errors.items.length>0"]'));
        }
    },

    errorMessageRow: { 
        get: function() { 
            return this.errorTable.element(by.repeater('alert in vm.errors.items'));
        }
    },


    errorMigrationDetailPageStatus: { 
        get: function() { 
            return element(by.css('.rs-table-text'));
        }
    },


    errorMigrationDetailAlerts: { 
        get: function() { 
            return $('.rs-status-error', '[aria-hidden=\'false\']');
        }
    },

    errorMigrationDetailTaskList: { 
        get: function() { 
            return element(by.css('.rs-list-table.no-truncate-td.cell-center'));
        }
    },
//The text box at the right side of the page to filter the name of the servers    
    ticketTable: { 
        get: function() { 
            return element.all(by.css('.rs-facet-section-body')).get(1);
            //return element.all(by.css('div.span-6')).last();
        }
    },

//The 'Start a Migration' button on the Dashboard Page
    btnStartMigration: { 
        get: function() { 
            return element(by.css('.fa.fa-plus-square.fa-fw'));
        }
    },  

 //The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    btnRefresh: { 
        get: function() { 
            return element(by.css('[ng-click="vm.getBatches(true)"]'));
        }
    }, 

//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    refreshStatus: { 
        get: function() { 
            return element(by.css('.pull-right > div'));
        }
    },

    settingsScheduledMigration: { 
        get: function() { 
            return element(by.css('.pull-right > div'));
        }
    },

    noCompletedMigrationRecord: { 
        get: function() { 
            return $('.secondary-table').$('.empty-collection-info');
        }
    },

    completedMigrationRecord: { 
        get: function() { 
            return element(by.repeater('batch in vm.completedBatches.items')).element(by.tagName('a'));
        }
    },
    
    completedMigrationStatusDetailsPage: { 
        get: function() { 
            return element(by.css('span.rs-status-ok'));
        }
    },

    completedMigrationNameDetailsPage: { 
        get: function() { 
            return element(by.css('td.rs-table-link'));
        }
    },

    btnSeeTasks: { 
        get: function() { 
            return element(by.repeater('instance in vm.job.instances | orderBy: vm.sortBy.server')).element(by.linkText('See Tasks'));
        }
    },

    linkBackToDashboard: { 
        get: function() { 
            return $('i.fa.fa-chevron-left');
        }
    },

    linkFirstTicket: { 
        get: function() { 
            return element.all(by.repeater('ticket in vm.tickets.items ')).get(1).element(by.tagName('a'));
            //return element(by.repeater('ticket in vm.tickets.items ')).element(by.tagName('a'));
        }
    },

    
});