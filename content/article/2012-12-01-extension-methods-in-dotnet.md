{
    "categories": [ "Development" ],
    "date": "2012-12-01T17:51:38Z",
    "description": "An introduction into .Net's extension methods, how to create them and how to use them.",
    "tags": [ "vb", "csharp", "dotnet" ],
    "title": "Extension methods in dotnet",
    "toc": true
}

In this article we will take a look at what extension methods are and how to use them in .Net. Personally, they are one of the best things that has been introduced into the .Net framework in terms of readability. I will take you through what extension methods are, how to create them (in c\# and vb) then I will show you some of the extension methods that I have created (in c\# only, conversion is for you to try).
<!--more-->

### What are extension methods?

Extension methods allow you to easily extend a type, such as an integer or string, without re-compiling or modifying the type. In essence, they are a type of `static` (`shared` in vb) method, but they are called as
if the method is native to the type. Extension methods are available from the 3.5 version of the .Net Framework and can be implemented on any type in the .Net framework or any custom type that you define.

One downside to extension methods is if that you create an extension method with the same name as another method in that type, the compiler will bind the method call to the native method not any extension. An
extension method is only called when there is no native method found.

#### Warning

If you declare an extension method on the type Object, you will effectively create the extension method for every type in the framework including but not limited to String, Integer and Lists.

### How do we create extension methods?

The basic outline of a creating extension methods goes something like this:

 ​1. Create a public `static` class (`module` in vb) \
 2. Define functions that you wish to perform\
 3. Make the functions an extension method

Following through a complete example, I will now demonstrate how to create an extension method that returns the first 3 characters of a string. Using the list above, I must first create a `static class` or
`module`:
```csharp
// C#
public static class Extensions
{

}

' VB
Module Extenstions

End Module
```
The next phase would be to write the function that we are going need, which in this case is the following:
```csharp
// C#
public static class Extensions
{
    public string GetFirstThreeCharacters(String str)
    {
        if(str.Length < 3)
        {
            return str;
        }
        else
        {
            return str.Substring(0,3);
        }
    }
}

' VB
Module Extenstions

Public Function GetFirstThreeCharacters(Byval str As String) As String
    If (str.Length < 3) Then
        return str
    Else
        return str.SubString(0,3)
    End If
End Function

End Module
```
So far, we have done nothing special. In the last phase is to make the functions extension methods. It is slightly more complicated in VB but not by much. I will deal with C\# first.

To make our C\# version of our function an extension method we need to mark the function as static (so that it can be accessed at any time with out the need for declaring anything) and secondly, marking the first
paramter with the `this` keyword. This keyword basically tells the CLR that when this extension method is called, to use "this" parameter as the source. See the following:

```csharp
public static class Extensions
{
    public static string GetFirstThreeCharacters(this String str)
    {
        if(str.Length < 3)
        {
            return str;
        }
        else
        {
            return str.Substring(0,3);
        }
    }
}
```

Now for the VB version. Instead of using the `this` keyword, we need to do something slightly different. We need to mark the function with the `System.Runtime.CompilerServices.Extension` attribute like so:

```vb
<System.Runtime.CompilerServices.Extension> _
Public Function GetFirstThreeCharacters(Byval str As String) As String
    If str.Length < 3 Then
            Return str
    Else
            Return str.Substring(0, 3)
    End If
End Function
```

If you copy this code into any project, you should be able to call it like so:

```csharp
// C#
String str = "my new String";
str = str.GetFirstThreeCharacters();

' VB
Dim str as String = "my new String"
str = str.GetFirstThreeCharacters()
```

As I explained for both languages above, the effective use of the `this` keyword, makes the CLR take what ever we are calling the extension method from as the first parameter to our function.

*Hint: Try adding an additional `Integer` parameter and using that as a replacement for the 0 in the code above.*

### Examples of extension methods

Here are a few of the extensions that I have found or created over time. These are helpful to me and I hope they are to you as well. If you have a question about any of these, drop me a comment below.

#### HasElements

Something that I often do is check a collection for a value. This method is designed to prevent me constantly checking for a null value and existance of any item in a given collection. This method will work on any collection that implents the `ICollection` interface.

*Definition:*

```csharp
/// <summary>
/// Determines whether the specified collection has any elements in the sequence. This method also checks for a null collection.
/// </summary>
/// <param name="items">The ICollection of items to check.</param>
public static bool HasElements(this ICollection items)
{
    return items != null && items.Count > 0;
}
```

*Example usage:*

```csharp
List<String> myList = new List<String>();
if (myList.HasElements())
{
    // do some code
}
```

#### IsBetween

The `IsBetween` method returns a boolean and determins whether or not a value is between an inclusive upper and lower boundry. This will only work on types that implement the `IComparable` interface.

*Definition:*

```csharp
/// <summary>
/// Determins whether a value is between a minimum and maximum value.
/// </summary>
/// <typeparam name="T">The type of the value parameter.</typeparam>
/// <param name="value">The value that needs to be checked.</param>
/// <param name="low">The inclusive lower boundry.</param>
/// <param name="high">The inclusive upper boundry.</param>
public static bool IsBetween<T>(this T value, T low, T high) where T : IComparable<T>
{
    return value.CompareTo(low) >= 0 && value.CompareTo(high) <= 0;
}
```

*Example usage:*

```csharp
Int32 myInt = 0;
myInt.IsBetween(0, 5); // returns true
myInt.IsBetween(1, 5); // returns false
```

#### Each

Quite often I have to perform a task on a collection of items. This is just a shortcut way for saying for each element in the collection, perform this action. This will work on any collection that implements
the `ICollection` interface. The action that is parsed in can be a lambda expression or a function/subroutine.

*Definition:*

```csharp
/// <summary>
/// Executes the given action against the given ICollection instance.
/// </summary>
/// <typeparam name="T">The type of the ICollection parameter.</typeparam>
/// <param name="items">The collection the action is performed against.</param>
/// <param name="action">The action that is performed on each item.</param>
public static void Each<T>(this ICollection<T> items, Action<T> action)
{
    foreach (T item in items)
    {
        action(item);
    }
}
```

*Example usage:*

```csharp
List<String> myList = new List<String>();
myList.Each(el =>
{
    // perform an action(s) on the item
    el.Substring(0,1);
    el = el;
});
```

#### In

Often it is neccessary to determine whether a value is in a set collection. For example, I need to check whether a string is in an allowed list. This method will allows us to check any value against an
array of values of the same type.

*Definition:*

```csharp
/// <summary>
/// Determines whether a parameter is in a given list of parameters. Eg. 11.In(1,2,3) will return false.
/// </summary>
/// <typeparam name="T">The type of the source parameter.</typeparam>
/// <param name="source">The item that needs to be checked.</param>
/// <param name="list">The list that will be checked for the given source.</param>
public static bool In<T>(this T source, params T[] list)
{
    if (null == source) throw new ArgumentNullException("source");
    return list.Contains(source);
}
```

*Example usage:*

```csharp
Int32 myInt = 0;
myInt.In(0, 0, 1, 2, 3); // returns true
myInt.In(1, 5, 6, 7, 8); // returns false
```

Hopefully, you now have an understanding of how to implement extension methods in both C\# and VB.Net.

### Related Links

-   [MSDN: Extension Methods (C\# Programming
    Guide)](http://msdn.microsoft.com/en-us/library/bb383977.aspx)
-   [Example of extension methods
    (](http://www.extensionmethod.net/)[http://www.extensionmethod.net/)](http://www.extensionmethod.net/))
