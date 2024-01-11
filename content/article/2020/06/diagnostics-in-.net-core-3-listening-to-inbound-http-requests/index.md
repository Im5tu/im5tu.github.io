---
title: "Diagnostics in .Net Core 3: Listening to inbound HTTP requests"
description: A look into the EventCounters API in .Net Core 3, and seeing how we can capture inbound HTTP Requests.
date: 2020-06-19T14:00:00
toc: true
includeInSitemap: true
series: "Diagnostics in .Net Core 3"
tags:
- dotnet
- aspnetcore
---

In my [previous article](/article/2020/06/diagnostics-in-.net-core-3-listening-to-outbound-http-requests/) we took a look at how to monitor outbound HTTP requests using a `DiagnosticListener`. In this article, we will re-use some of the same components to monitor inbound HTTP requests. We could use middleware to do as most approaches do, but this approach is highly dependent on the middleware that you have and the duration of this, so we will re-use some of the code from last time.
<!--more-->

A lot of this article relies on the infrastructure that we built out previously, so if something is missing here, it will likely be in that article. We will need to implement the following components:

1. A new DiagnosticListener
1. A observer that looks at incoming requests
1. A observer that looks at the response
1. A metric builder that builds our diagnostic counters

## Implementing the DiagnosticListener

In order to hook into the infrastructure that we built in the previous article, we need a new implementation of `DiagnosticListenerBase` that listens on the `Microsoft.AspNetCore DiagnosticSource`:

```csharp
internal sealed class InboundHttpRequestDiagnosticListener : DiagnosticListenerBase
{
    private readonly List<IInboundHttpObserver> _observers;
    private readonly string _name = "Microsoft.AspNetCore";

    public InboundHttpRequestDiagnosticListener(IEnumerable<IInboundHttpObserver> observers)
    {
        _observers = observers.ToList();
    }

    public override void TryObserve(DiagnosticListener diagnosticListener)
    {
        if (diagnosticListener is null || !diagnosticListener.Name.Equals(_name, StringComparison.OrdinalIgnoreCase))
            return;

        foreach (var observer in _observers)
            Subscribe(diagnosticListener, observer);
    }
}
```

The intention here is that we only subscribe specific observers when we encounter a `DiagnosticListener` that’s named `Microsoft.AspNetCore`. This listener has two specific events that we need to listen for:

- `Microsoft.AspNetCore.Hosting.BeginRequest` - Contains the following properties: httpContext, timestamp
- `Microsoft.AspNetCore.Hosting.EndRequest` - Contains the following properties: httpContext, timestamp

We will bind all of our observers into our IoC container again so that we can take advantage of injecting dependencies easily should we want/need to. The code is near identical to the outbound version otherwise.

## Implementing the observers

The approach we are going to take is largely the same as the outbound HTTP requests. The `DiagnosticListener` that we subscribe to is different, as are the payloads, but we get a near identical set of information that we can use to generate out metrics. As per the previous article, we use a marker interface for all of our inbound observers, which is declared as follows:

```csharp
internal interface IInboundHttpObserver : IObserver<KeyValuePair<string, object>>
{
}
```

### Implementing the request observer

The purpose of the `InboundHttpRequestObserver` is to extract the timestamp property that’s contained in the `Microsoft.AspNetCore.Hosting.BeginRequest` event, which indicates the ticks that the request started, and attach this as a property in the `HttpContext` so that we can access it later on.

```csharp
internal sealed class InboundHttpRequestObserver : SimpleDiagnosticListenerObserver, IInboundHttpObserver
{
    public override void OnNext(KeyValuePair<string, object> value)
    {
        if (value.Key == "Microsoft.AspNetCore.Hosting.BeginRequest")
        {
            var data = GetValueAs<TypedData>(value);
            if (data?.httpContext?.Items is {})
            {
                data.httpContext.Items["RequestTimestamp"] = data.timestamp;
            }
        }
    }

    private class TypedData
    {
        public HttpContext? httpContext;
        public long timestamp;
    }
}
```

Like our outbound implementation, I've generated a typed class so that we can access the data within the events payload as these are internal classes. I’ve nested a class inside of the observer to help with this, containing only the properties that I need.

### Implementing the response observer

The purpose of the `InboundHttpResponseObserver` is to extract the timestamp property that’s contained in the `Microsoft.AspNetCore.Hosting.EndRequest` event, which indicates the ticks that the request finished, and calculate the duration using the request timestamp that we previously stored in the `HttpContext` properties.

```csharp
internal sealed class InboundHttpResponseObserver : SimpleDiagnosticListenerObserver, IInboundHttpObserver
{
    private readonly IInboundHttpMetricBuilder _metricBuilder;

    public InboundHttpResponseObserver(IInboundHttpMetricBuilder metricBuilder)
    {
        _metricBuilder = metricBuilder;
    }

    public override void OnNext(KeyValuePair<string, object> value)
    {
        if (value.Key == "Microsoft.AspNetCore.Hosting.EndRequest")
        {
            var data = GetValueAs<TypedData>(value);
            object? requestTimestamp = null;
            if (data.httpContext?.Items?.TryGetValue("RequestTimestamp", out requestTimestamp) == true)
            {
                if (requestTimestamp is {} && long.TryParse(requestTimestamp?.ToString(), out var startTimestamp))
                {
                    var response = data.httpContext.Response;
                    var request = data.httpContext.Request;
                    // For all HTTP requests we should:
                    //    - Track the success (<400 status code response) or failure of the API call
                    //    - Capture the latency of the request
                    var resultCounter = (int)response.StatusCode < 400 ? _metricBuilder.GetSuccessCounter(request, response) : _metricBuilder.GetErrorCounter(request, response);
                    resultCounter?.Increment();
                    _metricBuilder.GetLatencyCounter(request, response)?.WriteMetric(GetDuration(startTimestamp, data.timestamp).TotalMilliseconds);
                }
            }
        }
    }

    private class TypedData
    {
        public HttpContext? httpContext;
        public long timestamp;
    }
}
```

As mentioned in a previous section, I've generated a typed class so that we can access the data within the events payload. I’ve nested a class inside of the observer to help with this, containing only the properties that I need. Now that we have all of the data we need to generate some metrics, we can use the injected `IInboundHttpMetricBuilder` to create the metrics that we want to track dynamically.

## Creating metrics from the context of the request

In our services, there are a few bits of information that I want to capture about the context of the request:

1. Whether the request was successful or not (based on the HTTP Status code)
1. The duration of the request, in milliseconds

With this information, we want to add metadata to the DiagnosticCounters that we generate so that we can use it as dimensions in our monitoring applications like DataDog/Prometheus. We want to track the following properties:

- HTTP method: GET/POST/PUT/PATCH/DELETE etc
- HTTP version: 1.0/1.1/2.0 etc
- HTTP scheme: HTTP/HTTPS
- HTTP request type: outbound (previous article)/inbound (this article)
- HTTP status code: 200/201/202/204/400 etc
- Request Path: /search
- Host: <www.google.com>

With this information, we should have more than enough to filter out specific flows easily, whilst being able to aggregate the results where needed. Each one of the properties is added to each one of the diagnostic counters that we generate:

- Success Counter
- Error Counter
- Latency Counter

To allow us to override the implementation later on, we can use the following interface:

```csharp
public interface IInboundHttpMetricBuilder
{
    IncrementingEventCounter? GetSuccessCounter(HttpRequest request, HttpResponse response);
    IncrementingEventCounter? GetErrorCounter(HttpRequest request, HttpResponse response);
    EventCounter? GetLatencyCounter(HttpRequest request, HttpResponse response);
}
```

**Note:** _For a summary of the different types of event counters, please see [this article](https://im5tu.io/article/2020/01/diagnostics-in-.net-core-3-event-counters/)._

In order to generate the same tags that we want, we can start of with the exact same code from the previous article. We can re-use most of the same code from the previous article, renaming anything that says `outbound` to `inbound`:

```csharp
internal sealed class DefaultInboundHttpMetricBuilder : IInboundHttpMetricBuilder
{
    private readonly ConcurrentDictionary<List<(string key, string value)>, IncrementingEventCounter> _successCounters = new ConcurrentDictionary<List<(string key, string value)>, IncrementingEventCounter>(new ListOfTupleEqualityComparer());
    private readonly ConcurrentDictionary<List<(string key, string value)>, IncrementingEventCounter> _errorCounters = new ConcurrentDictionary<List<(string key, string value)>, IncrementingEventCounter>(new ListOfTupleEqualityComparer());
    private readonly ConcurrentDictionary<List<(string key, string value)>, EventCounter> _latencyCounters = new ConcurrentDictionary<List<(string key, string value)>, EventCounter>(new ListOfTupleEqualityComparer());

    public IncrementingEventCounter GetSuccessCounter(HttpRequest request, HttpResponse response) => GetCoreHttpRequestCounter(_successCounters, request, response);

    public IncrementingEventCounter GetErrorCounter(HttpRequest request, HttpResponse response) => GetCoreHttpRequestCounter(_errorCounters, request, response);

    public EventCounter GetLatencyCounter(HttpRequest request, HttpResponse response)
    {
        return _latencyCounters.GetOrAdd(GetCoreTags(request, response), key =>
        {
            var counter = new EventCounter("http-request-latency", CheckoutEventSource.Instance)
            {
                DisplayName = "HTTP Request Latency",
                DisplayUnits = "ms"
            };
            foreach (var dimension in key)
                counter.AddMetadata(dimension.key, dimension.value);
            CheckoutEventSource.Instance.AddDiagnosticCounter(counter);
            return counter;
        });
    }

    private IncrementingEventCounter GetCoreHttpRequestCounter(ConcurrentDictionary<List<(string key, string value)>, IncrementingEventCounter> collection, HttpRequest request, HttpResponse response)
    {
        return collection.GetOrAdd(GetCoreTags(request, response), key =>
        {
            Debug.WriteLine("CREATED NEW COUNTER: " + string.Join(",", key.Select(x => $"{x.key}:{x.value}")));

            var counter = new IncrementingEventCounter("http-request", CheckoutEventSource.Instance)
            {
                DisplayName = "HTTP Request Count",
                DisplayUnits = "requests"
            };
            foreach (var dimension in key)
                counter.AddMetadata(dimension.key, dimension.value);
            CheckoutEventSource.Instance.AddDiagnosticCounter(counter);
            return counter;
        });
    }

    private List<(string key, string value)> GetCoreTags(HttpRequest request, HttpResponse response)
    {
        var path = request.Path.Value;

        if (string.IsNullOrWhiteSpace(path))
            path = "/";

        if (path.Length > 1)
        {
            var initialPartIndex = path.IndexOf('/', 1);
            if (initialPartIndex > 1)
                path = path.Substring(0, initialPartIndex);
            else
            {
                var queryIndex = path.IndexOf('?', 1);
                if (queryIndex >= 0)
                    path = path.Substring(0, queryIndex);
            }
        }

        var tags = new List<(string, string)>
        {
            ("http-method", request.Method),
            ("http-scheme", request.Scheme),
            ("http-request-type", "inbound"),
            ("http-status-code", response.StatusCode.ToString()),
            ("host", request.Host.Host), // host without the port value
            ("request-path", path)
        };

        if (request.Protocol.StartsWith("HTTP/"))
            tags.Add(("http-version", request.Protocol.Substring(5)));

        return tags;
    }


    private class ListOfTupleEqualityComparer : EqualityComparer<List<(string, string)>>
    {
        public override bool Equals(List<(string, string)>? left, List<(string, string)>? right)
        {
            if (left is null || right is null)
                return ReferenceEquals(left, right);

            if (left.Count != right.Count)
                return false;

            if (left.Count == 0)
                return true; // Both are 0

            using var iterator2 = right.GetEnumerator();
            foreach (var element in left)
            {
                // second is shorter than first
                if (!iterator2.MoveNext())
                {
                    return false;
                }
                if (!(element.Item1.Equals(iterator2.Current.Item1) && element.Item2.Equals(iterator2.Current.Item2)))
                {
                    return false;
                }
            }
            // If we can get to the next element, first was shorter than second.
            // Otherwise, the sequences are equal.
            return !iterator2.MoveNext();
        }

        public override int GetHashCode(List<(string, string)> obj)
        {
            var code = 17;
            foreach (var element in obj)
                code = HashCode.Combine(code, element.Item1.GetHashCode(), element.Item2.GetHashCode());

            return code;
        }
    }
}
```

Although I've copied the full code here for completeness, the only portion that's really changed is the `GetCoreTags` method. We needed to change this because the request/response classes that are used on the inbound request flow are different to what we used on the outbound flow. The logic, however, is largely unchanged.

Hopefully, once everything has been bound to your IoC container, you now have all the bits that you would need to build this out in your own applications. Happy request tracking!
