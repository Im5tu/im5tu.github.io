{
    "title": "Using Moq with ref, in and out parameters in C#",
    "description": "A look into how we can use Moq with ref, in and out parameters in C#",
    "tags": ["aspnet", "dotnet", "diagnostics", "testing", "moq"],
    "date": "2020-11-28T12:39:52Z",
    "categories": ["Development"],
    "toc": true
}

In this article, I want to take a look at a scenario that I came across this week which I've come across a few times. Occasionally, you will have an interface that you wish to mock out with Moq and find you have troubles because the method signature takes a `ref` or an `out` parameter. This week, I've found a way that we can successfully mock the method without too much of a change to the test code.
<!--more-->

Lets assume that we have the following implementation that we want to mock out using Moq, which is a simplification of the problem I had earlier in the week:

```csharp
public interface IVisitor
{
    bool Visit(ref MyType type);
}
```

Here's the class that we are going to test:

```csharp
public class MyVisitorRunner
{
    private readonly IEnumerable<IVisitor> _visitors;

    public MyVisitorRunner(IEnumerable<IVisitor> visitors)
    {
        _visitors = visitors;
    }

    public bool Visit(ref MyType type)
    {
        foreach (var visitor in _visitors)
            if (!visitor.Visit(ref type))
                return false;

        return true;
    }
}
```

We want to have a simple test that ensures that all the visitors are called. So using XUnit, we could write something along the lines of:

```csharp
[Fact]
public void MustCallAllVisitors()
{
    var visitor1 = new Mock<IVisitor>();
    var visitor2 = new Mock<IVisitor>();

    visitor1.Setup(x => x.Visit(ref It.IsAny<MyType>())).Returns(true);
    visitor2.Setup(x => x.Visit(ref It.IsAny<MyType>())).Returns(true);

    var target = new MyVisitorRunner(new [] { visitor1.Object, visitor2.Object });
    var subject = new MyType();

    target.Visit(ref subject);

    visitor1.Verify(x => x.Visit(ref It.IsAny<MyType>()), Times.Once);
    visitor2.Verify(x => x.Visit(ref It.IsAny<MyType>()), Times.Once);
}
```

But this gives us the compile time error of `A ref or out value must be assignable to a variable`. So if we take a look at what happens when we do as the compiler says and assign it to a variable:

```csharp
[Fact]
public void MustCallAllVisitors()
{
    var visitor1 = new Mock<IVisitor>();
    var visitor2 = new Mock<IVisitor>();

    var type = It.IsAny<MyType>();

    visitor1.Setup(x => x.Visit(ref type)).Returns(true);
    visitor2.Setup(x => x.Visit(ref type)).Returns(true);

    var target = new MyVisitorRunner(new [] { visitor1.Object, visitor2.Object });
    var subject = new MyType();

    target.Visit(ref subject);

    visitor1.Verify(x => x.Visit(ref type), Times.Once);
    visitor2.Verify(x => x.Visit(ref type), Times.Once);
}
```

It now compiles correctly, but when the tests execute you receive the following error:

```
Moq.MockException

Expected invocation on the mock once, but was 0 times: x => x.Visit(null)

Performed invocations:

   Mock<IVisitor:1> (x):

      IVisitor.Visit(MyType)

   at Moq.Mock.Verify(Mock mock, LambdaExpression expression, Times times, String failMessage) in C:\projects\moq4\src\Moq\Mock.cs:line 354
   at Moq.Mock`1.Verify[TResult](Expression`1 expression, Func`1 times) in C:\projects\moq4\src\Moq\Mock.Generic.cs:line 880
```

Moq version 4.8 (or later) has improved support for by-ref parameters by introducing `It.Ref<T>.IsAny` which works on `ref`, `in` (since they are by-ref parameters) and `out` parameters. We can use this changing our code to `visitor1.Setup(x => x.Visit(ref It.Ref<MyType>.IsAny)).Returns(true);` as shown below:

```csharp
[Fact]
public void MustCallAllVisitors()
{
    var visitor1 = new Mock<IVisitor>();
    var visitor2 = new Mock<IVisitor>();

    visitor1.Setup(x => x.Visit(ref It.Ref<MyType>.IsAny)).Returns(true);
    visitor2.Setup(x => x.Visit(ref It.Ref<MyType>.IsAny)).Returns(true);

    var target = new MyVisitorRunner(new [] { visitor1.Object, visitor2.Object });
    var subject = new MyType();

    target.Visit(ref subject);

    visitor1.Verify(x => x.Visit(ref It.Ref<MyType>.IsAny), Times.Once);
    visitor2.Verify(x => x.Visit(ref It.Ref<MyType>.IsAny), Times.Once);
}
```

If we now run our tests, we see that it works as we expect, fixing the original issue. As the same approach works for `in` and `out` parameters, I'll leave this as an exercise for you dear reader. I hope that you've found this little tip help, happy mocking!
