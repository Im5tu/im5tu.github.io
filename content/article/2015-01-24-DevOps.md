{
   "categories": [ "Development" ],
   "date": "2015-01-24T18:36:29Z",
   "description": "I have recently been getting to grips with the build and deployment features of both Teamcity and Octopus Deploy. This has been making me think about the industry buzz word DevOps and exactly what that means.",
   "tags": [ "dotnet", "devops" ],
   "title": "DevOps"
}

As part of my role as a .Net Developer, I have recently been getting to grips with the build and deployment features of both Teamcity and Octopus Deploy. This has been making me think about the industry buzz word "DevOps" and exactly what that means.<!--more-->

Broadly speaking, I think DevOps can be summarized along the lines of:

> DevOps is the combination of development and operational practises which allow the building, evolving and operating of rapidly-changing resilient systems.

I have seen a fair few videos of people trying to explain DevOps as the combination of development and operations teams, with a focus on communication, integration and collaboration. While I agree with the fact its the combination of development and operations; it's the practises that should be combined, not the teams. Each team has a specific set of skills and tools that should be shared in order to enhance the deployments of a product. Combining the teams sounds a lot like budget cuts. You can't replace a competent sys-admin with a developer and vise-versa.

DevOps works! There is no question of that in my mind. [PuppetLabs](http://puppetlabs.com/blog/what-is-a-devops-engineer) suggest that organisations adopting DevOps practises deploy up to 30 times more frequently, with 50% fewer deployment failures. It's quiet easy to see why if you consider a DevOps team doing the following:

- Automation of builds
- Automation of testing
- Automation of deployments
- Version controlled scripts for the above

It all revolves around taken the human element of out deployments and being able to map the changes to each deployment across time. For resilient operations we need to be consistent. That is why teams invest heavily in tools like Teamcity and Jenkins. They show you who made what change to which project and when. But perhaps more importantly, they make things easier to get right.

If we have a good audit trail provided to us by the tools above and we version control any remaining scripts such as deployment; we have a resilient system that we can rely on to build, test and deploy our solutions. So that is what DevOps is to me, the combination of development and operational practises which allow the building, evolving and operating of rapidly-changing resilient systems.