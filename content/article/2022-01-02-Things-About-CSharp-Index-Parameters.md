{
    "title": "Things you might not know about CSharp - Using Params with Indexers",
    "description": "In the first part of this series, we are going to take a look at a little known feature with index parameters. See how to pass multiple arguments to a custom indexer.",
    "tags": ["csharp", "dotnet"],
    "date": "2022-01-02T08:00:00Z",
    "categories": ["Development"],
    "series": ["Things you might not know about CSharp"],
    "toc": true
}

This is the first part of my series taking a look at some of the lesser known features of the C# language. Today we will be looking at index parameters, specifically how to use `params` with them, and how they are used in C#. With these articles, your millage may vary in terms of usability of these features for day to day programming, so think of this series as raising awareness that these things exist, not that you should use for general purpose programming. Without further adieu...

<!--more-->

## What is an indexer

An indexer is a piece of syntax sugar for C# that allows a given class/interface/struct the ability to access data like you would do with an array. You can provide a getter, a setter or both and set the accessibility of the getter/setters. In essence, an indexer acts like a parameterised property.

Below is a contrived example of how you would create an indexer for a class and then use it:

```csharp
public class IndexerExample {

    private Dictionary<String, String> _data = new();

    public String this[string id]
    {
         get => _data[id];
    }
}

public class TestClass
{
    private readonly IndexerExample _instance = new();

    public string TestMethod() => _instance["hello"];
}
```

_[Play with this example on sharplab.io](https://sharplab.io/#v2:CYLg1APgAgTAjAWAFBQAwAIpwCwG5nJQDMmM6AkgHbACmAHjQE4CidAhgLYAOANjegG9k6EemGiujAJYA3NgBd+AESkBjeVID2lNowCeAHgDK86ZQDmAGnQmz5gHzoA+sAVt0AXnSUaAdwAUAJT4SKJioaLENqZSFujyABZSAM4A2lgYUsAAuuIiQhFhouY08p6OLm6pWdkhYQC+yI1IhCSw6AAqNMnyAMI8bMnJyAVhkrIK/Iw0bMDaPHoU1PRMrJy8/E6xPWyUqvxePgHBeeFhURmd3fIAsqUJmsBB5c7b8rv7qQBECTQ8PJovrUmkA===)_

For more information on the basic usage of indexers, check the documentation [here](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/indexers/using-indexers).

## Passing multiple parameters

Whilst indexers are a relatively well-known concept, mainly from their usage in lists and arrays, it's not very common knowledge that you can pass multiple parameters to an indexer, like this example:

```csharp
public class IndexerExample {

    private Dictionary<String, String> _data = new();

    public String this[params string[] ids]
    {
         get => string.Join(", ", ids.Select(x => _data[x]));
    }
}

public class TestClass
{
    private readonly IndexerExample _instance = new();

    public string TestMethod() => _instance["hello", "world"];
}
```

[Play with this example on sharplab.io](https://sharplab.io/#v2:CYLg1APgAgTAjAWAFBQAwAIpwCwG5lqZwB0AMgJYB2AjvkgQMyYzoCSlwApgB6cBOAUW4BDALYAHADad0Ab2TpF6BUvF9yAN2EAXGQBFyAY23kA9pWF8AngB4AytvWUA5gBp0Dp84B86APrAOsLoALzolJwA7gAUAJR0SspIiVBMnlTO6NoAFuQAzgDa4pZieUSoBQC66OTAeZUqivLJiYnOnNqhvlioxABSplTRAETuozV1xHac0sbR3F3+gdrCBdyVsfGN6AC+yHv0KEyw6AAqnHnaAMKSwnl5yM2Japo6MnycwsDmklZsHDx+EIxFIZH4qJdhJRDDIwhEYlsWoptqlymcLtoALIdbKmYBxRbgyiQ6GcArDbIzSSmcbDSKmPiSYDDSp0HZAA==)

In this example, we can specify many arguments into the indexer, and have one or many results returned. As with other members in C#, so long as the signature is different, we can overload indexers with different variations, as shown in the example below:

```csharp
public class IndexerExample {

    private Dictionary<String, String> _data = new();

    public String this[string id]
    {
         get => _data[id];
    }

    public IEnumerable<String> this[params string[] ids]
    {
         get => ids.Select(x => _data[x]);
    }
}

public class TestClass
{
    private readonly IndexerExample _instance = new();

    public String ReturnSingle() => _instance["hello"];

    public IEnumerable<String> ReturnMany() => _instance["hello", "world"];
}
```

[Play with this example on sharplab.io](https://sharplab.io/#v2:CYLg1APgAgTAjAWAFBQAwAIpwCwG5lqZwB0AMgJYB2AjvkgQMyYzoCSlwApgB6cBOAUW4BDALYAHADad0Ab2TpF6BUvF9yAN2EAXGQBFyAY23kA9pWF8AngB4AytvWUA5gBp0Dp84B86APrAOsLoALzolJwA7gAUAJR0SspIiVBMnlTO6NoAFuQAzgDaWBjkwAC6KoryyYmJzpzaob4BQQWlZQlKAL6VSSlMWAz2jhm+OfkF4pZieUSoBWXopXkVNVW9tfWNIb7LxHac0sbR3E3+gdrCBdxl8b09SA+MzOgAKpx52gDCksJ5echqok1JodDI+JxhMBzJIrGwODx+EIxFIZH4qJ9hJRDDIwhEYnd6GtMGkRi50AAlBoAVz4lDsGWkcTO6MomOxnAKACJsodJKYuR1kL1UkQhukXL4qdpaZQALJYqzMnb+DGXDnc3mSflc9xcyKmPiSYCCuhdIA===)

And that's it for this article, join me next time where we are going to learn about duck typing in C# and different use cases for it. I hope that you've learnt something new and have another tool in your toolbox.
