// import all libraries
var gulp = require("gulp"),
    connect = require("gulp-connect"),
    open = require("gulp-open"),
    ngDocs = require("gulp-ngdocs");

// Define your source files
var jsSrcFiles = ["../opdash-cp/opdash/static/js/angsrc/**/*.js", "./overview.js"];

// Define your server details
var serverUrl = "http://localhost:8080/docs",
    port = 8080;

var ngDocsOptions = {
    title: "FAWS Migration UI Docs",
    styles: ["./docs/css/custom.css"]
}

// Start a local server
gulp.task("serverStart", function() {
    connect.server({
        port: port,
        livereload: true
    });
});

//Open a specific URL
gulp.task("openUrl", function() {
    gulp.src(__filename)
        .pipe(open({
            uri: serverUrl
        }));
});

// setup ngdoc
gulp.task('ngdocs', [], function () {
  return gulp.src(jsSrcFiles)
            .pipe(ngDocs.process(ngDocsOptions))
            .pipe(gulp.dest('./docs'));
});

gulp.task("default", ["ngdocs", "serverStart", "openUrl"]);