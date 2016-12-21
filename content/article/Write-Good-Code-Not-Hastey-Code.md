{
   "categories": ["Coding"],
   "date": "2016-12-21T22:06:27Z",
   "description": "Here I talk about why it's important to write good code, not code that you can write fast.",
   "draft": true,
   "tags": ["Development", "Clean Code"],
   "title": "Write Good Code, Not Hastey Code"
}

This article is a rework of a draft that I've had sitting in my drafts folder for a long while now. Over the last six months or so, I've been reviewing a lot more code than I had previously thanks in part to a promotion and in part, code reviewing applicants coding entries. Some of the code has been good, with some code, really not so good!
<!--more-->

> **TL;DR:** *Do everything in your power to not take the shortcut when writing code. It will bite you in the future.*

I am much the same as everybody else, there is room for improvement in my code - of that I'm sure. We are all limited by knowledge: not knowing what we don't know. That's one of the things I enjoy the most about what I do, learning how to do new things to make my life, and others lives, easier in the long run.

One of the areas that I think 95% of developers can be better at doing is writing clean code. We've all heard of [Uncle Bob](https://cleancoders.com/), so I won't re-itterate him here. I've found that senior developers asking for £45,000 cannot even recite the SOLID principals, let alone use them correctly in practise. I use the SOLID principals as one example, but truthly what we are talking about is clean and reusable code. Code that anyone of any level can pickup and understand.

## On Haste

There comes a time in every project where you're up against the clock for one reason or another. Deadline's are coming up quickly, you still haven't finished that module. What do you do? Do you write those unit tests later? Do you take that "quick and easy" shortcut.

It's very easy to take the shortcut and get the work out on time. When you do this, you are deferring that effort until later. Except:

> Later equals never

So what happens when you keep deffering that effort until never? You and your team start to use the phrases like: "this needs a complete rewrite" or "we can't do feature x because it wasn't written in an extensible way". These phrases should be massive red flags. They are a sign that too many shortcuts have been taken in the past which have now come to prominence.

I gave this bit of advice today to a junior developer which I don't think is repeated enough, in any form. I've given it before and i'll give it countless times more:

> Take the time and learn how to do it correctly. Practise doing it correctly until it's second nature, even on current projects.  

Studying by itself is seldom enough. Learning is often best completed in context. The first few times, you may make a few mistakes. We are human, everyone makes mistakes. Think about it like an agile piece of work. Iterrate and improve (think code reviews). Learning things like patterns will likely slow you down in the early stages of learning whilst you refer to learning material. However, over time your general throughput as a developer will likely increase since you're spending less time clearing up after old mistakes. Moreover, you're reading and writing readable code. Code that is not readable, slows everyone down, yourself included though you may not realise it at first. 

## On Code Reviews

One of the quickest ways to improve the code you're writing is to have it reviewed. Reviews need to be a conscious effort by everyone in the team. How you do the review is up to you. It's just important that it happens. Can a junior review a seniors code? Certainly, I think. Juniors should be asking questions about the code and how it works. This forces a greater understanding in what they've written and the principals behind the code. 

One of the most common blockers to adopting code reviews is that they take too much time. If you are attempting to review a 3000 file changeset, then of course it will take time. But it also asks the question, why has it grown to a 3000 file changeset in the first place. The chances of missing something obvious in a changeset grows exponentially with the size of the changeset. Reviewers will get review fatigue with large changesets so, where possible, try and keep the changeset small and have it reviewed more frequently by different persons.