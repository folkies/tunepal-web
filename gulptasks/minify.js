'use strict';

var gulp = require('gulp');
var $ = require('./gulp-plugins');
var merge = require('merge-stream');
var through = require('through2');
var fs = require('fs');
var git = require('./git-rev');

var readOriginalFile = through.obj(function (file, enc, cb) {
  fs.readFile(file.path, {encoding: enc}, function(err, data) {
    file.contents = new Buffer(data);
    cb(err, file);
  });
});

var commitId = null;
var commitDate = null;

gulp.task('get-git-info', function (cb) {
  git.head(function (id, date) {
    commitId = id;
    commitDate = date;
    cb();
  })
});

// Search and minify html, js, css
gulp.task('minify-search', ['get-git-info'], function () {
  var assets = $.useref.assets({searchPath: ['.tmp', 'app']});

  return gulp.src(['app/**/*.html', '!app/lib/materialize/**/*.html'])
    .pipe(assets)
    .pipe($.debug())
    // Copy minified files
    .pipe($.if('**/*.min.js', readOriginalFile))
    // Remove console, alert, and debugger statements from code
    .pipe($.if(['**/*.js', '!**/*.min.js'], $.stripDebug()))
    // Concatenate And Minify JavaScript
    .pipe($.if('**/App.js', $.uglify({mangle: false})))
    .pipe($.if(['**/*.js', '!**/App.js', '!**/*.min.js'], $.uglify({mangle: true})))
    // Concatenate And Minify Styles
    // In case you are still using useref build blocks
    .pipe($.if('**/*.css', $.cssmin()))
    .pipe(assets.restore())
    .pipe($.useref({
      git: function(content, target, options, alternateSearchPath) {
        return commitDate + ' &nbsp;&nbsp; ' + commitId;
      }
    }))
    // Minify Any HTML
    .pipe($.if('**/*.html', $.minifyHtml({
      empty: true,  // do not remove empty attributes
      conditionals: true,  // do not remove conditional internet explorer comments
      spare:true  // do not remove redundant attributes
    })))
    // Output Files
    .pipe(gulp.dest('www/tunepal'))
    .pipe($.size({title: 'minify-search'}));
});

gulp.task('minify', ['minify-search'], function () {
  //TODO
  //var images = gulp.src(['app/images/**/*'])

  var dsp = gulp.src(['app/lib/dsp.js/dsp.js'])
    .pipe($.uglify())
    .pipe(gulp.dest('www/tunepal/lib/dsp.js'));

  var transcriber = gulp.src(['.tmp/scripts/transcription/TranscriberWorker.js'])
    .pipe($.uglify())
    .pipe(gulp.dest('www/tunepal/scripts/transcription'));

  return merge(dsp, transcriber)
    .pipe($.size({title: 'minify'}));
});
