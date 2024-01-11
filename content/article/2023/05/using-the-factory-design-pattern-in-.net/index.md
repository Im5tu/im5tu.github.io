---
title: "Using The Factory Design Pattern in .NET"
description: Discover how to use the Factory design pattern in .NET applications to create objects in a flexible and maintainable way. It provides examples of real-world scenarios where the pattern could be used to improve code quality, and demonstrates how to implement the Factory pattern in C# code.
date: 2023-05-09T07:00:00Z
toc: true
includeInSitemap: true
series: "Design Patterns In Dotnet"
tags:
- dotnet
---

The Factory Design pattern is a popular technique for creating objects in .NET applications. It allows developers to create objects without specifying the exact class of object that will be created, making it an excellent option for improving code flexibility and maintainability. This article will explore the concept behind the Factory Design pattern, its benefits, and how it can be implemented in C# code.

<!--more-->

## What is the Factory Design Pattern?

The Factory Design pattern is a creational pattern that provides an interface for creating objects in a superclass while allowing subclasses to alter the type of objects created. It enables developers to abstract the object creation process, making it more flexible and adaptable to changing requirements.

In the Factory pattern, a factory class creates objects based on parameters passed rather than instantiating them directly. This allows the creation process to be centralized and managed in a single location, making it easier to maintain and update the code.

One of the key benefits of using the Factory pattern is that it can improve code quality and maintainability. By abstracting the creation process, the code is more modular and easier to understand. It also makes it easier to modify the code in the future since changes can be made to the factory class rather than the code that creates the objects. It can also reduce code duplication because rather than creating objects in multiple places throughout the code, the Factory pattern centralizes the creation process, making it easier to reuse code across different parts of the application.

## Factory vs Abstract Factory

When we look at the Factory design pattern, we may come across one of two implementations: Factory or Abstract Factory. The Factory and Abstract Factory patterns are used to create objects but serve different purposes.

The Factory pattern is used to create a single type of object. It provides a way to encapsulate the object creation process so that it can be easily modified or extended in the future. The factory class is responsible for creating instances of the concrete classes that implement a standard interface or inherit from a common base class. This allows the client code to interact with the objects through a common interface without knowing how the objects are created.

The Abstract Factory pattern is used to create families of related objects. It provides an interface for creating families of related or dependent objects without specifying their concrete classes. The abstract factory class creates instances of the concrete classes that inherit a common interface or base class.

So, when deciding between the Factory and Abstract Factory patterns, it's essential to consider the complexity and relationships between the objects you're trying to create. If you only need to create a single object type, the Factory pattern may be sufficient. The Abstract Factory pattern may be the better choice if you need to create families of related entities.

## Implementing The Factory Design Pattern In C\#

Let's first look at the simplest form of the Factory pattern by using a logging framework as our example. For simplicity, we'll create a `ConsoleLogger` and a `FileLogger`:

```csharp
public interface ILogger
{
    void Log(string message);
}

public class ConsoleLogger : ILogger
{
    public void Log(string message)
    {
        Console.WriteLine($"ConsoleLogger: {message}");
    }
}

public class FileLogger : ILogger
{
    public void Log(string message)
    {
        // Code to write message to file
        Console.WriteLine($"FileLogger: {message}");
    }
}
```

Then all we need to do is create our `LoggerFactory` class, which implements the factory pattern by providing a method to create instances of the concrete `ILogger` classes:

```csharp
public class LoggerFactory
{
    public static ILogger CreateLogger(string providerType)
    {
        switch (providerType)
        {
            case "Console":
                return new ConsoleLogger();
            case "File":
                return new FileLogger();
            default:
                throw new ArgumentException("Invalid provider type");
        }
    }
}
```

The `CreateLogger()` method takes a string parameter that specifies the type of logger to create. It uses a switch statement to create and return an instance of the appropriate concrete `ILogger` class. Here's an example of how you could use the LoggerFactory to create an instance of a logger:

```csharp
var logger = LoggerFactory.CreateLogger("File");
logger.Log("This is a log message");

// Prints: "FileLogger: This is a log message"
```

In this example, we create an instance of a `FileLoggerProvider` using the `LoggerFactory`. We then use the `CreateLogger()` method of the `FileLoggerProvider` to create an instance of a `FileLogger`. Finally, we call the `Log()` method of the FileLogger to log a message.

## Implementing The Abstract Factory Design Pattern In C\#

You may also need to create factories that have dependencies on other entities, which is where the abstract factory comes in. First, we'll create an interface for our logging provider:

```csharp
public interface ILoggerProvider
{
    ILogger CreateLogger();
}
```

This interface defines a method `CreateLogger()` that returns an instance of an `ILogger`. We'll use this interface to define different logging providers that can be created by our factory. Next, we'll create a couple of concrete logging providers that implement the `ILoggerProvider` interface. For simplicity, we'll create a `ConsoleLoggerProvider` and a `FileLoggerProvider`:

```csharp
public class ConsoleLoggerProvider : ILoggerProvider
{
    public ILogger CreateLogger()
    {
        return new ConsoleLogger();
    }
}

public class FileLoggerProvider : ILoggerProvider
{
    public ILogger CreateLogger()
    {
        return new FileLogger();
    }
}
```

The `ConsoleLoggerProvider` and `FileLoggerProvider` classes both implement the `CreateLogger()` method to return an instance of a `ConsoleLogger` or a `FileLogger`, respectively. By defining the `CreateLogger()` method in the `ILoggerProvider` interface, we're able to provide a common interface that can be used to create different types of loggers. The client code doesn't need to know the details of how the loggers are created, only how to interact with them through the common `ILogger` interface. Next, we'll change our `LoggerFactory` class to return the provider that we will use to create the ultimate class:

```csharp
public class LoggerFactory
{
    public static ILoggerProvider CreateLoggerProvider(string providerType)
    {
        switch (providerType)
        {
            case "Console":
                return new ConsoleLoggerProvider();
            case "File":
                return new FileLoggerProvider();
            default:
                throw new ArgumentException("Invalid provider type");
        }
    }
}
```

Lastly, we need to update the calling code:

```csharp
var provider = LoggerFactory.CreateLoggerProvider("File");
var logger = provider.CreateLogger();
logger.Log("This is a log message");

// Prints: "FileLogger: This is a log message"
```

With this implementation, we don’t need to pass any arguments to the create logger method, as we’ve requested a specific factory implementation on the first line. This approach is much more extensible but only warranted when you need the extensibility. I would personally stick to the initial factory implementation until such time as the extensibility is required.

## Frequently Asked Questions About The Factory Design Pattern

### What Are Some Real-World Usages Of The Factory Design Pattern?

- Logging: A logging framework can use the factory pattern to create instances of loggers, allowing for different logging behaviours (e.g., logging to the console, to a file, or to a remote server) to be added without modifying the client code that uses the loggers.
- Caching: A caching framework can use the factory pattern to create cache instances, allowing for different caching strategies (e.g., in-memory, disk-based, or distributed caching) to be added without modifying the client code that uses the caches.
- Database access: A database access framework can use the factory pattern to create instances of data access objects, allowing for different database drivers (e.g., for SQL Server, Oracle, or MySQL) to be added without modifying the client code uses the data access objects. An example of this is `DBCommand`.
- User interface: A user interface framework can use the factory pattern to create instances of user interface elements, allowing for different styles (e.g., for desktop, web, or mobile applications) to be added without modifying the client code that uses the user interface elements.
- Plugin systems: A plugin system can use the factory pattern to create instances of plugins, allowing for different plugins to be added dynamically without modifying the client code that uses the plugins.

### When Should I Use The Factory Design Pattern?

You should consider using the factory design pattern when:

1. You want to decouple object creation from the client code that uses the objects.
2. You need to create families of related objects.
3. You need to provide a way to switch between different families of objects at runtime.
