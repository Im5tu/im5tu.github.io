{
    "title": "Architecture Pathway Introduction",
    "description": "A glance at some of the resources that helped me learn software architecture.",
    "tags": ["architecture"],
    "date": "2020-07-15T20:56:00+01:00",
    "categories": ["architecture", "Development"],
    "toc": true
}

Over the past year or so, I've had the pleasure of mentoring people on their software development journeys. Some of those personnel have expressed a desire to pursue the software architect route. As it's something that I often refer to, I've decided to post a mini-pathway to help guide on some of the basics.
<!--more-->
The majority of my learnings have come from a mixture of talented people, mistakes and good old fashion practise. The more that you practise designing systems, the better you will become, just like any other skill. I've included a brief summary from the pages linked so that you can glance at the content as you read along - all credits to their original authors.

Happy Reading!

## The 10 Cloud Architecture Principals

### [Design for self healing](https://docs.microsoft.com/en-us/azure/architecture/guide/design-principles/self-healing)

In a distributed system, failures happen. Hardware can fail. The network can have transient failures. Rarely, an entire service or region may experience a disruption, but even those must be planned for. Therefore, design an application to be self healing when failures occur.

### [Make all things redundant](https://docs.microsoft.com/en-us/azure/architecture/guide/design-principles/redundancy)

A resilient application routes around failure. Identify the critical paths in your application. Is there redundancy at each point in the path? If a subsystem fails, will the application fail over to something else?

### [Mimimize coordination](https://docs.microsoft.com/en-us/azure/architecture/guide/design-principles/minimize-coordination)

Most cloud applications consist of multiple application services — web front ends, databases, business processes, reporting and analysis, and so on. To achieve scalability and reliability, each of those services should run on multiple instances. Coordination between instances limits the benefits of horizontal scale and creates bottlenecks.

### [Design to scale out](https://docs.microsoft.com/en-us/azure/architecture/guide/design-principles/scale-out)

A primary advantage of the cloud is elastic scaling — the ability to use as much capacity as you need, scaling out as load increases, and scaling in when the extra capacity is not needed. Design your application so that it can scale horizontally, adding or removing new instances as demand requires.

### [Partition around limits](https://docs.microsoft.com/en-us/azure/architecture/guide/design-principles/partition)

In the cloud, all services have limits in their ability to scale up. Limits include number of cores, database size, query throughput, and network throughput. If your system grows sufficiently large, you may hit one or more of these limits. Use partitioning to work around these limits.

### [Design for operations](https://docs.microsoft.com/en-us/azure/architecture/guide/design-principles/design-for-operations)

The cloud has dramatically changed the role of the operations team. They are no longer responsible for managing the hardware and infrastructure that hosts the application. That said, operations is still a critical part of running a successful cloud application. Involve the operations team in design and planning, to ensure the application gives them the data and insight that need to be successful.

### [Use managed services](https://docs.microsoft.com/en-us/azure/architecture/guide/design-principles/managed-services )

IaaS is like having a box of parts. You can build anything, but you have to assemble it yourself. PaaS options are easier to configure and administer. You don't need to provision VMs, set up VNets, manage patches and updates, and all of the other overhead associated with running software on a VM.

### [Use the best data store for the job](https://docs.microsoft.com/en-us/azure/architecture/guide/design-principles/use-the-best-data-store)

In any large solution, it's likely that a single data store technology won't fill all your needs. Alternatives to relational databases include key/value stores, document databases, search engine databases, time series databases, column family databases, and graph databases. Each has pros and cons, and different types of data fit more naturally into one or another.

### [Design for evolution](https://docs.microsoft.com/en-us/azure/architecture/guide/design-principles/design-for-evolution)

All successful applications change over time, whether to fix bugs, add new features, bring in new technologies, or make existing systems more scalable and resilient. If all the parts of an application are tightly coupled, it becomes very hard to introduce changes into the system. A change in one part of the application may break another part, or cause changes to ripple through the entire codebase. When services are designed to evolve, teams can innovate and continuously deliver new features.

### [Build for the needs of the business](https://docs.microsoft.com/en-us/azure/architecture/guide/design-principles/build-for-business)

This design principle may seem obvious, but it's crucial to keep in mind when designing a solution. Do you anticipate millions of users, or a few thousand? Is a one-hour application outage acceptable? Do you expect large bursts in traffic or a predictable workload? Ultimately, every design decision must be justified by a business requirement.

## Different Architecture Styles

### [Big Compute](https://docs.microsoft.com/en-us/azure/architecture/guide/architecture-styles/big-compute)

The term big compute describes large-scale workloads that require a large number of cores, often numbering in the hundreds or thousands. Scenarios include image rendering, fluid dynamics, financial risk modeling, oil exploration, drug design, and engineering stress analysis, among others.

### [Big Data](https://docs.microsoft.com/en-us/azure/architecture/guide/architecture-styles/big-data)

A big data architecture is designed to handle the ingestion, processing, and analysis of data that is too large or complex for traditional database systems. Big data solutions typically involve one or more of the following types of workload:

- Batch processing of big data sources at rest.
- Real-time processing of big data in motion.
- Interactive exploration of big data.
- Predictive analytics and machine learning.

### [Event Driven](https://docs.microsoft.com/en-us/azure/architecture/guide/architecture-styles/event-driven)

An event-driven architecture consists of event producers that generate a stream of events, and event consumers that listen for the events. Events are delivered in near real time, so consumers can respond immediately to events as they occur

### [Microservices](https://docs.microsoft.com/en-us/azure/architecture/guide/architecture-styles/microservices)

A microservices architecture consists of a collection of small, autonomous services. Each service is self-contained and should implement a single business capability.

### [N-Tier Application](https://docs.microsoft.com/en-us/azure/architecture/guide/architecture-styles/n-tier)

An N-tier architecture divides an application into logical layers and physical tiers. Layers are a way to separate responsibilities and manage dependencies. Each layer has a specific responsibility. A higher layer can use services in a lower layer, but not the other way around.

### [Web-queue-worker](https://docs.microsoft.com/en-us/azure/architecture/guide/architecture-styles/web-queue-worker)

The core components of this architecture are a web front end that serves client requests, and a worker that performs resource-intensive tasks, long-running workflows, or batch jobs. The web front end communicates with the worker through a message queue.

## Common Design Patterns

### [Anti-corruption layer](https://docs.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer)

Implement a façade or adapter layer between different subsystems that don't share the same semantics. This layer translates requests that one subsystem makes to the other subsystem. Use this pattern to ensure that an application's design is not limited by dependencies on outside subsystems.

### [Bulkhead](https://docs.microsoft.com/en-us/azure/architecture/patterns/bulkhead)

The Bulkhead pattern is a type of application design that is tolerant of failure. In a bulkhead architecture, elements of an application are isolated into pools so that if one fails, the others will continue to function. It's named after the sectioned partitions (bulkheads) of a ship's hull.

### [Cache-aside](https://docs.microsoft.com/en-us/azure/architecture/patterns/cache-aside)

Load data on demand into a cache from a data store. This can improve performance and also helps to maintain consistency between data held in the cache and data in the underlying data store.

### [Circuit Breaker](https://docs.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker)

In a distributed environment, calls to remote resources and services can fail due to transient faults, such as slow network connections, timeouts, or the resources being over-committed or temporarily unavailable. A circuit breaker handles faults that might take a variable amount of time to recover from, when connecting to a remote service or resource.

### [Command & Query Responsibility Segregation](https://docs.microsoft.com/en-us/azure/architecture/patterns/cqrs)

The Command and Query Responsibility Segregation (CQRS) pattern separates read and update operations for a data store. Implementing CQRS in your application can maximize its performance, scalability, and security. The flexibility created by migrating to CQRS allows a system to better evolve over time and prevents update commands from causing merge conflicts at the domain level.

### [Compensating Transaction](https://docs.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction)

Undo the work performed by a series of steps, which together define an eventually consistent operation, if one or more of the steps fail. Operations that follow the eventual consistency model are commonly found in cloud-hosted applications that implement complex business processes and workflows.

### [Competing Consumers](https://docs.microsoft.com/en-us/azure/architecture/patterns/competing-consumers)

Enable multiple concurrent consumers to process messages received on the same messaging channel. This enables a system to process multiple messages concurrently to optimize throughput, to improve scalability and availability, and to balance the workload.

### [Event Sourcing](https://docs.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)

Instead of storing just the current state of the data in a domain, use an append-only store to record the full series of actions taken on that data. The store acts as the system of record and can be used to materialize the domain objects. This can simplify tasks in complex domains, by avoiding the need to synchronize the data model and the business domain, while improving performance, scalability, and responsiveness. It can also provide consistency for transactional data, and maintain full audit trails and history that can enable compensating actions.

### [Gatekeeper](https://docs.microsoft.com/en-us/azure/architecture/patterns/gatekeeper)

Protect applications and services by using a dedicated host instance that acts as a broker between clients and the application or service, validates and sanitizes requests, and passes requests and data between them. This can provide an additional layer of security, and limit the attack surface of the system.

### [Leader Election](https://docs.microsoft.com/en-us/azure/architecture/patterns/leader-election)

Coordinate the actions performed by a collection of collaborating instances in a distributed application by electing one instance as the leader that assumes responsibility for managing the others. This can help to ensure that instances don't conflict with each other, cause contention for shared resources, or inadvertently interfere with the work that other instances are performing.

### [Queue-Based Load Leveling](https://docs.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling)

Use a queue that acts as a buffer between a task and a service it invokes in order to smooth intermittent heavy loads that can cause the service to fail or the task to time out. This can help to minimize the impact of peaks in demand on availability and responsiveness for both the task and the service.

### [Retry](https://docs.microsoft.com/en-us/azure/architecture/patterns/retry)

Enable an application to handle transient failures when it tries to connect to a service or network resource, by transparently retrying a failed operation. This can improve the stability of the application.

### [Sharding](https://docs.microsoft.com/en-us/azure/architecture/patterns/sharding)

Divide a data store into a set of horizontal partitions or shards. This can improve scalability when storing and accessing large volumes of data.

### [Sidecar](https://docs.microsoft.com/en-us/azure/architecture/patterns/sidecar)

Deploy components of an application into a separate process or container to provide isolation and encapsulation. This pattern can also enable applications to be composed of heterogeneous components and technologies.

### [Strangler](https://docs.microsoft.com/en-us/azure/architecture/patterns/strangler)

Incrementally migrate a legacy system by gradually replacing specific pieces of functionality with new applications and services. As features from the legacy system are replaced, the new system eventually replaces all of the old system's features, strangling the old system and allowing you to decommission it.

### [Throttling](https://docs.microsoft.com/en-us/azure/architecture/patterns/throttling)

Control the consumption of resources used by an instance of an application, an individual tenant, or an entire service. This can allow the system to continue to function and meet service level agreements, even when an increase in demand places an extreme load on resources.

## Distributed Systems Theory

### [Understanding the 8 fallacies of Distributed Systems](https://www.simpleorientedarchitecture.com/8-fallacies-of-distributed-systems/)

More than 20 years ago Peter Deutsch and James Gosling defined the 8 fallacies of distributed computing. These are false assumptions that many developers make about distributed systems. These are usually proven wrong in the long run, leading to hard to fix bugs.

### [CAP Theorem](https://robertgreiner.com/cap-theorem-revisited/)

The CAP Theorem states that, in a distributed system (a collection of interconnected nodes that share data.), you can only have two out of the following three guarantees across a write/read pair: Consistency, Availability, and Partition Tolerance - one of them must be sacrificed.

### [How Sharding Works](https://medium.com/@jeeyoungk/how-sharding-works-b4dec46b3f6)

Your application suddenly becomes popular. Traffic and data is starting to grow, and your database gets more overloaded every day. People on the internet tell you to scale your database by sharding, but you don’t really know what it means. You start doing some research, and run into this post.

### [Consistent Hashing](http://www.tom-e-white.com/2007/11/consistent-hashing.html)

The need for consistent hashing arose from limitations experienced while running collections of caching machines - web caches, for example. If you have a collection of n cache machines then a common way of load balancing across them is to put object o in cache machine number hash(o) mod n.

## Other Interesting Reads

- [Workload Isolation Using Shuffle-Sharding](https://aws.amazon.com/builders-library/workload-isolation-using-shuffle-sharding/)
- [Avoiding Insurmountable Queue Backlogs](https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/)
- [Implementing Health Checks](https://aws.amazon.com/builders-library/implementing-health-checks/)
- [Monoliths and Microservices](https://medium.com/@SkyscannerEng/monoliths-and-microservices-8c65708c3dbf)
- [Fault Tolerance in a High Volume, Distributed System](https://netflixtechblog.com/fault-tolerance-in-a-high-volume-distributed-system-91ab4faae74a)
- [Tips for High Availability](https://medium.com/@NetflixTechBlog/tips-for-high-availability-be0472f2599c)
- [Globalizing Player Accounts while Maintaining Availability](https://technology.riotgames.com/news/globalizing-player-accounts)
- [Microservice Architecture at Medium](https://medium.engineering/microservice-architecture-at-medium-9c33805eb74f)
- [Automate and abstract: Lessons from Facebook on engineering for scale](https://architecht.io/lessons-from-facebook-on-engineering-for-scale-f5716f0afc7a)
