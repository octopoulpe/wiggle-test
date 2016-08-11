/* jshint node: true */
'use strict';

var gulp = require('gulp');
var stylus = require('gulp-stylus');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
//var uglify = require('gulp-uglify');
var stringify = require('stringify');
var watchify = require('watchify');
var assign = require('lodash.assign');
var gutil = require('gulp-util');
var webserver = require('gulp-webserver');

var config = {
    buildDir: './app/build',
    stylMain: './src/style/main.styl',
    jsMain: './src/main.js',
    jsMin: './app.min.js',
};

var opts = assign({}, watchify.args, {
  entries: config.jsMain,
  debug: true,
});
var wBundler = watchify(
    browserify(opts)
    .transform(
        stringify,
        {
            appliesTo: { includeExtensions: ['.glsl'] }
        }
    )
);

function bundle () {
    return wBundler
    .bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source(config.jsMin))
    .pipe(buffer())
    //.pipe(uglify())  // {compress: false} because sourcemaps work only with that
    .pipe(gulp.dest(config.buildDir));
}

gulp.task('js', bundle);
wBundler.on('update', bundle);
wBundler.on('log', gutil.log);

gulp.task('css', function () {
    return gulp.src(config.stylMain)
    .pipe(stylus({
        compress: true
    }))
    .pipe(gulp.dest(config.buildDir));
});

gulp.task('webserver', function() {
  return gulp.src('app')
  .pipe(webserver({}));
});

gulp.task(
    'default',
    ['css', 'js', 'webserver', ]
);
