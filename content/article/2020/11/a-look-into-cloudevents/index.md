---
title: "A Look Into CloudEvents"
description: A look into what CloudEvents are, and how they can be used as a internal format for messaging
date: 2020-11-21T11:34:07Z
toc: true
includeInSitemap: true
tags:
- dotnet
- devops
---

Over the past few months, I've been looking into the internal architecture setup for [Checkout.com](https://checkout.com) and seeing how we can scale it for the next few years. As part of that research, I've been looking into the CloudEvents specification as a potential option as the basis for a common event schema across teams.

<!--more-->

## What are CloudEvents?

CloudEvents is a [Cloud Native Computing Foundation](https://www.cncf.io/projects/) incubating project that provides [a specification](https://github.com/cloudevents/spec/blob/master/spec.md) for describing event data in a common way ensuring that teams have consistency in their applications, helping to reduce some of the errors traditionally faced and simplifying integrations. Traditionally, different teams & third-party providers have different structures to their events, even with the same organisation.

CloudEvents, at its core, defines a set of metadata, called attributes, about the event being transferred between systems, and how those pieces of metadata should appear in that message. This metadata is meant to be the minimal set of information needed to route the request to the proper component and to facilitate proper processing of the event by that component. _([Source](https://github.com/cloudevents/spec/blob/master/primer.md#design-goals))_

Interestingly, the CloudEvents project also explicitly lists the non-goals for the project (ie: the stuff that's out of scope):

- Function build and invocation process
- Language-specific runtime APIs
- Selecting a single identity/access control system
- Inclusion of protocol-level routing information
- Event persistence processes
- Mechanism for Authorization, Data Integrity and Confidentiality

## What does a CloudEvent look like?

As all CloudEvents implementations must support the JSON format, we can take a look at a minimal payload here:

```json
{
    "id": "A234-1234-1234",
    "source": "https://github.com/cloudevents/spec/pull",
    "specversion": "1.x-wip",
    "type": "com.github.pull_request.opened"
}
```

All of the fields listed above are required in all formats of CloudEvents. The `id` field identifies the event which producers ensure is unique for a given `source`. The `source` identifies the context in which an event happened. Often this will include information such as the type of the event source, the organization publishing the event or the process that produced the event. The `specversion` describes the version of the CloudEvents specification that the event adheres to.

The specification also includes some additional optional attributes, which can be seen here:

```json
{
    "id": "A234-1234-1234",
    "source": "https://github.com/cloudevents/spec/pull",
    "specversion": "1.x-wip",
    "type": "com.github.pull_request.opened",
    "data": "<much wow=\"xml\"/>",
    "datacontenttype": "text/xml",
    "dataschema": "/teams/sega/cloud_event.json",
    "subject": "et_245435943",
    "time": "2019-10-12T07:20:50.52Z"
}
```

Should a producer want to include domain specific information about the event occurrence, they must encapsulate this information inside of the `data` field. The `datacontenttype` field will then describe the format of the data field, for example `application/json`. If the `datacontenttype` field is omitted, then its assumed that the `data` field, if present, is of type `application/json`. Another field that directly relates to the data field, if present, is `dataschema`. This field identifies the schema that the `data` field adheres to, as a URI reference. The `subject` field describes the object/instance that the event is in reference to within the context of the producer. In other words, it could be the name of a EC2 instance, a file in Azure blob storage or a user id. Lastly, the `time` field is the timestamp in format of [RFC 3339](https://tools.ietf.org/html/rfc3339) (eg: `2019-10-12T07:20:50.52Z` (ISO8601 compatible) or `2019-10-12 07:20:50.52Z` (**not** ISO8601 compatible)) of when the event occurred.

The [json format](https://github.com/cloudevents/spec/blob/master/json-format.md) also allows for messages to be batched together. When this occurs, the `type` field must be set to `application/cloudevents-batch+json`. See the [example shown here](https://github.com/cloudevents/spec/blob/master/json-format.md#43-examples).

### Duplication/Idempotency

Earlier, I mentioned that the `id` field identifies the event which producers ensure is unique for a given `source`. If a duplicate event is re-sent (eg: retry of a queue) it may have the same id. How the consumers handle this is up to them and largely depends on the context of the event. For example: if we are sending a new UserCreated event in the system, it will usually be safe to treat this as an idempotent event using the `id` as the idempotency key. It's always up to the consumer to decide whether or not multiple events with the same `source` and `id` combination are treated as duplicates or not.

## Transports

CloudEvents may be sent across a variety of transport mechanisms, including:

- [AMQP](https://github.com/cloudevents/spec/blob/master/amqp-protocol-binding.md)
- [HTTP](https://github.com/cloudevents/spec/blob/master/http-protocol-binding.md)
- [MQTT](https://github.com/cloudevents/spec/blob/master/mqtt-protocol-binding.md)
- [NATS](https://github.com/cloudevents/spec/blob/master/nats-protocol-binding.md)
- [Kafka](https://github.com/cloudevents/spec/blob/master/kafka-protocol-binding.md)
- [WebSockets](https://github.com/cloudevents/spec/blob/master/websockets-protocol-binding.md)

The specification doesn't explicitly include vendor specific transports like Azure Service Bus or SQS. CloudEvents can be mapped to these vendor specific transports pretty easily by using the [HTTP](https://github.com/cloudevents/spec/blob/master/http-protocol-binding.md) as a guide for this.

## Formats

As mentioned earlier, any implementation must support the JSON format, presumably because it's one of the most widely used formats today. However, the specification details two other formats: [Avro](https://github.com/cloudevents/spec/blob/master/avro-format.md) & [Protobuf](https://github.com/cloudevents/spec/blob/master/protobuf-format.md).

The format that services decide to use is up to them, so long as the specification is followed. This allows great flexibility in the way systems are built.

## Specification extensions

Like any specification, it's never a case of one size fits all. The CloudEvents specification allows itself to be extended. An extension adds additional attributes to the message so long as they follow the same naming convention and type system as the standard attributes. A number of extensions for some common use cases have already been documented:

- [Dataref (Claim Check Pattern)](https://github.com/cloudevents/spec/blob/master/extensions/dataref.md)
- [Distributed Tracing](https://github.com/cloudevents/spec/blob/master/extensions/distributed-tracing.md)
- [Partitioning](https://github.com/cloudevents/spec/blob/master/extensions/partitioning.md)
- [Sampling](https://github.com/cloudevents/spec/blob/master/extensions/sampled-rate.md)
- [Sequence](https://github.com/cloudevents/spec/blob/master/extensions/sequence.md)

To write a custom extension, [check here](https://github.com/cloudevents/spec/blob/master/documented-extensions.md) first for prior art and implementation information.

## SDK Support

At the time of writing, there are six different SDK's at the moment to help people produce and consume CloudEvents:

1. [GO](https://github.com/cloudevents/sdk-go)
1. [Javascript](https://github.com/cloudevents/sdk-javascript)
1. [Java](https://github.com/cloudevents/sdk-java)
1. [C#](https://github.com/cloudevents/sdk-csharp)
1. [Ruby](https://github.com/cloudevents/sdk-ruby)
1. [Python](https://github.com/cloudevents/sdk-python)

I think it's definitely worth teams looking into the use of CloudEvents as an interoperability mechanism between teams that need to consume each others events. The specification may also be looked at with other CNCF projects, like the Serverless Workflow specification. There's definitely a lot more that I need to go and unpack with the CloudEvents specification, but at a high level, I really like the approach that's been taken and I hope you do as well.

You can [read the full specification here](https://github.com/cloudevents/spec/blob/master/spec.md).
