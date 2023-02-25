{
    "title": "Observed No. 1 - VPC Endpoint Policies",
    "description": "Welcome to the very first edition of Observed! Each week I bring you a tip you can implement in your infrastructure across many categories like AWS, Terraform and General DevOps practices. This week's edition looks at VPC endpoint policies in AWS.",
    "tags": ["devops", "observed"],
    "date": "2023-01-02T01:00:00+00:00",
    "categories": ["Development"]
}

Welcome to the very first edition of Observed! Each week I bring you a tip you can implement in your infrastructure across many categories like AWS, Terraform and General DevOps practices. This week's edition looks at VPC endpoint policies in AWS.

## What Are VPC Endpoints?

VPC endpoints are network interfaces you can create in your VPC to enable communication between your VPC and other AWS services without using an Internet gateway, VPN, or VPC peering. VPC Endpoints allow you to secure and control access to both AWS services and your services by:

Enabling access to AWS services from within your VPC without requiring a NAT gateway or VPN connection.

Enabling private connectivity between your VPC and other AWS services, such as Amazon S3, Amazon SQS, and Amazon SNS allows you to keep your data and communication within the AWS network, improving security and reducing data transfer costs.

Enabling access to AWS services from on-premises networks using AWS Direct Connect allows you to create a secure, private connection between your on-premises network and your VPC and then use VPC endpoints to access AWS services without going over the Internet.

By default, VPC endpoints allow full access to the resources they are created for, so we need to add policies to guard against unwanted actions. For example, if you create a VPC endpoint for SQS, then the endpoint will allow any SQS traffic over the network. This is where VPC endpoint policies come into play.

## VPC Endpoint Policies

One overlooked factor of VPC endpoints is the policies you can attach to them. VPC endpoint policies are an optional series of rules to control access to your VPC endpoint, which are attached to the endpoint itself rather than to an individual resource or service. Some common use cases for VPC endpoint policies include:

Allowing only specific AWS accounts to access your VPC endpoint ensuring that only authorised users can access it.

Allowing only specific IAM users or roles to access your VPC endpoint, which is useful for controlling access on a more granular level, allowing you to grant or deny access to individual IAM users or roles.

Allowing only specific VPCs to access your VPC endpoint. This can be useful for limiting access to your VPC endpoint to only specific VPCs, such as VPCs that belong to your organisation.

The policies themselves follow the standard IAM policy format, with the slight difference that you should only reference resources for the specific type of VPC endpoint. For example, don't try to apply SNS permissions on an SQS VPC endpoint.

Let’s take a look at an example VPC endpoint policy:

```json
{
  "Statement": [
    {
      "Sid": "PreventUnintendedResourcesAndPrincipals",
      "Principal": "*",
      "Action": "s3:*",
      "Effect": "Deny",
      "Resource": "*",
      "Condition": {
        "StringNotEquals": {
          "aws:ResourceOrgId": "o-XXXXXXX",
          "aws:PrincipalOrgId": "o-XXXXXXX"
        }
      }
    }
  ]
}
```

This policy prevents S3 usage outside the current organisation by using global conditional keys. When a principal makes a request to AWS, AWS gathers the request information into a request context. This request context is made available to you via the Condition element of the statement block in the policy document.

The action section of the policy can either be wildcarded like I have in the example above, or you can limit it to specific actions such as s3:PutObject. When I create my policies, I try to use a combination of Effect:Deny and NotAction. I believe that being more specific about what actions are allowed on a VPC Endpoint leads to a better security posture.

You can see which AWS services support VPC Endpoint Policies, and other valuable information, by using the describe-vpc-endpoint-services CLI command and checking for the field VpcEndpointPolicySupported in the response.

I believe VPC Endpoint Policies are critical for securing infrastructure in sensitive environments, which is why they are part of my Well Architected Toolkit, which I’ll release later this year. Have you implemented VPC Endpoint Policies? What use cases have you found for them? Let me know how you use them below or reach out to me on [Twitter](https://twitter.com/codewithstu).

**📣 Get the Weekly Newsletter Straight to Your Inbox!**

Don't miss out on the latest updates! Subscribe to the [Observed! Newsletter](https://news.codewithstu.tv) now and stay up-to-date with the latest tips and tricks across AWS, Devops and Architecture. [Click here](https://news.codewithstu.tv) to subscribe and start receiving your weekly dose of tech news!
