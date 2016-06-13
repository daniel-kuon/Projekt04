/// <binding Clean='clean' />
"use strict";

var gulp = require("gulp"),
    rimraf = require("rimraf"),
    concat = require("gulp-concat"),
    cssmin = require("gulp-cssmin"),
    uglify = require("gulp-uglify"),
    less = require("gulp-less"),
    ts = require("gulp-typescript"),
    rename = require("gulp-rename"),
    sourcemaps = require("gulp-sourcemaps"),
    debug = require("gulp-debug"),
    ignore = require("gulp-ignore"),
    gulpUtil = require("gulp-util"),
    lec = require('gulp-line-ending-corrector');

var webroot = "./wwwroot/";

var paths = {
    js: webroot + "js/**/*.js",
    minJs: webroot + "js/**/*.min.js",
    css: webroot + "css/**/*.css",
    minCss: webroot + "css/**/*.min.css",
    concatJsDest: webroot + "js/site.min.js",
    concatCssDest: webroot + "css/site.min.css",
    jsDest: webroot + "js/",
    cssDest: webroot + "css/",
    ts: "./TS/**.ts",
    less: "./Less/**.less",
    libJs: webroot + "lib/**/*.js",
    libMinJs: webroot + "lib/**/*.min.js",
    libCss: webroot + "lib/**/*.css",
    libMinCss: webroot + "lib/**/*.min.css"
};

gulp.task("clean:js",
    function(cb) {
        rimraf(paths.concatJsDest, cb);
    });

gulp.task("clean:css",
    function(cb) {
        rimraf(paths.concatCssDest, cb);
    });

gulp.task("clean", ["clean:js", "clean:css"]);

gulp.task("min:js",
    ["cleas:js"],
    function() {
        return gulp.src([paths.js, "!" + paths.minJs], { base: "." })
            .pipe(concat(paths.concatJsDest))
            .pipe(uglify())
            .pipe(gulp.dest("."));
    });

gulp.task("min:css",
    ["clean:css"],
    function() {
        return gulp.src([paths.css, "!" + paths.minCss])
            .pipe(concat(paths.concatCssDest))
            .pipe(cssmin())
            .pipe(gulp.dest("."));
    });

gulp.task("min", ["min:js", "min:css", "min:lib"]);

gulp.task("min:lib", ["min:lib:js", "min:lib:css"]);


gulp.task("min:lib:js",
    function() {
        return gulp.src([paths.libJs, "!" + paths.libMinJs])
            .pipe(debug())
            .pipe(sourcemaps.init())
            .pipe(ignore.exclude(["**/*.map"]))
            .pipe(lec({ eolc: 'LF', encoding: 'utf8' }).on("error", gulpUtil.log))
            .pipe(uglify().on("error", gulpUtil.log))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(function(file) {
                return file.base;
            }));
    });

gulp.task("min:lib:css",
    function() {
        return gulp.src([paths.libCss, "!" + paths.libMinCss])
            .pipe(debug())
            .pipe(sourcemaps.init())
            .pipe(cssmin())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(function(file) {
                return file.base;
            }));
    });

gulp.task("less",
    ["clean:css"],
    function() {
        return gulp.src([paths.less])
            .pipe(debug())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(less())
            .pipe(cssmin())
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(function(file) {
                return paths.cssDest;
            }));
    });

gulp.task("ts",
    ["clean:js"],
    function() {
        return ts.createProject("tsconfig.json", { sortOutput: true })
            .src([paths.ts])
            .pipe(debug())
            .pipe(sourcemaps.init())
            .pipe(ts({ declarations: false }))
            .pipe(uglify().on("error", gulpUtil.log))
            .pipe(sourcemaps.write())
            .pipe(gulp.dest(function(file) {
                return paths.jsDest;
            }));

    });

gulp.task("default", ["build", "watch"]);

gulp.task("build", ["build:js", "build:css", "min:lib"]);
gulp.task("build:js", ["clean:js", "ts"]);
gulp.task("build:css", ["clean:css", "less"]);

gulp.task("watch",
    function() {
        gulp.watch(paths.less, ["build:css"]);
        gulp.watch(paths.ts, ["build:js"]);
    });

gulp.task("watch:css",
    function() {
        gulp.watch(paths.less, ["build:css"]);
    });

gulp.task("watch:js",
    function() {
        gulp.watch(paths.ts, ["build:js"]);
    });