{
   "categories": [ "Development", "Building a blog" ],
   "date": "2016-11-17T20:23:00Z",
   "description": "Beginning to setup our workflow on the way to our very first hugo powered blog.",
   "tags": ["hugo", "go", "git", "blogging"],
   "series": "Building A Blog With Hugo",
   "title": "Blog Building - Part 1 - Hello Hugo"
}

As promised in this first mini-series, I am going to guide you through the steps that I have taken to get my blog up and running on Github pages and Cloudflare with SSL. As these the steps that I have taken to get this blog up and running, your milage may vary with this as different versions get released. That said, you should be fine.
<!--more-->

*NB: I had already pushed a hello world up into my hosted repository with an index file containing hello world before I decided to write this guide.*

## Prerequisite: Installing Git

The likelyhood is that you've already installed git, but if you haven't download and install the latest version of git from [the git website](https://git-scm.com/).

## Installing Hugo

Now that we have git installed, we are ready and raring to go. I'm going to make the assumption that you are on Windows with the instructions. We are going to install go, then use go to install hugo from source, installing all the updates as we go.

1. Navigate in your favourite browser to: [https://golang.org/dl/](https://golang.org/dl/)
2. Download the installer of choice and follow the instructions in the installer, making a note of installation directory (eg: `E:\GoLang\`)
3. Open a new command prompt and enter: `echo %GOROOT%`. You should see the installation directory echo'd out to the console window. Close the command prompt for the next step
4. Next, we need to ensure that `GOPATH` is set on your path
  - Right click on the start button
  - Click on System
  - Click on Advanced System Settings on the left
  - Click on the Environment Variables� button on the bottom
  - In the User variables section, click the New� button
  - Type the name `GOPATH` for the variable name
  - In the value textbox, type in the folder where you wish to extract hugo to. Eg: `E:\GoLang\`
5. With the Environment Variables window open still, edit the PATH variable under user to include `%GOPATH%\bin
6. Re-open any command prompt windows so that the variables take effect
7. Now we are ready to install hugo by running the following command: `go get -u -v github.com/spf13/hugo`
  - This will download hugo, update its dependencies and build hugo. Expect this process to take 5 minutes or so.
8. Verify that hugo has downloaded successfully by running `hugo --help`

## Configuring Git

Typically you can host on Github pages for two scenarios: Project pages or User/Organisation pages. When you are hosting the former, you will have a branch named `gh-pages` which hosts the site within the project. The latter is what we are going to setup which requires the site to be present on the master branch. For this, we are going to use git submodules. This will mean that we actually have two repositories created, one for the hosted site and one for the structure code. This is actually quiet a nice way around an otherwise awkward branching model.

1. Create repository `<github-handle>.github.io`, eg: `im5tu.github.io`
	- This repository will contain the finished site
2. Create repository `<github-handle>-hugo`, eg: `im5tu-hugo`
	- This repository will contain all of the generation code and templates etc
3. Create a location on disk where you will store the generation files and navigate to that directory on the command line
	- Eg: `mkdir E:\im5tu-hugo && cd E:\im5tu-hugo`
4. Next run the following command to make a new site in the new directory: `hugo new site .`
5. It's probably a good time to create the git respository and commit the code we have currently
	- To initialize the git repository: `git init`
	- Add all the current files: `git add -A`
	- Commit all of the files: `git commit -am "Initial Commit`
	- Add the remote url of your Github repository: `git remote add origin https://github.com/Im5tu/im5tu-hugo.git`
	- Push the code to your new repository: `git push -u origin master`
6. Next we are going to create a sub-module in the public directory. This folder is where the generated output goes.
	- I used GitKraken to do this, but you could do it from the command line also:
	- `git submodule add -b master git@github.com:<github-handle>/<github-handle>.github.io.git public`
7. Now we have that setup, commit everything again
	- Commit all of the files: `git commit -am "Initialized submodules`
	- Push the code to Github: `git push`

From now on, when we generate our site with `hugo` (the way we will generate our site) the files will be generated inside of the public directory. Then its a case of either committing the files in the main repository or changing to the public folder and committing the changes in that repository to push it to our live site.

Out of curiosity, I tested to make sure that they have different git histories:

``` powershell
E:\im5tu-hugo>git log --oneline
f3c2595 Initialized submodules
e60426b Initial commit

E:\im5tu-hugo>cd public && git log --oneline
ef81fbc Create CNAME
3043605 Hello World
```

This can be verified on both repositories [here](https://github.com/Im5tu/im5tu-hugo/commits/master) and [here](https://github.com/Im5tu/im5tu.github.io/commits/master).

## Summary

So far we have created our git repositories, installed both Go Lang and hugo and setup our workflow ready to begin work on our site. In the next article, I will begin adding a theme so that we can start publishing the posts that we are writing.