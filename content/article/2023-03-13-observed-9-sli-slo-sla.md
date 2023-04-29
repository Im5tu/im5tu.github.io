{
    "title": "Observed No. 9 - SLIs vs SLOs vs SLAs",
    "description": "The 9th edition of Observed explains the differences between Service Level Indicators, Service Level Objectives and Service Level Agreements",
    "tags": ["devops", "observed"],
    "date": "2023-03-13T01:00:00+00:00",
    "categories": ["Development"],
    "toc": true
}

Welcome to the 9th edition of Observed! Your weekly newsletter, where I bring you a tip you can implement in your infrastructure across many categories like AWS, Terraform and General DevOps practices. This week's edition examines the differences between SLIs, SLOs and SLAs.

<!-- more -->

When it comes to measuring the quality of your service, three terms are frequently used: Service Level Indicators (SLIs), Service Level Objectives (SLOs), and Service Level Agreements (SLAs). Although they sound similar, they each have different meanings and purposes. Let's dive into each of them.

## Service Level Indicators (SLIs)

A Service Level Indicator (SLI) is a metric that measures the performance of a service. SLIs are used to understand a service's performance from the end-users perspective. They are often measured in terms of availability, latency, and throughput.

For example, with a website, you might use the following SLIs:

- Availability: The percentage of time that your website is up and running.
- Latency: The time it takes for your website to respond to a request.
- Throughput: The number of requests your website can handle at a time.

SLIs are generated on a per-event basis, such as a web request. Each event may feed into multiple SLIs and will create a result that must be one of the following:

- Passed: - We achieved our SLI for this event
- Failed: - We did not achieve our SLI for this event
- Not Interested: We are not interested in counting this event towards our SLI

Let's look at the example of a web request and see how we can map SLIs to a web request event. Imagine that you want to have the following SLIs:

- Error rate
- Response time

For the web request, we could consider any 2XX responses as a success, 5XX responses as an error, and everything else we aren't interested in (e.g., redirects). We may also consider ignoring specific endpoints such as health checks. We can apply the same logic to the response time SLI. We are generally only interested in the 2XX responses, so everything else is mapped to "not interested". This would be generated from the same request/response data for the SLI error rate.

## Service Level Objectives (SLOs)

A Service Level Objective (SLO) is a target that defines an SLI's acceptable performance level. SLOs are used to set expectations for how well a service should perform. SLOs are typically expressed as a percentage over a given period.

For example, if your website has an SLI of availability, you might set an SLO of 99.9% over a month. This means your website should be available 99.9% of the time in any given month.

What makes a good SLO?

SLOs must be:

- Succinct
- Comprehensible
- Within our control (i.e., does not rely on user-specific actions such as # of created orders)
- Time-bound
- Specific

Some examples of good SLOs:

- Less than 1% of failed requests in the last 30 days
- 99.9% Availability Per Month P95
- API Response time less than 500ms

### SLO Adherence

The adherence to an SLO is always expressed as a percentage and only ever accounts for SLI events that interest us, e.g., Passed/Failed. We can think about SLOs using the following formula:

```bash
SLO Adherence = 100 * (passed / (passed + failed))
```

If we have 132 events that we are interested in, 5 of which failed, then the calculation would be as follows:

```bash
Passed = 127 events
Failed = 5 events
SLO Adherence = 100 * (127 / (127 + 5))
SLO Adherence = 100 * (127 / 132)
SLO Adherence = 100 * 0.9621212121212121
SLO Adherence = 96.21% (rounded to 2dp)
```

Each SLO we publish should be available on a continually updated basis.

## Service Level Agreements (SLAs)

A Service Level Agreement (SLA) is a contract between a service provider and a customer that defines the level of service the provider will deliver. SLAs are used to establish a mutual understanding between the provider and the customer regarding the level of service that will be provided.

For example, a cloud provider might offer an SLA guaranteeing 99.9% availability for your cloud services. If you fail to meet this SLA, you may have to provide a service credit or refund to the customer.

In conclusion, SLIs, SLOs, and SLAs are all critical components of measuring the quality of your service. SLIs measure the performance, SLOs set the acceptable level of performance, and SLAs establish the level of service that will be delivered. You can ensure that your service meets your customers' needs by tracking and meeting these metrics.

**📣 Get the Weekly Newsletter Straight to Your Inbox! 📣**

Don't miss out on the latest updates! Subscribe to the [Observed! Newsletter](https://news.codewithstu.tv) now and stay up-to-date with the latest tips and tricks across AWS, Devops and Architecture. [Click here](https://news.codewithstu.tv) to subscribe and start receiving your weekly dose of tech news!
