'use strict';

var gulp = require('gulp');
var $ = require('./gulp-plugins');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var proxy = require('http-proxy-middleware');
var reload = browserSync.reload;

var apiProxy = proxy('/tunepal2/**', {
  target: 'https://tunepal.org/',
  changeOrigin: true,
  logLevel: 'debug'
});

gulp.task('build', function (cb) {
  runSequence(
    'clean',
    ['html', 'materialize', 'midi', 'styles', 'es6'],
    cb);
});

// Watch files for changes & reload
gulp.task('serve', ['build'], function () {
  browserSync.init({
    notify: true,
    startPath: '/tunepal/',
    server: {
      baseDir: ['.tmp', 'app'],      
      logLevel: 'debug',
      middleware: [apiProxy],
      routes: {
        '/tunepal/styles': '.tmp/styles',
        '/tunepal/lib': '.tmp/lib',
        '/tunepal/scripts': '.tmp/scripts',
        '/tunepal': 'app',
      }      
    }
  });

  gulp.watch(['app/index.html', 'app/{scripts/pages,tests}/**/*.html'], ['html', reload]);
  gulp.watch(['app/{scripts,tests}/**/*.{es6,es6lib}'], ['es6', reload]);
  gulp.watch(['app/styles/_variables.scss'], ['materialize-styles', 'styles', reload]);
  gulp.watch(['app/styles/materialize.scss'], ['materialize-styles', reload]);
  gulp.watch(['app/{styles,tests}/**/*.scss', '!app/styles/{_variables,materialize}.scss'], ['styles', reload]);
});
