---
title: "Write Good Code, Not Code Hastily"
description: Here I talk about why it's important to write good code, not code that you can write fast.
date: 2016-12-21T23:25:27Z
toc: true
includeInSitemap: true
tags:
- dotnet
---

This article is a rework of a draft that I've had sitting in my drafts folder for a long while now. Over the last six months or so, I've been reviewing a lot more code than I had previously thanks in part to a promotion and in part, code reviewing applicants coding entries. Some of the code has been good, with some code, really not so good!
<!--more-->

> **TL;DR:** *Do everything in your power to not take the shortcut when writing code. It will bite you in the future.*

I am much the same as everybody else, there is room for improvement in my code - of that I'm sure. We are all limited by knowledge: not knowing what we don't know. That's one of the things I enjoy the most about what I do, learning how to do new things to make my life, and others lives, easier in the long run.

One of the areas that I think 95% of developers can be better at doing is writing clean code. We've all heard of [Uncle Bob](https://cleancoders.com/), so I won't re-itterate him here. I've found that senior developers asking for £45,000 cannot recite the SOLID principals correctly (if at all), let alone use them in practise. I use the SOLID principals as one example, but in reality we are talking about clean and reusable code. Code anyone of any level can pickup and understand.

## On Haste

There comes a time in every project where you're up against the clock for one reason or another. Deadline's are coming up quickly and you still haven't finished that module. What do you do? Do you write those unit tests later? Do you take that "quick and easy" shortcut.

It's very easy to take the shortcut and get the work out on time. When you do this, you are deferring that effort until later. Except:

> Later equals never

So what happens when you keep deffering that effort until never? You and your team start to use the phrases like: "this needs a complete rewrite" or "we can't do feature x because it wasn't written in an extensible way". These phrases should be massive red flags. They are a sign that too many shortcuts have been taken in the past which have now come to fruition.

Back to the example, what should you do? There are a number of things that you can do, including:

- Ask for more time to do it properly,
- Attempt to descope some of the work,
- Stay late and put extra effort it

Typically, the first two options are likely your best approach before considering a shortcut or working late. I used often work later as a last resort, though it is something that I am not fond of in any shape or form. This typically means bad quoting/estimating/requirements gathering which is a little outside of scope for this article, so I'll cover this topic in a future post.

Clean coding can help in preventing us from reaching the situation described above. I gave some advice today, on this very subject, to a junior developer which I don't think is repeated enough, in any form. I've given it before and i'll give it countless times more:

> Take the time and learn how to do it correctly. Practise doing it correctly until it's second nature, even on current projects. You will become faster at it with time and be a better developer for it.

Studying by itself is seldom enough. Learning is always best in context. The first few times you try something new, you will inevitably make mistakes. It's natural to make mistakes when learning, we are human afterall. Think of learning like its an agile piece of work. Iterrate and improve (with the help of code reviews).

Learning the core patterns & principals (eg: SOLID) may slow you down in the early stages of learning as you refer to learning material. However, don't be put off by this. As your knowledege increases, you will be spending less time fighting your way through unreadable code whilst writing code that can be read by all skill levels. Code that is not readable slows everyone down. Yourself included, though you may not realise it at first.

## On Code Reviews

One of the quickest ways to improve the code you're writing is to have it reviewed. Reviews need to be a conscious effort by everyone in a team. How you do the review is up to you. A review can be two people sitting at a desk, or it can be an isolated review. Pick which strategy is best for you. It's just important that it happens.

Can a junior review a seniors code? Certainly, in my opinion. Juniors should be asking questions about the code and how it works. This forces a greater understanding in what has been written (on both sides) and the core  principals behind the code.

One of the most common blockers to adopting code reviews is that they take too much time. If you are attempting to review a 3000 file changeset, then of course it will take time. But we must also be asking the question: why has it grown to a 3000 file changeset in the first place? The chances of missing an obvious mistake in a changeset grows exponentially with the size of the changeset. Reviewers get fatigued with large changesets. Where possible, try and keep the changeset small and have it reviewed more frequently by different people. The more eyes on the code, the better, generally.

Code reviews exist for two primary reasons: to help people learn and catch the obvious mistakes. They should also be [empathetic in nature](https://slack.engineering/on-empathy-pull-requests-979e4257d158).

## Final Thoughts

The scrutineers amongst you will have noticed that the sub-text to this article is all about preventing technical debt. Technical debt is a monster that accrues interest over time. One of the key ways to prevent that debt, is by writing clean code. We should be writing code as clean as we can. The more you write clean code, the quicker you will be at writing it.

*Your code is your legacy*
