var gulp         = require("gulp"),
    sass         = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    srcRootDir   = "src/",
    destRootDir  = "static/",
    srcCssDir    = srcRootDir + "css/",
    srcJsDir     = srcRootDir + "js/",
    destCssDir   = destRootDir + "css/",
    destJsDir    = destRootDir + "js/";

gulp.task("js", function() {
    gulp
        .src(srcJsDir + "**/*.js")
        .pipe(gulp.dest(destJsDir))
});

gulp.task("css", function() {
    gulp
        .src(srcCssDir + "**/*.scss")
        .pipe(sass({
            outputStyle: "compressed"
        }))
        .pipe(autoprefixer({
            browsers: ["last 20 versions"]
        }))
        .pipe(gulp.dest(destCssDir))
});

gulp.task("watch", ["css", "js"], function() {
    gulp.watch([srcCssDir, srcJsDir], ["css", "js"])
});

gulp.task("default", ["watch"]);