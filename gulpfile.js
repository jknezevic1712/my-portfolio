const gulp = require("gulp");
const { src, series, dest, watch } = require("gulp");
const imagemin = require("gulp-imagemin");
const concat = require("gulp-concat");
const terser = require("gulp-terser");
const sourcemaps = require("gulp-sourcemaps");
const postcss = require("gulp-postcss");
const cssnano = require("cssnano");
const autoprefixer = require("autoprefixer");
const sass = require("gulp-sass")(require("sass"));
const browserSync = require("browser-sync");
const rimraf = require("rimraf");

const jsPath = "src/assets/js/**/*.js";
const cssPath = "src/assets/css/**/*.css";
const scssPath = "src/assets/scss/**/*.scss";
const htmlPath = "src/**/*.html";
const imgPath = "src/images/*";

// Erases the dist folder
gulp.task("clean-dist", function (cb) {
  rimraf("dist", cb);
});

gulp.task("copy-html", function () {
  return src(htmlPath).pipe(gulp.dest("dist"));
});

// Compile sass into CSS & auto-inject into browsers
gulp.task("compile-sass", function () {
  return src(scssPath)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist/assets/css"))
    .pipe(browserSync.stream());
});

// Minifies size of image files by using imagemin()
gulp.task("compile-img", function () {
  return src(imgPath)
    .pipe(imagemin())
    .pipe(gulp.dest("dist/images"))
    .pipe(browserSync.stream());
});

// Bundles all js files into one bundle.js and uglifies the code using terser()
// Terser() also uglifies ES6 unlike gulp-uglify which doesn't
// NOTE: Don't forget to change script import inside of index.html because of the newly created bundle.js
gulp.task("compile-js", function () {
  return src(jsPath)
    .pipe(sourcemaps.init())
    .pipe(concat("bundle.js"))
    .pipe(terser())
    .pipe(sourcemaps.write("."))
    .pipe(dest("dist/assets/js"))
    .pipe(browserSync.stream());
});

gulp.task(
  "build",
  series("clean-dist", "copy-html", "compile-js", "compile-sass", "compile-img")
);

// Static Server + watching scss/html files
gulp.task(
  "serve",
  series("build", function () {
    browserSync.init({
      server: "./dist",
    });

    watch(scssPath, series("compile-sass"));
    watch(imgPath, series("compile-img"));
    watch(jsPath, series("compile-js"));
    watch(htmlPath, series("copy-html")).on("change", browserSync.reload);
  })
);
gulp.task("default", series("serve"));
