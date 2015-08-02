var gulp = require('gulp');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var watch = require('gulp-watch');

gulp.task('dev', ['jsmin', 'watch']);

gulp.task('jsmin', function() {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.js', ['jsmin']);
});
