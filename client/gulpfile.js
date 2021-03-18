var gulp = require('gulp');
var sass = require('gulp-sass');

gulp.task('hello', function() {
  console.log('Testing gulp');
});

gulp.task('sass', function(){
  console.log('Testing gulp');
  return gulp.src('*.scss')
    .pipe(sass()) // Converts Sass to CSS with gulp-sass
    .pipe(gulp.dest('./src'))
    .on('error', (err) => {
      console.log(err);
      process.exit(1);
    });
});

function defaultTask(cb) {
    // place code for your default task here
    cb();
  }

  exports.default = defaultTask