{
   "categories": [ "Development", "Building a blog" ],
   "date": "2016-11-19T08:01:38Z",
   "description": "Setting up a frontend pipeline powered by yarn & gulp.",
   "tags": ["hugo", "blog", "js", "yarn", "node"],
   "series": "Building A Blog With Hugo",
   "title": "Blog Building - Part 4 - Frontend"
}

So far we have built a very basic site and got a basic understanding of how to configure and override the theme. Next up we are going to configure our frontend workflow using yarn and gulp.

<!--more-->
## Yarn

Yarn is a frontend package manager. It replaces the traditional workflow of npm whilst remaining compatible with the npm registry. This means that we can get all of the speed and security improvements whilst having all the packages that are currently available on the npm registry.

### Installing node.js

Unfortunately, it still runs on node, so we need to get that setup first. Head to [the node website]() and install the correct version for your environment. You can verify node is setup correctly post-installation by running the following command:

``` powershell
C:\>node --version
v7.1.0
```

### Installing yarn

Once node is setup, we can install yarn:

``` powershell
C:\>npm install yarn -g
```

This will install yarn so that it is available for all projects, not just our new blog. Once the installation is complete, we can verify yarn is installed by running the following command:
``` powershell
C:\>yarn --version
0.17.6
```
## Yarn'ing our project

Before we begin installing packages inside of our project, I am going to add a `.gitignore` file as we will generate a lot of files that we don't want inside of our git respository. Here is what I added to start off with: 

``` powershell
node_modules/
data/**/hash.*
static/css/*.css
static/js/*.js
public/
```

Now we can setup our project to use yarn:

    E:\im5tu-hugo>yarn init

This will ask you a series of questions such as: 

``` powershell
E:\im5tu-hugo>yarn init
yarn init v0.17.6
question name (im5tu-hugo): im5tu
question version (1.0.0): 0.0.1
question description: Stuart Blackler's Tech Blog
question entry point (index.js):
question git repository (https://github.com/Im5tu/im5tu-hugo.git):
question author (Stuart Blackler (@im5tu) <im5tu@users.noreply.github.com>):
question license (MIT):
success Saved package.json
Done in 42.93s.
```

Once this is completed, we will have a `package.json` file in our root and we can start adding the dependencies that we need. If you don't specify an answer, the default will be taken for you (the default is shown in brackets).

## gulp

At this point, I assume that you are fairly familiar with `gulp` or at least know what it is. We are going to setup gulp and our initial set of dependencies to do things like minification of files etc. We will add these files as development dependencies:

``` powershell
yarn add gulp -D
yarn add gulp-sass -D
yarn add gulp-autoprefixer -D
```

Now we need to tell gulp what to do by adding a `gulpfile.js`. Create this in the website root:

``` powershell
E:\im5tu-hugo>echo "" > gulpfile.js
```

As you may remember from my previous post, anything that gets placed inside of static folder will get copied across to the main website. As I have chosen to use a css preprocessor (scss), we only want the output from the preprocessor to be in the static folder. Inside of the `.gitignore` file, I have already put the main css/js files as these should be generated and not a part of main source code.

Now we can configure `gulp` to watch our source directory, process the files and copy the output into the static folder. At the very top of the file we need to require our dependencies, followed by a few configuration variables:

``` js
var gulp         = require("gulp"),
    sass         = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    srcRootDir   = "src/",
    destRootDir  = "static/",
    srcCssDir    = srcRootDir + "css/",
    srcJsDir     = srcRootDir + "js/",
    srcCss       = srcCssDir + "**/*.scss",
    srcJs        = srcJsDir + "**/*.js",
    destCssDir   = destRootDir + "css",
    destJsDir    = destRootDir + "js";
```

I have choosen to have a folder structure like the following:

``` powershell
/root
    /static
        /css
        /js
    /src
        /css
        /js
```

Next inside of our gulp file, we can configure two tasks. One to process any javascript files that we have and another for any scss files that we have:

``` js
gulp.task("js", function() {
    gulp
        .src(srcJs)
        .pipe(gulp.dest(destJsDir))
});

gulp.task("css", function() {
    gulp
        .src(srcCss)
        .pipe(sass({
            outputStyle: "compressed"
        }))
        .pipe(autoprefixer({
            browsers: ["last 20 versions"]
        }))
        .pipe(gulp.dest(destCssDir))
});
```

Lastly, we need to setup a watch task so that as files are changed they are copied to the static folder. When we combine this with hugo's watch ability we have a dynamically changing site that reloads with the changes as we hit save. We also want to setup a default task, so that we can just run `gulp` from inside of the root directory on the command line. The watch/default tasks look like:

``` js
gulp.task("watch", ["css", "js"], function() {
    gulp.watch([srcCss, srcJs], ["css", "js"]);
});

gulp.task("default", ["watch"]);
```

In terms of our gulpfile we are all setup and ready to go. At the time of writing there are problems running gulp directly from the command line. In order to work around this, I needed to add the following to the package.json file in our root directory:

``` js
"scripts": {
    "gulp": "gulp"
}
```

And then I can run gulp as follows:

``` cmd
yarn gulp
```

## Setting up our site for css/js

Now that we have our frontend pipeline setup and both the watch commands running, we can begin to change our site to include the files that we want. If you are using the bones theme, you need to create the following two files:

``` powershell
/root
    /layouts
        /partials
            /body
                scripts.html
            /header
                styles.html
```

Inside of the scripts file add:

``` html
<script src="/js/site.js" async></script>
```

Inside of the styles file add:

``` html
<link rel="stylesheet" href="/css/site.css" />
```

Now you should be able to add the file `/root/src/css/site.scss` with the following content:

``` css
body { background: #ababab }
```

All being well you should have both files renderd as part of your output.

## Cache busting

### Creating the hash

For our cache busting mechanism, we are going to append the hash of the file to the file. As a new file will be created everytime that our file changes, we will need to clear out the destination css folder. To start, we need to add two more packages, using yarn:

``` powershell
yarn add gulp-hash -D
yarn add del -D
```

And then add them to our gulpfile:

``` js
var gulp         = require("gulp"),
    sass         = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    hash         = require("gulp-hash"),
    del          = require("del"),
    ...
```
Now lets create a task to clean out some directories that we are using:

``` js
gulp.task("clean", function() {
    del([destCssDir, destJsDir, "data"]);
});
```

Now we can easily clean the directories that we need to at will. This could come in handy at a later date. Next we can change our task definitions to clean up their respective directories:

``` js
gulp.task("js", function() {
    del.sync([destJsDir]);
...
gulp.task("css", function() {
    del.sync([destCssDir]);
```

Finally, we can add the hash of the file prior to writing it to its destination in each task:

``` js
...
.pipe(hash())
.pipe(gulp.dest(...)); // change ... to the relevant destination eg: destCssDir
```

### Using the hashed file

In hugo, the `/root/data` directory is used to store any data that we might need. Anything placed in here is accessible through the variable `.Site.Data`. So using some more gulp magic, we can store the hahes of the files in here and update our template accordingly.

`gulp-hash` has a built in manifest method that will generate a json file containing the hash for us. We can change our gulp tasks to leverage this functionality and place it inside of the `/root/data` directory:

``` js
// js gulp task
...
.pipe(gulp.dest(destJsDir))
.pipe(hash.manifest("hash.json"))
.pipe(gulp.dest("data/"));

// css gulp task
...
.pipe(gulp.dest(destCssDir))
.pipe(hash.manifest("hash.json"))
.pipe(gulp.dest("data/"));
```

Restart our gulp task and now you should see the hash files being generated. If we open up the hash files, you should see something along the lines of:

``` css
{"site.css":"site-da39a3ee.css","site.js":"site-da39a3ee.js"}
```

All that's left to do is to use these hashes inside of our layouts. Luckily, GO has a built in function called `index` which accepts a map and an index and returns the value of the map with the given index. So in our templates, we simply need to ask for the right files. Let's first change our stylesheet in `/layouts/partials/styles.html` to:

``` html
<link rel="stylesheet" href="/css/{{ index .Site.Data.hash "site.css" }}" />
```

Finally, let's change our script template to do the same (`/layouts/partials/body/scripts`):

``` html
<script src="/js/{{ index .Site.Data.hash "site.js"}}" async></script>
```

Now we have a fully functional pipeline for frontend work. To start up the pipeline, you need to run two commands from different command line windows:

``` powershell
yarn gulp
hugo server -D
```

And then you can make changes to your files at will. Happy FED'ing.