---
title: "Observed No. 10 - Chaos Engineering on AWS"
description: The 10th edition of Observed explains how to run chaos engineering on AWS
date: 2023-03-20T01:00:00+00:00
toc: true
includeInSitemap: true
tags:
- devops
---

Welcome to the 10th edition of Observed! Your weekly newsletter, where I bring you a tip you can implement in your infrastructure across many categories like AWS, Terraform and General DevOps practices. This week's edition looks at the practice of Chaos Engineering.

<!-- more -->

## What is Chaos Engineering?

Chaos engineering is an innovative approach to testing and enhancing complex systems' reliability, resilience, and robustness. Born out of a need to ensure system stability in the face of unpredictable events, chaos engineering involves intentionally injecting faults, errors, and failures into a system to evaluate its behaviour and improve its ability to withstand such occurrences.

## Origins

The concept of chaos engineering originated at Netflix in the early 2010s. Netflix recognized the need to ensure the reliability of its services in the face of ever-increasing traffic and infrastructure complexity. They understood that traditional testing methods were insufficient for detecting and addressing potential issues in their intricate systems.

To tackle this challenge, Netflix engineers developed the Chaos Monkey, the first tool in what would become the Simian Army. The Chaos Monkey was designed to randomly disable instances (virtual machines) within Netflix's production environment, forcing the system to adapt and recover from these disruptions. This approach allowed engineers to observe the system's behaviour under stress and identify weaknesses that could lead to outages or performance degradation. As a result, Netflix continuously improved their infrastructure and services, enhancing user experience and customer satisfaction.

Over time, chaos engineering has evolved into a comprehensive discipline with principles and practices that extend beyond the Netflix ecosystem. Many organizations have adopted chaos engineering to test and improve their systems, ensuring they can withstand the unexpected and function smoothly in the face of adversity.

## Why should we adopt chaos engineering?

Adopting chaos engineering offers several benefits that can improve the overall reliability, resilience, and performance of your systems, including:

1. Proactive problem identification: Discover and address potential issues in your systems before they escalate into more significant problems or outages by intentionally injecting faults.
1. Improved system resilience: Regularly conducting chaos engineering experiments help build more resilient systems that can withstand and recover from disruptions, such as hardware failures, software bugs, or spikes in traffic.
1. Faster incident response: Develop better processes and practices by routinely dealing with simulated failures. Teams become more adept at identifying, diagnosing, and resolving issues, ultimately reducing the time it takes to recover from incidents.
1. Enhanced understanding of system behaviour: Gain insights into how your systems behave under various conditions. This understanding can help you optimize your infrastructure, fine-tune performance, and improve resource allocation, resulting in a more efficient and cost-effective system.

## How do we apply this in AWS?

AWS offers the Fault Injection Simulator (FIS) as a managed service to help you implement chaos engineering principles in your infrastructure. FIS allows you to inject faults into your AWS resources and observe their behaviour, enabling you to identify and address potential issues that could affect the resilience of your applications. AWS FIS contains:

1. Experiment Templates: These pre-configured templates define the fault injection actions and their target AWS resources. You can create custom templates or use the ones provided by AWS.
1. Experiments: An experiment is an instance of an experiment template that runs in your environment. It consists of one or more actions that inject faults into your AWS resources.
1. Actions: Actions are the specific fault injection tasks during an experiment. Examples include terminating instances, injecting latency, or throttling APIs.
1. Stop Conditions: These are criteria that, when met, automatically halt an experiment. They help ensure the safety of your environment by preventing experiments from causing excessive damage or disruption.

To use AWS FIS, we need to follow a few steps:

1. Define the scope of your experiment: Identify the AWS resources and services you want to target for fault injection. Consider the potential impact on your environment and ensure you have the necessary safeguards, such as backup systems and monitoring tools.
1. Create an experiment template: Using the FIS console or API, create an experiment template that specifies the actions you want to perform and the resources they will target. You can use AWS-provided templates or create custom ones based on your requirements.
1. Set up stop conditions: Define the criteria that will trigger the automatic termination of your experiment. For example, you can set a stop condition based on the duration of the experiment, the number of errors encountered, or a specific metric value.
1. Run the experiment: Launch the experiment using the FIS console or API. Monitor the progress of the experiment in real-time using AWS monitoring tools such as Amazon CloudWatch or AWS X-Ray.
1. Analyze the results: After completing the experiment, review the results to identify any weaknesses in your infrastructure or application. Use this information to develop and implement improvements that will enhance the resilience of your system.
1. Iterate and refine: Chaos engineering is an ongoing process. Continuously run experiments with different fault injection scenarios to ensure your system remains resilient under various conditions.

As technology evolves rapidly, our reliance on distributed systems and related services has grown significantly. Chaos engineering emerges as a crucial practice, helping organizations ensure that their systems can adapt and recover from unforeseen challenges. I believe chaos engineering represents a paradigm shift in how we approach complex systems' reliability and resilience.

By embracing a continuous learning and improvement culture, teams can better understand their systems, enhancing their ability to respond to incidents and deliver a consistent, high-quality user experience.

Furthermore, the importance of chaos engineering is magnified by the potential consequences of system failures. Downtime and performance issues can have severe financial, operational, and reputational impacts on organizations. Businesses can mitigate these risks by investing in chaos engineering and ultimately protecting their bottom line.

**📣 Get the Weekly Newsletter Straight to Your Inbox! 📣**

Don't miss out on the latest updates! Subscribe to the [Observed! Newsletter](https://news.codewithstu.tv) now and stay up-to-date with the latest tips and tricks across AWS, Devops and Architecture. [Click here](https://news.codewithstu.tv) to subscribe and start receiving your weekly dose of tech news!
