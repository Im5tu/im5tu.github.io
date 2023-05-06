const { watch, src, dest } = require('gulp');
const { rimraf } = require('rimraf');

var sass = require("gulp-dart-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    hash = require("gulp-hash"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    pipeline = require('readable-stream').pipeline,
    cleanCSS = require('gulp-clean-css');

var srcRootDir = "src/",
    destRootDir = "static/",
    srcCssDir = srcRootDir + "sass/",
    srcJsDir = srcRootDir + "js/",
    srcCss = srcCssDir + "**/site.scss",
    highlightJs = srcJsDir + "highlight.pack.js",
    srcJs = [srcJsDir + "**/*.js", "!" + highlightJs],
    destCss = destRootDir + "css",
    destJs = destRootDir + "js";

exports.default = function () {
    options = { delay: 500, events: 'all', ignoreInitial: false };

    watch(srcCss, options, updateCSS);
    watch(srcJs, options, updateJS);

    updateCSS();
    updateJS();
}

exports.deploy = function() {
    return new Promise(function(resolve, reject) {
        updateCSS();
        updateJS();
        resolve();
    });
}

function updateCSS() {
    rimraf.sync(destCss);

    return src(srcCss)
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(cleanCSS())
        .pipe(hash())
        .pipe(dest(destCss))
        .pipe(hash.manifest("hash.json"))
        .pipe(dest("data/"))
}

function updateJS(callback) {
    rimraf.sync(destCss);

    return src(srcJs)
        .pipe(concat("site.js"))
        .pipe(uglify())
        .pipe(hash())
        .pipe(dest(destJs))
        .pipe(hash.manifest("hash.json"))
        .pipe(dest("data/"));
}

function errorHandler(err) {
    if (err) {
        console.error("Pipeline failed", err);
    }
}