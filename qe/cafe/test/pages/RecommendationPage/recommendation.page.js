//Uins the Astrolabe node package for creating Page Object Model
var Page = require('astrolabe').Page;

//Creating Page Object Model for the Migration Page
module.exports = Page.create({

// The URL of the page.  Currently the same URL is used in onPrepare function in the protractor.conf.js file, hence kept blank here
    url: { value: browser.baseUrl+'/#/migration/recommendation' },

//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    labelCurrentCost: { 
        get: function() { 
            return element(by.id('basePrice'));
        }
    },

//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    valCurrentCost: { 
        get: function() { 
            return element(by.className('info-panel')).element(by.tagName('big'));
        }
    },

//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    btnBack: { 
        get: function() { 
            return element(by.linkText('Back'));
        }
    },

//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    btnContinue: { 
        get: function() { 
            return element(by.linkText('Continue'));
        }
    },

//The 'Cancel' button on the form to cancel the migrations of the selected servers   
    btnCancelMigration: { 
        get: function() { 
            return element(by.linkText('Cancel Migration'));
        }
    },

//The text box at the right side of the page to filter the name of the servers    
    filterTextBox: { 
        get: function() { 
            return element(by.model('vm.filteredValue'));
        }
    },

//The 'Next' link on the form to display the next set of 5 servers    
    linkSeeDetailsCurrentCost: { 
        get: function() { 
            return element.all(by.css('[ng-click="vm.openUsageCostsModalInChild()"]')).get(0);
            //return element(by.className('info-panel')).element(by.tagName('small'));
        }
    },

 //The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    labelProjectedCost: { 
        get: function() { 
            return element(by.className('white-panel')).element(by.tagName('h3'));
        }
    },

//The 'Continue' Button on the form to go to Next page after servers are selected for migration    
    valCurrentCost: { 
        get: function() { 
            return element(by.className('white-panel')).element(by.tagName('big'));
        }
    },

//The 'Next' link on the form to display the next set of 5 servers    
    linkSeeDetailsProjectedCost: { 
        get: function() { 
            return element(by.className('white-panel')).element(by.tagName('small'));
        }
    },

    eleTable: {
        get: function() {
            return $('table.rs-list-table.keywords.recommendServer');
        }
    },

    headers: { 
        get: function() { 
            return this.eleTable.all(by.tagName('th')).getText();
        }
    },


     columnAction: { 
        get: function(columnNo) { 
            return element(by.className('rs-btn-action'));
            //return element.all(by.model('item.selected')).get(server).click();
        }
    },

     popModifyConfigurations: { 
        get: function() { 
              return element(by.css("div[id^=modify_modal]"));
            //return element(by.repeater("item in vm.data"));
            //return element.all(by.model('item.selected')).get(server).click();
        }
    },             

     btnSaveChanges: { 
        get: function() { 
            return element(by.css("div[id^=modify_modal]")).element(by.buttonText('Save Changes'));
            //return element.all(by.model('item.selected')).get(server).click();
        }
    },

     btnClose: { 
        get: function() { 
            return element(by.buttonText('Close'));
            //return element.all(by.model('item.selected')).get(server).click();
        }
    },       

    btnStartMigration: { 
        get: function() { 
            //return element(by.css('[ng-click="vm.startNewMigration()"]'));
            return element(by.linkText('Start a Migration'));
        }
    },

    awsRegions: { 
        get: function() { 
            return element.all(by.model('vm.awsRegion'));
        }
    },

    awsRegionsDefaultSelection: { 
        get: function() { 
            return element(by.css("div[id^=modify_modal]")).element(by.model('vm.awsRegion')).$('option:checked');
        }
    },

    awsZones: { 
        get: function() { 
            return element.all(by.model('vm.awsZone'));
        }
    },

    awsZonesDefaultSelection: { 
        get: function() { 
            return element(by.css("div[id^=modify_modal]")).element(by.model('vm.awsZone')).$('option:checked');
            //return this.awsZones.all(by.css('option:checked'));
        }
    },

    awsRegionsOptionToChoose: { 
        get: function() { 
        //value: function(OptionNumber) { 
            //return this.awsRegions.all(by.css('option:checked'));
            //return this.awsRegions.all(by.cssContainingText('option', chooseOption));
            //return element.all(by.repeater('region in vm.regions track by $index')).get(OptionNumber);
            return element(by.css(('[role="dialog"][aria-hidden="false"] [ng-model="vm.awsRegion"]')));
        }
    },

    awsZoneOptionToChoose: { 
        get: function() { 
        //value: function(OptionNumber) { 
            //return this.awsRegions.all(by.css('option:checked'));
            //return this.awsRegions.all(by.cssContainingText('option', chooseOption));
            //return element.all(by.repeater('region in vm.regions track by $index')).get(OptionNumber);
            return element(by.css(('[role="dialog"][aria-hidden="false"] [ng-model="vm.awsZone"]')));
        }
    },

    recommendationTableAWSRegionValue: { 
        get: function() { 
        //value: function(OptionNumber) { 
            //return this.awsRegions.all(by.css('option:checked'));
            //return this.awsRegions.all(by.cssContainingText('option', chooseOption));
            //return element.all(by.repeater('region in vm.regions track by $index')).get(OptionNumber);
            return element(by.css('.rs-list-table.keywords.recommendServer td:nth-child(4)'));
        }
    },

    recommendationTableAWSZoneValue: { 
        get: function() { 
        //value: function(OptionNumber) { 
            //return this.awsRegions.all(by.css('option:checked'));
            //return this.awsRegions.all(by.cssContainingText('option', chooseOption));
            //return element.all(by.repeater('region in vm.regions track by $index')).get(OptionNumber);
            return element(by.css('.rs-list-table.keywords.recommendServer td:nth-child(5)'));
        }
    },
   
    modalPricingCalculations: { 
        get: function() { 
            return element(by.id('calculator_modal'));
        }
    },

    modalPricingCalculationsHeading: { 
        get: function() { 
            return element(by.id('calculator_modal')).element(by.tagName('h3'));
        }
    },

    modalPricingCalculationsCurrentCosts: { 
        get: function() { 
            return this.modalPricingCalculations.all(by.tagName('big')).first();
        }
    },

    modalPricingCalculationsProjectedCostsAWS: { 
        get: function() { 
            return this.modalPricingCalculations.all(by.tagName('big')).last();
        }
    },

    modalPricingCalculationsClose: { 
        get: function() { 
            return this.modalPricingCalculations.element(by.css('.fa.fa-times'));
        }
    },

    
});