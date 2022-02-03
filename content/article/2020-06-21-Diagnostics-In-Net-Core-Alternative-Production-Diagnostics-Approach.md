{
    "title": "Diagnostics in .Net Core 3: An alternative approach to using dotnet-counters with Docker",
    "description": "A look into the EventCounters API in .Net Core 3, and seeing how we can capture inbound HTTP Requests.",
    "tags": ["aspnetcore", "dotnet", "diagnostics"],
    "date": "2020-06-25T22:56:00+01:00",
    "categories": ["aspnetcore", "dotnet", "diagnostics"],
    "series": ["Diagnostics in .Net Core 3"],
    "toc": true
}

In a [previous article](/article/2020/01/diagnostics-in-.net-core-3-using-dotnet-counters-with-docker/), we took a look at a way to use `dotnet-counters` with an external image. This article takes a look at how we can embed the tooling that we require into the image so that we extract the counter/memory information as required. This approach does not require elevated permissions as before.

<!--more-->

Let's assume that we are starting with the following dockerfile:

```dockerfile
# Publish the application using the SDK
FROM mcr.microsoft.com/dotnet/core/sdk:3.1-alpine AS build
WORKDIR /app
RUN dotnet new webapp -n BlogApp
RUN dotnet publish /app/BlogApp/BlogApp.csproj -c Release -o /out /p:GenerateDocumentationFile=false

# Build the smaller runtime image
FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-alpine
WORKDIR /app
COPY --from=build /out ./
EXPOSE 5000
ENTRYPOINT ["dotnet", "BlogApp.dll"]
```

Here we use a docker multi-stage build to publish our application (which is also created inline for the purposes of this article). Once the code has been published, we can then make the a runtime image which has a lot less dependencies, thus a smaller image size, to host the published version of the application.

**Note:** _If you don't use the same OS, like Alpine, on both steps, then you should specify the `-r` flag with the runtime identifier for the runtime image._

## Installing the .Net tools

In order to embed the tooling inside of the runtime image, we first need to adapt our build image:

```dockerfile
# Publish the application using the SDK
FROM mcr.microsoft.com/dotnet/core/sdk:3.1-alpine AS build
WORKDIR /app
RUN dotnet new webapp -n BlogApp
RUN dotnet publish /app/BlogApp/BlogApp.csproj -c Release -o /out /p:GenerateDocumentationFile=false
# NEW CODE
RUN dotnet tool install dotnet-dump --tool-path /tools
RUN dotnet tool install dotnet-counters --tool-path /tools
RUN dotnet tool install dotnet-trace --tool-path /tools
# END OF NEW CODE
```

Here we leverage the dotnet tools ability to restore tooling to a specific directory, in this case `/tools`. Once the tools have been installed, we can copy them into the runtime image:

```dockerfile
# Build the smaller runtime image
FROM mcr.microsoft.com/dotnet/core/aspnet:3.1-alpine
WORKDIR /app
COPY --from=build /out ./
EXPOSE 5000
# NEW CODE
COPY --from=build /tools /tools
ENV PATH="/tools:${PATH}"
# END OF NEW CODE
ENTRYPOINT ["dotnet", "BlogApp.dll"]
```

## Accessing the tools at runtime

In order to access these tools at runtime, we need to be able to access the container at runtime. An example of this is being able to SSH into the running EC2 instance on AWS. Assuming that we have access, we can run the following command to get the running containers:

```bash
docker ps
```

Which results in output similar to the following:

```bash
CONTAINER ID  IMAGE             COMMAND                  CREATED        STATUS                    PORTS                NAMES
fac2377f3e87  myContainerImage  "./usr/src/app/init.…"   30 hours ago   Up 55 seconds (healthy)   0.0.0.0:80->80/tcp   myContainerImage
```

From here, we can use the [docker exec](https://docs.docker.com/engine/reference/commandline/exec/) command to launch a shell in the new container, using the container ID from above:

```bash
docker exec -it -w /tools <ID> /bin/sh
#Example:
docker exec -it -w /tools fac2377f3e87 /bin/sh
```

`-it` tells docker that we want the shell to be interactive and to keep the shell open for us even when there is no immediate input, ie: we can type into it and get a response. `-w` means start in the working directory `/tools`. Next, replace `<ID>` with the container ID from the selection above. Finally, we pass in the command that we want to execute in the shell - which we open a shell so that we can run different commands.

Now you should be able to run `dotnet-counters`, `dotnet-dump` & `dotnet-trace` as normal. If you need to copy any files from the container then you need to run the following from the host machine:

```bash
docker cp <ID>:<path-to-file-in-container> <copy-to-path-on-host>
#Example:
docker cp fac2377f3e87:/tools/output/trace.nettrace ./output/trace.nettrace
```

The [docker cp](https://docs.docker.com/engine/reference/commandline/cp/) command allows us to copy a file from/to the running container (specified by `<ID>`). The only other thing that you need is the path of the file that you wish to copy from the container, and the destination path on the host machine.

Now you'll have the diagnostic tools embedded within your runtime images, at the correct version. Naturally, the more tools that you install, the larger the final size of the image will be. It does also take a little bit of prep work, but this can pay off massively for unexpected memory/cpu issues. Happy diagnosing.
