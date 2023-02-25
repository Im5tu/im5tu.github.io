{
    "title": "Building a custom build agent image with Docker and Azure DevOps pipelines",
    "description": "Learn how to use a custom dockerfile as the bases for a customised Azure DevOps build agent.",
    "tags": ["devops", "vsts", "azure"],
    "date": "2018-12-24T14:00:00+00:00",
    "categories": ["Development"],
    "toc": true
}

In this article, we will learn how to use a custom dockerfile as the bases for a customised Azure DevOps build agent. There are many reasons why you might want to do this, including running custom tooling that takes a while to setup or tooling that isn't supported yet.

<!--more-->

### TL;DR

You need to this `Dockerfile` snippet:

```dockerfile
FROM microsoft/vsts-agent:ubuntu-16.04

# Install your stuff here

CMD /bin/sh
```

And this `azure-pipelines.yml` snippet:

```yml
resources:
    containers:
    - container: octodns
        image: im5tu/octodns:latest

container: octodns

steps:
# Your steps go here
```

## Starting with a Dockerfile

In order to use a custom image as part of the build process, we need to start off with a shell of a docker file. Microsoft have graciously given us a series of base images to start from. You can find them [here](https://hub.docker.com/r/microsoft/vsts-agent). For this article, I will use the `ubuntu-16.04` release.

In the repository of your choice, create a file called `Dockerfile`. Note that the name is case sensitive because of the docker builds that we will do later on. I found this out the hard way, and if you've made the mistake too - run the following command to reset it within git: `git mv -f dockerfile Dockerfile`

At the top of the Dockerfile, start off with the following:

```dockerfile
FROM microsoft/vsts-agent:ubuntu-16.04
```

During the build, this will instruct docker to pull the image called `vsts-agent` tagged with `ubuntu-16.04` from the user `microsoft`.

Then at the bottom of the Dockerfile, place the following line:

```dockerfile
CMD /bin/sh
```

This instructs the built image to leave a command prompt as the entrypoint so that we can run the rest of our scripts.

### A note on the base image choice

I did initially try experimenting with an Alpine base image, but there seems to be some requirements around what the image contains. Unfortunately, I don't know what the requirements are/I haven't gone to figure them out. If you want to, feel free to browse the dockerfiles [here](https://github.com/Microsoft/vsts-agent-docker/) to see what's required, but I would just stick with the hosted images supplied by Microsoft as your base.

## Building with DockerHub

If your repository is hosted on either Bitbucket or Github, you can get your docker image built and hosted for free by Docker. In order to do this, you need to link either your Github or Bitbucket account from the following page: `https://cloud.docker.com/u/<your user id>/settings`

Once that is complete, if you navigate to the page [https://cloud.docker.com/repository/create](https://cloud.docker.com/repository/create) you should see the following:

![Docker - Create Repository Screen](/img/custom-docker-agent/Create-Repository.png)

From here we can create a link to our hosted repository and setup a build that is associated with the repository.

### Existing repositories

If you need to edit an existing repository or build, you can do that from the following page: `https://cloud.docker.com/repository/docker/<user id>/<repo name>/builds`

![Docker - Builds Screen](/img/custom-docker-agent/Build-Page.png)

## Using the Dockerfile in a Azure DevOps pipeline

Once the build agent has successfully built, we can start to create our `azure-pipelines.yml` file around the new custom container. Above the `steps` section of the file, add the following snippet:

```yml
resources:
    containers:
    - container: <name>
        image: <user id>/<repo name>:<tag>

container: <name>
```

Which, when populated looks like the following:

```yml
resources:
    containers:
    - container: octodns
        image: im5tu/octodns:latest

container: octodns
```

That's it, you should now have a functioning customised Azure DevOps build agent. After that you can play with any additional steps, triggers, variables or what ever your heart desires. Here's what it looks like when it's running instead of Azure DevOps (with the container initialization step highlighted):

![Azure DevOps - Running Custom Containers](/img/custom-docker-agent/Running-Agent.png)

To view the Dockerfile that I am currently using as a custom agent, [go here](https://github.com/Im5tu/octodns-docker/blob/master/Dockerfile).

To view the full usage of the docker file that I am using, [go here](https://github.com/Im5tu/dns/blob/master/azure-pipelines.yml).

### Further Reading

- [Container Jobs](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/container-phases?view=vsts&tabs=yaml)
- [Docker Automated Builds](https://docs.docker.com/docker-hub/builds/)
- [Docker Multi-Stage Builds](https://docs.docker.com/develop/develop-images/multistage-build/)
