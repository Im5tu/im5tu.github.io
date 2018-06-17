{
   "categories": [ "Development" ],
   "date": "2018-06-04T14:38:07+01:00",
   "description": "Explore the basics of our correlation context.",
   "tags": [ "IIS", "Url Rewrite", "Cookies" ],
   "title": "Correlation Context Part 1: The Context",
   "draft": true
}

Over the past few months, my colleagues and I have been implementing a way of correlating all the events that happen in our micro-service based system. We cross all service boundaries including async-await, service bus and service fabric. With the entire architecture covered, we have massively increased debugging and operational support capabilities within our problem domain.

<!--more-->

In the next five posts you can expect to see how we do the following:

1. Establish a correlation context (this post)
2. Integration with Asp.Net Core
3. Integration with Azure Application Insights
4. Integration with Azure Service Bus
5. Integration with Azure Service Fabric

I'm sure that I don't need say this, but this isn't for everyone. For some scenarios, it isn't even a good idea. That said, hopefully you will learn something interesting on the journey or a technique or two that you can apply to your own problem domain.

When this idea was originally proposed, our problem was defined as: How can we effectively track what's going on in our system without passing a huge custom object around.
Our current situation wasn't a great situation to be in. However, we found ourselves with time in which we could revisit the status quo and change it to make our lives better. We settled on having a single id in which we could pass around the system and make all of our logging, auditing and telemetry consume this piece of information. Once complete, we would have a system that we could diagnose or use for producing operational reports (from our audits).

The next question we had to solve was how we were going to achieve this feat. At first it seemed like quite a daunting task. Should we pass this new id through, what would effectively be, every method in our system or could we be a little cheeky and hide it from our developers and make an implicit context.

Having an implicit context is not without its downsides. It's very easy to forget that it's there or miss out vital integration points entirely. We have our own wrappers around various core components, so we are fairly confident that we can manage this effectively - with the help of standard tools such as code reviews.

For the rest of this post, I will show you how to construct a correlation context that supports multiple values which follows across async/await boundaries. Here are the list of the operations that we are going to support in our new correlation context:

- Creating a new correlation id if one doesn't already exist
- Creating a new correlation id with a specific id
- Getting the current correlation id
- Removing the correlation id when the scope of that correlation is over
- Getting a stack of depth of correlation, so that we can serialise later

I've covered the scenario of allowing you to specific the id for the scenarios that you are receive the id from an external system or are in the process of migrating etc. Plus, it's an easy change to make and allows a little more flexibility.

Now we have our requirements, here is the API surface that we will implement:

```c#
public static class CorrelationContext
{
    public static Stack<Guid> GetCorrelationStack() {}
    public static Guid? GetCorrelationId() {}
    public static IDisposable CreateCorrelation(Guid? correlationId = null) {}
    public static IDisposable CreateCorrelationIfNotExists(Guid? correlationId = null) {}
}
```

Our correlation context is going to based around a feature that is relatively new in the .Net Framework: `AsyncLocal<T>`. An 
`AsyncLocal<T>` is used to represent a piece of data that is local to a given control flow - with the special ability of being able to cross asynchronous boundaries. It optionally provides a notification mechanism for when values have been updated or the execution context has changed, whether this is through an explicit or implicit means.

What this means for our correlation context is that we can declare a static and everything will work, a bit like magic. However, it isn't thread safe and isn't designed to be used that way, so you have to be careful with what you do.

The eagle-eyed among you will have noticed that I put in a stack earlier in the article for storing our correlation id. The use case for having a stack is as follows: you have a long running connection (eg: TCP to a third party) in which you wish to track every message that comes from that connection whilst uniquely tracking each message with a different id.
In this scenario, we must first push the correlation id of the session, followed by each correlation of the unique message as we send each message for processing. With this in mind, to start off the implementation, we must first store the stack in the `AsyncLocal<T>` and be able to retrieve it:

```c#
private static readonly AsyncLocal<Stack<Guid>> _correlationStack = new AsyncLocal<Stack<Guid>>();
public static Stack<Guid> GetCorrelationStack() => _correlationStack.Value ?? new Stack<Guid>();
```

Not really too much is going on here. We definitely want to make our lives easier when trying to get the most recent correlation id and avoid the repetitive checks in our code, so we can integrate all of this into our GetCorrelationById method:

```c#
public static Guid? GetCorrelationId() 
{
    var stack = GetCorrelationStack();
    if(stack.Count > 0)
        return stack.Peek();

    return null; // TODO :: decide what you are going to do
}
```

You can see that I'm making use of the GetCorrelationStack method that we just implemented above, so that we don't have to do all of the checking of the AsyncLocal. Ultimately, I've decided to leave the decision about what we do in the case of no correlation id up to the calling code. In some cases, we may want to throw an exception. In other cases, it's okay for it to be empty because we haven't finished porting our code over yet.

So far we have been retrieving the correlation information from the stack we have stored. Pushing a value onto the stack is equally trivial:

```c#
public static IDisposable CreateCorrelation(Guid? correlationId = null)
{
    lock(_correlationStack)
    {
        if (_correlationStack.Value == null)
            _correlationStack.Value = new Stack<Guid>();

        _correlationStack.Value.Push(correlationId ?? Guid.NewGuid());
    }

    return new DisposeCorrelation(_correlationStack);
}
```

When we are ready to remove the correlation from the stack, we can dispose of the returned class which manages removing the value. This allows us to use the correlation context within a using statement as you'll see in the example later on. To cover off the scenarios in which we want to check to see whether or not the correlation stack already has a correlation id (eg: it's already been populated by other middleware), we simply need to combine two methods that we have already created:

```c#
public static IDisposable CreateCorrelationIfNotExists(Guid? correlationId = null)
{
    if(GetCorrelationStack().Count > 0)
        return new EmptyDisposable();

    return CreateCorrelation(correlationId);
}
```

So far we can retrieve and set correlation id's. Removing them is just as easy. As you saw earlier in the article, I created a class DisposeCorrelation which implements IDisposable:

```c#
private class DisposeCorrelation : IDisposable
{
    private readonly AsyncLocal<Stack<Guid>> _localStack;

    public DisposeCorrelation(AsyncLocal<Stack<Guid>> localStack)
    {
        _localStack = localStack;
    }
    public void Dispose()
    {
        var stack = _localStack.Value ?? new Stack<Guid>();

        if(stack.Count > 0)
            stack.Pop();
    }
}
```

Again, there's not a lot here to here to cover. On the disposal of the class, we double check that we actually have a stack, creating a temporary one if we don't, before verifying the count and removing the top entry.
As an exercise for you dear reader, there is another IDisposable that I've referenced in the article which is just an empty disposable that does nothing.

Once we put all the pieces of the puzzle together, we can test that our implementation works with a simple example:

```c#
class Program
{
    static void Main(string[] args)
    {
        using(CorrelationContext.CreateCorrelationIfNotExists())
        {
            Console.WriteLine(CorrelationContext.GetCorrelationId());

            using(CorrelationContext.CreateCorrelationIfNotExists())
            {
                Console.WriteLine(CorrelationContext.GetCorrelationId());
            }
        }
    }
}
```

All being well, you should see a console with two id's that are the exact same. Naturally, you should extend this example as you see fit, testing the other methods are intact as well.

For reference, here is the entire implementation:

```c#
public static class CorrelationContext
{
    private static readonly AsyncLocal<Stack<Guid>> _correlationStack = new AsyncLocal<Stack<Guid>>();
    public static Stack<Guid> GetCorrelationStack() => _correlationStack.Value ?? new Stack<Guid>();
    public static Guid? GetCorrelationId() 
    {
        var stack = GetCorrelationStack();
        if(stack.Count > 0)
            return stack.Peek();

        return null; // TODO :: decide what you are going to do
    } 
    public static IDisposable CreateCorrelation(Guid? correlationId = null)
    {
        lock(_correlationStack)
        {
            if (_correlationStack.Value == null)
                _correlationStack.Value = new Stack<Guid>();

            _correlationStack.Value.Push(correlationId ?? Guid.NewGuid());
        }

        return new DisposeCorrelation(_correlationStack);
    }
    public static IDisposable CreateCorrelationIfNotExists(Guid? correlationId = null)
    {
        if(GetCorrelationStack().Count > 0)
            return new EmptyDisposable();

        return CreateCorrelation(correlationId);
    }
    private class EmptyDisposable : IDisposable { public void Dispose() { } }
    private class DisposeCorrelation : IDisposable
    {
        private readonly AsyncLocal<Stack<Guid>> _localStack;

        public DisposeCorrelation(AsyncLocal<Stack<Guid>> localStack)
        {
            _localStack = localStack;
        }
        public void Dispose()
        {
            var stack = _localStack.Value ?? new Stack<Guid>();

            if(stack.Count > 0)
                stack.Pop();
        }
    }
}
```

That's all for this post. We now have our core correlation context which we can now use in our entries points and our communication frameworks.