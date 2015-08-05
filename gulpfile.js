var gulp = require('gulp');
var uglify = require('gulp-uglify');
var babel = require('gulp-babel');
var concat = require('gulp-concat');

gulp.task('dev', ['jsmin', 'watch']);

gulp.task('jsmin', function() {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'));
});

gulp.task('concat-js', function() {
  return gulp.src(['dist/xiaoming.js', 'dist/element.js', 'dist/promise.js'])
    .pipe(concat('xiaoming.js'))
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
  gulp.watch('src/**/*.js', ['jsmin']);
});
