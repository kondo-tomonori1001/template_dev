// ==== 必要プラグインの読み込み ====
const gulp = require("gulp");

// ==== ファイルのclean-up ====
const del = require('del');
function clean(done){
  const distFiles = './dist/**/*';
  del(distFiles);
  done();
}

// ==== Sassコンパイル ====
const sass = require('gulp-sass');
sass.compiler = require("dart-sass");
const autoprefixer = require('autoprefixer');
const postcss = require('gulp-postcss');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');

function sassCompile(){
  return (
    gulp
    .src('src/common/sass/main.scss')
    .pipe(sourcemaps.init())
    .pipe(plumber())
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(
      postcss([
      autoprefixer({
        cascade:false,
        grid:true
        })
      ])
    )
    .pipe(rename('style.css'))
    .pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest('./dist/common/styles'))
  );
}
exports.sassCompile = sassCompile;

function sassCompileBuild(){
  return (
    gulp
    .src('src/common/sass/main.scss')
    .pipe(plumber())
    .pipe(sass({outputStyle: 'expanded'}))
    .pipe(
      postcss([
      autoprefixer({
        cascade:false,
        grid:true
        })
      ])
    )
    .pipe(rename('style.css'))
    .pipe(gulp.dest('./dist/common/styles'))
  );
}
exports.sassCompileBuild = sassCompileBuild;

// ==== CSS圧縮 ====
const cleancss = require('gulp-clean-css');
function cssMinimum(){
  return(
    gulp
      .src('dist/common/styles/style.css')
      .pipe(cleancss())
      .pipe(rename({
        extname:'.min.css'
      }))
      .pipe(gulp.dest('./dist/common/styles'))
  );
}
exports.cssMinimum = cssMinimum;

// ==== webpackの設定ファイルの読み込み ====
const webpackStream = require("webpack-stream");
const webpack = require("webpack");
const webpackDev = require("./webpack.dev");
const webpackProd = require("./webpack.prod");

// 開発用
const webpackDevTask = () => {
  return webpackStream(webpackDev, webpack)
  .pipe(gulp.dest("dist"))
  .pipe(browserSync.reload({ stream: true }));
}
exports.webpackDevTask = webpackDevTask;

// ビルド用
const webpackProdTask = () => {
  return webpackStream(webpackProd, webpack)
  .pipe(gulp.dest("dist"));
}

// ===== Copy =====
function copy(){
  return(
    gulp
      .src('src/**/*.+(inc|html|ico|json)')
      .pipe(gulp.dest('./dist'))
  )
}
exports.copy = copy;

// ==== 画像圧縮 ====
const imagemin = require('gulp-imagemin');
const mozJpeg = require('imagemin-mozjpeg');
const pngquant = require('imagemin-pngquant');

function images(){
  return(
    gulp
      .src(['src/**/*.+(jpg|jpeg|png|svg)','!src/**/fonts/*.svg'])
      .pipe(imagemin([
        mozJpeg(),
        pngquant(),
        imagemin.svgo(),
      ]))
      .pipe(gulp.dest('./dist/'))
  )
}
exports.images = images;

// ==== ローカルサーバー立ち上げ ====
const browserSync = require('browser-sync').create(); 
const connectSSI = require('connect-ssi');

function browserSyncFunc(){
  return(
    browserSync.init({
      server: {
        baseDir: 'dist',
        middleware: [
          connectSSI({
            ext: '.html',
            baseDir: 'dist',
          })
        ]
      },
      open: 'external',
      startPath: './',
      online: true,
      reloadOnRestart: true,
    })
  )
}
exports.browserSyncFunc = browserSyncFunc;

// browserSync Reload
function reload(done){
  browserSync.reload();
  done();
}
exports.reload = reload;

// ==== watch ====
function watch(){
  // html
  gulp.watch('src/index.html',gulp.series('copy','reload'));
  gulp.watch('src/common/include/header.inc',gulp.series('copy','reload'));
  // css
  gulp.watch('src/common/sass',gulp.series('sassCompile','cssMinimum','reload'));
  // js
  gulp.watch('src/common/scripts',gulp.series('webpackDevTask','reload'));
}

exports.default = gulp.parallel(gulp.series(clean,webpackDevTask,sassCompile,cssMinimum,copy,images,browserSyncFunc),watch);
exports.build = gulp.series(clean,webpackProdTask,sassCompileBuild,cssMinimum,copy,images);