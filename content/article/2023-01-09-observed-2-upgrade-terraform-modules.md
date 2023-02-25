{
    "title": "Observed No. 2 - Upgrade Your Terraform Modules",
    "description": "Welcome to the second edition of Observed! your weekly newsletter, where I bring you a tip you can implement in your infrastructure across many categories like AWS, Terraform and General DevOps practices. This week's edition looks at a technique you can use to upgrade your Terraform modules.",
    "tags": ["devops", "observed"],
    "date": "2023-01-09T00:00:00+00:00",
    "categories": ["Development"],
    "toc": true
}

Welcome to the second edition of Observed! Your weekly newsletter, where I bring you a tip you can implement in your infrastructure across many categories like AWS, Terraform and General DevOps practices. This week's edition looks at a technique you can use to upgrade your Terraform modules.
<!-- more -->

In case you aren’t sure what a Terraform module is, they are a self-contained package of Terraform configurations managed as a group. Modules can be used to create reusable components, improve organization and structure, and improve the reusability and maintainability of your infrastructure.

Over the course of the last 4/5 years, I’ve noticed that there is always a trend within companies to build modules for specific things/use cases. Rarely do I see these teams account for the one thing they need to operate the infrastructure they make. That is monitoring/alerting.

Typically, a team would use an existing module or create their own and then create a load of resources for their monitoring/alerting needs. They would re-write this same terraform code over and over.

There are two different approaches that I take with my teams when adding monitoring/alerting:

Create a separate module which contains all of the monitoring/alerting

Embed the monitoring/alerting resources into the same module that you develop

The approach we take largely depends on the resources that we are creating the monitoring for. Where possible, we try not to reinvent the wheel because, as you may have experienced, Terraform can be a little bit tricky to get right sometimes.

I like to have this reusable component in place because I want the teams I work with to fall into the pit of success. That is, their experience will be better if they reuse the existing work and contribute to it where it makes sense. That said, I don’t believe there is a one-size-fits-all when it comes to any technology, so let’s quickly run down the benefits of each approach.

### Approach 1 - Separate module

Using a separate module allows for the most flexibility but also takes much of the duplication out of our code. This means that the same alerts, such as CPU %, can be reused in various scenarios.

However, this approach, whilst helpful, isn’t as optimal as I would personally like because it relies on two key things: discoverability and remembering to implement. Your company may have an excellent solution for discovering Terraform modules, but I’m yet to see a great implementation. I’d be very interested in speaking with you if you have a good implementation!

### Approach 2 - Embedded within the module

The second approach gives us the pit of success we are after because developers do not have to consider monitoring as the module embeds this with sensible defaults.

I generally find the most optimal solution to combine the approaches mentioned above. We typically build the monitoring/alerting into a separate module and then embed that into the module that creates the resources we are interested in. This gives us the best of both worlds!

### What should an alert look like?

Getting alerts right can be a little tricky, but there are some key steps that you can take to make sure your alerts can be actioned appropriately:

1. Actionable: It should clearly indicate what action should be taken in response to the alert.
1. Timely: It should be triggered as close to the event as possible so that the appropriate action can be taken in a timely manner.
1. Accurate: It should only be triggered when there is a real issue and not due to false positives.
1. Specific: It should provide enough information to allow someone to understand and address the issue without requiring further investigation.
1. Relevant: It should only be sent to people responsible for or able to take action on the issue.

With my teams, I always try to look at it from the perspective of “how would I want to deal with this at 2 am after a long week”. With this perspective, I find that my teams and I create a high standard of alerts. Couple this with the terraform module approach above, and you should take your Terraform to the next level!

Before I leave you to get on with your week, I want to let you know about something happening pretty soon. I’m launching a [DevOps-focused YouTube channel](https://youtube.com/@DevOpsWithStu?sub_confirmation=1)! On the 20th Jan 2023, DevOpsWithStu will go live with three videos. This channel will be the same as this newsletter, with helpful tutorials on AWS, Terraform and general DevOps topics. If you like the content in this newsletter, I’m sure you’ll enjoy the content going out on YouTube, so hit that subscribe button & notification bell to get alerts for when new content is available!

Side note: I also own the [CodeWithStu YouTube channel](https://youtube.com/@CodeWithStu?sub_confirmation=1), which is focused on the .NET stack.

**📣 Get the Weekly Newsletter Straight to Your Inbox!**

Don't miss out on the latest updates! Subscribe to the [Observed! Newsletter](https://news.codewithstu.tv) now and stay up-to-date with the latest tips and tricks across AWS, Devops and Architecture. [Click here](https://news.codewithstu.tv) to subscribe and start receiving your weekly dose of tech news!
