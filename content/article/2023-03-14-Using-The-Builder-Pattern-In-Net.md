{
    "categories": [ "Development" ],
    "date": "2023-03-14T07:00:00Z",
    "description": "Discover how to use the Builder pattern in C#/.NET to create more maintainable and flexible code. Learn implementation tips and answers to FAQs in this comprehensive guide. Improve your .NET development skills and create reusable code today.",
    "tags": [ "csharp", "dotnet", "design patterns" ],
    "title": "Using the Builder Design Pattern in .NET",
    "series": ["Design Patterns In Dotnet"],
    "toc": true
}

As a .NET developer, you're probably familiar with the importance of design patterns for creating maintainable and flexible code. The Builder pattern is one of the most potent creational patterns in the .NET ecosystem. In this blog post, we'll dive deep into the Builder design pattern, explaining what it is, what problems it solves, how to implement it in C#, and answering frequently asked questions.

<!-- more -->

## What is the builder design pattern?

The Builder design pattern is a creational pattern that allows you to build complex objects incrementally while allowing various options. With this pattern, you can generate multiple representations and types of an object by utilizing the same construction code whilst hiding the complex implementation details from the consumer.

## Implementing the builder design pattern in C# ##

Imagine that we want our application to build cars with specific configurable options for each car we build. Our Car class may look something similar to the following:

```csharp
public class Car
{
    public string Engine { get; set; }
    public string Colour { get; set; }
    public int NumberOfWheels { get; set; }
    public int NumberOfSeats { get; set; }
}
```

Without the builder pattern, we would construct our `Car` instances with the `new` keyword:

```csharp
var car1 = new Car {
    Engine = "v8",
    Colour = "Blue",
    NumberOfWheels = 4
    NumberOfSeats = 5
};
```

This approach has a few different problems:

1. Ensuring that we have parameter validation
1. Ensuring that we have default values

If the object has many parameters or optional parameters, it can be challenging to remember the correct order or to know which parameters are required and which are optional. This can lead to errors, such as passing the wrong parameter type or forgetting a required parameter.

The Builder pattern solves this problem by separating the construction of an object from its representation. Instead of providing all the parameters at once, you can use a Builder object to set the parameters of the object one at a time, in any order. This allows you to validate each parameter as it is set, ensuring that it is of the correct type and that it meets any other requirements.

Furthermore, the Builder pattern allows you to provide sensible defaults for optional parameters, so you don't need to remember to pass them in each time. This can simplify the construction process and reduce the likelihood of errors.

When we implement the builder pattern, we first create an interface which has different configuration options:

```csharp
public interface ICarBuilder
{
    void WithEngine(string engine);
    void WithColour(string colour);
    void WithWheels(int numberOfWheels);
    void WithSeats(int numberOfSeats);
}
```

If we change the method definitions to all return the `ICarBuilder` interface then we have a specialized builder implementation called a fluent builder. This means that we can chain methods together like so:

```csharp
public interface ICarBuilder
{
    ICarBuilder WithEngine(string engine);
    ICarBuilder WithColour(string colour);
    ICarBuilder WithWheels(int numberOfWheels);
    ICarBuilder WithSeats(int numberOfSeats);
}

// CarBuilder class omitted for brevity

// In your code
var car = new CarBuilder().WithSeats(4).WithColor("Blue").Build();
```

We will be using this fluent builder implementation from this point on.

The next step in implementing the builder pattern is to have an implementation of the interface, which we will call `CarBuilder`. This will need to inherit from the `ICarBuilder` interface. Apart from the interface implementation, we also include a specific method called `Build`, which returns our `Car` type. Here is what the stub for the `CarBuilder` class would look like:

```csharp
public class CarBuilder : ICarBuilder
{
    public ICarBuilder BuildEngine(string engine)
    {
        throw new NotImplementedException();
    }

    public ICarBuilder BuildColor(string colour)
    {
        throw new NotImplementedException();
    }

    public ICarBuilder BuildWheels(int numberOfWheels)
    {
        throw new NotImplementedException();
    }

    public ICarBuilder BuildSeats(int numberOfSeats)
    {
        throw new NotImplementedException();
    }

    public Car Build()
    {
        throw new NotImplementedException();
    }
}
```

When it comes to the implementation of the class itself, we have a couple of different options:

1. Use a collection of private fields and instantiate the object right at the end
2. Start creating the object in the `CarBuilder` constructor and return the final object from

If your class has a large number of fields, then option 1 could make the code appear very convoluted and become harder to maintain overall. We would normally use approach number 2 whilst also setting the default values for the object. Here is what this could look like:

```csharp
public class CarBuilder : ICarBuilder
{
    private Car _car = new Car {
        // Set your default values here
    };

    public ICarBuilder BuildEngine(string engine)
    {
        // TODO :: Validation of engine
        _car.Engine = engine;
        return this;
    }

    public ICarBuilder BuildColor(string colour)
    {
        // TODO :: Validation of colour
        _car.Colour = colour;
        return this;
    }

    public ICarBuilder BuildWheels(int numberOfWheels)
    {
        // TODO :: Validation of numberOfWheels
        _car.NumberOfWheels = numberOfWheels;
        return this;
    }

    public ICarBuilder BuildSeats(int numberOfSeats)
    {
        // TODO :: Validation of numberOfSeats
        _car.NumberOfSeats = numberOfSeats;
        return this;
    }

    public Car Build()
    {
        return _car;
    }
}
```

## Real life example of the builder pattern

The `System.Text.StringBuilder` class in the .NET BCL is an excellent example of the Builder pattern. The `StringBuilder` class can be used to create and manipulate strings in a mutable way. It allows you to append, insert, replace, or remove characters from a string without creating a new string object each time.

Here's an example usage of the StringBuilder class:

```csharp
StringBuilder builder = new StringBuilder();

builder.Append("Hello");
builder.Append(" ");
builder.Append("world!");

var result = builder.ToString(); // result = "Hello world!"
```

In this example, we use the `StringBuilder` class to build a string by appending multiple substrings together. Each call to Append modifies the builder object to add a new substring to the final string. Finally, we use the `ToString` method to get the final string. Here `ToString` is synonymous with `Build`, which in this case is more appropriate for the implementation.

The StringBuilder class implements the Builder pattern by allowing you to build a complex object (a string) step-by-step. It separates the construction of the string from its representation by providing a mutable object that you can modify incrementally to create the final string.

## Frequently Asked Questions about the Builder design pattern

### What's the difference between the Builder pattern and the Factory pattern?

The main difference between the Builder and Factory patterns is their intent and the way they create objects.

The Factory pattern is a creational pattern that provides an interface for creating objects without specifying each object's exact class or construction logic. It allows you to create objects of different types using the same interface or method.

On the other hand, the Builder pattern is also a creational pattern that allows you to construct complex objects step by step. It's useful when creating objects with multiple configurable parameters or when creating objects step-by-step. The main goal of the Builder pattern is to separate the construction of a complex object from its representation, allowing you to create different representations of the object using the same construction code.

The difference is akin to picking a car from the shopfloor (factory pattern) vs having the car custom-made in the factory (builder pattern).

### Can I use the Builder pattern with immutable objects?

Yes, you can use the Builder pattern with immutable objects. The Builder pattern is often used with immutable objects since they cannot be modified after creation.

When using the Builder pattern with immutable objects, instead of modifying the properties of an existing object, the Build method of the builder returns a new instance of the object with the desired properties set. This way, each building process step returns a new object with the following property set until the final object is returned from the Build method.

By using immutable objects with the Builder pattern, you can create complex objects that are guaranteed to be in a consistent and valid state. It also makes your code more thread-safe since immutable objects can be safely shared between multiple threads.

### Is the Builder pattern thread-safe?

Generally, yes, but the thread safety of the Builder pattern ultimately depends on how it's implemented and the corresponding usages of the builder itself. If the builder object contains a shared mutable state or if there are other synchronization issues, then thread safety may be compromised. Therefore, ensuring that your implementation of the Builder pattern is thread-safe in your particular use case is essential.

## Related Patterns

- Factory Pattern
