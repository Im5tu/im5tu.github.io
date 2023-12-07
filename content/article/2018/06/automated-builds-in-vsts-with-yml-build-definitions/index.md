---
title: "Automated Builds in VSTS with YML Build Definitions"
description: Publish an ASPNET Core website using a VSTS YML build definition.
date: 2018-06-17T21:35:00+01:00
toc: true
includeInSitemap: true
tags:
- dotnet
- devops
---

In this article we will explore a preview feature inside of Visual Studio Team Services (VSTS) called YML Build Definitions. In essence, this allows you to change your build process from a `.yml` file in your git repository much in the same way as you can do with other services such as AppVeyor. During the article, we will setup a build definition for an Aspnet Core website.

<!-- more -->

## Prerequisites

Before we take a look at the struture of the file, you will need to complete the following tasks:

1. Setup a git repository inside of VSTS
2. Enable the preview feature (requires account level administration access)

For the sake of brevity, I will assume that you already have administrator access to your VSTS account and that you have a git repository already setup. If you need to know how to setup a git repository inside of VSTS, please use [this guide](https://docs.microsoft.com/en-us/vsts/git/create-new-repo?view=vsts).

Enabling a preview feature inside of VSTS requires that you have administration access to your account, not just your team project. If you do not have access, or unable to obtain access, you will be unable to follow the rest of the article. Once you have secured administrator level access, use the [following guide](https://docs.microsoft.com/en-us/vsts/project/navigation/preview-features?view=vsts) to enable the "YML Build Definition" preview feature.

## Say hello to `.vsts-ci.yml`

The way that VSTS has implemented the automated build system, is nothing short of excellent. They have used a convention based approach to locating the file and have built the system on top of existing tasks in your VSTS account. Unfortunately, task groups do not work as yet, but there is a templating feature which may be useful in some instances.

In order to use the feature, you need to create a `.vsts-ci.yml` file in the root of the repository. It is worth noting that this file is white-space sensitive so pay attention to that from the outset. Once this file is committed to the repository, it will automatically run everytime one or more commits are pushed to VSTS. Just like regular builds, the YML Build Definition builds integrate seamlessly into the pull request system inside of VSTS.

The first build, once the file has been pushed, takes a little longer than use as VSTS has to create all the required build parts for the first time. In your build definitions inside of VSTS, you will see a new definition in the following naming convention:

    <repository name> CI

If I had a repository called `hello-world-web` then the build defintion that you can search for will be `hello-world-web CI`.

The file we will create follows the following structure:

```yml
name: <version number>
triggers:
    <list of triggers>
variables:
    <list of variables>
steps:
    <our build process>
```

The `name` property, from what I can tell, represents the build number which we can extract later on in the build process. `triggers` allows us to only trigger when the required conditions are met. `variables` are an invaluable part of the build definition. I always try and variable anything useful as the build files can become quite lengthy depending on your desired process. Lastly, `steps` is where all of the build process is defined. The build files do support phases, but i am keeping that out of scope for this article. For the remainder of the article, we will assume the build number is `0.1.0` or `name: 0.1.0` in the yml file.

**Note:** _At the end of this article, there is a complete file that you can use as a template._

## Setting up triggers

If you do not specify a trigger section, VSTS will run a build for every branch that you ever commit/push to regardless of what it's called. I usually setup my builds to automatically trigger on any feature/bugfix/release/hotfix branch and, naturally, the master branch. To do this, configure the section as follows:

```yml
    trigger:
        branches:
            include:
            - master
            - hotfix/*
            - release/*
            - feature/*
            - bugfix/*
```

The full syntax, if you choose to use it, is:

```yml
    trigger:
    branches:
        include: [string]
        exclude: [string]
    paths:
        include: [string]
        exclude: [string]
```

The shorter, inclusive only syntax is:

```yml
    trigger:
        [string]
```

Personally, I prefer the full syntax, but it doesn't make a difference as I typically only use inclusive only filters. Where `[string]` is present, either place a single entry or if multiple entries are required, follow my example where I place `-` on the start of each new line of the element.

One last point to note, if you setup your branching policies in VSTS to require a build from the yml build definition, this will always be triggered regardless of the settings in this section - as far as I am aware.

## Using variables

You do not have to use variables in your scripts. If you decide to, they can be extremly powerful. The variables can be passed to task inputs using the macro syntax `$(variableName)`, or accessed within a script using the environment variable. For an example of how the alternative syntaxes, see the [documentation](https://github.com/Microsoft/vsts-agent/blob/master/docs/preview/yamlgettingstarted-phase.md):

```yml
    variables:
       buildConfiguration: 'Release'
       buildProjects: '**/*.csproj'
       testProjects: '**/*Tests*.csproj'
       publishProject: 'src\CHANGEME\CHANGEME.csproj'
       dotnetCliVersion: '2.1.300'
```

In our script that we are building, we have some simple variables for some of the key sections of our code. It can be incredibly easy to parameterise everything, but I would advise only do that which is necessary.

## The build pipeline

As mentioned earlier in the article, I will be walking through how to create a build pipeline for a sample Aspnet Core website. In order for us to have something to publish-able at the end of the build, I will take you through the following:

1. Cleaning the sources (Issue #4 at the end of the article)
2. Ensure the dotnet CLI is installed
3. Run the build in release mode
4. Run the tests in release mode
5. Publish the website to the artifact directory of the VSTS build
6. Label the VSTS build with the build number

## Cleaning Sources

As a best practise, the first thing that I do in a build process is to reset the state of the repository. This prevents any issues such as false positives from previous builds etc. In order to do this, we can execute a small git magic:

```yml
    steps:
    - script: |
      git clean -d -x -f

      displayName: Clean Sources
```

This portion is declared directly under the `steps:` section in the yml file. Inline scripts, as shown above, are limited to around 500 characters at the time of writing. So you may need to get inventive with your scripts or use an external file (out of scope for this article). As the file is whitespace sensitive, there is no need for quotation marks around most things, so we can just type `Clean Sources` and the space will be preserved in the name of the step when we view it inside of VSTS.

For completeness, the git options entered are:

- `-d`: Removes untracked files
- `-x`: Basically removes everything regardless of whether or not it's in the `.gitignore`
- `-f`: Force the clean operation

In my testing, these options successfully remove the build output if present.

## Ensuring the dotnet CLI in installed

Depending on where you are running your build process, you may or may not need this step, but I always include it for completeness. This steps checks for the specified version of the dotnet CLI and installs it if it is not present. We pull the version from a variable, which I'll cover later.

```yml
    - task: DotNetCoreInstaller@0
    displayName: DotNet CLI Installer
    inputs:
        version: $(dotnetCliVersion)
```

This should be placed under the definition of Clean Sources above. For each of the remaining steps, place them directly after the last step you entered, unless you want to change the order of the process (the build executes the steps from top to bottom - so the first one in the file is the first one to be run).

## Building the projects

In order to build the project(s), I use a two step process: restore the required nuget packages using a nuget.config file, followed by building the projects.

```yml
    - task: DotNetCoreCLI@2
    displayName: Restore Packages
    inputs:
        command: restore
        feedsToUse: config
        nugetConfigPath: 'nuget.config'
        projects: $(buildProjects)
        noCache: true
        verbosityRestore: Normal
```

In the above snippet, the first thing that I want to mention is that I am using a variable to decide which projects I want nuget packages to be restored for.The projects directive supports a wildcard approach, so we can declare a folder structure such as `**/*.csproj` should we want to. Next, I had to set the `noCache: true` directive as I always wanted the latest versions from the nuget feeds. This shouldn't be required on hosted build servers, but may be needed for your own build servers. Lastly, I set the verbosity level back to normal, where the default is detailed. This massively cleans up the corresponding build logs. I'll leave it up to you, the reader, to extract this to a variable should you wish too.

```yml
    - task: DotNetCoreCLI@2
    displayName: Build Projects
    inputs:
        projects: $(buildProjects)
        packDirectory: '$(Build.ArtifactStagingDirectory)'
        arguments: '-c $(buildConfiguration) /p:Version=$(Build.BuildNumber)'
```

Once again, I have used a couple of variables. The first is the projects to build which is the exact same definition as in the previous step. The second variable is the configuration that we wish to build. In this case, I always have my automated builds built in `Release` mode - so this is how i've defined this variable. Last but by no means least, I set version number in the arguments so the assemblies are versioned correctly.

## Testing the projects

Testing is always a part of my pipeline, regardless of whether or not the solution actually contains any tests at the current time. Luckily, if tests are not present when this step runs, then there is a only a warning on the step rather than a failing build.

```yml
    - task: DotNetCoreCLI@2
    displayName: Test Projects
    inputs:
        command: test
        projects: $(testProjects)
        publishTestResults: true
        arguments: '--no-build -c $(buildConfiguration)'
```

You may of noticed that I used a separate variable for the projects that I wish to test (`$(testProjects)`). For me, this is just a subset of the projects that I have already built and I always want to run in the same configuration that I built in. This allows me to pass in the `--no-build` argument, saving a small amount of time on executing the tests. Luckily, the built in task for tests can automatically publish the test results (if available) via the `publishTestResults: true` input.

## Publishing the website

_Sorry about some of the formatting in this section. See the full file at the end of this article for the proper formatting. I will sort this out eventually._

There are two steps in publishing our website. The first is to build the project with the runtime, placing the output in a staging directory. The second part is taking the build output from the staging directory and publishing it to the artificts of the build.

```yml
    - task: DotNetCoreCLI@2
    displayName: Publish Web App
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/master'))
    inputs:
        command: publish
        projects: $(publishProject)
        arguments: '-c Release --self-contained -r win7-x64 -o $(Build.ArtifactStagingDirectory)/drop /p:Version=$(Build.BuildNumber)'
```

This is the first time that we have used a condition. The default condition is `succeeded()` which means "only run this step if the previous one completed successfully". Here I have said, where the previous step completed successfully and the branch that's being built is the `master` branch. For some of our builds we only publish on the master branch, though it can be handy to have this step in place for pull requests etc. It purely depends on the requirements on your build pipeline.

Taking a look at the arguments, I want to point out the use of: `--self-contained`, `-r` and `-o`. They have the following attributes:

- `--self-contained`: Publish the .NET Core runtime with your application so the runtime doesn't need to be installed on the target machine.
- `-r <runtime>`: Publish the project for a given runtime.
- `-o <directory>`: This places the build output into the specified directory. In our case, it's a folder called `drop` inside of the VSTS staging directory. You do not need to manually create these folders, VSTS takes care of this for you.

The next step is to publish the artifacts so we can use it after the build completes:

```yml
    - task: PublishBuildArtifacts@1
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/master'))
    inputs:
        pathtoPublish: '$(Build.ArtifactStagingDirectory)/drop'
        artifactName: 'drop'
        publishLocation: Container
```

This step takes the contents of the `drop` folder in the staging area, and copies it to the published artifacts `drop` directory. Occassionally, I build and package multiple projects, so I have them split out in the staging/published areas in separate folders. This, however, is not required.

## Labelling the Build

This section requires the [following extension](https://marketplace.visualstudio.com/items?itemName=YodLabs.VariableTasks) to be installed. Though there may be another, built in, way to complete the same task. In my real builds, I usually have multiple tags for our release process. To add additional tags, enter another line at the same indentation as `Build-$(Build.BuildNumber)`.

```yml
    - task: YodLabs.VariableTasks.AddTag.AddTag@0
    displayName: Tag VSTS Build
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/master'))
    inputs:
        tags: |
        Build-$(Build.BuildNumber)
```

Once this task completes, you should have a tag on your build like: `Build-0.1.0`.

## Final file

As I mentioned near the start of the article, the `.vsts-ci.yml` file is whitespace sensitive, so for completeness, here is a sample file that you can use for your own builds.

<script src="https://gist.github.com/Im5tu/3ed84e07f4db212440b56a4b84d4ad3e.js"></script>

## Teaching yourself

Although I have covered a very basic process here, there are two ways that you can discover the features currently available in the preview feature. Firstly, you can create a build definition manually adding in the relevant tasks to your process. Once you are ready, click on the phase that you are interested in then look for the `View YAML` option in the right hand pane. Alternatively, there is the [preview documentation](https://github.com/Microsoft/vsts-agent/blob/master/docs/preview/yamlgettingstarted.md). I used both approaches to teach myself how to do the builds. The documentation could do with a little bit more detail in places, so a lot of this is currently experimentation.

## Potential Issues

I wanted to include this section, because there are a few things that I have noticed that doesn't quite work as expected, or at all in some cases:

1. Changing the queue using the `queue:` setting does not appear to work. I have tried using a variety of syntaxes in a few different places (top level/phases) but nothing seems to work at the moment. So you have to change the build manually if this is an issue for you.
2. In order to perform git operations from the command line, you need to either:
    - Use the VSTS API and API token system to perform the action
    - Give the project collection build user account `Contributor` access to your repository
3. When I experimented with using the git command line to tag our repositories, the command to push to the repository seemed never to complete or timeout (it was "pushing" for well over 5 minutes)
4. You can get build server re-use which can lead to incremental builds rather than a clean build, which can have some disasterous consequences. So for all of my builds, I force git to clean all of the sources before I do anything for the current build.

I'm sure that all of these issues will be resolved in due course as more and more support is added to the feature. It is well worth using if it works for your scenario. In a future article, I will show you how to publish a SQL project, Service Fabric project and Nuget package all from a YML Build Definition.
