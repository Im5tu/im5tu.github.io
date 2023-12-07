---
title: "3 Easy Steps To Configuring Azure With Powershell"
description: Recently, I had to automate some tasks in Azure. This is the easiest way I could get started.
date: 2015-02-17T18:37:00Z
toc: true
includeInSitemap: true
tags:
- dotnet
- devops
---

Recently, I had to automate some tasks in Azure. This is the easiest way I could get started.
<!--more-->

Before we begin, ensure that you have a administrative powershell window and have set the execution policy to unrestricted:

```powershell
Set-ExecutionPolicy Unrestricted
#Confirm the settings afterwards with Get-ExecutionPolicy
```

## Step 1 - Download Settings

In order to download the settings you need to have a valid Azure administrative account and be logged in. Once you are logged in, use the powershell window to run the following command:

```powershell
Get-AzurePublishSettingsFile
```

This will open up the Azure portal and download the file to disk. Remember the path to the downloaded file as you will need this in the next step.

## Step 2 - Import Settings

Using the file downloading in the previous step, we can import the settings using the following commands, replacing `<pathToFile>` with the actual file:

```powershell
$settingsFile = "<pathToFile>"
Import-AzurePublishSettingsFile -PublishSettingsFile $settingsFile
```

This command sets up all of the available subscriptions for you in a nice easy manner.

## Step 3 - Verify

The last step is to verify that everything has been setup correctly. To do this, simply run the `Get-AzureSubscription` command:

```powershell
Get-AzureSubscription
```

You should see all of your settings in the powershell window. Profit!

*Don't forget how to remove your details once you are done!*
