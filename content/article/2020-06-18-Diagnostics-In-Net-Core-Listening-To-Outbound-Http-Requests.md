{
    "title": "Diagnostics in .Net Core 3: Listening to outbound HTTP requests",
    "description": "A look into the EventCounters API in .Net Core 3, and seeing how we can capture outbound HTTP Requests.",
    "tags": ["aspnetcore", "dotnet", "diagnostics"],
    "date": "2020-06-18T01:34:00",
    "categories": ["aspnetcore", "dotnet", "diagnostics"],
    "series": "Diagnostics in .Net Core 3"
}

Throughout the course of my Diagnostics in .Net Core series, we've taken a look at the basics of how to use the Event Counters API. In this article, we will take a look at how we can capture all outbound HTTP requests automatically as they occur.
<!--more--> 
Our implementation is going to use a number of technologies combined to get the information that we require about the web request. Here are the steps that we need to complete:

1. Create a service that hooks onto DiagnosticListeners as they get created
1. Create a observer to listen for the start of an outbound request
1. Create a observer to listen for the end of an outbound request
1. Create metrics from the context of the request/response

The classes that I've added to this article are designed to give you the most flexiblity around how you extend your applications in future, including the next article. Another aim is to give the classes a single purpose to add with testability. If you do not need this level of extensiblity or testability, it should be relatively easy to merge some of the classes together. As this is already a lengthy article, I've not included the tests here.

## Creating the diagnostics hosted service

Our `DiagnosticsHostedService` will help us manage the lifetime of our observers. I've included here in the article for completeness, although this is an an optional step so log as you register your new `DiagnosticListener` observer via `DiagnosticListener.AllListeners` then you should be fine.

A DiagnosticListener allows us to listen for events that are published in our application, either by a third party or ourselves, for the purposes of diagnostics. The events are sent from a `DiagnosticSource` that sends us a rich payload that's designed for consumption within the current process. They are multi-cast in nature, meaning that multiple listeners can listen to the same event without any issues. For our use case, we will listen to a single `DiagnosticSource` with multiple observers, for testability.

Read more: [Consuming Data with DiagnosticListeners](https://github.com/dotnet/corefx/blob/master/src/System.Diagnostics.DiagnosticSource/src/DiagnosticSourceUsersGuide.md#consuming-data-with-diagnosticlistener) / [Microsoft Docs](https://docs.microsoft.com/en-us/dotnet/api/system.diagnostics.diagnosticlistener?view=netcore-3.1)

### The DiagnosticsHostedService 

Now that we have a basic understanding of a `DiagnosticListener` we can use this in a simple hosted service that uses a special property called `AllListeners`. This property then exposes a `Subscribe` method on which we can add our first type of observer:

```csharp
internal sealed class DiagnosticsHostedService : IHostedService
{
    private readonly Observer _observer;
    private IDisposable? _subscription;

    public DiagnosticsHostedService(Observer observer)
    {
        _observer = observer ?? throw new ArgumentNullException(nameof(observer));
    }
    
    public Task StartAsync(CancellationToken cancellationToken)
    {
        _subscription ??= DiagnosticListener.AllListeners.Subscribe(_observer);
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        _subscription?.Dispose();
        return Task.CompletedTask;
    }
}
```

The service above helps us with managing the life-cycle of the observer and keeps hold of the subscription to ensure that it doesn't accidentally get cleaned up. It doesn't matter at which point you call `DiagnosticListener.AllListeners` because when you subscribe, you will always get all previously registered `DiagnosticSource`s and any future sources that will be created.

I'm a fan of being able to easily extend applications by adding a new entry to our DI containers. This can be extremely helpful when doing assembly scanning. To keep with this pattern, I've created a simple wrapper that facilitates this, whilst adding some safety guarantees for graceful shutdown scenarios.


```csharp
internal class Observer : IObserver<DiagnosticListener>
{
    private readonly List<IDiagnosticListener> _listeners;
    private bool _complete = false;

    public Observer(IEnumerable<IDiagnosticListener> listeners)
    {
        _listeners = listeners?.ToList() ?? throw new ArgumentNullException(nameof(listeners));
    }
    
    public void OnCompleted()
    {
        lock (_listeners)
        {
            _complete = true;
        }
    }

    public void OnError(Exception error)
    {
    }

    public void OnNext(DiagnosticListener value)
    {
        lock (_listeners)
        {
            if (_complete)
                return;
            
            foreach(var listener in _listeners)
                listener.TryObserve(value);
        }
    }
}
```

Once we've hooked up the above services in DI, all that's left for us to do is implement the `IDiagnosticListener` interface and register some observers from within the implementation, binding the implementation of `IDiagnosticListener` and any observers into our DI container of choice along the way.

## Creating the Observers

### Implementing IDiagnosticListener

In this series of articles, we will implement some of this functionality again when we implement the inbound metrics, so i've moved the common functionality to base classes that can be re-used for other purposes. First of all, we have the `DiagnosticListenerBase`

```csharp
public abstract class DiagnosticListenerBase : IDiagnosticListener
{
    private readonly List<IDisposable> _subscriptions = new List<IDisposable>();
    private bool _disposed = false;

    public abstract void TryObserve(DiagnosticListener diagnosticListener);

    protected void Subscribe(DiagnosticListener diagnosticListener, IObserver<KeyValuePair<string, object>> observer)
    {
        lock (_subscriptions)
        {
            if (_disposed)
                throw new InvalidOperationException("Cannot subscribe when the diagnostic listener has been disposed.");

            _subscriptions.Add(diagnosticListener.Subscribe(observer));
        }
    }

    public void Dispose()
    {
        lock (_subscriptions)
        {
            foreach(var subscription in _subscriptions)
                subscription.Dispose();

            _disposed = true;
        }
        
        OnDispose();
    }

    protected virtual void OnDispose()
    {
    }
}
```

This class is intended to make sure that we manage the subscriptions correctly, just like we did with the `DiagnosticsHostedService`. We also abstractly implement the interfaces' `TryObserve` method, which our `OutboundHttpDiagnosticListener` implements:

```csharp
internal sealed class OutboundHttpRequestDiagnosticListener : DiagnosticListenerBase
{
    private readonly List<IOutboundHttpObserver> _observers;
    private readonly string _name = "HttpHandlerDiagnosticListener";

    public OutboundHttpRequestDiagnosticListener(IEnumerable<IOutboundHttpObserver> observers)
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

The intention here is that we only subscribe specific observers when we encounter a DiagnosticListener that's named `HttpHandlerDiagnosticListener`. This listener has two specific events that we need to listen for: 

- `System.Net.Http.Request` - Contains the following properties: Request, LoggingRequestId, TimeStamp
- `System.Net.Http.Response` - Contains the following properties: Response, LoggingRequestId, ResponseTaskStatus, TimeStamp

Each of the observers that we create will have a marker interface attached to them called `IOutboundHttpObserver` so that we can plug them into our IoC container. It's simply defined as:

```csharp
internal interface IOutboundHttpObserver : IObserver<KeyValuePair<string, object>>
{
}
```

### SimpleDiagnosticListenerObserver

When you deal with `DiagnosticListener`s, we are dealing with the Observer pattern in C#, which means that we always need to implement the following methods: `OnCompleted`, `OnError`, `OnNext`. For our use case, we don't need the `OnCompleted` or `OnError` methods in any of our observers, so we can move this functionality into a base class with some additional helper methods: `GetDuration` and `GetValueAs`

```csharp
public abstract class SimpleDiagnosticListenerObserver : IObserver<KeyValuePair<string, object>>
{
    // Gets the conversion factor that's used to go from ticks to a real world time. Inspiration: https://github.com/aspnet/Extensions/blob/34204b6bc41de865f5310f5f237781a57a83976c/src/Shared/src/ValueStopwatch/ValueStopwatch.cs
    protected static readonly double TimestampToTicks = TimeSpan.TicksPerSecond / (double)Stopwatch.Frequency;
    
    public virtual void OnCompleted()
    {
    }

    public virtual void OnError(Exception error)
    {
    }

    public abstract void OnNext(KeyValuePair<string, object> value);
    
    protected static TimeSpan GetDuration(long startTimestampInTicks, long endTimestampInTicks)
    {
        var timestampDelta = endTimestampInTicks - startTimestampInTicks;
        var ticks = (long)(TimestampToTicks * timestampDelta);
        return new TimeSpan(ticks);
    }

    protected static T GetValueAs<T>(KeyValuePair<string, object> value)
        where T : class => Unsafe.As<T>(value.Value);
}
```

Each event that we receive in the is typed to be a `KeyValuePair<string, object>`. The key property will always represent the name of the event, while the value property will be the rich payload that's send by the `DiagnosticSource`.

The `GetDuration` method is inspired by the [ValueStopwatch](https://github.com/aspnet/Extensions/blob/34204b6bc41de865f5310f5f237781a57a83976c/src/Shared/src/ValueStopwatch/ValueStopwatch.cs) code that AspNetCore has internally. This allows us to calculate the wall-clock time duration of two ticks. Incidentally, this is the same calculation method that appears to be used in the logging of inbound HTTP requests from what I can tell so far.

The `GetValueAs<T>` method use some [CLR magic](https://mattwarren.org/2016/09/14/Subverting-.NET-Type-Safety-with-System.Runtime.CompilerServices.Unsafe/) to forcefully convert the type for us, ie: it does not perform type checking. We need this because the objects that come along with the events that we listen to are internal to the .Net code base, so we have to mimic the same type/properties and then cast to it so that we can access the information. A "safer" approach would be to use cached reflection calls, but to me, I understand that this might break in the future no matter what I do so I've opted for a more performant* approach.

### Creating the OutboundHttpRequestObserver

The purpose of the `OutboundHttpRequestObserver` is to extract the timestamp property that's contained in the `System.Net.Http.Request` event, which indicates the ticks that the request started, and attach this as a request property so that we can access it later on.

```csharp
internal sealed class OutboundHttpRequestObserver : SimpleDiagnosticListenerObserver, IOutboundHttpObserver
{
    public override void OnNext(KeyValuePair<string, object> value)
    {
        if (value.Key == "System.Net.Http.Request")
        {
            var data = GetValueAs<TypedData>(value);
            if (data?.Request?.Properties is {})
            {
                data.Request.Properties["RequestTimestamp"] = data.Timestamp;    
            }
        }
    }
    
    private class TypedData
    {
        public HttpRequestMessage? Request;
        public long Timestamp;
    }
}
```

As mentioned in the previous section, we generated a typed class so that we can access the data within the events payload. I've nested a class inside of the observer to help with this, containing only the properties that I need.

### Creating the OutboundHttpResponseObserver

The purpose of the `OutboundHttpResponseObserver` is to extract the timestamp property that's contained in the `System.Net.Http.Response` event, which indicates the ticks that the request finished, and calculate the duration using the request timestamp that we previously stored in the request properties.

```csharp
internal sealed class OutboundHttpResponseObserver : SimpleDiagnosticListenerObserver, IOutboundHttpObserver
{
    private readonly IOutboundHttpMetricBuilder _metricBuilder;

    public OutboundHttpResponseObserver(IOutboundHttpMetricBuilder metricBuilder)
    {
        _metricBuilder = metricBuilder;
    }
    
    public override void OnNext(KeyValuePair<string, object> value)
    {
        if (value.Key == "System.Net.Http.Response")
        {
            var data = GetValueAs<TypedData>(value);
            object? requestTimestamp = null;
            if (data?.Response?.RequestMessage?.Properties?.TryGetValue("RequestTimestamp", out requestTimestamp) == true)
            {
                if (long.TryParse(requestTimestamp?.ToString(), out var startTimestamp) == true)
                {
                    // For all HTTP requests we should:
                    //    - Track the success (<400 status code response) or failure of the API call
                    //    - Capture the latency of the request
                    var resultCounter = (int)data.Response.StatusCode < 400 ? _metricBuilder.GetSuccessCounter(data.Response.RequestMessage, data.Response) : _metricBuilder.GetErrorCounter(data.Response.RequestMessage, data.Response);
                    resultCounter?.Increment();
                    _metricBuilder.GetLatencyCounter(data.Response.RequestMessage, data.Response)?.WriteMetric(GetDuration(startTimestamp, data.TimeStamp).TotalMilliseconds);
                }
            }
        }
    }
    
    private class TypedData
    {
        public HttpResponseMessage? Response;
        public long TimeStamp;
    }
}
```

As mentioned in a previous section, we generated a typed class so that we can access the data within the events payload. I've nested a class inside of the observer to help with this, containing only the properties that I need. Now that we have all of the data we need to generate some metrics, we can use the injected `IOutboundHttpMetricBuilder` to create the metrics that we want to track dynamically.

## Creating metrics from the context of the request

In our services, there are a few bits of information that I want to capture about the context of the request:

1. Whether the request was successful or not (based on the HTTP Status code)
1. The duration of the request, in milliseconds

With this information, we want to add metadata to the DiagnosticCounters that we generate so that we can use it as dimensions in our monitoring applications like DataDog/Prometheus. The dimensions that we are interested in include:

- HTTP method: GET/POST/PUT/PATCH/DELETE etc
- HTTP version: 1.0/1.1/2.0 etc
- HTTP scheme: HTTP/HTTPS
- HTTP request type: outbound (this article)/inbound (next article)
- HTTP status code: 200/201/202/204/400 etc
- Request Path: `/search`
- Host: `www.google.com`

With this information, we should have more than enough to filter out specific flows easily, whilst being able to aggregate the results where needed. Each one of the properties is added to each one of the diagnostic counters that we generate:

- Success Counter
- Error Counter
- Latency Counter

To allow us to override the implementation later on, we can use the following interface:

```csharp
public interface IOutboundHttpMetricBuilder
{
    IncrementingEventCounter? GetSuccessCounter(HttpRequestMessage request, HttpResponseMessage response);
    IncrementingEventCounter? GetErrorCounter(HttpRequestMessage request, HttpResponseMessage response);
    EventCounter? GetLatencyCounter(HttpRequestMessage request, HttpResponseMessage response);
}
```

**Note:** _For a summary of the different types of event counters, please see [this article](https://im5tu.io/article/2020/01/diagnostics-in-.net-core-3-event-counters/)._

For the sake of brevity of this article, I'm not going to explain all of the below, rather the general concept. Here, the intention is to have a core set of dimensions (listed above) that are are also used to de-duplicate the number of counters that we create overall. Lastly, we have a custom comparer so that we can compare the values of the `List` that we generate for each type of metric, rather than relying on the default equality comparer. This helps us ensure that we have semantic rather than reference equality.

```csharp
/// <remarks>
/// We don't want to add new event counters all the time to the system. So based on the tags, we maintain a list for success/errors/latency.
/// Because we are storing based on semantic equivalents, we need a custom comparer to ensure that we have uniqueness, this is guarenteed in two ways:
///     - Ensuring that hashcodes are generated using a semantic method, given that inputs are the always given in the same ordered way
///     - When we check for equality, assuming the hashcodes match, we each that the sequences are equal using a performant version of Enumerable.SequenceEquals (as this is going to be called ALOT!)
/// </remarks>
internal sealed class DefaultOutboundHttpMetricBuilder : IOutboundHttpMetricBuilder
{
    private readonly ConcurrentDictionary<List<(string key, string value)>, IncrementingEventCounter> _successCounters = new ConcurrentDictionary<List<(string key, string value)>, IncrementingEventCounter>(new ListOfTupleEqualityComparer());
    private readonly ConcurrentDictionary<List<(string key, string value)>, IncrementingEventCounter> _errorCounters = new ConcurrentDictionary<List<(string key, string value)>, IncrementingEventCounter>(new ListOfTupleEqualityComparer());
    private readonly ConcurrentDictionary<List<(string key, string value)>, EventCounter> _latencyCounters = new ConcurrentDictionary<List<(string key, string value)>, EventCounter>(new ListOfTupleEqualityComparer());
    
    public IncrementingEventCounter GetSuccessCounter(HttpRequestMessage request, HttpResponseMessage response) => GetCoreHttpRequestCounter(_successCounters, request, response);

    public IncrementingEventCounter GetErrorCounter(HttpRequestMessage request, HttpResponseMessage response) => GetCoreHttpRequestCounter(_errorCounters, request, response);
    
    public EventCounter GetLatencyCounter(HttpRequestMessage request, HttpResponseMessage response)
    {
        return _latencyCounters.GetOrAdd(GetCoreTags(request, response), key =>
        {
            var counter = new EventCounter("http-request-latency", MyDiagnosticsEventSource.Instance)
            {
                DisplayName = "HTTP Request Latency",
                DisplayUnits = "ms"
            };
            foreach (var dimension in key)
                counter.AddMetadata(dimension.key, dimension.value);
            MyDiagnosticsEventSource.Instance.AddDiagnosticCounter(counter);
            return counter;
        });        
    }
    
    private IncrementingEventCounter GetCoreHttpRequestCounter(ConcurrentDictionary<List<(string key, string value)>, IncrementingEventCounter> collection, HttpRequestMessage request, HttpResponseMessage response)
    {
        return collection.GetOrAdd(GetCoreTags(request, response), key =>
        {
            Debug.WriteLine("CREATED NEW COUNTER: " + string.Join(",", key.Select(x => $"{x.key}:{x.value}")));

            var counter = new IncrementingEventCounter("http-request", MyDiagnosticsEventSource.Instance)
            {
                DisplayName = "HTTP Request Count",
                DisplayUnits = "requests"
            };
            foreach (var dimension in key)
                counter.AddMetadata(dimension.key, dimension.value);
            MyDiagnosticsEventSource.Instance.AddDiagnosticCounter(counter);
            return counter;
        });
    }

    private List<(string key, string value)> GetCoreTags(HttpRequestMessage request, HttpResponseMessage response)
    {
        var path = request.RequestUri.PathAndQuery;

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
            ("http-method", request.Method.ToString()),
            ("http-version", request.Version.ToString()),
            ("http-scheme", request.RequestUri.Scheme),
            ("http-request-type", "outbound"),
            ("http-status-code", ((int)response.StatusCode).ToString()),
            ("request-path", path)
        };
        
        if (request.RequestUri.IsAbsoluteUri)
            tags.Add(("host", request.RequestUri.Authority));

        return tags;
    }


    private class ListOfTupleEqualityComparer : EqualityComparer<List<(string, string)>>
    {
        public override bool Equals(List<(string, string)> left, List<(string, string)> right)
        {
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

Naturally, if you use another method like the response body to figure out whether the request was successful or not then you will need to do additional work with the contents of the request. This will be outside the context of this post. Hopefully, you now have all the bits that you would need to build this out in your own applications. In the next article, we will be taking a look at how we mimic the same technique for accurately tracking inbound requests using a lot of the same components that we have built out in this article.