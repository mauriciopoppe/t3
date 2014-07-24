// libs
var browserSync = require('browser-sync');
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var pkg = require('./package.json');

// gulp extras
var gulp = require('gulp');
var useWatchify;

function run(bundler, minify) {
  if (minify) {
    bundler = bundler.plugin('minifyify', {
      map: pkg.name + '.map.json',
      output: './build/' + pkg.name + '.map.json'
    });
  }

  console.time('build');  
  return bundler
    .bundle({debug: true})
    .pipe(source(pkg.name + (minify ? '.min' : '') + '.js'))
    .pipe(gulp.dest('./build/'))
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
      // concat
      run(bundler);
    }
    // concat + min
    return run(bundler, true);
  };

  if (useWatchify) {
    bundler.on('update', bundle);
  }

  return bundle();
});

gulp.task('browserSync', ['build'], function () {
  browserSync.init(['build/**'], {
    server: {
      baseDir: 'build'
    }
  });
});

gulp.task('useWatchify', function () {
  useWatchify = true;
});

gulp.task('watch', ['useWatchify', 'browserSync'], function () {
  // gulp.watch('src/sass/**', ['compass']);
  // gulp.watch('src/images/**', ['images']);
  // gulp.watch(['src/js/lib/**', 'src/index.html'], ['copy']);
});

// main tasks
gulp.task('build', ['browserify']);
gulp.task('default', ['watch']);