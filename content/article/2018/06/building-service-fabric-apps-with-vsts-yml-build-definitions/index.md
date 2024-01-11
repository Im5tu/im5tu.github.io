---
title: "Building Service Fabric Apps With VSTS YML Build Definitions"
description: Publish an Service Fabric application using a VSTS YML build definition.
date: 2018-06-30T19:40:00+01:00
toc: true
includeInSitemap: true
tags:
- dotnet
- devops
---

In my [previous article](/article/2018/06/automated-builds-in-vsts-with-yml-build-definitions/), we setup a standarised build using the new YML build definitions within VSTS, using the .Net CLI tooling. In this article, we will use the same setup as our base, but we will build and publish a service fabric application.

<!--more-->

Our [sample build file](/article/2018/06/automated-builds-in-vsts-with-yml-build-definitions/) has the following steps:

1. Clean Sources
2. Install the Dotnet CLI
3. Restore Packages
4. Build Projects
5. Test Projects
6. Publish the Web App
7. Publish Build Artifacts
8. Tag VSTS Build

For our service fabric build, we will need the following steps:

1. Clean Sources
2. Install the Dotnet CLI
3. Restore Packages - csproj
4. **Restore Packages - sfproj (* New)**
5. Build Projects
6. Test Projects
7. **Publish the Service Fabric App (* New)**
8. **Update the Service Fabric App Version (* New)**
9. **Copy Publish Profiles (* New)**
10. Publish Build Artifacts
11. Tag VSTS Build

For the sake of brevity, I am going to only talk about the new steps in the sequence and the reasoning behind their existance but i'll include a full sample file at the end of the post.

## Restore Packages (SFPROJ)

At first, this step may seem a little strange. Currently, the service fabric tooling does not support the dotnet CLI properly, though it's getting better. The major hurdle is the restoring of the msbuild package that contains the targets - this does not seem to restore properly with the CLI, so I use an additional step using the old nuget commands:

```yml
- task: NuGetCommand@2
  displayName: Restore Packages (SF Projects)
  inputs:
    restoreSolution: $(packageProjects)
    restoreDirectory: '..\..\packages'
    feedsToUse: config
    nugetConfigPath: nuget.config
    noCache: true
    verbosityRestore: Normal
```

Here, `$(packageProjects)` is defined as `**/*.sfproj` allowing for multiple service fabric applications in a single solution. The only real difference between this step and the `dotnet restore` step from the previous article is the fact that we restore to the solution level packages folder instead of `dotnet restore`'s default location. This is because the targets in the sfproj are looking in this directory. Adjust `restoreDirectory` according to your own folder structure - I place all the sources under an `/src` folder for reference.

## Publishing the Service Fabric App

When it comes around to publishing the application(s), I usually create two versions, one in a debug build and one in release. Both are then published to the artifacts. The debug build is useful for downloading by other developers for use on their local machines and the release build is what is used for deployments. If you wish to mirror this, duplicate the step and replace Release with Debug.

```yml
- task: DotNetCoreCLI@2
  displayName: Package Projects (Publish - Release)
  inputs:
    projects: $(packageProjects)
    packDirectory: '$(Build.ArtifactStagingDirectory)\\drop\\release'
    arguments: '-c Release /p:Platform=x64 /p:Version=$(Build.BuildNumber) /t:Package /p:PackageLocation=$(Build.ArtifactStagingDirectory)\drop\release\applicationpackage'
```

***Note***: *Sorry about the formatting, see the full file at the end of the article for the proper formatting.*

In this step, we package directly to the artifact staging directory to make publishing to the build artifacts a lot easier later in the process. All of the output is placed inside of the `drop` folder as a way of differentiating between this artifact and others. Under the `drop` folder, we split based on the configuration type: Debug/Release. Both the debug and the release folder mirror the same folder structure which is an `applicationpackage` folder, containing the packaged code and the `projectartifacts` folder which will contain the publish profiles. So the full folder structure appears like:

```yml
/drop
    /debug
        /applicationpackage
        /projectartifacts
    /release
        /applicationpackage
        /projectartifacts
```

The only other element that I wish to point out is that service fabric applications have to be built as the `x64` platform.

## Update the Service Fabric App Version

I am currently unaware of the correct msbuild switch to set the version number of the service fabric application, so I use a built in step to change the manifest numbers to match the assembly numbers and ensure a rolling upgrade is possible on the service fabric cluster.

```yml
# Update the service fabric build numbers
- task: ServiceFabricUpdateManifests@2
  displayName: Update Service Fabric Version (Release)
  inputs:
    applicationPackagePath: '$(Build.ArtifactStagingDirectory)\\drop\\release\\applicationpackage'
    versionSuffix: '$(Build.BuildNumber)'
    versionBehavior: Replace
```

The `versionBehavior` parameter has two modes: Append/Replace. Since I always use the build number, which is always a semver version, I use the replacement mode. We look inside of the `applicationpackage` folder to find the manifest file, which is the location we previously published the application to.

## Copying Publish Profiles

In order to publish the service fabric application from the release area in VSTS, we need to copy the publish profiles that are defined with the project (unless you want to re-create them in the release pipeline, everytime!).

```yml
- task: CopyFiles@2
  displayName: Copy XML Files To Artifacts (Release)
  inputs:
    SourceFolder: 'src\'
    Contents: |
     **\*.ServiceFabric\PublishProfiles\*.xml
     **\*.ServiceFabric\ApplicationParameters\*.xml
    TargetFolder: '$(Build.ArtifactStagingDirectory)\drop\release\projectartifacts\'
    CleanTargetFolder: true
```

As mentioned previously, I keep the sourcecode under an `src` folder in the repository. Inside of that folder, we need to search for any xml files in the `PublishProfiles` and `ApplicationParameters` folders and place them in the `projectartifacts` folder as described previously. The only convention here is that my service fabric applications end in `.ServiceFabric` so you may need to adjust this for your own build scripts.

If you put all the pieces together, you should have a working service fabric build pipeline, along the lines of the following sample:

<script src="https://gist.github.com/Im5tu/3f114127c4174cb4e6602d6295b8c827.js"></script>
