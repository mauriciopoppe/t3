// libs
var browserSync = require('browser-sync');
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var pkg = require('./package.json');
var version = pkg.version;

// gulp extras
var gulp = require('gulp');
var git = require('gulp-git');
var bump = require('gulp-bump');
var useWatchify;

function run(bundler, minify) {
  if (minify) {
    bundler = bundler.plugin('minifyify', {
      map: pkg.name + '.map.json',
      output: './dist/' + pkg.name + '.map.json'
    });
  }

  console.time('build');
  return bundler
    .bundle({
      debug: true,
      standalone: pkg.name
    })
    .pipe(source(pkg.name + (minify ? '.min' : '') + '.js'))
    .pipe(gulp.dest('./dist/'))
    .on('end', function () {
      console.timeEnd('build');
    });
}

gulp.task('browserify', function () {
  var method = useWatchify ? watchify : browserify;

  var bundler = method({
    entries: ['./src/js/index.js'],
    extensions: ['js']
  });

  var bundle = function () {
    if (!useWatchify) {
      // concat + min
      run(bundler, true);
    }
    // concat
    return run(bundler);
  };

  if (useWatchify) {
    bundler.on('update', bundle);
  }

  return bundle();
});

gulp.task('browserSync', ['build'], function () {
  browserSync.init(['./examples/**/*'], {
    server: {
      baseDir: 'examples'
    }
  });
});

gulp.task('bump', ['build'], function () {
  var message = 'Release ' + version;
  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump('minor'))
    .pipe(gulp.dest('./'));
});

gulp.task('tag', ['bump'], function () {
  var message = 'Release ' + version;
  return gulp.src('./')
    .pipe(git.commit(message))
    .pipe(git.tag(version, message))
    .pipe(git.push('origin', 'master', '--tags'))
    .pipe(gulp.dest('./'));
});

gulp.task('useWatchify', function () {
  useWatchify = true;
});

gulp.task('watch', ['useWatchify', 'browserSync'], function () {
});

// main tasks
gulp.task('build', ['browserify']);
gulp.task('release', ['tag']);
gulp.task('default', ['watch']);