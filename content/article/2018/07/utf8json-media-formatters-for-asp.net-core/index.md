---
title: "Utf8Json Media Formatters for ASP.Net Core"
description: An updated sample of the input/output media formatters which use Utf8Json as the serialisation library
date: 2018-07-29T16:40:00+01:00
toc: true
includeInSitemap: true
tags:
- dotnet
- aspnetcore
---

Recently, I have been looking at the [Utf8Json](https://github.com/neuecc/Utf8Json) project and evaluating for use in our high performance payments API. Looking at the benchmarks on the Github page, and running my own benchmarks, the numbers stated seemed to tally up, so I built a few media formatters for aspnet core.

<!--more-->

Now, the project does already ship with some media formatters as a separate nuget package. However, I wanted to improve the following things:

- Add support for the media type `application/problem+json` by letting the server define the content type
- Return a `NoValue` result on the input formatter when the request body is zero lengthed
- Only read input values when they are of type `application/json`

Whilst not massive improvements, they may still help others. The formatters can be added via the `InputFormatters`/`OutputFormatters` properties when configuring the options for `UseMvc`. The only problem that I am aware of, is that occassionally the deserializer does not map some camel cased proeprty names. I have dug into this problem yet as my initial evalution has finished but I suspect it's to do with the default resolver naming convention used.

## Utf8Json Input Media Formatter

```csharp
using Microsoft.AspNetCore.Mvc.Formatters;
using System.Threading.Tasks;
using Utf8Json;

internal sealed class Utf8JsonInputFormatter : IInputFormatter
{
    private readonly IJsonFormatterResolver _resolver;

    public Utf8JsonInputFormatter() : this(null) { }
    public Utf8JsonInputFormatter(IJsonFormatterResolver resolver)
    {
        _resolver = resolver ?? JsonSerializer.DefaultResolver;
    }

    public bool CanRead(InputFormatterContext context) => context.HttpContext.Request.ContentType.StartsWith("application/json");

    public Task<InputFormatterResult> ReadAsync(InputFormatterContext context)
    {
        var request = context.HttpContext.Request;

        if (request.Body.CanSeek && request.Body.Length == 0)
            return InputFormatterResult.NoValueAsync();

        var result = JsonSerializer.NonGeneric.Deserialize(context.ModelType, request.Body, _resolver);
        return InputFormatterResult.SuccessAsync(result);
    }
}
```

## Utf8Json Output Media Formatter

```csharp
using Microsoft.AspNetCore.Mvc.Formatters;
using System.Threading.Tasks;
using Utf8Json;

internal sealed class Utf8JsonOutputFormatter : IOutputFormatter
{
    private readonly IJsonFormatterResolver _resolver;

    public Utf8JsonOutputFormatter() : this(null) { }
    public Utf8JsonOutputFormatter(IJsonFormatterResolver resolver)
    {
        _resolver = resolver ?? JsonSerializer.DefaultResolver;
    }

    public bool CanWriteResult(OutputFormatterCanWriteContext context) => true;

    public Task WriteAsync(OutputFormatterWriteContext context)
    {
        if (!context.ContentTypeIsServerDefined)
            context.HttpContext.Response.ContentType = "application/json";

        if (context.ObjectType == typeof(object))
        {
            return JsonSerializer.NonGeneric.SerializeAsync(context.HttpContext.Response.Body, context.Object, _resolver);
        }
        else
        {
            return JsonSerializer.NonGeneric.SerializeAsync(context.ObjectType, context.HttpContext.Response.Body, context.Object, _resolver);
        }
    }
}
```
