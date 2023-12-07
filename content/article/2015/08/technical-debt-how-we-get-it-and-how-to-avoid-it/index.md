---
title: "Technical Debt: How We Get It And How To Avoid It"
description: A discussion on technical debt including strategies to help avoid high levels of technical debt.
date: 2015-08-05T18:37:26Z
toc: true
includeInSitemap: true
tags:
- development
---

This post started as a rebuttal to Ralf Westphal's [blog](http://geekswithblogs.net/theArchitectsNapkin) and his post, "[There is no such thing as technical debt](http://geekswithblogs.net/theArchitectsNapkin/archive/2015/07/22/there-is-no-such-thing-as-technical-debt.aspx)". There are many points of view on the subject covered by various people such as [Uncle Bob](https://sites.google.com/site/unclebobconsultingllc/a-mess-is-not-a-technical-debt) and [Martin Fowler](http://martinfowler.com/bliki/TechnicalDebt.html), but I thought it might be insightful to show how my team manages our code base.<!--more-->

I can see where Ralf is heading in his post, however, I don't believe dissecting the financial analogy provides any benefit to the industry as a whole. As I will cover later, technical debt is a metaphor. Granted, one that can eventually be tracked to a monetary value yet negated quite substantially with proper management.

To give you an idea of the code base I am currently working with, it primarily consists of large monolithic applications that have patchy test coverage and confused design patterns. All of this code was written by many people before me and added to by many others, all with typical enterprise constraints. I have personally added and fixed various parts of the code base, ensuring that I add tests as I go. As our team expands, we are attempting to modernise our code base by identifying services that we can extract into meso-services (services that are slightly larger than a micro-service) and clear our predecessors misgivings. We also have numerous greenfield projects that have been built from the ground up using modern best practises - TDD, agile, SOLID principals, DI, Composition etc.

Before I talk about how we get into technical debt, I'd like to first remind you that technical debt is a metaphor. One that describes the engineering trade-off’s that software developers and business stakeholders must often make in order to meet schedules and customer expectations ([Uncle Bob](https://sites.google.com/site/unclebobconsultingllc/a-mess-is-not-a-technical-debt)). We can mistake the metaphor of technical debt with physical, measurable debt such as financial debt as demonstrated by Ralf.

## Getting into debt

It's frighteningly easy to get yourself into technical debt, but a lot harder to get out of. The most common ways that I have seen so far in my career are:

- Lack of knowledge
- Lack of time or resource (often driven by business)
- Not following best practises (eg: the SOLID principals)
- MVP's

The lack of knowledge of any developer can be attributed to one of two things: the lack of effective experience (i.e.: not working on the same project for 5 years) and a lazy developer. Personally, I believe that if developers want to write better code, they will first find the time to learn more/read others code. If you're too busy in the evening or feel demotivated after work, then try getting up earlier and doing it before your day becomes hectic - it's about time management. It can be argued that junior developers are exempt from this and the responsibility of progressing them falls on to their technical lead(s)/senior developer(s). [Tommy Long](https://twitter.com/smudge202) quite accurately points out: "It is for Seniors to regularly, actively propogate knowledge to improve software development as a whole. Uncle Bob reckons we double in number of developers every 5 years right now. There is a tonne of shit mixed in with a few decent resources on the internet, juniors can't go it alone."

Lack of time or resource is unfortunately bestowed upon us from the business, after all the business is king - without it we would not have a job. This is probably the sole cause for the technical debt that I currently repaying. The trade off's that we have to make often start off small but over time snowball into a huge immovable problem - classic inertia. Therefore the responsibility falls on us as developers accurately estimate our work then let the business decide which work items will not make the deadline.

Not following best practices is again, mostly the fault of the developer. At the end of the day, we, the developer write the code so it is our responsibility to write it properly. In the cases where business is the blocker, it is time that we as developers began to fight those long hard battles in our favour. This is the exact same thing that the developers at Microsoft have done. Their drive came from the bottom up, not top down.

Lastly, MVP's or minimally viable products. The concept is absolutely solid when combined with other practises such as TDD/BDD*. One of the key identifiers with this entrant is the question of: "Should I do this because of feature x which **should** be coming in the next 3 weeks, but it will add half a day to the implementation?". Note the emphasis on **should**. A sprints backlog is volatile and subject to the abuse of the business at any given moment. If you keep the code as is, you run the risk of the feature costing more time in the future. On the contrary, the future feature may never be needed because of a changing requirement therefore saving you time.

*\*I believe that all code should be tested, even if it is a prototype/MVP. You never know whether or not it will be used again. This is one major pain point of many that i've experienced recently as I've picked up legacy projects.*

## When technical debt is too high

There are a few signs of high technical debt, which are:

- It's hard to add new functionality
- The code resembles a spaghetti junction
- You cannot test your code effectively

Typically, my first two points are attributed to developers not having enough knowledge or not following best practices. A prime example is if your class has more than a single responsibility such as it reads data from the database and contains business logic for validating a shopping basket. The example violates multiple principals and should make every developer feel like they've just jumped into a deep muddy puddle.

By effectively testing your code, I mean that you should be able to write all types of test against the code you write: Unit, Component and Integration. If you can only write integration tests for the code you have just written, then you likely need to change your code - Unit testing a database layer (specifically the ORM, not physical IO) is usually quite trivial if the code is structured correctly. That said, we are often stopped from unit testing when using certain frameworks such as Microsoft Azure Service Bus due to the lack of abstractions the library provides. In this case, integration tests are often the best that we can do - but at least it is under test.

The key point to make is that if your future self (or colleague) will have trouble maintaining the code you have just written, then we haven't coded it well enough. If you have to write comments then you are probably doing it wrong - unless there is a concious design decision. [Tommy Long](https://twitter.com/smudge202) quite accurately reflects some of my own thoughts on comments in [his post about comments](http://blog.devbot.net/conventions-comments/#code).

## Strategies to avoid high levels of technical debt

Here at [4Com](http://www.4com.co.uk), we employ the following techniques to help us track how much technical debt we have and to help us mitigate it:

- The rule of 3
- The hallway test
- Issue tracking
- Sprint management

Our rule of 3 is quite simple, once two out of three developers agree on a certain decision whether it be deciding on uptake of a new framework or naming an api, that decision is usually the one used. Usually one of the 3 is our manager/technical lead who often plays the role of devils advocate in this scenario. Any person of the 3 can play the role of devils advocate. The rule of 3 helps other members of the team understand the thought processes and context for the decision - something that is often missed when developers leave. It also helps to quickly highlight any major problems based on past experiences. If the situation warrants it, a spike can be performed to further evaluate the decision. While the rule of 3 is extremely helpful for larger architectural decisions, often a simpler approach can be used which negates the resource requirements: The hallway test.

The hallway test is a phrase that I picked up off the folks at Microsoft. The basic premise is that a random developer should be able to understand and logically follow the code/api without documentation. Often the random will not have domain knowledge, which can make them perfect to bounce ideas off of. Sometimes, domain knowledge will be required - but the point is to bounce/review the idea with another developer which often leads to a cleaner/simpler design; thus, lowering the debt raised.

If we have made a shortcut for an MVP or have identified a piece of legacy code that can be tied up, the first thing we do is raise an issue within JIRA - our issue tracking platform. The reason for this is that we can assign it a priority and discuss whether or not it blocks future functionality/reduce time of implementation. Often the items might be small and can be added to a sprint if the focus of the sprint has already been completed (eg: 2 hours to go before the end of the sprint and the work is all done). Whilst this isn't a way to avoid technical debt, it helps you to keep track of it and realise when you have too much debt that you need to repay.

Before each sprint, we asses the priorities of the business against our current backlog. Once the main priorities have been assigned work items within the sprint, we fill up the remaining space with technical debt. The order in which technical debt and features are tackled within a sprint depends on the business priorities. For example: feature/improvement A must be completed at all costs. As my colleague HerecyDev points out, you should be completing all work within a sprint and not over-committing. I personally favour tackling features first so the business gains value, unless tackling a piece of technical debt can improve the efficiency of implementing a feature. It might not always be possible to add technical debt every sprint, but so long as that is the minority of cases you should be perfectly fine.

With legacy projects, the primary focus should be getting unit tests in place (this might start as an integration test). This ensures that you will not break any existing functionality while you make the code better and flag work items for the future.

### Closing words

In his post, Ralf mentions that tackling technical debt is an addiction with the basic argument the business will keep postponing doing the right thing. If left unmanaged this is entirely true until it becomes a point where it is too costly to implement a feature. The key is the business will decide this. At [4Com](http://www.4com.co.uk), we continuously flag items as technical debt for review at every sprint planning meeting. I firmly believe that if we didn't, we wouldn't have the same high standards in our code base as we do today.

In short, we should always leave the code in a better place than when we found it - never worse and raise an issue if there is something that could be done better. That's what I believe the metaphor is for - something that we can do better within our code.
