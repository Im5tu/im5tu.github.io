{
    "title": "Observed No. 3 - Understanding Split Horizon DNS: How it works and How to Implement it in AWS",
    "description": "Welcome to the third edition of Observed! Your weekly newsletter, where I bring you a tip you can implement in your infrastructure across many categories like AWS, Terraform and General DevOps practices. This week's edition looks at Split Horizon DNS.",
    "tags": ["devops", "observed"],
    "date": "2023-01-16T00:00:00+00:00",
    "categories": ["devops", "observed"]
}

Welcome to the third edition of Observed! Your weekly newsletter, where I bring you a tip you can implement in your infrastructure across many categories like AWS, Terraform and General DevOps practices. This week's edition looks at Split Horizon DNS.
<!-- more -->

## What is Split Horizon DNS?

Split Horizon DNS is a technique used in DNS to provide different responses to queries depending on where the query originates. For example, a DNS request originating from inside your network may elicit a different response to a DNS request from a consumer of your application.

Splitting the responses by source can help ensure that only the resources which should be exposed to the internet are exposed. For example, an internal-only admin service would be an ideal candidate for not exposing to the internet, but we would want it addressable by our internal networks. In this case

With Split Horizon DNS, each zone responds with an authoritative answer. For example, in a traditional DNS setup where the DNS is not split, there is only one authoritative answer - your primary DNS nameserver. With split DNS, your internal DNS will respond with one answer, and the external DNS will respond with another - typically for an internal and external load balancer, respectively.

Split Horizon DNS is also known as Split View DNS, Split DNS or Split Brain DNS.

## How to set up Split Horizon DNS in AWS?

To configure Split Horizon DNS, you perform the following steps:

1. Create public and private hosted zones with the same name, for example: mydomain.com
1. Associate one or more VPCs with the private hosted zone. Route 53 Resolver uses the private hosted zone to route DNS queries in the specified VPCs.
1. Create records in each hosted zone. Records in the public-hosted zone control where internet traffic is routed, whilst records in the private-hosted zone control how traffic is routed internally.
1. Query your DNS

If you have any questions or comments, please don’t hesitate to contact me either in the comments, on Twitter or any medium listed on my website! I’d love to hear your thoughts. Subscribe to the newsletter below!
