// libs
var browserSync = require('browser-sync');
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

// gulp extras
var gulp = require('gulp');
var compass = require('gulp-compass');
var jsdoc = require('gulp-jsdoc');
var useWatchify;

gulp.task('browserify', function () {
  browserify({
    entries: 'src/index.js',
    debug: true,
    standalone: 't3'
  })
    .bundle()
    .pipe(source('t3.js'))
    .pipe(gulp.dest('dist'));
});

gulp.task('browserSync', ['browserify'], function () {
  browserSync.init(['./examples/**/*'], {
    server: {
      baseDir: '.'
    }
  });

  gulp.watch('src/**', ['browserify']);
});

gulp.task('docs', function(){
  return gulp.src('./src/**/*.js')
    .pipe(jsdoc('./docs/api'));
});

gulp.task('compass', function () {
  gulp.src(['./docs/**/*.scss'])
    .pipe(compass({
      // project: path.join(__dirname, 'docs/'),
      css: './docs/css',
      sass: './docs/sass'
    }));
});

gulp.task('useWatchify', function () {
  useWatchify = true;
});

gulp.task('watch', ['useWatchify', 'browserSync'], function () {
  gulp.watch('./docs/**/*.scss', ['compass']);
});

// main tasks
// default, build
gulp.task('build', ['browserify', 'compass']);
gulp.task('default', ['watch']);