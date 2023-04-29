{
    "title": "Observed No. 11 - Saving Costs on AWS",
    "description": "The 11th edition of Observed shows you some simple strategies for saving costs on AWS",
    "tags": ["devops", "observed"],
    "date": "2023-04-24T01:00:00+00:00",
    "categories": ["Development"],
    "toc": true
}

Welcome to the 11th edition of Observed! The newsletter delivers a tip you can implement across many categories like AWS, Terraform and General DevOps practices in your infrastructure. This week's edition looks at AWS Cost Savings.

Every company seems to be cutting costs in one way or another. Let’s look at different ways you can visualize and reduce costs.

<!-- more -->

## AWS Cost Explorer

AWS Cost Explorer should be your first stop when analyzing costs. AWS Cost Explorer is a cost management tool that helps AWS users visualize, understand, and manage their AWS costs and usage. With Cost Explorer, users can analyze their AWS spending patterns and identify optimisation areas, helping reduce costs and increase efficiency.

Tip: Inside cost explorer, you can group by usage type, often showing you the cause of hidden costs.

## AWS Budgets

Closely related to Cost Explorer is Budgets. AWS Budgets is a cost management tool that helps users set custom cost and usage budgets for their AWS resources, services, and accounts. With AWS Budgets, users can monitor their AWS spending and receive alerts when their usage or costs exceed the defined thresholds, helping to avoid unexpected expenses and optimize costs. This is vital for knowing that there is a problem ahead of time.

## Utilizing Saving Plans & Reserved Instances

We can utilize Saving Plans and Reserved Instances to save costs on their AWS usage. Both options offer significant discounts compared to on-demand pricing but work slightly differently:

Saving Plans offer flexible pricing for AWS compute usage compared to on-demand pricing. Users can commit to a specific dollar-per-hour usage rate for a one- or three-year term and then receive discounted rates for any usage that meets or exceeds the commitment. This allows users to save costs on a wide range of AWS services, including EC2, Fargate, Lambda, and more.

Reserved Instances (RI) offer up to 75% savings compared to on-demand pricing for EC2 instances, RDS instances, and other services. Users can reserve capacity for a one or three-year term, and then receive discounted rates for the instances that match the reservation attributes. This allows users to save costs on predictable, steady-state workloads that run consistently over time.

Depending on your workload and how your workload scales will ultimately be the driving force behind the decision to use either saving plans or reserved instances.

## Effectively use ECS Capacity Providers

ECS Capacity Providers allow users to define and manage groups of EC2 instances that can be used to run ECS tasks, with automatic scaling based on resource utilization and availability.

Using Spot Instances as a scaling mechanism in ECS can further optimize costs and improve workload efficiency. Spot Instances are unused EC2 instances that can be rented at a significant discount compared to on-demand pricing. By using Spot Instances with ECS Capacity Providers, we can take advantage of these discounts while maintaining the desired availability and performance level.

ECS can automatically manage the allocation of Spot Instances based on resource availability, helping to maximize cost savings while minimizing disruption to the workload.

## Switch to Graviton-based compute instances

In both EC2 and Lambda, we can switch over to Graviton based compute instances. They offer several benefits, including improved performance, cost efficiency, and reduced carbon footprint. Graviton is a custom-designed ARM-based processor optimized for AWS workloads, providing a high-performance, energy-efficient alternative to traditional x86-based instances.

Your applications must be compatible with an ARM-based processor to take advantage of this, but you could receive up to 40%* savings depending on your workload.

*From publically available sources

## Centralising Egress

One lesser-known tip is to centralise your egress. This involves creating a shared VPC that contains your NAT gateways and VPC Endpoints. These are two common costs in larger infrastructures that have many VPCs. There is a threshold that you’ll need to breach before this approach delivers you cost savings, which is a combination of the following:

1. How many NAT gateways do you have?
1. How many VPC endpoints do you use in each VPC?

You can read more about this approach [here]().

## Reduce Log Ingestion

The last tip concerns log ingestion. If you’re using AWS Cloudwatch to receive your logs, you might be paying too much for log ingestion. I’ve seen two common mistakes that lead to an increased cost:

1. Duplicated logging. Teams may log directly to the Cloudwatch API, not realising that you already have ECS/Lambda capturing your logs.
1. Logging too much: Teams may accidentally leave the log level set to verbose after diagnosing an issue, resulting in you ingesting much more than is necessary.

Both of these could easily increase your costs by 100s of dollars per month (if not more when talking about multiple environments), but it’s often hidden by other costs such as lack of EC2 reserved instances.

Also, set a retention policy or backup your logs to S3 storage for even more savings.

This only begins to scratch the surface of AWS cost savings. In fact, entire companies are dedicated to saving people money on AWS. Let me know your cost-saving tips below!

**📣 Get the Weekly Newsletter Straight to Your Inbox! 📣**

Don't miss out on the latest updates! Subscribe to the [Observed! Newsletter](https://news.codewithstu.tv) now and stay up-to-date with the latest tips and tricks across AWS, Devops and Architecture. [Click here](https://news.codewithstu.tv) to subscribe and start receiving your weekly dose of tech news!
