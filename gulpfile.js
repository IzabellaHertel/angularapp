var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify');

gulp.task('jshint', function() {
    return gulp.src('*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('uglify', function() {
    return gulp.src('*.js')
        .pipe(concat('concat.js'))
        .pipe(gulp.dest('dist'))
        .pipe(rename('script.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});