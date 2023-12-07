---
title: "Implementing Simple Feature Toggles In AspNetCore Using IConfiguration"
description: A look into how we implement simple feature toggles using IConfiguration
date: 2020-08-29T11:45:00+01:00
toc: true
includeInSitemap: true
tags:
- dotnet
---

Recently, we've had the need to build a few feature toggles in our applications that can be changed at runtime. This article walks through a simple approach that you can use in your applications, including a description of a route to dynamic feature toggles.

<!--more-->

We've built out our feature toggle system on top of the `IConfiguration` in ASP.NET Core as we do not need anything particularly fancyand we already have the packages referenced in our applications. If we needed something more advanced, we would take a look into one of the many available packages. If you just need something simple, you're in the right place.

If you already know what feature toggles are and you're familiar with the configuration model in ASP.NET Core, jump straight to [Building out simple feature toggles using IConfiguration](#building-out-simple-feature-toggles-using-iconfiguration).

## What are feature toggles?

Also known as feature flags, feature toggles are a technique in software development to enable certain functionality in an application. Typically this happens when releasing new functionality to consumers, but can also be used to sunset features or provide a global on/off switch (for example).

## Configuration System in .NET Core

Since the beginning of .NET Core, the ASP.NET team has rebuilt the [configuration](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-3.1) and [options](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/options?view=aspnetcore-3.1) system to provide a decent abstraction that can be used inside and outside of ASP.NET Core. The configuration is provided by the [Microsoft.Extensions.Configuration](https://www.nuget.org/packages/Microsoft.Extensions.Configuration) NuGet package. This package takes care of the "how do I locate my settings" part of the problem by providing an simple `IConfiguration` abstraction.

The second part of the problem is accessing the configuration, which is where the [options model](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/options?view=aspnetcore-3.1) comes into play. The [Microsoft.Extensions.Options](https://www.nuget.org/packages/Microsoft.Extensions.Options) package gives us abstractions to retrieve configuration from the `IConfiguration` abstraction the configuration model provides, while providing hooks for validation and post-configuration.

Both the configuration and options packages are included by default when building out an ASP.NET core application. For service workers, you may need to install these packages manually.

## Building out simple feature toggles using IConfiguration

In order to build a simple feature toggle system, we first need a class that will hold our feature toggles:

```csharp
public class FeatureToggles
{
    public bool MyFirstToggle { get; set; }
}
```

Next, we need to add a new configuration source to our host builder which tells the application where we should look for our configuration:

```csharp
Host.CreateDefaultBuilder()
    .ConfigureAppConfiguration(builder => {
        // Adds environment variables prefixed with STU_TEST
        // Note: the prefix will be removed from the environment variable
        builder.AddEnvironmentVariables("STU_TEST");
    })
    .Build()
    .Run();
```

So long as the configuration provider you added supports the updating of a feature flag, it can be changed at runtime from an external source like [consul](https://www.consul.io/), or even within your application itself. When we have our configuration source configured, we need to tell our application how to link a configuration section to the `FeatureToggles` class:

```csharp
public class Startup
{
    public IConfiguration Configuration { get; }

    public Startup(IConfiguration configuration) { Configuration = configuration; }

    public void ConfigureServices(IServiceCollection services)
    {
        // May require you to include Microsoft.Extensions.Configuration.Binder
        services.Configure<FeatureToggles>(Configuration.GetSection("FeatureToggles"));
    }
}
```

In the sample above, we have injected the application configuration into the startup class so that we can access all of the configuration that has built because we need access to the `FeatureToggles` section of that configuration. The only bit that is left is to access the configuration:

```csharp
public class SampleController : ControllerBase
{
    private readonly FeatureToggles _featureToggles;

    public SampleController(IOptionsSnapshot<FeatureToggles> featureToggles)
    {
        _featureToggles = featureToggles.Value;
    }

    [HttpGet("/my-first-toggle")]
    public IActionResult MyFirstToggle()
    {
        return Ok($"The value of MyFirstToggle is: {_featureToggles.MyFirstToggle}");
    }
}
```

If we now submit a request to `/my-first-toggle` we should now see the current value returned to us as part of the response. When consuming the options from a scoped context, eg: a http request, ensure to always use `IOptionsSnapshot<T>` (or `IOptionsMonitor<T>` if snapshot is not possible - but check the documentation to view the differences) as this ensures consistency for the settings in that scope and has some additional performance benefits.

That's it, simple feature toggles. Happy Toggling!
