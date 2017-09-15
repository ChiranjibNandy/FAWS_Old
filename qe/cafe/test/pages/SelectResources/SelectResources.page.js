//Uins the Astrolabe node package for creating Page Object Model
var Page = require('astrolabe').Page;

//Creating Page Object Model for the Migration Page
module.exports = Page.create({

// The URL of the page.  Currently the same URL is used in onPrepare function in the protractor.conf.js file, hence kept blank here
    url: { value: browser.baseUrl+'/#/migration/resources' },

//The 'Cancel' Button on the popup which appears when the user logs in as a Customer   
    popBtnCancel: {
        get: function () {
            return element(by.css('Cancel'));
        }
    },
 
//The 'Start a Migration' Button on the modal popup, which appears when a Customer Logs in     
    popBtnMigration: {
        get: function () {
            return element(by.linkText('Start a Migration'));
        }
    },

    goToPage: { 
        set: function(page) { 
            return element(by.linkText(page+''));
        }
    },

//Selecting all the checkboxes (servers) on the page    
    checkServers: { 
        value: function(server) { 
            return element.all(by.model('item.selected')).get(server).click();
        }
    },

//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    btnContinue: { 
        get: function() { 
            return element(by.linkText('Continue'));
        }
    },

//The 'Save for Later' button on the form to save the migration to execute at some other time
    btnSaveForLater: { 
        get: function() { 
            return element(by.linkText('Save For Later'));
        }
    },

//The 'Cancel' button on the form to cancel the migrations of the selected servers   
    btnCancelMigration: { 
        get: function() { 
            return element(by.linkText('Cancel Migration'));
        }
    },
 
//This the validation popup which appears when the user clicks on the 'Continue' button without selecting a server    
    popNoServerSelection: { 
        get: function() { 
            return element(by.id('no_selection'));
        }
    },

//The 'Close' button on the validation popup mentioned above
    noSelectionBtnClose: { 
        get: function() { 
            return this.popNoServerSelection.element(by.buttonText('Go Back'));
        }
    },

//selecting all the checkboxes(servers)    
    allCheckBoxes: { 
        get: function() { 
            return element.all(by.model('item.selected'));
        }
    },
    
//The text box at the right side of the page to filter the name of the servers    
    filterTextBox: { 
        get: function() { 
            return element(by.model('vm.filterSearch'));
        }
    },

//The 'Next' link on the form to display the next set of 5 servers    
    linkNext: { 
        get: function() { 
            return element(by.linkText('Next'));
        }
    },

//The place holder in the ITEMS SELECTED section which displays the name of the server selected    
    serverSelected: { 
        get: function() { 
            return element(by.id('server-name'));
        }
    },

//The place holder in the ITEMS SELECTED section which displays the name of the network for the selected server        
    
    networkSelected: { 
        get: function() { 
            return element(by.repeater("network in vm.networksList"));
        }
    },
 
//The popup which appears when the user clicks on the 'Cancel Migration' button    
    popCancelModal: { 
        get: function() { 
            return $('[id="cancel_modal"][aria-hidden="false"]');
        }
    },    

//The 'Yes' radio button on the popup mentioned above    
/*    radioYesCancelModal: { 
        get: function() { 
            return this.popCancelModal.all(by.model('vm.saveProgress')).get(0);
        }
    }, */

    btnSaveMigration: { 
        get: function() { 
            return this.popCancelModal.element(by.buttonText('Save Migration'));
        }
    },     

//The 'No' radio button on the popup mentioned above        
/*    radioNoCancelModal: { 
        get: function() { 
            return this.popCancelModal.all(by.model('vm.saveProgress')).get(1);
        }
    },
*/

    btnDontSaveMigration: { 
        get: function() { 
            return this.popCancelModal.element(by.buttonText("Don't save"));
        }
    },  
//The Submit button on the popup mentioned above which gets activated when the user selects Yes/No    
    btnSubmitCancelMigration: { 
        get: function() { 
            return this.popCancelModal.element(by.buttonText('Submit'));
        }
    },  
    

//The 'Start a Migration' button on the Dashboard Page
    btnStartMigration: { 
        get: function() { 
            return element(by.css('[ng-click="vm.startNewMigration()"]'));
        }
    },  
    
});