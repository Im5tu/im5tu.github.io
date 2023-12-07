---
title: "Message Queue Fundamentals: Introduction"
description: Message queues are a substantial part of modern day enterprise architectures and a vital part of providing scalable solutions. Here I walk you through some of the basic patterns.
date: 2014-09-07T18:35:37Z
toc: true
includeInSitemap: true
tags:
- dotnet
---

Message queues are a substantial part of modern day enterprise architectures and a vital part of providing scalable solutions. They are designed for asynchronous communication between different parts of the system. They help scale individual components of a system and increase reliability with the optional addition of the persistence of messages to a storage system.<!--more-->

In the next few articles I will be covering some of the basics of message queues followed by a couple of different implementations including [Microsoft's MSMQ](http://msdn.microsoft.com/en-us/library/ms711472(v=vs.85).aspx) and [Particular's](http://particular.net/) [NServiceBus](http://particular.net/nservicebus).

## What is a Message Queue (MQ)?

Messages queues can be thought of as any other first-in-first-out queue. Each message queue accepts a single message one at a time and stores it until a handler is ready to process this message. If there are no message handlers ready to receive the message, it remains in the queue. Some implementations of message queues allow the configuration of features such as a priority on each message, others do not.

As mentioned earlier, message queues are designed to perform asynchronous communication which they achieve in one of three principals:

1. Fire & Forget
2. Request-Response
3. Publish/Subscribe

I will also detail a variant of the Request-Response pattern called Scatter-Gather and an additional technique of the Publish/Subscribe pattern called Subscription Filters.

## Fire & Forget Messaging

Originally a military term, the phrase fire and forget has ported well to realms of programming. Typically when two entities are communicating, one entity sends a message and the other replies (be it (a)synchronously). With fire & forget messaging, the entity is not interested in any reply, simply the acknowledgement of the message.

The best example I can think of is notifications. Once the application server has sent the notification message to the message queue, it is free to process additional requests. When a handler is free to pick up the notification message it does and sends the message on to the relevant device via the correct medium. At any stage during, the only response is acknowledgement of receipt of the notification message. This is so that the queues do not attempt to resend the message. If an error occurs, or a time-out value expires, the message is left in the queue to be tried again, depending on the nature of the error.

## Request-Reponse Messaging

In request-response, two different queues are used; one for processing requests and the other for processing the responses. Whilst sending the message to the request queue, the client often includes a reply address so that a response can be sent to the correct destination.

Each client typically has its own response queue, so that it only receives responses to its own requests. This pattern of messaging allows the client to continue processing while it waits for a response from the response queue, which would have otherwise been completed via synchronous communication.

### Scatter-Gather Messaging

Often responses are required from multiple sources. This is where the Scatter-Gather pattern comes in. The Scatter-Gather pattern is a composition of the publish-subcribe pattern that we will see later and the aggregator pattern. Once a message has been published, the subscribers return the responses to a central queue to be consumed by an aggregator.

The aggregator will know how many responses it should expect, either by using a pre-defined value or via header information. Once the aggregation is complete, the publisher is notified via the response message queue.

In this scenario, I would typically expect to see three distinct queues:

1. A publisher queue
2. An aggregation queue
3. A response queue

## Publish/Subscribe Messaging

The publish/subscribe pattern is not to dissimilar to the observer pattern found in C#/Java. Interested parties subscribe to a specific queue in order to receive notifications. Once a message has been sent to the queue, all parties receive a copy of the message.

This pattern is good for event-driven processing, since components can be added or removed with relative ease. An example would be a users address changes. The changes need to be reflected in the database, a CRM system and a third party provider. Without this pattern, the publisher would have to know about the three different systems in order to complete the processing. Instead, the publisher only knows about the queue, and the queue about the subscribers to that queue.

A natural extension of this pattern is the [Reactive Extensions Framework (Rx)](http://msdn.microsoft.com/en-gb/data/gg577609.aspx). It is a library for composing asynchronous and event-based programs using observable sequences and LINQ-style query operators and has been ported to many different languages.

### Subscription Filters

Subscription filters can be applied to any queue that contains a publish-subscribe model. Upon receipt of a message, the queue is responsible for deciding which messages should be sent to each handler. This allows for greater security, because not all subscribers receive all messages, but at the cost of greater processing expense. The addition of each new subscriber will impact the throughput of the queue because the new subscriber has to be considered for every message that flows through the queue.
