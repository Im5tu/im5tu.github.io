{
    "title": "Things you might not know about C# - Duck Typing",
    "description": "",
    "tags": ["c#", "dotnet"],
    "date": "2022-01-04T08:00Z",
    "categories": ["dotnet"],
    "series": ["Things you might not know about C#"]
}

<!--more-->

## What is Duck Typing

Many people have heard of the phrase _"If it walks like a duck and it quacks like a duck, then it must be a duck"_ a few times as a way to explain what duck typing is. Much like the classic pre-mature optimization quote, there is often vital parts of the explanation missing.

Duck typing really refers to the ability of the compiler to use an object for a specific purpose when it has certain properties. In C# this means that a class/struct/interface has a specific combination of properties/methods with the correct arguments. The rest of this article takes a look at a few ways that this is used in C#:

- Using a foreach on a class/struct/interface that doesn't implement `IEnumerable` or `IEnumerable<T>`
- Making anything awaitable

## Foreach loops without IEnumerable

One of the more uncommon but interesting things you can do is do a foreach loop over anything that could act or generate a collection. Imagine that you want to write the following code: 

```csharp
foreach (var i in 10)
    // do something with i with values 0-9
```

In order for us to use a type in a foreach loop we must to one of two things:

1. Expose an instance method called `GetEnumerator()`
2. Build an extension method for the type that is called `GetEnumerator()`

Both of the methods must return a type that looks like something that implements `IEnumerator`, in other words, the type must have the following:

1. A property called `Current` that returns the current element in the sequence. The return type can be an object or any given
2. A method called `MoveNext()` returning a boolean stating whether or not there is any more elements left in the sequence

Lets take a look a the simple implementation using an existing enumerator:

```csharp
public class Program {
    public static void Main() {
        foreach (var i in 10)
            Console.WriteLine(i);
    }
}

public static class Extensions
{
     public static IEnumerator<int> GetEnumerator(this int i) => Enumerable.Range(0, i).GetEnumerator();   
}
```

_[Play with this example on sharplab.io](https://sharplab.io/#v2:C4LgTgrgdgNAJiA1AHwAICYCMBYAUKgBgAJVMAWAbj0JMwDoAZASygEcrdqBmE9WgdiIBvPETG8+I3OJlEAZgHswAUwCGAYwAWRABQA3VWCJNjUIpgIBKUbNukAnDqaWOMgL54PnfD1IA2XiIAUQAPYGUoAGcmBSi8KVlUX0wAgEkgqAgAW2UwVWAlAB4WYAA+IgBxZWAM7Nz8pR1gTSZI02BjSyIAXnLanLyAIwAbZToAJVUoAHNlHQIYTroqmsyBhrAdF3FPIA)_

This gets us to where we need to be, but sometimes we might not want to or can implement `IEnumerator`/`IEnumerator<T>`. Luckily for us, Duck Typing can save us again and we can implement something that looks like enumerator to achieve our goal:

```csharp
public class Program {
    public static void Main() {
        foreach (var i in 10)
            Console.WriteLine(i);
    }
}

public static class Extensions
{
     public static CustomEnumerator GetEnumerator(this int i) => new CustomEnumerator(i);   
}

public class CustomEnumerator
{
    private int _limit;
    private int _current;
    
    public int Current => _current - 1;
    
    public CustomEnumerator(int limit) { _limit = limit; }
    
    public bool MoveNext()
    {
        if (_current < _limit)
        {
            _current += 1;
            return true;   
        }
        
        return false;
    }
}
```
_[Play with this example on sharplab.io](https://sharplab.io/#v2:C4LgTgrgdgNAJiA1AHwAICYCMBYAUKgBgAJVMAWAbj0JMwDoAZASygEcrdqBmE9WgdiIBvPETG8+I3OJlEAZgHswAUwCGAYwAWRABQA3VWCJNjUIpgIBKUbNukAnDqaWOMgL54PnfD1IA2XiIAUQAPYGUoAGcmBSi8KVlUX0wAgGEISOAFAFsgqAhs5TBVLKMAcWVgPIKikqUdYE0mSNNgY0siAF4APiIoZQB3InTMnOrC4tKnF3FPPG5Akazc/Im6sHibMQAHMCYDcNaiAH0AGyZspmBXcV39kuUj4/UIMBUoa62iL6Sj9LeIm0eicXgCPkQALTmG5iH48JZjVa1KYsNrnS7ADpCE7oq5dIi465ELwyOFEABGCgUpyIAFkFHplAA5ZRhHTWaTiBK2YxyXTPV7vNoAHhxFyuHJ5wi+UoFYLaiE60JlPNQgmAkGUFFmnNsJJ5KrEavkqlOkS1Xy8biAA=)_

Although we can `foreach` pretty much anything that we want using duck typing, we cannot use other methods such as those provided by the LINQ extension methods as they rely on a specific interface implementation.

Generally speaking, duck typing just for a foreach statement might not be particularly useful for our applications given that we have a concrete interface contract to follow, but there are more most useful examples of duck typing in C# such as awaiting anything we want...

## Await anything

Much like being able `foreach` over anything, in order to `await` anything, we need to have a specific contract applied either on the instance of the type or via an extension method. The contract to be able to `await` anything requires us to expose a parameterless method called `GetAwaiter` with a return type that has the following attributes:

1. Implements `INotifyCompletion`
2. Has a property called `IsCompleted` with a return type of bool
3. Has a parameterless method called `GetResult` with a return type of `object` or `T` 

Let's imagine that we want to implement the following code:

```csharp
public class Program {
    public static async Task Main() {
        await 1.Seconds();
    }    
}

public static class Extensions
{
    public static TimeSpan Seconds(this int i) => TimeSpan.FromSeconds(i);
}
```

In order to make it compile, we need to add a parameterless `GetAwaiter` method to the `TimeSpan` type. The simpliest way of doing this is with the following code:

```csharp
public class Program {
    public static async Task Main() {
        await 1.Seconds();
    }    
}

public static class Extensions
{
    public static TimeSpan Seconds(this int i) => TimeSpan.FromSeconds(i);
    public static TaskAwaiter GetAwaiter(this TimeSpan x) => Task.Delay(x).GetAwaiter();
}
```

_[Play with this example on sharplab.io](https://sharplab.io/#v2:CYLg1APgAgTAjAWAFBQAwAIpwKwG5lqZwB0ASgK4B2ALgJYC2ApsQMID29ADrQDaMBOAZQEA3WgGNGAZ3xICAZkwwiAdnQBvZOm2ZFWAGyYAHJkMBZAIa1KACgCUGrTudQAnOhLDxbSsCn3ZZwBfZ2Qg5AUiQ1h0AFEAD2pGSilaHylkTSQXPThDABUGRkFOC0p0Lx8/G2oAC1opdGtqJocAXgA+dEKmErLiADF+Dkrff1o7QJ0oXOj9AEEAdysk/nQAcUZqJZWBGvrGnuLS8vj2rqh9YgARRh4LAE8bM+JN7eXaVYCwoA==)_


================


https://sharplab.io/#v2:CYLg1APgAgTAjAWAFBQAwAIpwKwG5lqZwB0ASgK4B2ALgJYC2ApsQMID29ADrQDaMBOAZQEA3WgGNGAZ3xICAZkwwiAdnQBvZOm2ZFWAGyYAHJkMBZAIa1KACgCUGrTudQAnOhLDxbSsCn3ZZwBfZ2Qg5AUiQ1h0AFEAD2pGSilaHylkTSQXPThDABUGRkFOC0p0Lx8/G2oAC1opdGtqJocAXgA+dEKmErLiADF+Dkrff1o7QJ0oXIKivsoAQQB3KyT+dABxRmoVtYEa+sae4tLy+PauykZl7vmzvdp1mwvZcLkUPWUThcf19BA6AAkgA5Nh0ABmAE92Fw+HQfJknNoZugAEZsNg8YFSWGceGMYDoTroaj8ciMKYoxQAeTRACtGOIWttqKRpOQeNR7MSrpyeFT0MjdHdeg9Vk8Dj8zugLsKssEItlpnoACzoGmUPEE4A2LDKbw0azkCwIyh2eXC5yGuiUE1mgLC95BIA