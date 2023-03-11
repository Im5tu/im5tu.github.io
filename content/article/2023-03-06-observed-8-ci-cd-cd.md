{
    "title": "Observed No. 8 - Continuous Integration vs Continuous Delivery vs Continuous Deployment",
    "description": "The 8th edition of Observed explains the differences between Continuous Integration, Continuous Delivery, and Continuous Deployment. These practices lead to safer and smoother releases, reduce integration conflicts, save time, and improve software quality",
    "tags": ["devops", "observed"],
    "date": "2023-03-06T00:00:00+00:00",
    "categories": ["Development"],
    "toc": true
}

Welcome to the 8th edition of Observed! Your weekly newsletter, where I bring you a tip you can implement in your infrastructure across many categories like AWS, Terraform and General DevOps practices. This week's edition looks at the differences between continuous integration, continuous delivery and continuous deployment.

<!-- more -->

## Continuous Integration

Continuous Integration (CI) is the act of integrating code changes into a shared repository, and automated tests verify each integration. The aim is to catch and fix errors early in the development cycle rather than waiting for a significant release.

With CI, developers frequently work on small, incremental changes and commit them to the main codebase. When developers push their code changes to the repository, the CI system automatically builds the code. It runs automated tests to ensure the changes don't break anything in the codebase. If the tests fail, the system alerts the developer, who can quickly fix the issue before it causes any problems.

CI helps to reduce the risk of integration conflicts and reduces the time required to test and integrate new code changes. Ultimately, CI leads to a more stable and reliable software development process.

## Continuous Delivery

Continuous delivery is a natural extension of continuous integration where each change gets released to a staging or test environment in a reliable and automated way. With CD, your software is always in a releasable state, and the decision to release becomes based on business needs rather than technical constraints.

Continuous delivery doesn't necessarily mean that each change makes its way to production, simple that each change could make it to production.

## Continuous Deployment

Continuous deployment is very similar to, and often confused with, continuous delivery. Continuous deployment releases code changes to production after they pass automated testing. With continuous deployment, developers can deploy new code changes to production without manual intervention.

Continuous deployment relies heavily on automation and infrastructure stability. This practice helps to improve the speed of software delivery, reduce the risk of human error, and ensure that new features and updates are available to users as soon as possible. It helps reduce the time required to release new features and updates, as no manual intervention is necessary to deploy changes to production.

It is important to note that continuous deployment requires a high level of trust in the automated testing process and infrastructure stability. Any issues with the automated testing or deployment process could lead to downtime or other issues in production.

## Looking at the benefits of CI/CD/CD

By understanding the differences between CI/CD/CD, you can implement the practices to improve your software development process and meet your business requirements. Some of the key benefits include:

Smoother & More Frequent Releases: Automating with a continuous deployment pipeline means releases can happen with the push of a button rather than taking days to plan for and execute. Customers also stay up-to-date with the latest version of the software.

Safer Releases: Since automated processes like continuous delivery and deployment work in smaller change batches, issues in each release are easier to remediate than the code changes pushed out with infrequent, mammoth-sized manual releases. Smaller releases mean that we also reduce the risk of each change.

Less Manual Work: Overall, less time is spent releasing, which means that more time can be spent increasing the quality of your software.

**📣 Get the Weekly Newsletter Straight to Your Inbox!**

Don't miss out on the latest updates! Subscribe to the [Observed! Newsletter](https://news.codewithstu.tv) now and stay up-to-date with the latest tips and tricks across AWS, Devops and Architecture. [Click here](https://news.codewithstu.tv) to subscribe and start receiving your weekly dose of tech news!
