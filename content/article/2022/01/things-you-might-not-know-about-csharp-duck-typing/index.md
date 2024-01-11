---
title: "Things you might not know about CSharp - Duck Typing"
description:
date: 2022-01-07T08:00:00Z
toc: true
includeInSitemap: true
series: "Things you might not know about CSharp"
tags:
- dotnet
---

This is the next part of my series taking a look at some of the lesser known features of the C# language. Today we will be looking at duck typing and how it is used in C#. Much like the previous article, your millage may vary in terms of actually using these features for day to day programming, so think of this series as raising awareness that these things exist, not that you should use for general purpose programming. Without further adieu...
<!--more-->

## What is Duck Typing

Many people have heard of the phrase _"If it walks like a duck and it quacks like a duck, then it must be a duck"_ a few times as a way to explain what duck typing is. Personally, I think much like the classic pre-mature optimization quote, a vital part of the explanation is missing.

Duck typing refers to the ability of the compiler to use an object for a specific purpose when it has certain properties, not that it is always a certain type (ie: a duck). In C# this means that a class/struct/interface has a specific combination of properties/methods with the correct arguments.

The rest of this article takes a look at a few ways that duck typing could be used in C#:

- Using a foreach on a class/struct/interface that doesn't implement `IEnumerable` or `IEnumerable<T>`
- Making anything awaitable

## Foreach loops without IEnumerable

One of the more uncommon but interesting things you can do is use a foreach loop over anything that could act like or generate a collection. Imagine that you want to write the following code:

```csharp
foreach (var i in 10)
    // do something with i with values 0-9
```

To make this code compile, we need to do one of two things:

1. Expose an instance method called `GetEnumerator()`
2. Build an extension method for the type that is called `GetEnumerator()`

Both of the methods must return a type that looks like something that implements `IEnumerator`, in other words, the type must have the following:

1. A property called `Current` which returns the current element in the sequence. The return type can be an object or any given `T`
2. A method called `MoveNext()` returning a boolean stating whether or not we were able to move to the next item in the sequence

Let's take a look a the simple implementation using an existing enumerator:

```csharp
public class Program {
    public static void Main() {
        foreach (var i in 10)
            Console.WriteLine(i);
    }
}

public static class Extensions
{
     public static IEnumerator<int> GetEnumerator(this int i) => Enumerable.Range(0, i).GetEnumerator();
}
```

_[Play with this example on sharplab.io](https://sharplab.io/#v2:C4LgTgrgdgNAJiA1AHwAICYCMBYAUKgBgAJVMAWAbj0JMwDoAZASygEcrdqBmE9WgdiIBvPETG8+I3OJlEAZgHswAUwCGAYwAWRABQA3VWCJNjUIpgIBKUbNukAnDqaWOMgL54PnfD1IA2XiIAUQAPYGUoAGcmBSi8KVlUX0wAgEkgqAgAW2UwVWAlAB4WYAA+IgBxZWAM7Nz8pR1gTSZI02BjSyIAXnLanLyAIwAbZToAJVUoAHNlHQIYTroqmsyBhrAdF3FPIA)_

The above code gets us to where we need to be, but sometimes we might not want to or can implement `IEnumerator`/`IEnumerator<T>` (ie: when we don't own the type). Luckily for us, Duck Typing can save us again by letting us implement something that looks like enumerator to achieve our goal:

```csharp
public class Program {
    public static void Main() {
        foreach (var i in 10)
            Console.WriteLine(i);
    }
}

public static class Extensions
{
     public static CustomEnumerator GetEnumerator(this int i) => new CustomEnumerator(i);
}

public class CustomEnumerator
{
    private int _limit;
    private int _current;

    public int Current => _current - 1;

    public CustomEnumerator(int limit) { _limit = limit; }

    public bool MoveNext()
    {
        if (_current < _limit)
        {
            _current += 1;
            return true;
        }

        return false;
    }
}
```

_[Play with this example on sharplab.io](https://sharplab.io/#v2:C4LgTgrgdgNAJiA1AHwAICYCMBYAUKgBgAJVMAWAbj0JMwDoAZASygEcrdqBmE9WgdiIBvPETG8+I3OJlEAZgHswAUwCGAYwAWRABQA3VWCJNjUIpgIBKUbNukAnDqaWOMgL54PnfD1IA2XiIAUQAPYGUoAGcmBSi8KVlUX0wAgGEISOAFAFsgqAhs5TBVLKMAcWVgPIKikqUdYE0mSNNgY0siAF4APiIoZQB3InTMnOrC4tKnF3FPPG5Akazc/Im6sHibMQAHMCYDcNaiAH0AGyZspmBXcV39kuUj4/UIMBUoa62iL6Sj9LeIm0eicXgCPkQALTmG5iH48JZjVa1KYsNrnS7ADpCE7oq5dIi465ELwyOFEABGCgUpyIAFkFHplAA5ZRhHTWaTiBK2YxyXTPV7vNoAHhxFyuHJ5wi+UoFYLaiE60JlPNQgmAkGUFFmnNsJJ5KrEavkqlOkS1Xy8biAA=)_

Although we can `foreach` over pretty much anything we want using duck typing, we cannot use other methods such as those provided by the LINQ [extension methods](/article/2012/12/extension-methods-in-dotnet/) as they rely on a specific interface implementation (ie: no `.Select(x => {})`).

Generally speaking, duck typing just for a foreach statement might not be particularly useful for our applications given that we have a concrete interface contract to follow, but there are more useful examples of duck typing in C# such as awaiting anything we want...

## Await anything

Much like being able `foreach` over anything, in order to `await` anything, we need to have a specific contract applied either on the instance of the type or via an extension method. The contract to be able to `await` anything requires us to expose a parameterless method called `GetAwaiter` with a return type that has the following attributes:

1. Implements `INotifyCompletion`
2. Has a property called `IsCompleted` with a return type of bool
3. Has a parameterless method called `GetResult` with a return type of `object` or `T` (where `T` is your custom result type)

Let's imagine that we want to implement the following code:

```csharp
public class Program {
    public static async Task Main() {
        await 1.Seconds();
    }
}

public static class Extensions
{
    public static TimeSpan Seconds(this int i) => TimeSpan.FromSeconds(i);
}
```

To make it compile, we need to add the aforementioned parameterless `GetAwaiter` method to the `TimeSpan` type. The simplest way of doing this is with the following code:

```csharp
public class Program {
    public static async Task Main() {
        await 1.Seconds();
    }
}

public static class Extensions
{
    public static TimeSpan Seconds(this int i) => TimeSpan.FromSeconds(i);
    public static TaskAwaiter GetAwaiter(this TimeSpan x) => Task.Delay(x).GetAwaiter();
}
```

_[Play with this example on sharplab.io](https://sharplab.io/#v2:CYLg1APgAgTAjAWAFBQAwAIpwKwG5lqZwB0ASgK4B2ALgJYC2ApsQMID29ADrQDaMBOAZQEA3WgGNGAZ3xICAZkwwiAdnQBvZOm2ZFWAGyYAHJkMBZAIa1KACgCUGrTudQAnOhLDxbSsCn3ZZwBfZ2Qg5AUiQ1h0AFEAD2pGSilaHylkTSQXPThDABUGRkFOC0p0Lx8/G2oAC1opdGtqJocAXgA+dEKmErLiADF+Dkrff1o7QJ0oXOj9AEEAdysk/nQAcUZqJZWBGvrGnuLS8vj2rqh9YgARRh4LAE8bM+JN7eXaVYCwoA==)_

In the above example, we are using the built in awaiter for `Task.Delay` - but we can also define our own awaiter type as shown below:

```csharp
public class Program {
    public static async Task Main() {
        await 1.Seconds();
    }
}

public static class Extensions
{
    public static TimeSpan Seconds(this int i) => TimeSpan.FromSeconds(i);
    public static TimeSpanAwaiter GetAwaiter(this TimeSpan x) => new TimeSpanAwaiter(x);
}

public class TimeSpanAwaiter : INotifyCompletion
{
    public bool IsCompleted => true;
    public Object GetResult() => null;

    public TimeSpanAwaiter(TimeSpan x)
    {
        // Not implemented for brevity
    }

    public void OnCompleted(Action continuation)
    {
        continuation();
    }
}
```

_[Play with this example on sharplab.io](https://sharplab.io/#v2:CYLg1APgAgTAjAWAFBQAwAIpwKwG5lqZwB0ASgK4B2ALgJYC2ApsQMID29ADrQDaMBOAZQEA3WgGNGAZ3xICAZkwwiAdnQBvZOm2ZFWAGyYAHJkMBZAIa1KACgCUGrTudQAnOhLDxbSsCn3ZZwBfZ2Qg5AUiQ1h0AFEAD2pGSilaHylkTSQXPThDABUGRkFOC0p0Lx8/G2oAC1opdGtqJocAXgA+dEKmErLiADF+Dkrff1o7QJ0oXIKivsoAQQB3KyT+dABxRmoVtYEa+sae4tLy+PauykZl7vmzvdp1mwvZcLkUPWUThcf19BA6AAkgA5Nh0ABmAE92Fw+HQfJknNoZugAEZsNg8YFSWGceGMYDoTroaj8ciMKYoxQAeTRACtGOIWttqKRpOQeNR7MSrpyeFT0MjdHdeg9Vk8Dj8zugLsKssEItlpnoACzoGmUPEE4A2LDKbw0azkCwIyh2eXC5yGuiUE1mgLC95BIA)_

Whilst I haven't implemented the custom awaiter for brevity - I wanted to show you that it is possible should you need to be able to do this. There are uses of duck typing that you probably use today without realising it...

## Duck Typing in ASP.NET Core

In ASP.NET Core, there are two main areas were duck typing is used: the Startup class & within Middleware components. Consider the following startup class:

```csharp
public class Startup
{
    public void Configure(IApplicationBuilder app)
    {
        app.UseRouting();
        app.UseEndpoints(endpoints => endpoints.Map("/", async ctx => await ctx.Response.WriteAsync("Hello world!")));
    }
}
```

The startup class does not require the use of an interface as the minimum requirement for this class is that it includes a `Configure` method accepting an `IApplicationBuilder`. It doesn’t even have to be called `Startup`, it can have any name you want - startup is just the convention that Microsoft chose when they introduced the concept. If we were to remove the `Configure` method or rename it, then the code would compile successfully but fail at runtime. This is one of the major downsides of duck typing, as everything is late bound, it's not necessarily possible to detect whether the signature is correct at compile time.

Another area of ASP.NET Core where duck typing is used is in middleware components. Let's take a look at [this example](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/middleware/write?view=aspnetcore-6.0) from the docs:

```csharp
public class RequestCultureMiddleware
{
    private readonly RequestDelegate _next;

    public RequestCultureMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var cultureQuery = context.Request.Query["culture"];
        if (!string.IsNullOrWhiteSpace(cultureQuery))
        {
            var culture = new CultureInfo(cultureQuery);

            CultureInfo.CurrentCulture = culture;
            CultureInfo.CurrentUICulture = culture;
        }

        // Call the next delegate/middleware in the pipeline.
        await _next(context);
    }
}
```

Again, we see that there is no interface or abstract class as part of the inheritance chain, so for this to work the signature of the methods must be correct at runtime. The minimum signature expected here is `public Task InvokeAsync(HttpContext context)`. This contract is not strict as you can pass in dependencies as shown in the later example from the docs:

```csharp
public class MyCustomMiddleware
{
    private readonly RequestDelegate _next;

    public MyCustomMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    // IMessageWriter is injected into InvokeAsync
    public async Task InvokeAsync(HttpContext httpContext, IMessageWriter svc)
    {
        svc.Write(DateTime.Now.Ticks.ToString());
        await _next(httpContext);
    }
}
```

And that's it for this article, hopefully you have a good understanding of how and where duck typing is used in C#. Personally, I'm not a massive fan of duck typing, though I do see how it can be incredibly useful in lower level constructs to build extensions for things that you don't necessarily own. I hope that you've learnt something new and have another tool in your toolbox.
