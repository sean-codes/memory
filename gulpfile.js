const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const autoprefixer = require('gulp-autoprefixer');

gulp.task('default', ['scss']);
gulp.task('watch', () => {
   gulp.watch('scss/**', ['default']);
});

gulp.task('scss', () => {
   gulp.src('./scss/main.scss')
      .pipe(sass()).on('error', console.log)
      .pipe(autoprefixer())
      .pipe(rename({ basename: 'MemoryGame', extname: '.css'}))
      .pipe(gulp.dest('css'));
});
