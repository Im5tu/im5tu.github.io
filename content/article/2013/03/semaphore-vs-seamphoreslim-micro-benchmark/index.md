---
title: Semaphore vs SeamphoreSlim Micro Benchmark
description: A micro-benchmark to demonstrate the performance difference between the Semaphore and SemaphoreSlim classes in C#
date: 2013-03-11T18:06:28Z
toc: false
includeInSitemap: true
tags:
- dotnet
---

In this post, I am going to show a small micro-benchmark to demonstrate the performance difference between the `Semaphore` and `SemaphoreSlim` classes in C#. A `Semaphore` is often used to restrict the number of threads than can access some (physical or logical) resource. In this case, we want the restriction to be as little as possible.
<!--more-->

Semaphores are of two types: local semaphores and named system semaphores. If you create a Semaphore object using a constructor that accepts a name, it is associated with an operating-system semaphore of that name. Named system semaphores are visible throughout the operating system, and can be used to synchronize the activities of processes. You can create multiple Semaphore objects that represent the same named system semaphore, and you can use the OpenExisting method to open an existing named system semaphore. *[Source](http://msdn.microsoft.com/en-gb/library/system.threading.semaphore.aspx)*

A local semaphore exists only within your process. It can be used by any thread in your process that has a reference to the local Semaphore object. Each Semaphore object is a separate local semaphore. *[Source](http://msdn.microsoft.com/en-gb/library/system.threading.semaphore.aspx)*

The machine that I am using for this benchmark is a Intel core i3, clocked at 4ghz with 4GB DDR3 ram running Windows 7 x64 SP1 and .Net Framework 4.5.

In order to begin the test, I created a new console application and imported the BMark package from the [NuGet](https://nuget.org/packages/BMark/) repository. Next, I added the following code to the application as shown below:

```csharp
const Int32 count = 106;

Semaphore regularSemaphore = new Semaphore(count, count);
SemaphoreSlim slimSemaphore = new SemaphoreSlim(count, count);

UInt64 amountToRun = (UInt64)(count - PerformanceTester.PreRunAmount - 2);

PerformanceTester.Run("Semaphore.WaitOne", amountToRun, () => { regularSemaphore.WaitOne(); });
PerformanceTester.Run("Semaphore.Release", amountToRun, () => { regularSemaphore.Release(); });
PerformanceTester.Run("SemaphoreSlim.WaitOne", amountToRun, () => { slimSemaphore.Wait(); });
PerformanceTester.Run("SemaphoreSlim.Release", amountToRun, () => { slimSemaphore.Release(); });

Console.WriteLine(PerformanceTester.GetResults());
```

By default, the `PerformanceTester` will run each test 4 times before starting the actual timed test. Since we are dealing with a blocking resource, I added some extra capacity so that the test would not block at any point. When the code is run in release mode without the debugger, the output of the program is:

```
    Semaphore.WaitOne:         0.09ms    NumberOfSamples: 100
    Semaphore.Release:         0.05ms    NumberOfSamples: 100
    SemaphoreSlim.WaitOne:     0.01ms    NumberOfSamples: 100
    SemaphoreSlim.Release:     0.01ms    NumberOfSamples: 100
```

As the results show, the `SemaphoreSlim` class is a tiny bit quicker. After testing this myself earlier, I thought that others could run this themselves and hopefully receive a small increase in performance in their applications. The reason for the performance increase is because the `SemaphoreSlim` class provides a lightweight alternative to the `Semaphore` class that doesn't use Windows kernel semaphores.

In essence, if you do not need a named `Semaphore`, use the `SemaphoreSlim` class.
