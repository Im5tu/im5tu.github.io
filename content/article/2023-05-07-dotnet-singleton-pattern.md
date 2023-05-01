{
    "categories": [ "Development" ],
    "date": "2023-05-07T01:00:00Z",
    "description": "Discover how to use the Singleton design pattern in C#/.NET to create a single instance of an object that is globally accessible throughout your application. Learn about the benefits and drawbacks of the Singleton pattern, how to implement it using Lazy<T> for thread-safety, and its role in modern .NET development and Dependency Injection.",
    "tags": [ "csharp", "dotnet", "design patterns" ],
    "title": "Using The Singleton Design Pattern in .NET",
    "series": ["Design Patterns In Dotnet"],
    "toc": true
}

As a .NET developer, you understand the importance of writing efficient, scalable, and maintainable code. One design pattern that can help achieve these goals is the Singleton pattern. The Singleton pattern is a creational pattern that ensures only one instance of a class is created and provides global access to that instance throughout the application. In this blog post, we’ll look in-depth at the Singleton pattern, exploring its benefits, use cases, and implementation in C#. By the end of this post, you’ll have a solid understanding of how to leverage the Singleton pattern to optimize your .NET applications.

<!-- more -->

## What Is The Singleton Design Pattern?

The Singleton pattern is a creational pattern that ensures only one instance of a class is created throughout the application and provides global access to that instance. This means that when multiple parts of your application need to use the same object, they can all reference the same Singleton instance rather than creating numerous instances that may not be synchronized.

In the Singleton pattern, the class is responsible for ensuring that only one instance is created and accessible throughout the application. Typically, this is done using a private constructor that can only be called by the Singleton class itself and a static method or property that returns the single instance of the class.

The Singleton pattern is often used for resources that are expensive to create or that need to be shared across the application, such as thread pools, logging services, and configuration objects.

> Given the rapid popularity of dependency injection over the last ten years, it's becoming more common to think about Singletons differently. When speaking about a Singleton with my development teams, they refer to it as a single instance of a given class within a given scope - usually one per application.
This is because of the way it is registered within the IoC container. These container instances take care of your lifecycle management whilst guaranteeing a single object in your specified scope. We will look at this later on.

## Implementing The Singleton Design Pattern In C\#

Implementing the Singleton pattern was quite lengthy in early versions of C#. Fortunately, we now have the ability to generate it very quickly using the `Lazy<T>` class:

```csharp
public sealed class MySingleton
{
    private static readonly Lazy<MySingleton> _instance = new Lazy<MySingleton>(() => new MySingleton());

    private MySingleton()
    {
        // constructor logic goes here
    }

    public static MySingleton Instance => _instance.Value;
}
```

In this implementation, the `Lazy<MySingleton>` instance is created only when it is first accessed and is initialized in a thread-safe manner by the `Lazy<T>` class. This approach simplifies the code needed to create a thread-safe Singleton instance and ensures that the instance is initialized correctly without needing locks or other synchronization primitives.

The `Lazy<T>` class helps create lazy-initialized objects in .NET. It can be used to simplify the creation of Singleton instances and other types of objects that should be initialized only when needed. By using `Lazy<T>` in conjunction with the Singleton pattern, you can ensure that your Singleton instances are thread-safe and initialized correctly without adding unnecessary complexity to your code.

## Real-life Usage Of The Singleton Design Pattern

While the Singleton pattern has been used to manage the lifetime of objects in .NET applications, it is not generally used in modern .NET development. Instead, the preferred approach is to use Dependency Injection (DI) to manage the lifetime of objects and ensure that only a single instance is created and shared across the entire application.

That being said, some legacy applications and frameworks still use the Singleton pattern, and it can be helpful to understand how the pattern works in these contexts.

In modern .NET development, when people talk about implementing a single object in their application, they typically mean how to implement a single instance of that object using Dependency Injection. In the next section, I'll show you how this is achieved by registering the object as a Singleton with the DI container using the AddSingleton method.

## The Singleton Pattern & Dependency Injection

In dependency injection frameworks, a Singleton is referred to as a single instance of an object that can be shared across all components that depend on it. This can help reduce memory usage and improve application performance by reducing the number of object allocations. Let's look at a couple of simple examples:

```csharp
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection().AddSingleton<MySingleton>().BuildServiceProvider();

Console.WriteLine(ReferenceEquals(services.GetRequiredService<MySingleton>(), services.GetRequiredService<MySingleton>())); // Prints true

public class MySingleton {}
```

The above approach would be used when we are implementing dependency injection in either a lambda or console application that doesn't use the host builder approach. When we use AspNetCore, we can make the same `AddSingleton` call through the application builder:

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<MySingleton>();

var app = builder.Build();
// The rest of your code
```

When using a DI container, it is common to register a Singleton instance using the AddSingleton method. However, it is important to note that even when using AddSingleton, multiple instances of the Singleton object can still be created if the container is not correctly configured or if the object is created outside the scope of the DI container. Let's take a look at how this can occur:

```csharp
using Microsoft.Extensions.DependencyInjection;

var services1 = new ServiceCollection().AddSingleton<MySingleton>().BuildServiceProvider();
var services2 = new ServiceCollection().AddSingleton<MySingleton>().BuildServiceProvider();

Console.WriteLine(ReferenceEquals(services1.GetRequiredService<MySingleton>(), services2.GetRequiredService<MySingleton>())); // Prints false

public class MySingleton {}
```

## Frequently Asked Questions About The Singleton Design Pattern

### How Do I Ensure Thread-Safety When Using The Singleton Design Pattern?

One potential drawback of the Singleton pattern is that it can be challenging to ensure thread safety when multiple threads access the Singleton instance simultaneously. To ensure that your Singleton instance is thread-safe, you can use one of several techniques:

1. Thread-safe lazy initialization: This technique uses a lazy initialization technique to create the Singleton instance only when it is first accessed. This can improve performance by avoiding unnecessary object creation. [This is the approach we showed above](#implementing-the-singleton-design-pattern-in-c)
1. Double-checked locking: This technique involves checking if the Singleton instance is null before acquiring a lock on a synchronization object. A new instance is created and assigned to the Singleton variable if the instance is null. This technique can improve performance by avoiding locking when the Singleton instance already exists.

Here's an example of how you might use double-checked locking to implement a thread-safe Singleton in C#:

```csharp
public sealed class MySingleton
{
    private static readonly object _lock = new object();
    private static MySingleton _instance = null;

    private MySingleton() {}

    public static MySingleton Instance
    {
        get
        {
            if (_instance == null)
            {
                lock (_lock)
                {
                    if (_instance == null)
                    {
                        _instance = new MySingleton();
                    }
                }
            }

            return _instance;
        }
    }
}
```

### Are there any drawbacks to using the Singleton pattern?

While the Singleton pattern can be a powerful tool for managing global access to shared resources in your application, there are some potential drawbacks to be aware of:

1. Global state: Because the Singleton pattern creates a global instance of a class that can be accessed from anywhere in your application, it can lead to state that is difficult to manage and maintain.
1. Tight coupling: By relying on a single instance of a class throughout your application, the Singleton pattern can lead to tight coupling between different parts of your code, making it difficult to modify and test individual components.
1. Thread-safety: While the Singleton pattern can be made thread-safe with appropriate locking mechanisms, it can be difficult to ensure that all parts of your application use the Singleton instance in a thread-safe manner.
1. Overuse: The Singleton pattern can be overused, leading to unnecessary complexity and making it difficult to reason about the behaviour of your application.
1. Testability: Unit tests are designed to test individual units of code in isolation. The Singleton pattern can make unit testing more difficult. When using the Singleton pattern, isolating the code that depends on the Singleton instance can be difficult. This is because the Singleton is typically tightly coupled to the rest of the application, making it problematic to substitute the Singleton instance with a mock or stub during testing.