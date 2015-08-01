var gulp = require('gulp');
var uglify = require('gulp-uglify');
var cssminify = require('gulp-minify-css');
var watch = require('gulp-watch');

gulp.task('dev', ['jsmin', 'watch']);

gulp.task('jsmin', function() {
  return gulp.src('src/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch('js/*.js', ['jsmin']);
});
