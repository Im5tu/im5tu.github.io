{
    "title": "Diagnostics in .Net Core 3: Using dotnet-counters with Docker",
    "description": "A look into how we can use dotnet-counters with a docker container",
    "tags": ["aspnetcore", "dotnet", "diagnostics"],
    "date": "2020-01-25T13:00:00",
    "categories": ["aspnetcore", "dotnet", "diagnostics"],
    "series": "Diagnostics in .Net Core 3"
}

In my [previous post](/article/2020/01/diagnostics-in-.net-core-3-event-counters/), I described how we can leverage the new EventCounter diagnostics API to add custom event counters and listen for built in counters. In this article, I will walk through how we can leverage the `dotnet-counters` tool with a running docker image.

<!--more-->

## Creating our diagnostics image

In order to connect to a docker image, we will create a diagnostics image which will host the same .Net SDK version as our application and will have the `dotnet-counters` tool pre-installed:

```dockerfile
FROM mcr.microsoft.com/dotnet/core/sdk:3.1
RUN mkdir /root/.dotnet/tools
ENV PATH="/root/.dotnet/tools:${PATH}"
RUN  dotnet tool install dotnet-counters --global
WORKDIR /diagnostics
ENTRYPOINT [ "/bin/bash" ]
```

A common mistake when creating docker images that contain .Net tools which are installed globally is not remembering to add the tool path, in this case `/root/.dotnet/tools/` to the PATH so that it can be globally executed. Luckily, the .Net CLI will remind you in the build logs should you forget to do this.

Note: _You can see the other tools that are available [here](https://github.com/dotnet/diagnostics/tree/master/src/Tools)._

Now that we have our docker image ready, we can build with the following command:

```bash
docker build -f diagnostics.Dockerfile -t dotnetdiag:3.1 .
```

### Setting up the host image

For the purposes of this article, we will setup our application using a brand new application within a dockerfile, created by `dotnet new`:

```dockerfile
FROM mcr.microsoft.com/dotnet/core/sdk:3.1
WORKDIR /app
EXPOSE 5000
EXPOSE 5001
RUN dotnet new webapp -n BlogApp
WORKDIR /app/BlogApp
ENTRYPOINT dotnet run -c Release
```

And we will build our application with the following command line:

```bash
docker build -f app.Dockerfile --name app -t dotnetapp:latest .
```

Once you have you're application built we are ready to start our docker image with debugging enabled.

## Connecting from the diagnostics image to the host image

Normally we would start our applications with a command line similar to this: 

```bash
docker run --rm --name app dotnetapp:latest
```

However, in order to be able to connect to the running application we need to mount a volume to the temporary directory on the application container. We can do this by appending `-v dotnetdiag:/tmp`, which instructs docker to mount a named volume `dotnetdiag` to the path `/tmp`. Docker will create the named volume during startup if it does not exist.

We mount the volume because as the .Net runtime starts up, it places a load of temporary files into the `/tmp` directory such as the following:

```
root@379211a5012a:/# ls /tmp
CoreFxPipe_root.b5he0_wwfcD_lH7g471Brpw4X   VBCSCompiler                                 
jiksomfd.ri0                                NuGetScratch
hn2K8eq8bHUcTVSgvuckPlSK9tw9_ORiMDm_Vn4ylfI system-commandline-sentinel-files
```

_Note the inclusion of the file beginning with `CoreFxPipe_root`, which is the EventPipe that we will connect to._

Once the application is running, we are now able to start connecting to our application. Normally we would run the following command line to start the diagnostics image: `docker run --rm -it --pid=container:app --net=container:app -v dotnetdiag:/tmp --cap-add ALL --privileged dotnetdiag:3.1`. Before we execute this command, we need to modify it by add arguments for:

- Mounting to the same volume as the running application
- Be able to inspect the process list of the running application,
- Be able to share the same networking as the running application,
- Elevate execution for the new container

Without completing the steps listed above we will be unable to connect to the running application. For mounting the volume we can use the exact same argument as before (`-v dotnetdiag:/tmp`). 

In order to get the process id, we need to join the same process namespace through the use of the [--pid](https://docs.docker.com/engine/reference/run/#pid-settings---pid) argument. The `--pid` offers two modes, container or host. For this article, we will connect to a specific container by name, though you can also connect to the container by id as well.

Like the process argument, we also need to join the same networking space as the running container. So we will use [--net](https://docs.docker.com/engine/reference/run/#network-settings) which can also be run in multiple modes. For this article, we will connect to the application via the container name.

Lastly, by default, Docker containers restrict a lot of what you can do with running processes, like run docker in docker. So we need to tell docker to run in privileged mode and what capabilities we require to have from our diagnostics container. For this we will use the `--cap-add` and the `--privileged` arguments. Click [here](https://docs.docker.com/engine/reference/run/#runtime-privilege-and-linux-capabilities) to read more about runtime privilege and docker capabilities.

After putting it all together, here is the full command line that we will run:

```bash
docker run --rm -it --pid=container:app --net=container:app -v dotnetdiag:/tmp --cap-add ALL --privileged dotnetdiag:3.1
```

Now you should have an empty command line to run, so if we execute `dotnet-counters ps` you should see something similar to the following:

```bash
root@9663cbb4e1fe:/diagnostics# dotnet-counters ps
       103 BlogApp    /app/BlogApp/bin/Release/netcoreapp3.1/BlogApp
         6 dotnet     /usr/share/dotnet/dotnet
        42 dotnet     /usr/share/dotnet/dotnet
        61 dotnet     /usr/share/dotnet/dotnet
       247 dotnet-counters /root/.dotnet/tools/dotnet-counters
```

Assuming that your application is running under process id **103** then we would execute the following command to view the counters:

```bash
root@9663cbb4e1fe:/diagnostics# dotnet-counters monitor -p 103 System.Runtime Microsoft.AspNetCore.Hosting
```

## Recap

In order to diagnose a running docker image from another docker image, you need to:

- Mount the `/tmp` on the application image prior to starting the application
- Create a diagnostic image with your diagnostics tools
- Run your diagnostics image with the following arguments:
    - `-v` for mounting to the same volume as the application image
    - `--pid` for joining the same process space
    - `--net` for joining the same network
    - `--privileged` for requesting additional permissions to cross container boundaries, and
    - `--cap-add ALL` for adding the ability to list processes etc.

Happy diagnostics!