const { series, parallel, src, dest, watch } = require('gulp');
const del = require("del");

var sass = require("gulp-dart-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    hash = require("gulp-hash"),
    concat = require("gulp-concat"),
    uglify = require("gulp-uglify"),
    pipeline = require('readable-stream').pipeline;

var srcRootDir = "src/",
    destRootDir = "static/",
    srcCssDir = srcRootDir + "sass/",
    srcJsDir = srcRootDir + "js/",
    srcCss = srcCssDir + "**/site.scss",
    highlightJs = srcJsDir + "highlight.pack.js",
    srcJs = [srcJsDir + "**/*.js", "!" + highlightJs],
    destCss = destRootDir + "css",
    destJs = destRootDir + "js";

function errorHandler(err) {
    if (err) {
        console.error("Pipeline failed", err);
    }
}

function clean(cb) {
    del.sync(destJs);
    del.sync(destCss);

    cb();
}
exports.clean = clean;

function js(cb) {
    del.sync(destJs);

    pipeline(
        src(srcJs),
        concat("site.js"),
        uglify(),
        hash(),
        dest(destJs),
        hash.manifest("hash.json"),
        dest("data/"),
        errorHandler
    );

    pipeline(
        src(srcJsDir + "highlight.pack.js"),
        dest(destJs),
        errorHandler
    );

    cb();
}
exports.js = js;

function css(cb) {
    del.sync(destCss);

    pipeline(
        src(srcCss),
        sass(),
        autoprefixer(),
        hash(),
        dest(destCss),
        hash.manifest("hash.json"),
        dest("data/"),
        errorHandler
    );

    cb();
}
exports.css = css;

exports.default = exports.watch = function () {
    options = { events: 'all', ignoreInitial: false };

    watch(srcCssDir, options, series(css));
    watch(srcJs, options, series(js));
}