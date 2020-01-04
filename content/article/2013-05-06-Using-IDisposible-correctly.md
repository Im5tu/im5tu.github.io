{
   "categories": [ "Development" ],
   "date": "2013-05-06T18:09:25Z",
   "description": "A demonstration of how to use IDisposable correctly.",
   "tags": [ "csharp", "dotnet" ],
   "title": "Using IDisposible correctly"
}

In this article, I am going to show you how to use the `IDisposable` interface correctly in your code. When I read others code, it is easy to pick up on subtle bugs. We need to begin to train ourselves to see the bugs and we do this by understanding what we are using. Before we begin, we need to make sure that we understand a core piece of computer science theory: Destructors.
<!--more-->

## Destructors

Generally speaking, destructors are the computers way of releasing resources from an application. In environments that contain a virtual machine with a garbage collection facility, the destructor is automatically called. In these environments however, the destructor is also called a `Finalizer`. Although these environments are <s>good</s> excellent at managing memory for us, we cannot guarantee when the `Finalizer` is going to be called.

## Enter Dispose

The purpose of the `Dispose` is to guarantee when we are going to release resources. This might be at the end of a `foreach` loop or at the end of a database connection. Either way, we have control of when we can release the resources. There are two types of resources that can be released: Managed and Unmanaged.

Managed resources are typically objects that are run and controlled by the Common Language Runtime (CLR). Managed code supplies the metadata necessary for the CLR to provide services such as memory management and cross-language integration [(Source)](http://stackoverflow.com/questions/334326/what-is-managed-unmanaged-code-in-c). Unmanaged resources are those outside the CLR such as Win32 API's. These can be called from within managed code allowing some serious memory leaks if we are not careful.

The .Net libraries have some useful interfaces in them, one of them being the `IDisposable` interface. This interface has just one method called `Dispose` (the name seems standard from what I have seen). Here is the implementation of the interface:

```csharp
public interface IDisposable
{
    void Dispose()
}
```

When we first implement the interface on our class, we are given the following code:

```csharp
public sealed class MyClass : IDisposable
{
    public void Dispose()
    {
        /* Release resources here */
    }
}
```

While this implementation is fine if you don't mind waiting for the garbage collector to come and release the resources. What if your class has a large object inside (say ~250mb). Do you really want to wait for the garbage collector? Probably not. 

In order to fix our implementation, we need to do two things. Firstly, we need to implement a `Finalizer` and then implement an overload to the original `Dispose` method. The reason why we implement a `Finalizer` is because we want to safe-guard ourselves if we forget to call the `Dispose` method. For those that do not know what a `Finalizer` looks like, here it is: 

```csharp
public sealed class MyClass : IDisposable
{
    public MyClass()
    {
        /* Constructor */
    }

    public ~MyClass()
    {
        /* Destructor */
    }

    public void Dispose()
    {
        /* Release resources here */
    }
}
```

In order to safe-guard ourselves as I just mentioned, our `Finalizer` needs to call our `Dispose` method like so:

```csharp
public ~MyClass()
{
    /* Destructor */
    Dispose();
}
```

You may have realised by now that we could, potentially, call the `Dispose` twice. The user will call it once followed by the CLR calling it for us in case we forget (through the `Finalizer`). This gives us the requirement for the overload of the `Dispose` method I mentioned earlier. If **we** call the `Dispose` method then it is *safe* for us to release managed resources. However, if the **CLR** calls the `Dispose` method then we cannot safely release managed resources because we do not know their current state.

**Note:** The CLR runs on a background thread, which we have no control over. Therefore, we cannot know any objects state on that thread.

Now that we have identified that the `Dispose` method can be called from two places, we can implement this into our code:

```csharp
public sealed class MyClass : IDisposable
{
    public MyClass()
    {
        /* Constructor */
    }

    public ~MyClass()
    {
        /* Destructor */
        Dispose(false); // the CLR will call Dispose, so its an unsafe call
    }

    public void Dispose()
    {
        /* The interface implementation */
        Dispose(true); // WE are calling Dispose, so its a safe call
    }

    public void Dispose(bool safeToFreeManagedResources)
    {
        /* Free unmanaged resources */

        if (safeToFreeManagedResources)
        {
            /*  Free managed resources */
        }
    }
}
```

Even though we have told the CLR that we are not to release managed resources twice, we will still release unmanaged resources twice. This is not only wasteful, but you could end up with an exception here which is something that **SHOULD NEVER HAPPEN**. Luckily for us, the CLR has a neat way for us to tell it not to call the `Finalizer` because we have already released all the resources necessary. Here is the one line magic fix:

```csharp
public void Dispose()
{
    /* The interface implementation */
    Dispose(true); // WE are calling Dispose, so its a safe call
    GC.SuppressFinalize(this); // WE have called dispose, there is no need to call it again Mr. GC.
}
```

## Best Practise

Now that we have our code fixed, without any issues or bugs, it's time to know a best practise. When an object implements the `IDisposable` interface, we have the opportunity to use the `using` statement. The idea of the `using` statement is that once you have finished with the object, the CLR will call the `Dispose` method for you. Note I said `Dispose` not the `Finalizer`. The `using` statement is really easy to use:

```csharp
static void Main(string[] args)
{
    using (var myClass = new MyClass())
    {
        /* Do stuff here */
    }
}
```

When the compiler sees this code, it actually expands it to this: 

```csharp
static void Main(string[] args)
{
    var myClass = new MyClass();
    try
    {
        /* Do stuff here */
    }
    finally
    {
        myClass.Dispose();
    }
}
```

So there it is. Hopefully now you can implement `IDisposable` correctly according to your needs. 