{
    "title": "Publish Metrics to Cloudwatch in .NET Core",
    "description": "As companies grow, moving to a zero-trust architecture is majorly important. This article explores how to build it in AWS.",
    "tags": ["aspnet", "dotnet", "diagnostics", "AWS"],
    "date": "2020-12-13T16:21:58Z",
    "categories": ["Development"],
    "toc": true
}

In a [previous post](/article/2020/01/diagnostics-in-.net-core-3-event-counters/) I took a look at how we can utilize .NET event counters to record metrics in our applications. However, I never covered the implementation of how I write the metrics to either CloudWatch or DataDog. In this article, I'm going to take a look at how to publish metrics to CloudWatch and one way of integrating it with the aforementioned blog series.

<!--more-->

## What is CloudWatch?

Amazon CloudWatch is a monitoring and observability service that provides you with data and actionable insights to monitor your applications, respond to system-wide performance changes, optimize resource utilization, and get a unified view of operational health. CloudWatch collects monitoring and operational data in the form of logs, metrics, and events, providing you with a unified view of AWS resources, applications, and services that run on AWS and on-premises servers. You can use CloudWatch to detect anomalous behavior in your environments, set alarms, visualize logs and metrics side by side, take automated actions, troubleshoot issues, and discover insights to keep your applications
running smoothly. _([Source](https://aws.amazon.com/cloudwatch/))_

## Writing a CloudWatch Metric Publisher

If you've been following the previous articles, you would have seen that I omitted the type that I personally use to pass the metric information to the publishers. The common metric update type I've been using contains the name of the metric, it's value and any tags/dimensions that you which to be attached to the metric. For completeness, and incase you haven't been following the previous articles, here is the `MetricUpdate` type that we will reference:

```csharp
[DebuggerDisplay("{ToString(),nq}")]
public struct MetricUpdate
{
    public IEnumerable<KeyValuePair<string,string>> Tags;
    public string Name;
    public float Value;

    public MetricUpdate(string name, float value, IEnumerable<KeyValuePair<string,string>> tags)
    {
        Name = name;
        Value = value;
        Tags = tags;
    }

    public override string ToString() => $"{Name}:{Value} ({string.Join(",", Tags.Select(x => $"{x.Key}={x.Value}"))})";
}
```

Once we have this type configured, we need to install the `AWSSDK.CloudWatch` NuGet package, which will allow us to communicate with AWS CloudWatch. Our entry point to publishing the metrics will be a simple interface that will enable us to swap out the implementation for testing at a later point:

```csharp
public interface ICloudWatchMetricsPublisher
{
    Task PublishMetricsAsync(IEnumerable<MetricUpdate> metrics);
}
```

We will also need to have a corresponding implementation for the `ICloudWatchMetricsPublisher` contract:

```csharp
internal sealed class CloudWatchMetricsPublisher : ICloudWatchMetricsPublisher
{
    private readonly ILogger<CloudWatchMetricsPublisher> _logger;

    public CloudWatchMetricsPublisher(ILogger<CloudWatchMetricsPublisher> logger)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task PublishMetricsAsync(IEnumerable<MetricUpdate> metrics)
    {
        using var client = CreateClient();
        var datums = new List<MetricDatum>(metrics.Select(ConvertToDatum));

        var request = new PutMetricDataRequest
        {
            Namespace = "MyCustomNamespace",
            MetricData = datums
        };

        await client.PutMetricDataAsync(request);
    }

    private AmazonCloudWatchClient CreateClient() => new AmazonCloudWatchClient();

    // Other methods, defined below
}
```

Our main steps in the code above are:

1. Create a new instance of the `AmazonCloudWatchClient` class which allows us to communicate with CloudWatch
1. Convert our `MetricUpdate` type into the AWS specific `MetricDatum` type
1. Create a new instance of `PutMetricDataRequest` and call `PutMetricDataAsync` on the AWS Client, which sends the metrics through to CloudWatch, assuming we have the correct permissions

When we convert our `MetricUpdate` to a `MetricDatum`, there are a few points that we need to consider, including:

- The unit type that we want to be represented for the metric in CloudWatch
- The storage resolution that we want to use
- The number of dimensions that we can use for the metric

I've wrapped up some of this logic into a `ConvertToDatum` method to keep the logic contained and the main publishing code clear:

```csharp
private MetricDatum ConvertToDatum(in MetricUpdate metric)
{
    return new MetricDatum
    {
        TimestampUtc = DateTime.UtcNow,
        MetricName = metric.Name,
        Value = metric.Value,
        Unit = GetUnitMapping(metric),
        StorageResolution = 1,
        Dimensions = FormatDimensions(metric.Tags)
    };
}
```

The most important point part about the code snippet above is the `StorageResolution`. Setting this to 1 specifies this metric as a high-resolution metric, so that CloudWatch stores the metric with sub-minute resolution down to one second. Setting this to 60 specifies this metric as a regular-resolution metric, which CloudWatch stores at 1-minute resolution. For more information about high-resolution metrics, see [High-Resolution Metrics](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/publishingMetrics.html#high-resolution-metrics) in the Amazon CloudWatch User Guide.

Otherwise, for clarity and future extensibility, I've separated the unit mapping and the dimensions formatting. Lastly, should you want to change the timestamp, you just need to update the `MetricUpdate` type to add the TimeStamp. This could be handy for retries or delays in publication, but that's out of scope for this article. Now, lets take a look at the unit mapping code:

```csharp
private StandardUnit GetUnitMapping(in MetricUpdate metric)
{
    if (metric.Name.EndsWith("latency"))
        return StandardUnit.Milliseconds;
    if (metric.Name.EndsWith("count") || metric.Name.EndsWith("length"))
        return StandardUnit.Count;
    if (metric.Name.EndsWith("usage"))
        return StandardUnit.Percent;
    if (metric.Name.EndsWith("size"))
        return StandardUnit.Bytes;
    if (metric.Name.EndsWith("rate"))
        return StandardUnit.CountSecond;

    return StandardUnit.None;
}
```

There's nothing really special going on here, we just use the ending of the metric to decide what . In my real production code, this is configurable should we need to explicitly set something, but i'll leave that as an exercise for you dearest reader.

```csharp
private List<Dimension> FormatDimensions(IEnumerable<KeyValuePair<string, string>> dimensions)
{
    var result = new List<Dimension>(10);

    foreach (var dimension in dimensions)
    {
        result.Add(new Dimension
        {
            Name = dimension.Key,
            Value = dimension.Value
        });

        // We can only support a maximum of 10 dimensions in cloudwatch
        if (result.Count == 10)
        {
            _logger.LogWarning("Cloudwatch only supports 10 dimensions per metric. Any additional dimensions have been removed.");
            return result;
        }
    }

    return result;
}
```

Again, there is nothing really special going on with the formatting of the dimensions. It is important to note that only the first 10 elements of the collection will be passed through to CloudWatch. This is a limitation on the CloudWatch side and as such, we log a warning to know when we've hit that limit, allowing us to act on it in the future should we need to. As far as the publishing is concerned, that's pretty much it.

_As you may have noticed from the snippets of code, I have left out a lot of the configuration that would normally be done as I didn't want to bloat the code with unnecessary code, allowing you to get the important bits._

## Integrating our CloudWatch publisher with .NET Event Counters

In a [previous post](/article/2020/01/diagnostics-in-.net-core-3-event-counters/) I received a comment asking how I hook up .NET EventCounters with either DataDog or CloudWatch. The short answer is that I use the above code, at least a variation of it, to publish directly to CloudWatch. The longer answer is that I have an extensible mechanism which allows me to publish to one or more sources at once, depending on my needs. To do this, we need multiple parts to complete the puzzle:

1. An observable which we can publish the metric updates to
1. An observer per publisher (eg: CloudWatch/DataDog)
1. The publishing code (like the former part of this article)
1. Link the .NET EventCounters collectors to the observable

### Creating the observable infrastructure

The first part of linking .NET event counters to our new publishers, is to create an implementation of the observable pattern for which .NET has two handy interfaces that we can use:

- `IObservable<T>` - which allows us to subscribe to a stream of events that are emitted by an object
- `IObserver<T>` - which can be added to the above observable via the `Subscribe` method. The instance that's subscribed will receive notifications for: each object in the stream, exceptions from the stream and completion of the stream.

As the `IObservable<T>` interface isn't concerned with how the data is retrieved from the stream, as it could be from a network stream or an in-memory stream for example, we will need a way of publishing the data. To do this, we will add the `WriteMetric` method to a custom interface so that we can implement the pattern properly:

```csharp
public interface IMetricsObservable : IObservable<MetricUpdate>
{
    void WriteMetric(ref MetricUpdate metricUpdate);
}

internal sealed class MetricsObservable : IMetricsObservable
{
    private readonly List<IObserver<MetricUpdate>> _observers;

    public MetricsObservable(IEnumerable<IObserver<MetricUpdate>> observers)
    {
        _observers = observers.ToList();
    }

    public IDisposable Subscribe(IObserver<MetricUpdate> observer)
    {
        lock (_observers)
            _observers.Add(observer);

        return new ActOnDispose(() =>
        {
            lock (_observers)
                _observers.Remove(observer);
        });
    }

    public void WriteMetric(ref MetricUpdate metricUpdate)
    {
        lock(_observers)
            foreach (var observer in _observers)
                observer.OnNext(metricUpdate);
    }

    public void Dispose()
    {
        lock (_observers)
        {
            foreach (var observer in _observers)
                observer.OnCompleted();

            _observers.Clear();
        }
    }

    private class ActOnDispose : IDisposable
    {
        private readonly Action _act;
        private bool _disposed = false;

        public ActOnDispose(Action act)
        {
            _act = act;
        }

        public void Dispose()
        {
            if (_disposed)
                return;

            _disposed = true;
            _act();
        }
    }
}
```

The code above is a basic implementation of the observable pattern, which also takes a series of known consumers from an IoC container should it be configured. We return a custom disposable from the `Subscribe` method, that when disposed, will remove the `IObserver<T>` instance from the list of known consumers.

The next part of the puzzle is to create our `IObserver<T>` implementation. We want the processing of this element to be lightning fast as we will hold up the stream if we try do asynchronous processing, especially since the contract of `IObserver<T>` does not support asynchronicity. To work around this, we are going to use `System.Threading.Channels` to write to a temporary channel and pick this up in a background service that can do the aggregation of the metrics before publishing. I strongly recommend that you read [Steve Gordons excellent introduction to System.Threading.Channels](https://www.stevejgordon.co.uk/an-introduction-to-system-threading-channels) for background on this subject:

```csharp
internal sealed class CloudwatchMetricObserver : IObserver<MetricUpdate>
{
    private readonly ChannelWriter<MetricUpdate> _channel;

    public CloudwatchMetricObserver(ChannelWriter<MetricUpdate> channel)
    {
        _channel = channel;
    }

    public void OnCompleted() { }

    public void OnError(Exception error) { }

    public void OnNext(MetricUpdate value)
    {
        _channel.TryWrite(value);
    }
}
```

By proxying the metrics through a channel, we have a unique ability to batch the data in our requests through a simple pattern in the background service. The rough flow is:

- Check to see if there is an element in the channel. If an element is present:
  - Add it to a temporary list of metrics
  - If we have hit the capacity of our temporary storage, publish the metrics
- If no element in the channel:
  - Publish any remaining metrics (eg: if we haven't hit the capacity)
  - Wait for the stop signal or an element to appear in the channel, whichever is first

This flow is what I've implemented below:

```csharp
internal sealed class CloudwatchPublishingService : BackgroundService
{
    private readonly ICloudWatchMetricsPublisher _publisher;
    private readonly ILogger<CloudwatchPublishingService> _logger;
    private readonly ChannelReader<MetricUpdate> _metricReader;
    private readonly int _capacity = 20;
    private List<MetricUpdate>? _metrics;

    public CloudwatchPublishingService(ICloudWatchMetricsPublisher publisher,
        ILogger<CloudwatchPublishingService> logger,
        ChannelReader<MetricUpdate> metricReader)
    {
        _publisher = publisher;
        _logger = logger;
        _metricReader = metricReader;
    }

    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        async Task PublishAsync()
        {
            if (_metrics is {} && _metrics.Count > 0)
            {
                await _publisher.PublishMetricsAsync(_metrics);

                // Ensure that we reset the metric container after publishing
                _metrics = null;
            }
        }

        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                if (_metricReader.TryRead(out var metric))
                {
                    // We don't want to make API requests on every metric as this will cost a bucket load and is horribly inefficient
                    _metrics ??= new List<MetricUpdate>(_capacity);
                    _metrics.Add(metric);

                    if (_metrics.Count >= _capacity)
                    {
                        await PublishAsync();
                    }
                }
                else
                {
                    await PublishAsync();
                    await _metricReader.WaitToReadAsync(cancellationToken);
                }
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
            }
            catch (Exception exception)
            {
                _logger.LogError(exception, exception.Message);
            }
        }
    }
}
```

In the code above, we've explicitly set the capacity of our temporary storage to 20, as this is the limitation imposed on us by the CloudWatch `PutMetricData` endpoint. For those familiar with System.Threading.Channels, I have explicitly chosen not to use the `IAsyncEnumerable` support so that I have more control over the batching, ie: I don't have to wait for a complete batch of 20 metrics before I send the request the data be stored in CloudWatch. This can help with terminal scenarios where you may be able to get additional metrics out before the service dies, and when there are long intervals between metrics being published.

The last piece of the puzzle is to link the `MetricsCollectionService` from the [previous article](/article/2020/01/diagnostics-in-.net-core-3-event-counters/#processing-events) (some parts removed for brevity) with the `IMetricsObservable` we've just created:

```csharp
internal sealed class MetricsCollectionService : EventListener, IHostedService
{
    private IMetricsObservable _metricsObservable;

    public MetricsCollectionService(IMetricsObservable metricsObservable)
    {
        _metricsObservable = metricsObservable ?? throw new ArgumentNullException(nameof(metricsObservable));
    }

    protected override void OnEventWritten(EventWrittenEventArgs eventData)
    {
        if (eventData.EventName != "EventCounters"
                || eventData.Payload.Count <= 0
                || !(eventData.Payload[0] is IDictionary<string, object> data)
                || !data.TryGetValue("CounterType", out var counterType)
                || !data.TryGetValue("Name", out var name))
            return;

        var metricType = counterType.ToString();
        float metricValue = 0;

        if ("Sum".Equals(metricType) && data.TryGetValue("Increment", out var increment))
        {
            metricValue = Convert.ToSingle(increment);
        }
        else if ("Mean".Equals(metricType) && data.TryGetValue("Mean", out var mean))
        {
            metricValue = Convert.ToSingle(mean);
        }

        var metric = new MetricUpdate(metricName, metricValue, tags);
        _metricsObservable.WriteMetric(ref metric);
    }
}
```

Naturally, if you don't need the flexibility of adding multiple destinations, then you can bypass some of the code that I've shown above and go direct to the publisher instead of through the `IMetricsObservable` indirection.

That's it for this article, I hope you've learned how we can publish metrics to CloudWatch in C# and how we can link this with our [previous work](http://localhost:1313/series/diagnostics-in-.net-core-3/) on .NET Event Counters. Happy Metrics Collection!
