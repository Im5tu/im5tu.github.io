---
title: Bulkhead
faq:
- question: How does the Bulkhead Pattern improve system resilience?
  answer: The Bulkhead Pattern enhances system resilience by isolating different parts of a system into separate areas or 'bulkheads'. This isolation ensures that if one part of the system fails or becomes overloaded, it doesn't cause a cascade of failures in other parts. By compartmentalizing the system, the Bulkhead Pattern helps maintain overall system stability and prevents localized issues from escalating into major outages.

- question: Can the Bulkhead Pattern be used in monolithic applications?
  answer: Yes, the Bulkhead Pattern can be applied in monolithic applications. Even though it is more commonly associated with microservices and distributed systems, the principle of isolating different components or functionalities can also be beneficial in a monolithic architecture. In such applications, it can help segregate different functional areas, manage resource allocation effectively, and prevent issues in one area from impacting the entire application.

- question: How does the Bulkhead Pattern differ from the Circuit Breaker Pattern?
  answer: The Bulkhead Pattern and the Circuit Breaker Pattern are both used to build resilient systems, but they address different aspects of resilience. The Bulkhead Pattern isolates parts of a system to prevent failures from affecting the entire system. In contrast, the Circuit Breaker Pattern is designed to prevent a system from repeatedly trying to execute an operation likely to fail. It 'trips' like an electrical circuit breaker to stop further attempts and allow the system to recover. While the Bulkhead Pattern is about compartmentalization, the Circuit Breaker Pattern is about failure detection and recovery.

- question: How does the Bulkhead Pattern manage resource allocation?
  answer: The Bulkhead Pattern manages resource allocation by dividing the system into isolated sections, each with its own set of resources. This division ensures that a high demand or failure in one section doesn't deplete resources for other system parts. It's particularly useful in scenarios where resources are limited, such as in cloud environments or containerized services, as it helps maintain a balanced distribution of resources and prevents one part of the system from monopolizing them.
---

The Bulkhead pattern in cloud computing is inspired by ship design. It isolates elements of an application into compartments, ensuring that if one fails, the others remain unaffected. This pattern enhances system resilience and prevents failures from cascading through the application.

<!--more-->

The bulkhead pattern takes its name from the naval engineering practice of dividing a ship’s hull into multiple compartments. If one compartment is damaged, only the damaged section fills with water, preventing the entire ship from sinking. This pattern is used in distributed systems to prevent resource exhaustion and cascading failures, ensuring that a failure in one part of the system does not bring down the entire solution. This is achieved by isolating resources and services so that if one component fails, others remain unaffected and continue to function.

Drawing parallels with a ship compartmentalized into smaller sections, a distributed system with multiple components is also compartmentalized. A malfunction in one component shouldn’t sink the entire ship or, in this instance, cause the system to collapse. The bulkhead design pattern allows us to segment resources to ensure that a malfunction in one system component doesn’t upset the others.

## How to implement the bulkhead design pattern

Implementing the bulkhead pattern involves partitioning service instances based on consumer load and availability requirements. This guarantees that an overloaded instance doesn’t compromise the multiple services simultaneously. One way to achieve this is by limiting the number of concurrent calls to a component. This helps prevent resource depletion that can cause performance issues and ensures that specific services have the necessary resources.

{{<image "example-policy.png" "Example Bulkhead Workflow">}}

Consider a typical web application that relies on multiple services, such as product and rating services. If the rating service experiences a heavy load and becomes unresponsive, all the requests to the product service that depend on the rating service could be blocked, resulting in a cascading failure. Utilizing the bulkhead pattern can prevent this scenario. The application can be designed so that even if the rating service becomes unresponsive, the product service can continue to function by using a default or cached rating.

{{<image "webapp-flow.png" "Example of a web app flow">}}

Besides limiting concurrent calls, effective resource allocation for each segregated pool is also critical. This can be achieved using tools such as Polly, which can help prevent all service resources from being blocked, allowing the service to remain functional even during a failure. Managing the client’s connection pool efficiently is a key aspect of this process, as resource exhaustion affects services significantly.

## When to use the bulkhead pattern

The bulkhead pattern's main responsibility is to ensure high availability in distributed systems by ensuring that multiple concurrent requests from multiple clients do not end up in service failure. In such systems, the interconnected nature of components means that a failure in one service can rapidly propagate to other services, jeopardizing the entire system's stability. By implementing the bulkhead pattern, distinct sections of the system are isolated. This isolation acts as a barrier.

In environments where performance predictability is crucial, the bulkhead pattern is pivotal. Segregating system components allows for more controlled and predictable performance metrics.  It facilitates easier monitoring and management of each component's performance, leading to quicker issue identification and resolution.

## When not to use the bulkhead pattern

Although the bulkhead pattern is an effective barrier against cascading failures, it may not always be the optimal solution. Implementing the bulkhead pattern can add unnecessary complexity without providing significant advantages for simple applications or scenarios where resource isolation is not a priority.

The bulkhead pattern can be deemed excessive when its offered degree of isolation and resource allocation surpasses the necessary level or doesn’t contribute value in light of the application’s specific needs. For instance, implementing the bulkhead pattern would not offer significant advantages if an application only has a single service. The resources required to implement and manage the pattern would outweigh the benefits.

## Bulkhead Best Practises

Adhering to best practices while implementing the bulkhead pattern is key to optimal performance and reliability. One such practice is to allocate resources properly. This involves:

- Identifying critical resources
- Segregating them into distinct pools or groups
- Each isolated pool should have its own resources to prevent performance issues and ensure that specific components have the necessary resources.

Another best practice is to monitor each bulkhead's health and performance continuously. This allows for adjustments to performance and resource usage to uphold optimal operations. Monitoring can be done using various tools and should include key metrics such as queue depth, thread size, and connection pool usage.

The bulkhead pattern can be integrated with other resilience patterns to boost fault tolerance and system stability. This involves organizing resources into isolated pools for specific components, which helps to ensure that a failure in one component does not compromise the availability or performance of others. This can be particularly useful in scenarios involving multiple consumers or services, as it allows you to isolate critical consumers and prevent cascading failures.

## Combining Bulkhead Pattern with Other Resilient Design Patterns

The bulkhead pattern can be integrated with other resilient design patterns to heighten fault tolerance and system stability. These include the Circuit Breaker pattern, Retry strategies, and Fallback strategies. By integrating these patterns with the bulkhead pattern, you can create a more robust and resilient system that can withstand various failures and continue functioning efficiently.

Integrating the Circuit Breaker pattern with the Bulkhead pattern bolsters system resilience by warding off cascading failures and limiting the impact of a failing service, resulting in improved fault tolerance, availability, and scalability. The Circuit Breaker pattern stops the request and response process when a service is not functioning properly, thus preventing further resource exhaustion and system instability.

Integrating Retry strategies with the Bulkhead pattern boosts fault tolerance by providing superior fault handling and improving application resilience and availability in the face of transient failures. These strategies involve implementing retry logic within bulkheads to handle transient failures and preserve functionality. They also include the exponential backoff strategy, which progressively increases the delay between attempts, mitigating system overload and facilitating recovery from temporary outages.

{{<image "bulkhead-with-other-pattens.png" "Example Bulkhead With Other Patterns">}}

## Real-World Examples and Use Cases

The Bulkhead pattern is a fundamental principle in building resilient systems, widely applied in various domains, from cloud computing to structural engineering. Its primary objective is to isolate and prevent failures from cascading through the system. Here are some notable applications:

Isolated Service Instances: The bulkhead pattern is crucial in cloud-based applications, especially those following a microservices architecture. Services are isolated in separate runtime environments, such as containers or virtual machines. This isolation ensures that issues in one service, like memory leaks or CPU hogging, do not impact others.

Resource Allocation and Limits: Each service instance is allocated specific CPU and memory resources. By setting these limits, the bulkhead pattern prevents a single service from consuming all available resources, which could lead to system-wide failures.

Enhanced System Stability: In platforms like Kubernetes, the bulkhead pattern is implemented through pod and container configurations. This setup enhances overall system stability by ensuring that the failure or overload of one microservice doesn't compromise the entire application's functionality.
