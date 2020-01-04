{
   "categories": [ "Development" ],
   "date": "2015-02-23T18:37:14Z",
   "description": "Here I show you how to quickly get up and running with powershell and git.",
   "tags": [ "powershell", "git" ],
   "title": "Up And Running With Git And Powershell"
}

We've all experienced a time where we use our pc's for a prolonged period of time, accumulating a ton of crap along the way as we try out various technologies and fads. After a while, the pc begins to do funny things like crash for no apparent reason. This week, I needed to rebuild my dev machine and decided to change from Atlassian's Source Tree over to Powershell and raw git.<!--more-->

If i'm honest, i wish I made the change earlier. I no longer have a confusing UI to deal with, just me, my memory and when that fails, Google. So in this post, I will show you what I've done in hopes that it will help someone else. We will run through:

- Setting up git for the first time
- Setting up Powershell so we can use git
- Creating better diffs with `Out-Diff`
- Creating helper functions and setting up a powershell profile

## Setting up git for the first time

First of all, you need to download the latest version of git from [here](http://git-scm.com/download/win). At the time of writing, the version is: 1.9.5 released 2 months ago. When you start the setup program, everything is down to personal preference (eg: where you install, windows explorer integration) until you see the following screen:

![Select the middle option](/img/up-and-running-with-git/Git-install-command-prompt.png "Select the middle option")

It is important that you do not pick the top option here unless you are comfortable editing environment variables. The second option is the best for most windows users as this does the environment variables for you.

Following this, it is another case of common sense rules with choosing the style of line endings you need, typically checkin as-is suits (the last option).

When this is done, verify by heading into powershell/command prompt and typing:

    git

This should produce something similar to the following output:

    usage: git [--version] [--help] [-C <path>] [-c name=value]
               [--exec-path[=<path>]] [--html-path] [--man-path] [--info-path]
               [-p|--paginate|--no-pager] [--no-replace-objects] [--bare]
               [--git-dir=<path>] [--work-tree=<path>] [--namespace=<name>]
               <command> [<args>]

    The most commonly used git commands are:
       add        Add file contents to the index
       bisect     Find by binary search the change that introduced a bug
       branch     List, create, or delete branches
       checkout   Checkout a branch or paths to the working tree
       clone      Clone a repository into a new directory
       commit     Record changes to the repository
       diff       Show changes between commits, commit and working tree, etc
       fetch      Download objects and refs from another repository
       grep       Print lines matching a pattern
       init       Create an empty Git repository or reinitialize an existing one
       log        Show commit logs
       merge      Join two or more development histories together
       mv         Move or rename a file, a directory, or a symlink
       pull       Fetch from and integrate with another repository or a local branch
       push       Update remote refs along with associated objects
       rebase     Forward-port local commits to the updated upstream head
       reset      Reset current HEAD to the specified state
       rm         Remove files from the working tree and from the index
       show       Show various types of objects
       status     Show the working tree status
       tag        Create, list, delete or verify a tag object signed with GPG

    'git help -a' and 'git help -g' lists available subcommands and some
    concept guides. See 'git help <command>' or 'git help <concept>'
    to read about a specific subcommand or concept.

If you get that, you're ready for the next step. Otherwise, you will need to add the path to your git installation to the environment variables.

## Setting up Powershell so we can use git

Before you being, verify execution of scripts is allowed with `Get-ExecutionPolicy` (should be `RemoteSigned` or `Unrestricted`). If scripts are not enabled, run PowerShell as Administrator and call `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Confirm`.

After you have verified the execution policy above, you will be able to run the following script:

```powershell
(new-object Net.WebClient).DownloadString("http://psget.net/GetPsGet.ps1") | iex
Install-Module posh-git
```

This will do two different things:

1. Install [PsGet](http://psget.net/) into powershell. It allows for easy installation of powershell modules.
2. Install [Posh-git](https://github.com/dahlbyk/posh-git). The best way to deal with git from powershell in windows.

After the installation, you will see the following output in the console (highlighted in bright green, so its easier to see):

    PsGet is installed and ready to use
    ... omitted for brevity
    Module posh-git was successfully installed.

If you don't see that, refer to the installation guides of the various modules as listed above. Otherwise, we are technically done setting up powershell with git. Now we can do awesome things such as download new powershell modules from the ps-get directory, view the current status of a git repo and much much more.

*A repository will now show something along the lines of the following if you feel the need to verify:*

```powershell
C:\Dev\sblackler.github.io [master +1 ~2 -0 !]>
```

## Creating better diffs with Out-Diff

Some of the output that we get using the built in `git diff` command is a little horrid:

![Sample output](/img/up-and-running-with-git/git-diff-powershell.PNG "Sample Output")

What [Out-Diff](http://psget.net/directory/out-diff/) does is create a unifed diff for you using the [Unified Diff Format](http://en.wikipedia.org/wiki/Diff_utility#Unified_format).

To install the `Out-Diff`, use the same powershell console as earlier and type/copy:

```powershell
Install-Module Out-Diff
```

After that you should see the following confirmation:

```powershell
Module out-diff was successfully installed.
```

Now, when we run out `git diff` command, we add a slight twist pointing it to the `Out-Diff` function like:

```powershell
git diff | Out-Diff
```

This results in brighter colours in the console and slightly cleaner output. If the output of git diff consists of many lines of text, PowerShell will redirect them to the Out-Diff function one line at a time. This is called a streaming pipeline and it allows PowerShell to be responsive and consume less memory even when processing large amounts of data.

## Creating helper functions and setting up a powershell profile

The current powershell profile we are in comes in a variable called `$PROFILE` and we can hack this to do what we want. First of all, you need to expand that variable in the powershell window eg:

```powershell
$PROFILE
C:\Users\stuar_000\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1
```

Now we can access the profile in one of two ways, through powershell or through our editor of choice. I choose powershell, naturally. To edit this through powershell, type:

```powershell
ise $PROFILE
```

Which launches the powershell scripting environment. Currently, my profile is blank and only loads the `Posh-git` sample profile:

```powershell
# Load posh-git example profile
'C:\Users\stuar_000\Documents\WindowsPowerShell\Modules\posh-git\profile.example.ps1'
```

When you reload the powershell console you may have seen that it couldn't find the ssh-agent. This is something that we can fix here. To do that, add the following line to the top of the file:

```powershell
$env:path += ";" + (Get-Item "Env:ProgramFiles(x86)").Value + "\Git\bin"
```

Unfortunately we have to do this because msysgit doesn't automatically add that folder to the path variable. Then we can do really cool things after the `Posh-git` profile has been loaded like setting our base directory:

```powershell
Set-Location C:\Dev
```

Creating a better diff function so that we don't have to type it out everytime:

```powershell
function gdiff(){
    git diff -U5 | Out-Diff
}
```

Or ever start our preffered IDE when we hit a solution file (vs only):

```powershell
function ide(){
    $files = Get-ChildItem *.sln -Recurse
    foreach($file in $files){
        Start-Process $file.Name
    }
}
```

Here is only a small number of things that you can do now. So go git the power(shell). When you're done save the profile and reload the powershell console for the changes to take effect.