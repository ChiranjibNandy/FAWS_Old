var secrets = require('../secrets');
exports.config = {

  seleniumAddress: 'http://localhost:wd/4444/hub',

  // Capabilities to be passed to the webdriver instance.
  capabilities: {
    'browserName': 'chrome',
    directConnect: true
  },

  // Framework to use. Using Mocha Framework.
  framework: 'mocha',
 
//This is the root of all the Angular elements present in the DOM    
  rootElement: '[ng-app]',    

  // Spec patterns are relative to the current working directly when
  // protractor is called.
  //specs: ['../stories/home/*.js'],

  //baseUrl: 'http://opdash-cp-dev-ci.us-east-1.elasticbeanstalk.com',
  //baseUrl: 'https://stg.migration.rackspace.net',
  baseUrl: 'https://qe.migration.rackspace.net',

  allScriptsTimeout: 60000,

  //getPageTimeout: 50000,
    
  onPrepare: function() {
    expect = require('chai').use(require('chai-as-promised')).expect;  // Using the expect function of Chai
    //browser.driver.get('http://opdash-cp-pr-verify.us-east-1.elasticbeanstalk.com/login');  // Launching the URL in the browser
    browser.driver.get(browser.baseUrl); 
    //browser.driver.get(browser.baseUrl + '/login');
    browser.driver.manage().window().maximize();
    browser.waitForAngular();
    browser.driver.findElement(by.css("input[value='customer']")).click(); //Selecting the customer radio button
    browser.driver.findElement(by.id('username')).sendKeys('fawsmigrationqe2');    // Filling the customer name
    //browser.driver.findElement(by.id('username')).sendKeys('RSMTDev1');    // Filling the customer name
    //browser.pause();
    //browser.driver.findElement(by.id('rsa_token')).sendKeys('#T00ling');   // Filling the customer password
    browser.driver.findElement(by.id('password')).sendKeys(secrets.credentials.fawsmigrationqe2);
    //browser.driver.findElement(by.id('password')).sendKeys(secrets.credentials.RSMTDev1);
    browser.driver.findElement(by.className('rs-btn')).click();
    
    // Login takes some time, so wait until it's done.
    // For the test app's login, we know it's done when it redirects to
    // index.html.
    return browser.driver.wait(function() {
    return browser.driver.getCurrentUrl().then(function(url) {
    return /migration/.test(url);
          });
        }, 10000);
  },

  //specs: ['../stories/*/*.js'],

  suites: {
    Dashboard: '../stories/DashboardPage/*.js',
    SelectResourcePage: '../stories/SelectResourcesPage/*.js',
    RecommendationPage: '../stories/RecommendationPage/*.js',
    ConfirmMigrationPage: '../stories/ConfirmMigrationPage/*.js'
  },
    
  mochaOpts: {
      enableTimeouts: false,
      reporter: 'spec', //reports the spec status on the terminal console
      slow: 5000,
      ui: 'bdd',

//Configurations for the mochawesome package used for reporting       
      reporter: 'mochawesome-screenshots',
      reporterOptions: {
          reportDir: './Reports',
          reportName: 'Test Execution Report',
          reportTitle: 'Demo Execution',
          takePassedScreenshot: false,  // taking screenshots only when the spec failss
          clearOldScreenshots: true,
          jsonReport: false,
          multiReport: false
      },
  }
  
};
