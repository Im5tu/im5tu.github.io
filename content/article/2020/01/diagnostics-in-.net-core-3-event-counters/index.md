---
title: "Diagnostics in .Net Core 3: Event Counters"
description: A look into the EventCounters API in .Net Core 3
date: 2020-01-05T14:00:00
toc: true
includeInSitemap: true
series: "Diagnostics in .Net Core 3"
tags:
- dotnet
---

Recently, I've been playing with the new [diagnostic improvements in .Net Core 3](https://devblogs.microsoft.com/dotnet/introducing-diagnostics-improvements-in-net-core-3-0/). Traditionally, I've always used the great [AppMetrics](https://github.com/AppMetrics/AppMetrics) package to capture the metrics from our applications and send scrape them with a [Prometheus](https://github.com/prometheus/prometheus) &amp; [Grafana](https://github.com/grafana/grafana) setup. Whilst reading about the improvements, I wondered whether or not it would be possible to push metrics to [Prometheus](https://github.com/prometheus/prometheus).
<!--more-->

Ultimately, I decided that pushing to [Prometheus](https://github.com/prometheus/prometheus) wasn't ideal for my use case. However, I have successfully used the approach described in the rest of the article to push the metrics to another platform, using a new .Net API - EventCounters.

EventCounters are the .NET Core replacement for Windows performance counters, which are now cross platform. EventCounters are based on the EventPipe that was originally introduced in .Net Core 2.2, but .Net Core 3.0+ adds a lot of additional functionality that we can use going forward to create cross platform monitoring tools for our applications including:

- `dotnet-dump` takes memory snapshot and allow analysis based on most SOS commands;
- `dotnet-trace` collects events emitted by the Core CLR and generate trace file to be analyzed with PerfView;
- `dotnet-counters` collects the metrics corresponding to some performance counters that used to be exposed by the .NET Framework.

_Please note that this article is correct at the time of writing based on the [sources](https://source.dot.net) available. I do describe some of the internal workings of the API, which may change overtime._

## Application Flow

In order to use the new EventCounters API, you first need to create an inherited class that derives from EventSource because every type of counter needs to be registered against an EventSource. Let's start off with the simplist possible EventSource that records metrics dynamically:

```csharp
[EventSource(Name = "MyApplication")]
public class MyApplicationEventSource : EventSource
{
    public static MyApplicationEventSource Instance = new MyApplicationEventSource();
    private readonly ConcurrentDictionary<string, EventCounter> _dynamicCounters = new ConcurrentDictionary<string, EventCounter>();

    private MyApplicationEventSource() {}

    public void RecordMetric(string name, float value)
    {
        if (string.IsNullOrWhiteSpace(name)) return;

        var counter = _dynamicCounters.GetOrAdd(name, key => new EventCounter(key, this));
        counter.WriteMetric(value);
    }
}
```

In order to initialize a new EventCounter instance, we need to give a name and the EventSource that it should be associated with. Whilst this is okay for simple EventCounters, we often need to do more with our applications, such as tracking the start/stopping of certain events, or tracking activities using PerfView. To do this, we can leverage more of the EventSource's infrastructure.

### Using EventCounters And EventSource Events

Let's breakdown the following example, which I've taken from my [OpenMessage project](https://github.com/Im5tu/OpenMessage/blob/dev/src/OpenMessage/OpenMessageEventSource.cs):

```csharp
[EventSource(Name = "OpenMessage")]
internal class OpenMessageEventSource : EventSource
{
    internal static readonly OpenMessageEventSource Instance = new OpenMessageEventSource();

    private long _inflightMessages = 0;
    private long _processedCount = 0;
    private IncrementingPollingCounter _inflightMessagesCounter;
    private EventCounter _messageDurationCounter;
    private IncrementingPollingCounter _processedCountCounter;

    private OpenMessageEventSource() { }

    [NonEvent]
    public ValueStopwatch? ProcessMessageStart()
    {
        if (!IsEnabled()) return null;

        MessageStart();

        return ValueStopwatch.StartNew();
    }

    [Event(1, Level = EventLevel.Informational, Message = "Consumed Message")]
    private void MessageStart()
    {
        Interlocked.Increment(ref _inflightMessages);
        Interlocked.Increment(ref _processedCount);
    }

    [NonEvent]
    public void ProcessMessageStop(ValueStopwatch stopwatch)
    {
        if (!IsEnabled()) return;

        MessageStop(stopwatch.IsActive ? stopwatch.GetElapsedTime().TotalMilliseconds : 0.0);
    }

    [Event(2, Level = EventLevel.Informational, Message = "Message Completed")]
    private void MessageStop(double duration)
    {
        Interlocked.Decrement(ref _inflightMessages);
        _messageDurationCounter.WriteMetric(duration);
    }

    protected override void OnEventCommand(EventCommandEventArgs command)
    {
        if (command.Command == EventCommand.Enable)
        {
            _inflightMessagesCounter ??= new IncrementingPollingCounter("inflight-messages", this, () => _inflightMessages)
            {
                DisplayName = "Inflight Messages",
                DisplayUnits = "Messages"
            };
            _messageDurationCounter ??= new EventCounter("message-duration", this)
            {
                DisplayName = "Average Message Duration",
                DisplayUnits = "ms"
            };
            _processedCountCounter ??= new IncrementingPollingCounter("processed-count", this, () => _processedCount)
            {
                DisplayName = "Messages Processed",
                DisplayRateTimeScale = TimeSpan.FromSeconds(1)
            };
        }
    }

    // ... code omitted for brevity
}
```

The example above is designed to track the number of messages processed by our system, and how long on average they took to process. The event source is also designed to be lazily initialized, so we only track information when the EventSource is enabled. Let's take a look at how we've accomplished this by looking at `OnEventCommand`:

```csharp
protected override void OnEventCommand(EventCommandEventArgs command)
{
    if (command.Command == EventCommand.Enable)
    {
        _inflightMessagesCounter ??= new IncrementingPollingCounter("inflight-messages", this, () => _inflightMessages)
        {
            DisplayName = "Inflight Messages",
            DisplayUnits = "Messages"
        };
        _messageDurationCounter ??= new EventCounter("message-duration", this)
        {
            DisplayName = "Average Message Duration",
            DisplayUnits = "ms"
        };
        _processedCountCounter ??= new IncrementingPollingCounter("processed-count", this, () => _processedCount)
        {
            DisplayName = "Messages Processed",
            DisplayRateTimeScale = TimeSpan.FromSeconds(1)
        };
    }
}
```

This is where we register the event counters that we are interested in tracking. EventSource's can receive commands from external sources, so that they can enable the EventCounter API etc. We can receive this message from applications multiple times, so it's important to to make sure that we defensively programme. In the sample above, I use the new null-assignment expression to ensure that only when the field is null, do we perform the expression on the right hand side - which in our case is creating the counters.

There are four available types of counters available for us to use, which I will cover later on:

- EventCounter
- IncrementingEventCounter
- PollingCounter
- IncrementingPollingCounter

Next, we need to look how we can actually record the metrics. In order to do this, I've combined it with using EventSource Event's so that I can also get the information that I want inside of other tools like PerfView should I want to:

```csharp
[NonEvent]
public ValueStopwatch? ProcessMessageStart()
{
    if (!IsEnabled()) return null;

    MessageStart();

    return ValueStopwatch.StartNew();
}

[Event(1, Level = EventLevel.Informational, Message = "Consumed Message")]
private void MessageStart()
{
    Interlocked.Increment(ref _inflightMessages);
    Interlocked.Increment(ref _processedCount);
}

[NonEvent]
public void ProcessMessageStop(ValueStopwatch stopwatch)
{
    if (!IsEnabled()) return;

    MessageStop(stopwatch.IsActive ? stopwatch.GetElapsedTime().TotalMilliseconds : 0.0);
}

[Event(2, Level = EventLevel.Informational, Message = "Message Completed")]
private void MessageStop(double duration)
{
    Interlocked.Decrement(ref _inflightMessages);
    _messageDurationCounter.WriteMetric(duration);
}
```

We have two operations that we are really interested in Start &amp; Stop. In the example above, each of the operations is split out into a `[NonEvent]` and a corresponding `[Event]`. The `[Event]` is what the EventSource system uses to write the events to the underlying stream so that it can be picked up by tools such as PerfView. The entry point is always the `[NonEvent]` so that we can check to see if anyone is listening to the EventSource before we do anything, this helps ensure that it does not emit the Event unnecessarily. This is the same pattern that is used throughout the .Net Code base from what I can tell.

For the `[Event]`'s, you will notice that the Start/Stop is EventId 1/2 respectively and the also end with Start/Stop. This allows some magic to happen such as automatically figuring out the duration inside of PerfView. For more information on some of the magic that occurs, I strongly recommend reading [Vance Morrison's Excellent Blog Post](https://blogs.msdn.microsoft.com/vancem/2015/09/14/exploring-eventsource-activity-correlation-and-causation-features/) instead of me duplicating the knowledge here.

Once you have your EventSource configured, and you know which metrics you wish to track, then all that's left is to start recording your metrics (eg: `OpenMessageEventSource.ProcessMessageStart()`) and the runtime will take care of the rest.

### Other EventSource Examples

For some inspiration of how to configure your EventSource's, here are a few examples from Microsoft:

- [HostingEventSource](https://github.com/aspnet/AspNetCore/blob/master/src/Hosting/Hosting/src/Internal/HostingEventSource.cs): Used to track the current number of requests including: failed/total/requests per second.
- [KestrelEventSource](https://github.com/aspnet/AspNetCore/blob/master/src/Servers/Kestrel/Core/src/Internal/Infrastructure/KestrelEventSource.cs): Used to track details of connections to the Kestrel WebServer - including when connections and requests Start/Stop.
- [ConcurrencyLimiterEventSource](https://github.com/aspnet/AspNetCore/blob/master/src/Middleware/ConcurrencyLimiter/src/ConcurrencyLimiterEventSource.cs): Used to track the number of queued requests and the duration in the queue.

## Types of DiagnosticCounters

The `DiagnosticCounter` class is the abstract base class that all of the event counters types inherit from. Currently, there are four implementations registered in the [source](https://source.dot.net/#Microsoft.Diagnostics.Tracing.EventSource/DiagnosticCounter.cs,28677f9e15895cc9,references): `EventCounter`, `IncrementingEventCounter`, `PollingCounter` and `IncrementingPollingCounter`. Although abstract, we can't really inherit from `DiagnosticCounter` as the internal components that we need, which are described below, are protected from external use. The four implementations that I mentioned, appear to cover pretty much every use case that I can think of anyway.

### EventCounter

This type of event counter is typically used for tracking latency of requests to external parties due to the aggregated stats that this type provides. An EventCounter instance tracks the following about the metrics that it's recorded:

|Name|Type|Notes|
|---|---|---|
|Name|string||
|DisplayName|string||
|Mean|double|The average of all values recorded|
|StandardDeviation|double||
|Count|int|How many metric entries were recorded in this iteration|
|Min|double||
|Max|double||
|IntervalSec|float||
|CounterType|string|Always "Mean"|
|Metadata|string|Any associated metadata for this specific counter|
|DisplayUnits|string||
|Series|string|Format is: $"IntervalSec={IntervalSec}"|

In order to write data, you need to call `<counter>.WriteMetric(value)`.

### IncrementingEventCounter

An IncrementingEventCounter is typically used to track ever increasing numbers such as the total number of requests. Unlike it's namesake, EventCounter, this class does not provide any statistics about the data. In other words, it is a pure counter, so only the following information is tracked:

|Name|Type|Notes|
|---|---|---|
|Name|string||
|DisplayName|string||
|DisplayRateTimeScale|string|The unit of measure that the metric should be shown in, eg: per-second|
|Increment|double|The value of the this is: currentValue - previousValue|
|IntervalSec|float||
|Metadata|string||
|Series|string|Format is: $"IntervalSec={IntervalSec}"|
|CounterType|string|Always "Sum"|
|DisplayUnits|string||

In order to write data, you need to call `<counter>.Increment(value)`. The `Increment` that you receive is always `currentValue - previousValue`.

### PollingCounter

A PollingCounter is very much like a standard EventCounter, but instead of the metric being written to it, a function is invoked which retrieves the value from your source of choice. An PollingCounter instance tracks the following about the metrics that it's recorded:

|Name|Type|Notes|
|---|---|---|
|Name|string||
|DisplayName|string||
|Mean|double|The average of all values recorded|
|StandardDeviation|double||
|Count|int|How many metric entries were recorded in this iteration|
|Min|double||
|Max|double||
|IntervalSec|float||
|CounterType|string|Always "Mean"|
|Metadata|string|Any associated metadata for this specific counter|
|DisplayUnits|string||
|Series|string|Format is: $"IntervalSec={IntervalSec}"|

### IncrementingPollingCounter

A IncrementingPollingCounter is very much like a standard IncrementingEventCounter, but instead of the metric being written to it, a function is invoked which retrieves the value from your source of choice. An IncrementingPollingCounter instance tracks the following about the metrics that it's recorded:

|Name|Type|Notes|
|---|---|---|
|Name|string||
|DisplayName|string||
|DisplayRateTimeScale|string|The unit of measure that the metric should be shown in, eg: per-second|
|Increment|double|The value of the this is: currentValue - previousValue|
|IntervalSec|float||
|Metadata|string||
|Series|string|Format is: $"IntervalSec={IntervalSec}"|
|CounterType|string|Always "Sum"|
|DisplayUnits|string||

## Under the hood

Now that we've taken a look at how we construct the EvenSource so that we can create our application level metrics, we should also take a look at what happens under the hood so we can begin to complete the circle. Once you start creating any of the listed DiagnosticCounters in your application - the counter calls a method which ensures that the counter gets added to a `CounterGroup` associated with the specified EventSource. When a DiagnosticCounter is disposed, then it is removed from the CounterGroup and no longer tracked.

The `CounterGroup` is responsible for maintaining a thread that polls the DiagnosticCounters on the specified interval and updates their values. The thread isn't created until such time as an application calls `EnableEvents(eventSource, EventLevel.LogAlways, EventKeywords.All, new Dictionary<string, string>{{"EventCounterIntervalSec", "1"}});` on an EventSource. Lastly, when the value of each DiagnosticCounter is updated, an event is raised against the EventSource that was passed to the counter which means that we can listen to this in the same way that we listen to other events on EventSource's - eg: PerfView/EventListener.

The whole EventSource system is very lightweight and designed for scalability in systems that generate millions of events - so we should not be too concerned about the performance of this. Naturally, the more that you listen to, the more impact this will have. I think it's safe to say, the code that we write in the listeners will likely be the slowest part of this system.

## Listening for event counters

Lastly, in order to complete our circle, we need to be able to listen to the counters that we've created in our applications. There are two common approaches that we can use: the CLI tool `dotnet-counters` or from within our applications using an `EventListener`.

### Consuming EventCounters using dotnet-counters

As part of the diagnostic improvements in .Net Core 3, the .Net team introduced a new diagnostics tool called `dotnet-counters`. This is a stand-alone tool that can be installed using the following command:

```plain
dotnet tool install dotnet-counters --global
```

Or updated to the latest version if you already have it installed:

```plain
dotnet tool update dotnet-counters --global
```

After the tool has been installed, you can see the processes that are eligible for attaching to, using:

```plain
dotnet-counters ps
    10416 dotnet     C:\Program Files\dotnet\dotnet.exe
    20660 dotnet     C:\Program Files\dotnet\dotnet.exe
    21172 dotnet     C:\Program Files\dotnet\dotnet.exe
```

Once you know the process that you want to attach to, you can start monitoring with the following command:

```plain
dotnet-counters monitor -p 21172
```

If you are interested in specific EventSources, then you can supply a space separated list of EventSources like:

```plain
dotnet-counters monitor -p 21172 System.Runtime MyEventSource
```

By default, when you ask to monitor an EventSource, it will capture and display all the counters for you. If no EventSources are specified then a default list is used, including: `System.Runtime`. If you only wish to track a few counters from each EventSource, then you specify them in square brackets directly after the EventSource name:

```plain
dotnet-counters monitor -p 21172 System.Runtime[cpu-usage] MyEventSource[test]
```

All of the monitor commands will output something similar to the following:

```plain
Press p to pause, r to resume, q to quit.
    Status: Running

[System.Runtime]
    CPU Usage (%)                                      0
[MyEventSource]
    test                                             335
```

Lastly, should you wish to control the rate that the counters are refreshed, supply the `--refresh-interval` parameter:

```plain
dotnet-counters monitor -p 21172 --refresh-interval 5 System.Runtime[cpu-usage] MyEventSource[test]
```

### Consuming EventCounters within our applications

In order to enable tracing from within a .Net application you need three core parts:

1. Class inheriting from EventListener
1. Detecting of EventSource's
1. Processing of Events

#### Creating our EventListener

For our new EventListener, I will create a simple background service as follows:

```csharp
internal sealed class MetricsCollectionService : EventListener, IHostedService
{
    public Task StartAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
```

This will live for the lifetime of the application and host the task that will detect lazily initiated EventSources, such as the OpenMessage one I showed earlier in this article.

#### Detecting EventSources

In order to detect the lazily initiated EventSources, we need to periodically call the method `EventSource.GetSources()` which lists all of the currently available sources. we can do this from a simple task that lives against the service:

```csharp
internal sealed class MetricsCollectionService : EventListener, IHostedService
{
    private List<string> RegisteredEventSources = new List<string>();
    private Task _newDataSourceTask;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _newDataSourceTask = Task.Run(async () =>
        {
            while (true)
            {
                GetNewSources();
                await Task.Delay(1000);
            }
        });

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    protected override void OnEventSourceCreated(EventSource eventSource)
    {
        if (!RegisteredEventSources.Contains(eventSource.Name))
        {
            RegisteredEventSources.Add(eventSource.Name);
            EnableEvents(eventSource, EventLevel.LogAlways, EventKeywords.All, new Dictionary<string, string>
            {
                {"EventCounterIntervalSec", "1"}
            });
        }
    }

    private void GetNewSources()
    {
        foreach (var eventSource in EventSource.GetSources())
            OnEventSourceCreated(eventSource);
    }
}
```

We've got a list of the EventSources that we have already asked to be enabled so that we don't continually ask them to enable themselves. This helps guard against any slightly mis-constructed EventSources, though not strictly necessary.

#### Processing Events

The last bit for us to do is to override the `OnEventWritten`:

```csharp
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

    // do something with your metric here...
}
```

This method gets called for each EventSource that you have asked to receive the data from. It will be up to you to decide your own filtering policy. For each `EventWrittenEventArgs` that you receive, you need to double check that you have received an EventCounter before proceeding. Next, you need to check the payload that you received is indeed a `IDictionary<string, object>`, so that you can process the contents in a quick and efficient manner. Although in the implementations, there is a strongly typed class for the payload for each of the built in counters, it is internal so we are unable to consume it here. The last piece of the puzzle is for you to process the metric however you wish, ie: sending to DataDog.

Putting all of the above code together, we get something like the following:

```csharp
internal sealed class MetricsCollectionService : EventListener, IHostedService
{
    private List<string> RegisteredEventSources = new List<string>();
    private Task _newDataSourceTask;

    public Task StartAsync(CancellationToken cancellationToken)
    {
        _newDataSourceTask = Task.Run(async () =>
        {
            while (true)
            {
                GetNewSources();
                await Task.Delay(1000);
            }
        });

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    protected override void OnEventSourceCreated(EventSource eventSource)
    {
        if (!RegisteredEventSources.Contains(eventSource.Name))
        {
            RegisteredEventSources.Add(eventSource.Name);
            EnableEvents(eventSource, EventLevel.LogAlways, EventKeywords.All, new Dictionary<string, string>
            {
                {"EventCounterIntervalSec", "1"}
            });
        }
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

        // do something with your metric here...
    }

    private void GetNewSources()
    {
        foreach (var eventSource in EventSource.GetSources())
            OnEventSourceCreated(eventSource);
    }
}
```

Hopefully at this point, you have enough information on how to use the built in counters and creating your own metrics. Let me know on [Twitter](https://twitter.com/im5tu) if you have any thoughts or comments on the contents of this post.

Thanks for reading, happy counting! :)
