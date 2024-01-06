---
title: "My Favourite Git Aliases"
description: A look into some of the git aliases that I have configured on my machine which are in constant use.
date: 2020-07-11T12:56:00+01:00
toc: true
includeInSitemap: true
tags:
- dotnet
- devops
- git
---

Git aliases are used to create new git commands that can either invoke a function, or be used to create commands that map to longer commands. For example, we could map `git co` to `git checkout` or have `git undo` undo our previous commit. In this article, I'm going to show you some of my favourite git aliases.

<!--more-->

## Creating a new git alias

We have two ways of creating git aliases: via the command line or directly in the `.gitconfig` file. You only need to use one of the approaches, so pick which best works for you.

From the command line, the format is:

```bash
    git config alias.<name> <command>
```

Note: _You can also add these globally by using `git config --global alias.<name> <command>`._

If you are manually editing a `.gitconfig` file, you need to find/create a section called `[alias]`. Then the format is `<name> = command`, like this:

```ini
[alias]
        <name> = <command>
```

## git undo

`git undo` is for those times that you realise that you've messed up the commit and haven't pushed it to your remote yet. My common use case is because my muscle memory keeps writing `git commit -am` instead of `git commit -m`. This command undoes the last commit so that you can recommit however you see fit.

To add this alias from the command line:

```bash
git config --global alias.undo reset HEAD~1 --mixed
```

Or directly in the `.gitconfig`:

```ini
[alias]
        undo = reset HEAD~1 --mixed
```

## git reset-author

Like I imagine a lot of people do, I run multiple git profiles on my machine. One for personal work and one for work. Occasionally, I mess up which profile I am using so I want to reset the commit author details. To do this, I run `git reset-author`. This does not make any other changes to the commit other than the author.

To add this alias from the command line:

```bash
git config --global alias.reset-author commit --amend --reset-author --no-edit
```

Or directly in the `.gitconfig`:

```ini
[alias]
        reset-author = commit --amend --reset-author --no-edit
```

## git sync

When working on different machines, or working with another person on the same branch, you may need to update your local branch to be inline with the remote branch. `git sync` does this for us by fetching, pulling then pushing our working branch. This command uses a function to run multiple git commands in one. To make your own custom function, the syntax is `!f() { <YOUR COMMANDS HERE>; };f`.

To add this alias from the command line:

```bash
git config --global alias.sync "!f() { git fetch --tags && git pull && git push; };f"
```

Or directly in the `.gitconfig`:

```ini
[alias]
        sync = "!f() { git fetch --tags && git pull && git push; };f"
```

## git refresh

Much like the aforementioned `git sync`, `git refresh` also brings a branch up to date but with a different branch. This is useful for updating say `task/my-task` with the latest version of `main`. To run the alias, the syntax is `git refresh <current branch> <base branch>`.

To add this alias from the command line:

```bash
git config --global alias.refresh "!f() { git switch $2 && git fetch && git pull && git switch $1 && git merge $2; };f"
```

Or directly in the `.gitconfig`:

```ini
[alias]
        refresh = "!f() { git switch $2 && git fetch && git pull && git switch $1 && git merge $2; };f"
```

## git history

On occasion I need to view the current status of my remote branch to see the names of the recent commits. Enter `git history` which provides you with a list of commits on a single, eg:

```ini
* 967c867 (HEAD -> dev, origin/dev, origin/HEAD) HighCPU fix
* 824a02b Fix
* 285a98a Bugfix
* fbf9d43 Cleanup
* 01f5275 Minor updates
* 9725077 Added sqs dispatcher code to sample
* e9326d7 Added dispatch metrics, small perf improvements
* 4ec2ff0 Performance improvements
* 903db9f Allowed SQS to be unbounded locally
* d8ff987 Version
* afbd67d Bug fix
* b912c54 Updated batching
* 1ab32db Version
* 4a5203e Fixed assembly lookup
* 7f7cd19 Guess what, packages
* 4a43ef7 Batched SQS Dispatcher. Configurable JSON Options. (#202)
* fa745d4 Nullable Reference Types
* 28aa04a Package update
* e435497 Fix typo in OpenMessage.Serializtion (#256)
* 1cc730c Updated packages
* d2991da Addresses #232,# 227, #237 (#238)
* 3893833 Updated packages
```

To add this alias from the command line:

```bash
git config --global alias.history log --oneline --graph
```

Or directly in the `.gitconfig`:

```ini
[alias]
        history = log --oneline --graph
```

That's it. Hopefully these little alias are useful in your workflows. Let me know on [Twitter](https://twitter.com/im5tu) if you have more that you want to share.

Happy aliasing!
