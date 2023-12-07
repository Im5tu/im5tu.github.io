---
title: Unit Testing Equals The Forgotten Tests
description: This post demonstrates often overlooked tests when unit testing an object
date: 2014-06-18T18:20:25Z
toc: true
includeInSitemap: true
tags:
- dotnet
---


Today I wanted to cover something that is not often covered when unit testing an object. If an object has the `Equals` method overridden, then there are a number of tests that we should be running as a minimum:<!--more-->

- Reflexive Tests
- Symmetric Tests
- Transitive Tests
- Consistency Tests
- Not-Null Tests

### Reflexive Tests

A reflexive test is one where an object is equal to itself. In other words, the following expression should be true: `x.Equals(x)`.

```csharp
[Test]
public void ReflexiveTest()
{
    var x = new TestClass();

    Assert.IsTrue(x.Equals(x));
}
```

### Symmetric Tests

A symmetric test is one where an object (`x`) is equal to another instance (`y`), only if the second instance (`y`) is also equal to the first instance (`x`). In essence, if `x.Equals(y)` then `y.Equals(x)` should also be true.

```csharp
[Test]
public void SymmetricTest()
{
    var x = new TestClass();
    var y = new TestClass();

    Assert.IsTrue(x.Equals(y));
    Assert.IsTrue(y.Equals(x));
}
```

### Transitive Tests

A transitive tests is one where if object `x` is equal to `y`, and `y` is equal to `z`, then `x` should also be equal to `z`.

```csharp
[Test]
public void TransitiveTest()
{
    var x = new TestClass();
    var y = new TestClass();
    var z = new TestClass();

    Assert.IsTrue(x.Equals(y));
    Assert.IsTrue(y.Equals(z));
    Assert.IsTrue(x.Equals(z));
}
```

### Consistency Tests

A consistent test should ensure that regardless of how many invocations of the `Equals` method occurs, the result should remain the same. For example, both of the following tests should pass:

```csharp
[Test]
public void ConsistencyTest_2Invocations()
{
    var x = new TestClass();
    var y = new TestClass();

    Assert.IsTrue(x.Equals(y));
    Assert.IsTrue(x.Equals(y));
}

[Test]
public void ConsistencyTest_3Invocations()
{
    var x = new TestClass();
    var y = new TestClass();

    Assert.IsTrue(x.Equals(y));
    Assert.IsTrue(x.Equals(y));
    Assert.IsTrue(x.Equals(y));
}
```

### Not-Null Tests

If the `Equals` method is called with a null argument, the result of the test should always be `false`. This is because an instance of an object is never equal to a null reference.

```csharp
[Test]
public void NullTest()
{
    var x = new TestClass();

    Assert.IsFalse(x.Equals(null));
}
```

### Other notes about overriding Equals

- If you override `Equals()`, ensure that you override `GetHashCode()` as well.
  - If two objects are equal, then they must return the same value for `GetHashCode()`
  - If `GetHashCode()` is equal, it is not necessary for them to be the same; this is a collision and `Equals()` should be called to see if the objects are equal in reality
- If possible, always implement the `IEquatable<T>` interface on your custom objects as this provides type safety for other programmers and prevents boxing on value-types.
