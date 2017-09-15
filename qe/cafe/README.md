# Op-Dash Automation Framework

---

# Setup for Local Development
1.  Install node.js on your local system
2.  Create a folder "FAWS_Automation" in your local machine.
3.  Enter into the folder using command prompt.
4.  Run the command "npm init".  The package.json file will be created.
5.  Replace the contents of this file with the following devDependencies in the above file,

```
   "devDependencies": {
    "astrolabe": "^0.3.6",
    "chai": "^3.4.0",
    "chai-as-promised": "^6.0.0",
    "karma-mocha": "^0.1.10",
    "mocha": "^2.3.4",
    "mochawesome-screenshots": "^1.5.2",
    "protractor": "5.1.0"
  }
```  
  
  6.  Save the file.
  7.  Run the command "npm install".
  8.  Copy the "test" folder (from "opdash-cp/qe/cafe" location) and paste it in current folder ("FAWS_Automation").
  9.  The "Report" folder will be created once your run the tests using commands below (step 10).
  10.  On the command prompt (assuming you are on the FAWS_Automation folder), run the following two commands (back to back):
         "./node_modules/protractor/bin/webdriver-manager update"   and   
         "./node_modules/protractor/bin/webdriver-manager start"
         
  11.  Open a new tab in the same command line/terminal window (unix/mac) or open a new cmd/terminal window (windows).
  12.  Execute the following command (in the new tab) to test individual modules in "protractor.conf.js" file:
        ./node_modules/protractor/bin/protractor test/config/protractor.conf.js --suite <(name of the module)>
  13.  After executing the above command, the test will run in Chrome browser and the result will be displayed on the console of the terminal.
  14. Continue testing for other modules. 
