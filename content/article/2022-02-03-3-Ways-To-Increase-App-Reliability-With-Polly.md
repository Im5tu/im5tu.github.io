{
    "title": "3 Ways To Increase App Reliability With Polly",
    "description": "Learn how to use retries with decorrelated jitter, bulkhead and circuit breaker patterns to increase reliability in your applications with Polly",
    "tags": ["aspnetcore", "dotnet", "diagnostics"],
    "date": "2022-02-03T08:30:00Z",
    "categories": ["aspnetcore", "dotnet", "diagnostics"],
    "toc": true
}

{{< youtube id="4mWkb3tHDf0" >}}

In this article, we're going to take a look at the different ways that you can make your .NET applications more stable by using 3 different patterns: Retrying with decorrelated jitter, bulkheads and circuit breakers.

<!--more-->

In order to create highly resilient applications, we must embrace the fact that applications will fail, often at inopportune times. Failures can come in many forms such as temporary loss of services, complete service failure or timeouts. When failure occurs, we can choose whether or not we should retry the behaviour. Our ethos should be that all non-safe operations (eg: PUT/DELETE etc) should be idempotent so that we can retry the operation ensuring our applications complete the tasks correctly.

## Pattern 1 - Retry Policies with decorrelated Jitter

The first pattern that we're going to look at is retries with decorrelated jitter. When we write a retry policy with generally retry under the following conditions:

- Ensure retries are on all third party calls (eg: dynamo, http, sql)
- Retry on timeouts
- Retry on failures (eg: socket exceptions)
- Retry when HTTP Calls return a 5XX status code

When we retry, we generally have a period of time in which we backoff to allow the external system to recover. If we have a high amount of concurrent operations, then we will backoff and retry at the same time, potentially overloading the system again. To counteract this, we add randomness to the retry delays which is also known as jitter. Jitter has been shown to massively decrease the total operation duration in a failure scenario.

Our library of choice when implementing retry policies is to use Polly. The team behind Polly, and its many contributors, have placed a lot of effort in behind finding an efficient way of using retry policies with jitter. Without jitter, our retry policies will be correlated like the below:

![Exponential backoff](/img/polly/expo_backoff.png)

_[Image Credit](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)_

However, with jitter, our retry policies will be a bit better:

![Exponential backoff with jitter](/img/polly/exponential-backoff-and-jitter.png)

_[Image Credit](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)_

The Polly team have spent [a lot of time](https://github.com/App-vNext/Polly/issues/530) coming up with a great decorrelated jitter implementation which flattens the curve and reduces the amount of overall work that needs to be done:

![Polly decorrelated jitter implementation](/img/polly/NewJitterFormulaRetryCount5InitialDelay1Second.png)

This implementation is standard in all of my projects both in and outside of work. To use the implementation we need to import the `Polly.Contrib.WaitAndRetry` [NuGet Package](https://www.nuget.org/packages/Polly.Contrib.WaitAndRetry/), followed by setting up a new backoff policy:

```csharp
static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy(int medianFirstRetryDelay = 35, int retryCount = 7)
{
    var delay = Backoff.DecorrelatedJitterBackoffV2(medianFirstRetryDelay: TimeSpan.FromMilliseconds(medianFirstRetryDelay), retryCount: retryCount);
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(delay);
}

services.AddHttpClient("Client Name", client =>
    {
        // Your client setup, eg: setting up base address
    })
    .AddPolicyHandler(GetRetryPolicy());
```

The above implementation shows you how to use the retry policy alongside the HttpClientFactory provided by Microsoft via their NuGet package: [Microsoft.Extensions.Http.Polly](https://www.nuget.org/packages/Microsoft.Extensions.Http.Polly/). When a transient request failure occurs, then the package will retry 7 times (default above) before returning an exception back to the caller. Each retry attempt will increase inline with the backoff policy defined by the Polly implementation ensuring that your apps have the best chance to succeed.

## Pattern 2 - Bulkhead

The next pattern that we are going to take a look at is the bulkhead pattern. A bulkhead is used to control access to a common resource by multiple threads to avoid overloading it and causing cascading failures within a system. It does this by placing limits on what a system can process with a fixed length queue of pending requests. Once the pending request queue is full then the request is rejected and returned to the caller. This helps leave the system resources for requests that the system can process.

We can visualize this with the diagram below:

![Bulkhead Policy](/img/polly/Bulkhead-Policy.jpg)

We find the the maximum concurrent requests through [stress testing](https://k6.io/docs/test-types/stress-testing/) our target service so that we know what the breaking point of that service is. We then test our service under load to figure out how many pending requests we can have before our application starts to fail. I usually start with 2-4x our inflight requests number and increase/decrease depending on how the application performs.

A bulkhead can be placed on either the client side or the server side, although it is more common to see it on the server side as that's where the expensive computation occurs. As a minimum, we should provide the amount of concurrent requests (capacity below) and the amount of pending requests (queueLength below):

```csharp
static IAsyncPolicy<HttpResponseMessage> GetBulkheadPolicy(int capacity, int queueLength)
{
    return Policy.BulkheadAsync<HttpResponseMessage>(capacity, queueLength);
}

services.AddHttpClient("Client Name", client =>
    {
        // Your client setup, eg: setting up base address
    })
    .AddPolicyHandler(GetBulkheadPolicy(50, 200));
```

As with the retry example earlier, we've attached our policy to a HTTP client that we know can't take a large volume of load. As soon as we hit 50 concurrent requests, the policy will add subsequent requests to the pending request queue. Once the pending request queue is full, then the policy will start rejecting any other calls to the service. Polly does provide an overload that takes an action should you need a callback when something has been rejected by the bulkhead policy.

## Pattern 3 - Circuit Breaker

The next pattern that we are going to take a look at is the circuit breaker pattern. A circuit breaker detects the amount of faults in calls placed through it, and prevents calls when a configurable fault threshold is exceeded. For example, you are calling an API that is continously returning 500 status code results because of a failure condition. In this case, a circuit breaker would trigger and prevent calls from being forwarded to that service, giving it the opportunity to recover automatically. After a period of time, the circuit breaker would re-open and allow calls back to the hopefully recovered service.

A circuit breaker has three states, as visualised below: Closed, Open, Half-Open

![Circuit Breaker States](/img/polly/CircuitBreakerStates.png)

_[Image Credit](https://github.com/App-vNext/Polly/wiki/Circuit-Breaker)_

In the open state, no requests are forwarded to the target as the circuit breaker has detected it's in a unhealthy state. In the closed state, requests are forwarded to the target system as normal. Whilst in the half-open state, each request is treated as an experiment to see whether or not the target system has recovered and places the circuit breaker in to the open/closed state depending on the result of the operation.

Polly makes implementing this pattern really easy by providing us an `AdvancedCircuitBreaker`. This is an improvement on the original `CircuitBreaker` implementation as it now reacts on a proportion of failures which is measured over a duration of time. It also ensures that we have a minimum amount of throughput before it starts monitoring for failures.

```csharp
static AsyncPolicy GetCircuitBreakerPolicy()
{
    return Policy.Handle<Exception>()
                 .AdvancedCircuitBreakerAsync(0.5, TimeSpan.FromSeconds(10), 100, TimeSpan.FromSeconds(5));
}
```

Here we specify four configuration parameters, in order:

- Failure percentage: a value between 0 and 1 that specifies the threshold of failures. For example, a value of `0.5` would indicate a 50% failure rate
- Monitoring period: The amount of time that we should monitor calls for. For example: within a ten second period, we would need 50% failures for the circuit breaker to trigger
- Minimum load: The minimum number of calls within that monitoring period that we would need in order for the circuit breaker to trigger. For example, we would need a 50% failure rate within a ten second period once with a minimum of 100 calls (so 50 calls would need to fail)
- Cooldown: Once the circuit breaker has triggered, the state will revert to closed after the specified cool down period

This policy is very flexible so I suggest that you read the [Polly documentation](https://github.com/App-vNext/Polly/wiki/Advanced-Circuit-Breaker) before implementing.

## Combining multiple policies

Whilst all of the policies that we've seen here can be game changers for our applications, if we combine them, then they become even more powerful. I typically implement both the decorrelated jitter and the bulkhead together to constrain the resources used by any given service. To do this, Polly offers a simple extension called `Wrap` which takes multiple policies and executes them in the order specified as a brand new policy.

`Policy.WrapAsync` takes 2 or more policies and wraps them from left to right as the outermost policy to the innermost policy. Let's take a look at the following example:

```csharp
using Polly;
using Polly.Bulkhead;
using Polly.Contrib.WaitAndRetry;

var policy = Policy.WrapAsync(GetRetryPolicy(), GetBulkheadPolicy(5, 5));
policy.ExecuteAsync(async () =>
{
    Console.WriteLine("Starting task: " + i);
    await Task.Delay(250);
    Console.WriteLine("Finished task: " + i);
});

static AsyncPolicy GetRetryPolicy(int retryCount = 5)
{
    var delay = Backoff.DecorrelatedJitterBackoffV2(medianFirstRetryDelay: TimeSpan.FromMilliseconds(50), retryCount: retryCount);
    return Policy.Handle<Exception>()
        .WaitAndRetryAsync(delay, ((exception, span, arg3, arg4) => Console.WriteLine("Retrying task")));
}

static AsyncBulkheadPolicy GetBulkheadPolicy(int capacity, int queueLength)
{
    return Policy.BulkheadAsync(capacity, queueLength, context =>
    {
        Console.WriteLine("Rejected Call");
        return Task.CompletedTask;
    });
}
```

This would produce a policy similar to the following:

![Wrapped Policies](/img/polly/WrappedPolicies.jpg)

Once the returned policy is executed, then the retry policy is invoked with it's action to be calling the bulkhead policy, which in turn invokes the action specified by the user. This means, in the above example, that we can have all of our calls to our downstream service including those that are retried, all going through the same bulkhead policy that we've implemented. This can help relieve tension on the underlying system.

Hopefully the policies that I've shown you here will give you some ideas that you can implement into your systems and help your systems to remain more reliable under failure conditions such as load!
