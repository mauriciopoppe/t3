// libs
var browserSync = require('browser-sync');
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var exec = require('child_process').exec;
var pkg = require('./package.json');

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
      baseDir: '.'
    }
  });
});

gulp.task('bump', ['build'], function () {
  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump({
      // type: 'major'
      type: 'minor'
      // type: 'patch'
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('tag', ['bump'], function (cb) {
  var version = pkg.version;
  var message = 'Release ' + version;
  gulp.src('./')
    .pipe(git.commit(message));
  git.tag(version, message);
  exec('./push.sh', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
  // git.push('origin', 'master', {args: '--tags'});
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