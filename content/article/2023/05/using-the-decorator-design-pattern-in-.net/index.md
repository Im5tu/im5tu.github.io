---
title: "Using The Decorator Design Pattern in .NET"
description: Discover how to use the Decorator design pattern in C#/.NET to add new behaviours to an object dynamically without changing its underlying structure. See how you can make your code more maintainable and extensible, and see step-by-step instructions for implementing it in C#. Find out how to use the Decorator pattern with dependency injection.
date: 2023-05-08T07:00:00Z
toc: true
includeInSitemap: true
series: "Design Patterns In Dotnet"
tags:
- dotnet
---

The Decorator design pattern is a widely-used technique for extending the functionality of an existing object or component. By wrapping an object in a series of decorators, you can add new behaviours, features, or properties without modifying the underlying code. This makes it a powerful and flexible way to customize and extend software systems. In .NET, the Decorator design pattern can be used in various ways to enhance and modify existing classes and components, which can help you write more maintainable, extensible, and flexible code.

<!-- more -->

## What Is The Decorator Design Pattern?

The idea behind the Decorator design pattern is to wrap the object you want to modify in a series of decorators, each adding a specific behaviour or feature to the object. In the Decorator design pattern, there are several key components:

1. Component: This is the base object or interface you want to modify. It defines the basic behaviour or features of the object.
2. Concrete Component: This is the concrete implementation of the component interface. It provides the base functionality of the object.
3. Decorator: This is the abstract base class or interface for all decorators. It defines the basic structure of the decorators and how they should interact with the component.
4. Concrete Decorator: This is the concrete implementation of the decorator interface. It provides the specific functionality or behaviour you want to add to the component.

The Decorator design pattern is often used when you need to add new functionality to an object but want to keep its underlying structure the same. This can be useful when you want to keep the existing codebase intact.

One of the benefits of using the Decorator design pattern is that it allows you to add new behaviours or features to an object without modifying the underlying code. This can make your code more maintainable and extensible, allowing you to add new functionality to an object without changing existing behaviour. By wrapping an object in a series of decorators, you can create complex and customizable objects tailored to your specific needs.

## Implementing The Decorator Design Pattern In C\#

There are two different ways of implementing the decorator pattern. Like [the singleton design pattern](/article/2023/05/using-the-singleton-design-pattern-in-.net/), we can construct the pattern manually or with dependency injection. We'll take a look at both, starting with manual creation:

1. Define the Component interface or abstract class. This is the base object or interface that you want to modify. It defines the basic behaviour or features of the object:

```csharp
public interface IComponent
{
    void Operation();
}
```

2. Create the Concrete Component class. This is the concrete implementation of the component interface. It provides the base functionality of the object.

```csharp
public class ConcreteComponent : IComponent
{
    public void Operation()
    {
        Console.WriteLine("ConcreteComponent.Operation()");
    }
}
```

3. Create the Decorator abstract class. This is the abstract base class or interface for all decorators. It defines the basic structure of the decorators and how they should interact with the component.

```csharp
public abstract class Decorator : IComponent
{
    protected IComponent _component;

    public Decorator(IComponent component)
    {
        _component = component;
    }

    public virtual void Operation()
    {
        _component.Operation();
    }
}
```

4. Create the Concrete Decorator class. This is the concrete implementation of the decorator interface. It provides the specific functionality or behaviour that you want to add to the component.

```csharp
public class ConcreteDecoratorA : Decorator
{
    public ConcreteDecoratorA(IComponent component) : base(component)
    {
    }

    public override void Operation()
    {
        base.Operation();
        Console.WriteLine("ConcreteDecoratorA.Operation()");
    }
}

public class ConcreteDecoratorB : Decorator
{
    public ConcreteDecoratorB(IComponent component) : base(component)
    {
    }

    public override void Operation()
    {
        base.Operation();
        Console.WriteLine("ConcreteDecoratorB.Operation()");
    }
}
```

5. Implement the Decorator design pattern by wrapping components in decorators.

```csharp
IComponent component = new ConcreteComponent();
component = new ConcreteDecoratorA(component);
component = new ConcreteDecoratorB(component);

component.Operation();
```

When the above code is run, we end up with the following output:

```bash
ConcreteComponent.Operation()
ConcreteDecoratorA.Operation()
ConcreteDecoratorB.Operation()
```

The order of the output can easily be changed by changing the implementation of the decorators. Note that by using interfaces and abstract classes, we can create a flexible and extensible system that can be easily customized and modified.

## The Decorator Design Pattern & Dependency Injection

The Decorator design pattern can also easily be used with dependency injection frameworks using NuGet packages like [Scrutor](https://github.com/khellang/Scrutor). If we use the classes/interfaces that we've previously declared, we can add dependency injection as follows:

```csharp
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection()
                    .AddScoped<IComponent, ConcreteComponent>()
                    .Decorate<IComponent, ConcreteDecoratorA>()
                    .Decorate<IComponent, ConcreteDecoratorB>()
                    .BuildServiceProvider();

services.GetRequiredService<IComponent>().Operation();

// ...component definitions below...
```

This helps prevent the need for manual construction of objects which could reduce a large amount of repetitive code when the object being decorated has a lot of dependencies. The above code produces this output:

```bash
ConcreteComponent.Operation()
ConcreteDecoratorA.Operation()
ConcreteDecoratorB.Operation()
```

## Frequently Asked Questions About The Decorator Design Pattern

### What Are Some Real-World Usages Of The Decorator Design Pattern?

- Adding logging or error handling to a database access component
- Adding caching or throttling to a web service client
- Adding encryption or compression to a file storage component
- Adding formatting or validation to a user input component

### Can The Decorator Design Pattern Be Used To Modify Existing Behaviour Of An Object?

No, the Decorator pattern is designed to add new behaviours or features to an object, not to remove or modify existing behaviour. If you need to change existing behaviour in an object, consider other patterns like the Strategy pattern or the Template Method pattern.

### How Does The Decorator Design Pattern Differ From Inheritance?

Inheritance is another way to add new behaviours or features to an object, but it differs from the Decorator pattern in several ways. Inheritance is a static relationship between classes, whereas the Decorator pattern is a dynamic relationship between objects. Inheritance can lead to a problematic class hierarchy to maintain and extend, whereas the Decorator pattern allows for more flexible and modular code.
