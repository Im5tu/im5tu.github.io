{
    "title": "Blending Metrics Using EventCounters In C#",
    "description": "As companies grow, moving to a zero-trust architecture is majorly important. This article explores how to build it in AWS.",
    "tags": ["aspnet", "dotnet", "diagnostics", "AWS"],
    "date": "2020-12-27T12:53:17Z",
    "categories": ["Development"],
    "toc": true
}

In a world where we use auto-scaling a lot, its often not just one metric that we will take into consideration when deciding whether or not to scale our applications. For example, we might have a combination of CPU usage, memory usage and web request latency. Some services like AWS CloudWatch Metrics only allow scaling based off a single value. Luckily, we can blend metrics together to create new ones, which we can then use in our scaling policies. A blended metric is made up of however one or more existing metrics that you choose, called aspects, and can be published as if it were any other metric, eg: publish to DataDog/Cloudwatch.

<!--more-->

Each aspect contains the following:

- Name: This is the name of the metric that you wish to track
- Minimum: This indicates the lower bounds of the metric, which if breached will be kept at this value
- Maximum: This indicates the upper bounds of the metric, which if breached will be kept at this value
- Weighting: This increases the impact of this metric on the overall score, useful for when one metric impacts more than another

## Value Calculation

In essence there are four points to the calculation:

1. Get the value limited by the minimum and maximum bounds
1. Get the value as a fraction of the maximum value
1. Apply the weight to the fractional value
1. Average all aspect values together to get the final score

Let's walk through how this works in reality. Assume we have the following configuration:

- Aspect 1: Minimum=0, Maximum=100, Weighting=0, Value=50
- Aspect 2: Minimum=0, Maximum=100, Weighting=1, Value=50

For step 1, we need to check whether the value supplied is between the specified minimum and maximum. For this example, it is, but if the value was greater than the maximum (eg: 150), the value would be set to 100 (the maximum value allowed). The same logic applies inversely for the minimum value.

For step 2, we take the value and divide it by the maximum allowed value. This returns us a value between 0 & 1 - in our case, it's `0.5` for both aspects.

As we now know that step 2 returns the value `0.5` in both aspects, we can add the weighting value: `value = value * (1 + weighting)`. For aspect 1, we would end up with the calculation `value = 0.5 x 1 = 0.5`. Whereas for aspect 2, we would end up with the calculation `value = 0.5 x 2 = 1`.

For the last step, we calculate the average of the values with their weights applied, eg: `(0.5 + 1) / 2 = 0.75`. `0.75` is the value that will be reported for the metric.

_**Note:** An aspect's weighting must be between 0 and 1._

## Implementation

The implementation I am about to show builds upon my previous work with [EventCounters](http://localhost:1313/series/diagnostics-in-.net-core-3/) and [Publishing to CloudWatch](/article/2020/12/publish-metrics-to-cloudwatch-in-.net-core/), which I would encourage you to read. First, let's take a look at the `SimpleMetricObserver` class, which is a simple helper class that saves some of the boilerplate for the observable pattern:

```csharp
public abstract class SimpleMetricObserver : IObserver<MetricUpdate>
{
    /// <inheritDoc />
    public virtual void OnCompleted() { }

    /// <inheritDoc />
    public virtual void OnError(Exception error) { }

    /// <inheritDoc />
    public abstract void OnNext(MetricUpdate value);
}
```

Next, we can take a look at the implementation of `BlendedMetricObserver`. This observer is designed to listen to a series of metrics from the published metric stream I created in the [CloudWatch article](/article/2020/12/publish-metrics-to-cloudwatch-in-.net-core/):

```csharp
internal class BlendedMetricObserver : SimpleMetricObserver, IDisposable
{
    private readonly string _name;
    private readonly IOptionsMonitor<BlendedMetricOptions> _blendedMetricOptionsMonitor;
    private readonly Dictionary<string, BlendedMetricAspect> _aspects = new Dictionary<string, BlendedMetricAspect>();
    private readonly Dictionary<string, double> _values = new Dictionary<string, double>();
    private readonly List<IDisposable> _disposables = new List<IDisposable>();
    private PollingCounter? _counter = null;

    public BlendedMetricObserver(string name, IOptionsMonitor<BlendedMetricOptions> blendedMetricOptionsMonitor)
    {
        _name = name ?? throw new ArgumentNullException(nameof(name));
        _blendedMetricOptionsMonitor = blendedMetricOptionsMonitor ?? throw new ArgumentNullException(nameof(blendedMetricOptionsMonitor));
        _disposables.Add(_blendedMetricOptionsMonitor.OnChange(options => UpdateSettings(options)));
        UpdateSettings(_blendedMetricOptionsMonitor.Get(name));
    }

    public override void OnNext(MetricUpdate value)
    {
        lock (_values)
        {
            if (!_aspects.TryGetValue(value.Name, out var aspect))
                return;

            var filters = aspect.TagFilters.ToList();

            if (filters.Count == 0 || filters.All(x => value.Tags.Contains(x, TagFilterComparer.Instance)))
                _values[value.Name] = ConvertToWeightedValue(aspect, value.Value);
        }
    }

    // Exposed as protected so that we have at least some way of testing this
    protected double GetCurrentValue()
    {
        lock (_values)
        {
            if (_values.Count == 0)
                return 0;

            // Calculate the average of whether or not we should scale based on the weighted value of each metric
            // perf: do not use linq for this
            var total = 0d;
            foreach (var entry in _values)
                total += entry.Value;

            return total / _values.Count;
        }
    }

    private static double ConvertToWeightedValue(BlendedMetricAspect aspect, double value)
    {
        // Get the value or the lower/upper boundary, where applicable
        value = Math.Min(Math.Max(aspect.Minimum, value), aspect.Maximum);

        // work out the value as a fraction of the maximum value
        value /= aspect.Maximum;

        // Add the weighting to the value
        value *= (1 + aspect.Weighting);

        // Return the value bounded by 0 and 1
        return Math.Min(Math.Max(0, value), 1);
    }

    private void UpdateSettings(BlendedMetricOptions options)
    {
        if (!string.Equals(options.MetricName, _name))
            return;

        lock (_values)
        {
            _aspects.Clear();
            _values.Clear();

            if (_counter is null)
            {
                _counter = new PollingCounter(_name, MyEventSource.Instance, () => GetCurrentValue());

                foreach ((string key, string value) in options.Tags)
                    _counter.AddMetadata(key, value);
            }

            foreach (var aspect in options.Aspects)
            {
                if (string.IsNullOrWhiteSpace(aspect.Name))
                    continue;

                _aspects[aspect.Name] = aspect;
            }
        }
    }

    public void Dispose()
    {
        foreach (var disposable in _disposables)
            disposable.Dispose();

        _disposables.Clear();
        _values.Clear();
        _aspects.Clear();
    }

    private class TagFilterComparer : IEqualityComparer<KeyValuePair<string, string>>
    {
        internal static readonly TagFilterComparer Instance = new TagFilterComparer();

        public bool Equals(KeyValuePair<string, string> x, KeyValuePair<string, string> y)
        {
            return string.Equals(x.Key, y.Key, StringComparison.Ordinal) && string.Equals(x.Value, y.Value, StringComparison.Ordinal);
        }

        public int GetHashCode(KeyValuePair<string, string> obj)
        {
            return HashCode.Combine(obj.Key, obj.Value);
        }
    }
}
```

Let's break down some of the core methods. Firstly, the `OnNext` method is probably one of the most important ones as it listens to the incoming stream of metric data that is being published from our application, filtering for only the information that makes up our blended metric, before storing its value so that we can use it in the calculation portion. One thing to note in here as well, is that we can filter metrics by specific tags as well in our configuration. This means that we can re-use the same name and vary the metric by tags, much like we did in the [Capturing HTTP requests article](/article/2020/06/diagnostics-in-.net-core-3-listening-to-outbound-http-requests/). This is where the `TagFilterComparer` comes in handy, helping to determine equality in metric tags.

The `ConvertToWeightedValue` method takes the latest stored values of each of the aspects that make up the blended metric and performs the value calculation as described earlier in the article. This method is called periodically, depending on interval set by the `EnableEvents` call on the EventSource that we are registering the blended metric against. You can see how to do that [here](/article/2020/01/diagnostics-in-.net-core-3-event-counters/#detecting-eventsources).

Lastly, the `UpdateSettings` method is responsible for (re)creating the polling counter which will refresh on the specified interval that has been setup on the EventSource (eg: every second). Whilst

### Options & Validation

As you may have seen above, we have a specific options class that we use to track the different options of the blended metric:

```csharp
/// <summary>Represents a metric that is made up of one or more metrics</summary>
public sealed class BlendedMetricOptions
{
    /// <summary>The name to send the metric through as</summary>
    public string? MetricName { get; set; }

    /// <summary>A collection of metrics that make up the blended metric</summary>
    public IEnumerable<BlendedMetricAspect> Aspects { get; set; } = Enumerable.Empty<BlendedMetricAspect>();

    /// <summary>The tags that should be applied to the blended metric</summary>
    public IEnumerable<KeyValuePair<string, string>> Tags { get; set; } = Enumerable.Empty<KeyValuePair<string, string>>();
}

/// <summary>Represents a part that makes up the blended metric</summary>
public sealed class BlendedMetricAspect
{
    /// <summary>The full name of the metric</summary>
    public string? Name { get; set; }

    /// <summary>The lower limit of the metric. If the value is less than this value, it is set to this value.</summary>
    public double Minimum { get; set; } = 0;

    /// <summary>The upper limit of the metric. If the value is greater than this value, it is set to this value.</summary>
    public double Maximum { get; set; } = 100;

    /// <summary>The weighting that's applied to the metric</summary>
    public double Weighting { get; set; } = 0;

    /// <summary>Filters a metric where the specified tags are present</summary>
    public IEnumerable<KeyValuePair<string, string>> TagFilters = Enumerable.Empty<KeyValuePair<string, string>>();

    public BlendedMetricAspect()
    {
    }

    public BlendedMetricAspect(string name, double minimum = 0, double maximum = 100, double weighting = 0, IEnumerable<KeyValuePair<string, string>>? tagFilters = null)
    {
        Name = name;
        Minimum = minimum;
        Maximum = maximum;
        Weighting = weighting;
        TagFilters = tagFilters ?? Enumerable.Empty<KeyValuePair<string, string>>();
    }

    /// <summary>Factory function for creating a new instance</summary>
    public static BlendedMetricAspect Create(string name, double minimum = 0, double maximum = 100, double weighting = 0, IEnumerable<KeyValuePair<string, string>>? tagFilters = null)
        => new BlendedMetricAspect(name, minimum, maximum, weighting, tagFilters);
}
```

For completeness, I've included a simple options validator to ensure that we stick within some of the basic rules that we described earlier. This validation is bound to our IoC container in the next section.

```csharp
internal sealed class BlendedMetricOptionsValidation : IValidateOptions<BlendedMetricOptions>
{
    public ValidateOptionsResult Validate(string name, BlendedMetricOptions options)
    {
        var failures = Validate(options.Aspects);
        return failures.Count > 0 ? ValidateOptionsResult.Fail(failures) : ValidateOptionsResult.Success;
    }

    private static List<string> Validate(IEnumerable<BlendedMetricAspect> aspects)
    {
        var failures = new List<string>();

        var aspectLst = aspects.ToList();
        foreach (var aspect in aspectLst)
        {
            if (string.IsNullOrWhiteSpace(aspect.Name))
                failures.Add($"{nameof(BlendedMetricAspect.Name)} cannot be null, empty or whitespace. Index: {aspectLst.IndexOf(aspect)}");

            if (aspect.Minimum >= aspect.Maximum)
                failures.Add($"Aspect: {aspect.Name} - {nameof(BlendedMetricAspect.Minimum)} (Current: {aspect.Minimum}) must be less than {nameof(BlendedMetricAspect.Maximum)} (Current: {aspect.Maximum}).");

            if (aspect.Weighting < 0 || aspect.Weighting > 1)
                failures.Add($"Aspect: {aspect.Name} - {nameof(BlendedMetricAspect.Weighting)} must be between 0 & 1. Current: {aspect.Weighting}");
        }

        return failures;
    }
}
```

### Extensions

The last part of our implementation is to add some helpful extension methods for configuring new blended metrics in our IoC containers. These methods bind the necessary components and allow you to configure one or more blended metrics either from configuration or from passing the information into the method:

```csharp
public static IServiceCollection AddBlendedMetrics(this IServiceCollection services, IConfigurationSection configurationSection)
{
    foreach (var section in configurationSection.GetChildren())
        services.AddBlendedMetric(section.Key, options =>
        {
            options.MetricName = section.Key;
            configurationSection.Bind(options);
        });

    return services;
}

public static IServiceCollection AddBlendedMetric(this IServiceCollection services, string name, Action<BlendedMetricOptions> configurationAction)
{
    if (string.IsNullOrWhiteSpace(name))
        throw new ArgumentNullException(nameof(name));

    name = name.ToLowerInvariant().Replace("_", "-").Replace(" ", "-");

    services.TryAddSingleton<IValidateOptions<BlendedMetricOptions>, BlendedMetricOptionsValidation>();
    services.AddSingleton<IObserver<MetricUpdate>>(sp => ActivatorUtilities.CreateInstance<BlendedMetricObserver>(sp, name));

    return services.Configure<BlendedMetricOptions>(name, configurationAction);
}

public static IServiceCollection AddBlendedMetric(this IServiceCollection services, string name, Func<IEnumerable<BlendedMetricAspect>> aspects, IEnumerable<KeyValuePair<string, string>>? dimensions = null)
{
    return services.AddBlendedMetric(name, options =>
    {
        options.MetricName = name;
        options.Aspects = options.Aspects.Concat(aspects()).ToList();

        if (dimensions is {})
            options.Tags = dimensions.ToList();
    });
}
```

That pretty much wraps up our basic implementation of blended metrics. With the complete implementation, we should have our metrics published to our provider of choice. I hope you can see how useful they can be when combined with things like auto-scaling. Enjoy!
