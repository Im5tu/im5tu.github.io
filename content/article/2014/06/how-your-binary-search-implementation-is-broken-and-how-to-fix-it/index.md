---
title: How your binary search implementation is broken and how to fix it
description: This post describes how a bug exists in most implementations of a binary search algorithm and how to fix it
date: 2014-06-20T18:21:04Z
toc: false
includeInSitemap: true
tags:
- dotnet
- java
---

I have recently begun studying the theory and implementations of algorithms. During this study, I came across [this post](http://googleresearch.blogspot.co.uk/2006/06/extra-extra-read-all-about-it-nearly.html) which describes how a bug exists in most implementations of a binary search algorithm. <!--more-->

I'll begin with the example given in the post, which is taken from `java.util.Arrays`.

```csharp
public static int BinarySearch(int[] a, int key) {
    int low = 0;
    int high = a.length - 1;
    while (low <= high) {
        int mid = (low + high) / 2;
        int midVal = a[mid];
        if (midVal < key)
        {
            low = mid + 1;
        }
        else if (midVal > key)
        {
            high = mid - 1;
        }
        else
        {
            return mid; // key found
        }
    }
    return -(low + 1);  // key not found.
}
```

For all intensive purposes this implementation is correct. Except for a bug which can raise an Overflow Exception. The problematic line is this:

```csharp
int mid = (low + high) / 2;
```

If the result of `low + high` is greater than maximum value of an 32-bit integer, the exception is raised. Luckily, there are ways that we can fix this:

```csharp
int mid = low + (high - low) / 2;
```

Or if you're in Java:

```csharp
int mid = (low + high) >>> 1;
```

If you are working in .Net languages you will need to work with the `unchecked` keyword in order to use the bit shift method:

```csharp
int mid;
unchecked
{
    mid = (low + high) >> 1;
}
```

>The `unchecked` keyword is used to suppress overflow-checking for integral-type arithmetic operations and conversions.
>
>In an unchecked context, if an expression produces a value that is outside the range of the destination type, the overflow is not flagged. For example, because the calculation in the following example is performed in an unchecked block or expression, the fact that the result is too large for an integer is ignored, and int1 is assigned the value -2,147,483,639.

([Source](http://msdn.microsoft.com/en-GB/library/a569z7k8.aspx))

So here is the differential method in C#:

```csharp
public static int BinarySearch(int[] a, int key) {
    int low = 0;
    int high = a.length - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        int midVal = a[mid];
        if (midVal < key)
        {
            low = mid + 1;
        }
        else if (midVal > key)
        {
            high = mid - 1;
        }
        else
        {
            return mid; // key found
        }
    }
    return -1;  // key not found.
}
```

And using the bit shift method:

```csharp
public static int BinarySearch(int[] a, int key) {
    int low = 0;
    int high = a.length - 1;
    while (low <= high) {
        int mid;
        unchecked
        {
            mid = (low + high) >> 1;
        }
        int midVal = a[mid];
        if (midVal < key)
        {
            low = mid + 1;
        }
        else if (midVal > key)
        {
            high = mid - 1;
        }
        else
        {
            return mid; // key found
        }
    }
    return -1;  // key not found.
}
```

Personally, I prefer the differential version over the bit shift version but I have provided both for completeness. Even though this bug only manifests itself with well over a billion elements in an array, I still thought it was worth pointing out. I encourage you to read the other articles for more complete context.
