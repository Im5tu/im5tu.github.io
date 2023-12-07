---
title: "Observed No. 4 - Emerging Pattern: Centralised Ingress"
description: "Welcome to the fourth edition of Observed! Your weekly newsletter, where I bring you a tip you can implement in your infrastructure across many categories like AWS, Terraform and General DevOps practices. This week's edition looks at a common pattern emerging across the industry: Centralised Ingress"
date: 2023-01-23T02:00:00+00:00
toc: true
includeInSitemap: true
tags:
- devops
---
Welcome to the fourth edition of Observed! Your weekly newsletter, where I bring you a tip you can implement in your infrastructure across many categories like AWS, Terraform and General DevOps practices. This week's edition looks at a common pattern emerging across the industry: Centralised Ingress.

<!-- more -->

## What is ingress traffic?

Ingress traffic refers to communication with your network from outside its perimeter. Typically when referring to ingress traffic, we talk about traffic from external consumers of our services, usually via HTTP or HTTPS. However, ingress could be any external traffic trying to hit our network. For example, it could be a Google search bot or an attacker trying to connect to our Redis cluster(s).

## Why are companies centralising ingress?

In the past, the companies implementing centralised ingress have been limited to large companies with tens of thousands of employees. As the technology improves and teams adopt more agile DevOps practices, companies as small as 50 people are implementing this pattern.

To get a good understanding of why this is an emerging pattern, let’s take a look at some of the benefits that companies will get by implementing a centralised ingestion layer:

1. Improved security: Directing all incoming traffic to a central point can be more easily monitored for security threats, and any malicious traffic can be blocked before it reaches the internal network. Centralisation also reduces the total attack surface by keeping everything private, that should be private.
2. Simplified network architecture: Directing all incoming traffic to a central point can simplify the overall network architecture and make it easier to understand and troubleshoot. The simplification may also lead to cost savings by reducing the total number of load balancers, depending on the final architecture.
3. Additional functionality: Using a centralised ingestion point as a reverse proxy can provide other functionality like SSL termination, caching, rate limiting, and a starting point for tracing or authentication.

From what I’ve seen, companies tend to move towards a centralised point of ingestion primarily for security benefits, closely followed by the additional functionality they receive.

Companies typically look at two main additional pieces of functionality:

1. Rate limiting
2. Tracing

Centralising the rate-limiting of all external clients in a centralised manner allows development teams to reduce the total complexity of their applications because they essentially offload the work to the point of ingress. Teams may still choose to have rate limiting for their internal clients, but the centralised view can provide rate limits that are not otherwise possible to implement in each application.

With Tracing, a centralised ingress is the starting point for all requests regardless of destination. Apart from the standard benefits of having a distributed tracing system, one key benefit of starting the tracing at a single entry point is that you can generate metrics for every endpoint in your system, including any associated monitoring and alerting.

## Why wouldn’t you centralise your ingress?

Whilst there are a lot of positives of centralising your ingress traffic, there may be occasions where you shouldn’t. These include:

1. Scaling: Centralising your ingress traffic can create a bottleneck if the point of ingestion cannot handle a large amount of incoming traffic. This can lead to increased latency and decreased performance, or in some cases, a complete denial of service.
2. Complexity: Centralising your ingress traffic can add complexity to the architecture, making it more difficult to understand and troubleshoot. Moreover, it can increase the risk of any deployments done to the ingestion layer, which must be managed accordingly.
3. Limited flexibility: Centralising your ingress traffic can limit how traffic is directed and managed. It may be harder to implement more advanced routing rules or to route traffic to different services based on certain conditions.

As with any technology, the benefits and drawbacks need to be reviewed by your organisation against any requirements that they have. When deploying a centralised ingress layer, you also need to consider how many you will need to deploy because, ideally, you would have at least two different ingestion layers—one for production and one for testing.

If you want to see a video on deploying a centralised ingress network on AWS, please drop me a message or a comment.

**📣 Get the Weekly Newsletter Straight to Your Inbox! 📣**

Don't miss out on the latest updates! Subscribe to the [Observed! Newsletter](https://news.codewithstu.tv) now and stay up-to-date with the latest tips and tricks across AWS, Devops and Architecture. [Click here](https://news.codewithstu.tv) to subscribe and start receiving your weekly dose of tech news!
