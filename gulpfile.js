'use strict';

var gulp = require('gulp');

var ghPages = require('gulp-gh-pages');
var gulpif = require('gulp-if');
var minifyCss = require('gulp-minify-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');

var SRC = './';
var DIST = './dist/';

gulp.task('default', ['deploy'], function() {
  
});

/*
 * deployment to github pages
 * first run merge all js/css files
 */
gulp.task('deploy', ['html'], function() {
    // copy json files
    gulp.src(SRC + 'js/data/**')
        .pipe(gulp.dest(DIST + 'js/data'));
        
    // assets
    // TODO consider gitignore
    gulp.src(SRC + 'css/icons/*.(gif|png|jpeg)')
        .pipe(gulp.dest(DIST + 'icons/'));
        
    // gui is index
    gulp.src(DIST + 'gui.html')
        .pipe(rename('index.html'))
        .pipe(gulp.dest(DIST));

    // deploy
    return gulp.src(DIST + '**/*')
        .pipe(ghPages());
});

gulp.task('html', function() {
    return gulp.src(['*.html'])
        .pipe(useref())
        .pipe(gulpif('*.js', uglify({preserveComments: 'license'})))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(gulp.dest(DIST));
});