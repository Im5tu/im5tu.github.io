{
    "title": "Observed No. 7 - Well Architected",
    "description": "The Well-Architected Framework consists of six pillars to build and operate reliable, secure, efficient, and cost-effective systems on AWS. The framework offers best practices for each pillar.",
    "tags": ["devops", "observed"],
    "date": "2023-02-27T00:00:00+00:00",
    "categories": ["Development"],
    "toc": true
}

Welcome to the seventh edition of Observed! Your weekly newsletter, where I bring you a tip you can implement in your infrastructure across many categories like AWS, Terraform and General DevOps practices. This week's edition looks at the Well-Architected framework.

<!-- more -->

## What is the Well-Architected Framework?

The Well-Architected Framework is a set of best practices and guidelines designed to help businesses build and operate reliable, secure, efficient, and cost-effective systems in the cloud. AWS conceived the framework to help customers evaluate their architecture and adopt best practices to improve their systems' performance, security, and scalability.

The framework has six pillars, each focusing on a specific aspect of running on AWS. These are:

1. Operational Excellence Pillar
1. Security Pillar
1. Reliability Pillar
1. Performance Efficiency Pillar
1. Cost Optimization Pillar
1. Sustainability Pillar

## Operational Excellence Pillar

The operational excellence pillar focuses on improving operating procedures and processes, monitoring systems, and continuously improving the overall operational capabilities of the organization. It provides best practices for managing change, responding to events and defining procedures to ensure consistent, repeatable processes are in place.

## Security Pillar

The security pillar provides best practices for identifying and managing security risks, such as implementing strong access controls and enforcing least privilege principles. It also emphasizes the importance of automation of security tasks, continuous monitoring for security threats and maintaining compliance with security standards and regulations.

## Reliability Pillar

The reliability pillar provides best practices for designing resilient systems, such as using distributed systems and redundancy to ensure high availability and implementing monitoring and alerting to quickly detect and respond to failures. It also emphasizes the importance of testing and validating system resilience to identify and address potential weaknesses before they impact users.

## Performance Efficiency Pillar

The performance efficiency pillar provides best practices for selecting suitable instance types and sizes, using automation to scale resources up and down to meet demand, and optimizing application performance by leveraging caching, database performance tuning, and content delivery networks. It also emphasizes the importance of monitoring performance and usage metrics to identify areas for optimization and improvement.

## Cost Optimization Pillar

The cost optimization pillar provides best practices for selecting suitable pricing models, monitoring and analyzing usage data to identify opportunities for cost optimization, and implementing mechanisms for cost control, such as automated resource scheduling and usage quotas. It also emphasizes the importance of designing architectures that can scale cost-effectively by leveraging cloud services that offer pay-as-you-go pricing and dynamic resource allocation. By following the guidance of this pillar, organizations can optimize their cloud spending, reduce unnecessary costs, and maximize the value they get from their cloud investments.

## Sustainability Pillar

The sustainability pillar is the latest addition to the framework and focuses on designing and operating sustainable systems in the cloud. AWS introduced this pillar to minimize IT systems' environmental impact whilst reducing costs and downstream impacts.

## Are you well-architected?

You can assess your adherence to the AWS well-architected framework in two ways. The first option is to use an external consultancy company, which AWS can recommend partners for you. Typically these engagements are free to carry out the review but often come with an expectation that the consultancy would carry out some remediation work for you as a paid service. Some AWS partners may offer AWS credits for conducting the review.

The second option is to run the assessment yourself in the AWS console, which is entirely free, using the AWS Well-Architected Tool. They have three different lenses at the time of writing:

AWS Well-Architected Framework: The AWS Well-Architected Framework Lens provides foundational questions for you to consider for all your cloud architectures.

Serverless Lens: The AWS Serverless Application Lens provides additional questions for you to consider for your serverless applications.

SaaS Lens: The AWS SaaS Lens provides additional questions for you to consider for your Software-as-a-Service (SaaS) applications.

AWS recommends enabling Trusted Advisor when you start the tool if you have access, as this will provide more context to your questions. The questions are relatively straightforward, but I'd recommend talking with your AWS account manager to see if they can provide some training for you and help you walk through the first one.

You can run through the well-architected framework question in the AWS console using the AWS Well-Architected Tool: <https://eu-west-1.console.aws.amazon.com/wellarchitected/home>

Learn more about the Well-Architected framework here: <https://aws.amazon.com/architecture/well-architected>

**📣 Get the Weekly Newsletter Straight to Your Inbox!**

Don't miss out on the latest updates! Subscribe to the [Observed! Newsletter](https://news.codewithstu.tv) now and stay up-to-date with the latest tips and tricks across AWS, Devops and Architecture. [Click here](https://news.codewithstu.tv) to subscribe and start receiving your weekly dose of tech news!
