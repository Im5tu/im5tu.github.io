---
title: SAP Business One V9 Version Strings
description: Reviewing a list of SAP B1 Version Strings
date: 2014-03-15T13:18:01Z
toc: true
includeInSitemap: true
tags:
- sap
---

Today I had to figure out what the current version of SAP Business One is. In order to do this, I looked at the table SFMD inside of SBO-Common and found the following results<!--more-->:

 Version | Patch Level
    -----------------------
 900046 | 00
 900052 | 01
 900053 | 01 Hotfix 1
 900055 | 03
 900056 | 04
 900058 | 06
 900059 | 07
 900060 | 08
 902000 | 09
 902001 | 09 Hotfix 1
 902002 | 10

*Note: I added the Hotfix 1 to clarify. I believe these are correct as I can't find a definitive source to verify these results.*

Then to check the target database version, I ran the following against the target database:

    SELECT [Version] FROM [CINF]

There might be a better way of doing this. This article proposes a single solution. If you have an alternative solution, please notify me through social media.
