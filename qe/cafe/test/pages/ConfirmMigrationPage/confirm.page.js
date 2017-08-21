//Uins the Astrolabe node package for creating Page Object Model
var Page = require('astrolabe').Page;

//Creating Page Object Model for the Migration Page
module.exports = Page.create({

// The URL of the page.  Currently the same URL is used in onPrepare function in the protractor.conf.js file, hence kept blank here
    url: { value: browser.baseUrl+'/#/migration/confirm' },

    popAWSCompatibility: { 
        get: function() { 
            return element(by.id('precheck_modal'));
        }
    },

    popPreCheckBtnContinue: { 
        get: function() { 
            return this.popAWSCompatibility.element(by.linkText('Continue'));
        }
    },


//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    labelResourcesSelected: { 
        get: function() { 
            return element(by.tagName('rsselecteditemspanel')).element(by.tagName('h3'));
        }
    },

//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    labelServersSelected: { 
        get: function() { 
            return element(by.tagName('rsselecteditemspanel')).element(by.css('.accordion-heading'));
        }
    },

//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    btnBack: { 
        get: function() { 
            return element(by.linkText('Back'));
        }
    },

//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    btnScheduleMigration: { 
        get: function() { 
            return element(by.buttonText('Confirm & Schedule'));
        }
    },

//The 'Cancel' button on the form to cancel the migrations of the selected servers   
    btnCancelMigration: { 
        get: function() { 
            return element(by.linkText('Cancel Migration'));
        }
    },

//The text box at the right side of the page to filter the name of the servers    
    iconResourceSelectedModify: { 
        get: function() { 
            return element(by.tagName('rsselecteditemspanel')).element(by.css('.rs-btn-action'));
        }
    },

//The 'Next' link on the form to display the next set of 5 servers    
    migrationName: { 
        get: function() { 
            return $('[ng-show="!vm.editName"]');
        }
    },

    editMigrationName: { 
        get: function() { 
            return $('[ng-show="!vm.editName"] > a');
        }
    },


 //The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    iconEditMigrationName: { 
        get: function() { 
            return this.migrationName.element(by.tagName('a'));
        }
    },

//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    labelProjectedCost: { 
        get: function() { 
            return element.all(by.css('div.plain-panel')).get(1).$('h3');
        }
    },

//The 'Next' link on the form to display the next set of 5 servers    
    valProjectedCost: { 
        get: function() { 
            return element.all(by.css('div.plain-panel')).get(1).element(by.css('[class="ng-binding"]'));
        }
    },

    labelScheduleMigration: {
        get: function() {
            return element(by.css('div.white-panel')).element(by.tagName('h3'));
        }
    },

    labelInitiateMigrationNow: { 
        get: function() { 
            return element(by.css('[value="migrateNow"]'));
        }
    },

    labelScheduleMigrationLater: { 
        get: function() { 
            return element(by.css('[value="migrateLate"]'));
        }
    },

     dateTimePicker: { 
        get: function(columnNo) { 
            return element(by.id('datetimepickerAdd'));
            //return element.all(by.model('item.selected')).get(server).click();
        }
    },

     dropdownScheduleTime: { 
        get: function() { 
            return element(by.model('vm.time'));
        }
    },             

     dropdownScheduleTimeZone: { 
        get: function() { 
            return element(by.model('vm.timezone1'));
            //return element.all(by.model('item.selected')).get(server).click();
        }
    },

     checkBoxTermsConditions: { 
        get: function() { 
            return element(by.id('accept_terms'));
            //return element.all(by.model('item.selected')).get(server).click();
        }
    },       

    awsAccount: { 
        get: function() { 
            return $('div.rs-dropdown.rs-primary-dropdown');
        }
    },

    awsZones: { 
        get: function() { 
            return element.all(by.model('vm.awsZone'));
        }
    },
    
    
});