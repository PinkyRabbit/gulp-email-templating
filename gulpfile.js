 
const gulp = require('gulp');
const plumber = require('gulp-plumber'); // Prevent pipe breaking caused by errors from gulp plugins
const notify = require('gulp-notify'); // notification plugin for gulp
const del = require('del'); // to remove old files
const sass = require('gulp-sass'); // compiling SASS files
const autoprefixer = require('gulp-autoprefixer'); // Prefix CSS
const inlineCss = require('gulp-inline-css'); // make css inline-style
const ejs = require('gulp-ejs'); // ejs syntax added
const rename = require('gulp-rename'); // rename ejs to html
const browserSync = require('browser-sync'); // to show result in browser

const mocks = require('./mocks'); // ejs syntax added
const browser = browserSync.create();
const PORT = 8082;

// run development server
gulp.task('server', () => {
  browser.init({
    // Options: https://www.browsersync.io/docs/options
    ui: false,
    logLevel: 'debug',
    server: { baseDir: 'dist' },
    port: PORT,
  });

  // Watch for file changes.
  gulp.watch('src/templates/*.ejs', gulp.series('completeSeries'));
  gulp.watch('src/sass/**/*.{sass,scss}', gulp.series('completeSeries'));
});

console.log(mocks)
// step 1
gulp.task('deleteBeforeBuild', () => del([ 'dist/*.html' ]));

// step 2
gulp.task('html', () => gulp
  .src('src/templates/*.ejs')
  .pipe(plumber({ errorHandler }))
  .pipe(ejs({
    ...mocks,
    baseUrl: `http://localhost:${PORT}`,
  }))
  .pipe(rename(path => path.extname = '.html'))
  .pipe(gulp.dest('src/prebuild/')));

// step 3
gulp.task('sass', () => gulp
  .src('src/sass/*.scss')
  .pipe(plumber({ errorHandler }))
  .pipe(sass({ outputStyle: 'expanded' }))
  .pipe(autoprefixer({
      overrideBrowserslist: ['last 10 versions'],
      cascade: false
  }))
  .pipe(gulp.dest('src/prebuild/css/')));

// step 4
gulp.task('inline', () => gulp
  .src('src/prebuild/*.html')
  .pipe(plumber({ errorHandler }))
  .pipe(inlineCss({
    removeStyleTags: true,
    removeLinkTags: true,
    removeHtmlSelectors: true,
  }))
  .pipe(gulp.dest('dist/')));

// step 5
gulp.task('deleteAfterBuild', () => del([ 'src/prebuild/' ]));

gulp.task('browserReload', (done) => {
  browser.reload();
  done();
});

/* -------------------------------- */
const defaultTasks = [
  'deleteBeforeBuild',
  'html',
  'sass',
  'inline',
  'deleteAfterBuild',
  'browserReload'
];

gulp.task('default', gulp.series( ...defaultTasks, 'server'));
gulp.task('completeSeries', gulp.series(...defaultTasks));


// --------------------------
// >>> Error handler
function errorHandler(error) {
  console.log(error)
  notify.onError({
    title: 'Gulp error in the <%= error.plugin %> plugin',
    message: '<%= error.fileName %>\n<%= error.message %>'
  })(error);
  this.emit('end');

  console.log('----------');
  console.log(error);
}
