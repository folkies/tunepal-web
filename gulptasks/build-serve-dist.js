'use strict';

var gulp = require('gulp');
var $ = require('./gulp-plugins');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var merge = require('merge-stream');
var proxy = require('http-proxy-middleware');

var apiProxy = proxy('/tunepal2/**', {
  target: 'https://tunepal.org/',
  changeOrigin: true,
  logLevel: 'debug'
});



// Copy files to www
gulp.task('copy', function () {
  var assets = gulp.src(['app/assets/**/*'])
    .pipe(gulp.dest('www/tunepal/assets'));

  var fonts = gulp.src(['app/fonts/**/*'])
    .pipe(gulp.dest('www/tunepal/fonts'));

  var images = gulp.src(['app/images/**/*'])
    .pipe(gulp.dest('www/tunepal/images'));

  var rootFiles = gulp.src(['app/*'])
    .pipe(gulp.dest('www/tunepal'));

  var tmpFiles = gulp.src(['.tmp/**/*'])
    .pipe(gulp.dest('www/tunepal'));

  return merge(assets, fonts, images, rootFiles, tmpFiles)
    .pipe($.size({title: 'copy'}));
});

gulp.task('build:dist', function (cb) {
  runSequence(
    'clean',
    ['html', 'materialize', 'midi', 'styles', 'es6'],
    'copy',
    'minify',
    cb);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['build:dist'], function () {
  browserSync.init({
    notify: false,
    startPath: '/tunepal/',
    server: {
      baseDir: ['www'],
      middleware: [apiProxy]
    }
  });
});
