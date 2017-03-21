// Karma configuration
// Generated on Thu Mar 09 2017 15:34:43 GMT+0530 (India Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: './',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'opdash/static/js/anglib/angular.js',
      'opdash/static/js/anglib/angular_1_router.js',
      'opdash/static/js/anglib/angular-animate.js',
      'opdash/static/js/anglib/angular-mocks.js',
      'opdash/static/js/angsrc/migration-app/migration-app.js',
      'opdash/static/js/angsrc/migration-app/services/httpwrapper.js',
      'opdash/static/js/angsrc/migration-app/services/data-store-service.js',
      'opdash/static/js/angsrc/migration-app/services/auth-service.js',
      'opdash/static/js/angsrc/migration-app/components/rs-schedule-migration.component.js',
      'opdash/static/js/angtest/migration-app-test/components-test/rs-schedule-migration.components.spec.js',
      'opdash/static/js/angsrc/migration-app/components/rs-pricing-panel.component.js',
      'opdash/static/js/angtest/migration-app-test/components-test/rs-pricing-panel.component.spec.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
