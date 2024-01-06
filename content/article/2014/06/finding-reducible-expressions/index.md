---
title: Finding Reducible Expressions
description: This post details the Expressions that can be reduced in the System.Linq.Expressions namespace
date: 2014-06-24T09:21:19Z
toc: true
includeInSitemap: true
tags:
- dotnet
---

Today I just wanted to share a quick note regarding [a Stack Overflow answer](http://stackoverflow.com/a/2040097/315711) that I recently came across. In the answer the author explains that a call to `Expression.CanReduce` will typically return false, while `Expression.Reduce()` will return the current expression. The author continues to state that one of the types that overrides `Expression.Reduce()` and `Expression.CanReduce` is `MemberInitExpression`.
<!--more-->

I wanted to find out when `Expression.CanReduce` would actually return `true`. I discovered the [173 page Expression Tree Specification](http://www.codeplex.com/Download?ProjectName=dlr&DownloadId=246540) which provides an additional insight to `CanReduce` and `Reduce()`.

## CanReduce

>This property returns whether the Reduce method returns a different but semantically equivalent ET.  By default, this property returns false.
>In the typical case, the resulting ET contains all common ET nodes suitable for passing to any common compilation or ET processing code.  Sometimes the result is only partially reduced, and when walking the resulting ET, you'll need to further reduce some nodes.
>The value returned by this property should never change for a given object. Here's the signature:

```csharp
    public virtual Boolean CanReduce { get; }
```

## Reduce

>This method returns a semantically equivalent ET representing the same expression.  By default, this method returns the object on which it was invoked.
>Typically the result comprises only common ET types, ET nodes suitable for passing to any compilation or ET processing code.  Usually the result is only partially reduced (that is, only the root node).  You'll probably need to further reduce some nodes. Here's the signature:

```csharp
    public virtual Expression Reduce();
```

## Reducible Types Inside System.Linq.Expressions

Using [Telerik's JustDecompile](http://www.telerik.com/products/decompiler.aspx), I went through each public class to see which had an override on either `CanReduce` or `Reduce()`. The result came up with the following list:

- [BinaryExpression](http://msdn.microsoft.com/en-us/library/system.linq.expressions.binaryexpression.aspx)
- [ListInitExpression](http://msdn.microsoft.com/en-us/library/system.linq.expressions.listinitexpression.aspx)
- [MemberInitExpression](http://msdn.microsoft.com/en-GB/library/system.linq.expressions.memberinitexpression.aspx)
- [UnaryExpression](http://msdn.microsoft.com/en-us/library/system.linq.expressions.unaryexpression.aspx)

Furthermore, I searched for descendant types of the list above and found the following reducible classes that were marked as internal, as such I couldn't find any official documentation for them:

- AssignBinaryExpression
- CoalesceConversionBinaryExpression
- LogicalBinaryExpression
- SimpleBinaryExpression

## Further Reading

Inside the expression tree specification, I would also be inclined to read section 2.2 entitled *Reducible Nodes*.

If there are any additional expressions that can be reduced that I have missed, please send me a message and I will add it to the list.
