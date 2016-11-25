var gulp         = require("gulp"),
    sass         = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    hash         = require("gulp-hash"),
    del          = require("del"),
    concat       = require("gulp-concat"),
    uglify       = require("gulp-uglify"),
    srcRootDir   = "src/",
    destRootDir  = "static/",
    srcCssDir    = srcRootDir + "sass/",
    srcJsDir     = srcRootDir + "js/",
    srcCss       = srcCssDir + "**/site.scss",
    srcJs        = srcJsDir + "**/*.js",
    destCssDir   = destRootDir + "css",
    destJsDir    = destRootDir + "js";

gulp.task("js", function() {
    del.sync([destJsDir]);

    gulp
        .src(srcJs)
        .pipe(concat("site.js"))
        .pipe(uglify())
        .pipe(hash())
        .pipe(gulp.dest(destJsDir))
        .pipe(hash.manifest("hash.json"))
        .pipe(gulp.dest("data/"));
});

gulp.task("css", function() {
    del.sync([destCssDir]);

    gulp
        .src([srcCss])
        .pipe(sass({
            outputStyle: "compressed"
        }))
        .pipe(autoprefixer({
            browsers: ["last 20 versions"]
        }))
        .pipe(hash())
        .pipe(gulp.dest(destCssDir))
        .pipe(hash.manifest("hash.json"))
        .pipe(gulp.dest("data/"));
});

gulp.task("clean", function(){
    del([destCssDir, destJsDir, "data"]);
})

gulp.task("watch", ["css", "js"], function() {
    gulp.watch([srcCssDir + "**/*.scss"], ["css"]);
    gulp.watch([srcJs], ["js"]);
});

gulp.task("default", ["watch"]);