Steps to generate documentation for application code.

This application uses ng-docs for generating documentation for the angular code describing all the components of the applications.

Setup
*******
	Tools needed for generating documentation
	*******************************************
	- Nodejs needs to be locally installed on the system for the following steps to work. Nodejs is available here: 
	https://nodejs.org/en/download/
	
	Confirm that all the needed files are present
	***********************************************
	- Following configuration and task files are needed to generate the documentaion. They have been placed at following location 	  of the opdash application : 	  	  	  
		https://github.rackspace.com/FAWS-Migration/opdash-cp/tree/master/opdash/static/angdocumentation

	1-package.json - This is a configuration file which will be used by nodejs to download all the dependencies for this operation
	2-gulp.js - This is a gulp task file that executes multiple tasks to generate the documentation and spin-off a local server to 		    display the documentation in the browser.
	3-overview.js - This file is used by ngDocs to display the overview of the documentation.

Process to generate documentation
************************************
	1-Install nodejs in this folder or gloablly, if not already installed.

	2-Open command prompt in "angdocumentation" folder and type the command - "npm install". 
	  Nodejs will create a new folder here named "node_modules" and install all the dependencies here (e.g gulp, ngDocs etc).

	3-Run command "gulp". This will run the gulp tasks (configured in gulp.js), create a new folder named "docs", generate the 		  documentation, spin-off a localhost server and open the browser to display the generated documentation.

Important
**************
	If you ever generate the documentation in any other folder than"angdocumentation/docs" ensure that the folder is added to 		.gitignore file.

Troubleshooting
*******************
	- In case documentation is not generated properly, open the gulp.js file and check gulp task paths in variable named 
	  "jsSrcFiles".
	- Gulp is using all .js files in "angsrc" folder and overview.js file as its source to generate the documentation.



