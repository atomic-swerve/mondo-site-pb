'use strict';

var gulp = require('gulp');
var eslint= require('gulp-eslint');

var src = [
    'controllers/**/*.js',
    'include/**/*.js',
    'public/js/**/*.js',
    'contact_form.js'
];

gulp.task('lint', function(){
    return gulp.src(src)
        .pipe(eslint())
        .pipe(eslint.format())
});

gulp.task('watch', function() {
    gulp.watch(src, ['lint']);
});

gulp.task('default', ['lint', 'watch']);
