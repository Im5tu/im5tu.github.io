{
    "title": "Extending the AWS SDK for .Net",
    "description": "",
    "tags": ["aspnetcore", "dotnet", "diagnostics", "AWS"],
    "date": "2022-01-05T08:00:00Z",
    "categories": ["aspnetcore", "dotnet", "diagnostics"]
}

<!--{{< youtube id="4xocB0-bKQM" >}}-->

In this article we're taking a look at how to extend the AWS SDK for .NET, which can be useful for various tasks like adding in some custom observability components into the request pipeline. This article is a companion resource for the video linked above in case you prefer a written version. I'm actively using the approach described here to implement distributed tracing with OpenTelemetry for all AWS calls at work.

<!--more-->

## Our Example

To demonstrate how to extend the AWS SDK, we are going to have a very simple application that simply lists all of the DynamoDB instances registered in the target system:

```csharp
// NuGet Package Reference: <PackageReference Include="AWSSDK.DynamoDBv2" Version="3.7.2.4" />

using Amazon.DynamoDBv2;
using Amazon.Runtime;
using Amazon.Runtime.Internal;

using var client = new AmazonDynamoDBClient(new AmazonDynamoDBConfig
{
    ServiceURL = "http://localhost:4566"
});

foreach (var table in (await client.ListTablesAsync()).TableNames)
    Console.WriteLine("Found: " + table);

```

In order to run the above example, you need to have a working [localstack](https://localstack.cloud/) instance running with one or more DynamoDB tables created. If you want to copy the files that I've used, you can view them in the [appendix](#appendix) below. If you're using my files, then you should see the following when you run the program:

![Output before customization](/img/extending-the-aws-sdk/initial-output.jpg)

## Customizing the request pipeline

There are three parts to getting our code injected into the AWS request pipeline:

1. Telling the AWS SDK about our pipeline customizer
1. Creating a new instance of `IRuntimePipelineCustomizer`
1. Creating a new instance of `IPipelineHandler`

Although the `IRuntimePipelineCustomizer` is in the internal namespace, this should be relatively stable to use as this is the same technique that AWS use themselves to extend the SDK. Just note, as an internal interface, you'll want to ensure that everything continues to work when upgrading.

### The entrypoint into the AWS SDK

The AWS SDK provides an extensibility point inside of the `Amazon.Runtime.Internal` namespace called `RuntimePipelineCustomizerRegistry`. I discovered this entrypoint by looking at the code for AWS X-Ray. This type is a singleton that allows you to register a class that customizes a pipeline. We are interested in a method called `Register` that takes an instance of `IRuntimePipelineCustomizer`:

```csharp
RuntimePipelineCustomizerRegistry.Instance.Register(new AWSPipelineCustomization());

using var client = new AmazonDynamoDBClient(new AmazonDynamoDBConfig
{
    ServiceURL = "http://localhost:4566"
});

foreach (var table in (await client.ListTablesAsync()).TableNames)
    Console.WriteLine("Found: " + table);
```

It's super important that you register your pipeline customization as early as possible so that you can capture all AWS SDK calls.

### Creating an instance of IRuntimePipelineCustomizer

Once registered, an instance of `IRuntimePipelineCustomizer` will be called every time a new pipeline is created. The type that we need to implement is pretty trivial to implement as it's main purpose is to add one or more pipeline handlers:

```csharp
internal sealed class AWSPipelineCustomization : IRuntimePipelineCustomizer
{
    public string UniqueName { get; } = nameof(AWSPipelineCustomization);

    public void Customize(Type type, RuntimePipeline pipeline)
    {
        if (!typeof(AmazonServiceClient).IsAssignableFrom(type))
            return;

        pipeline.AddHandlerAfter<EndpointResolver>(new AWSPipelineHandler());
    }
}
```

We first check to see whether the type that's passed in is assignable to an AmazonServiceClient so that we can safely ignore types that are invalid such as mock types.

To add our `IPipelineHandler` instance, we need to call one of three methods:

1. `AddHandler` - Adds to the end of the pipeline
1. `AddHandlerBefore` - Adds before the specified handler type
1. `AddHandlerAfter` - Adds after the specified handler type

Generally speaking you want to add your handler after the `EndpointResolver` so that you catch all retry attempts and any credential based calls, such as IAM instance metadata.

### Creating our IPipelineHandler

When are implementing the `IPipelineHandler` we have two choices: implement the interface directly for maximum control or inherit from the class `PipelineHandler` _(recommended)_ and override just the methods that we need. We're not going to do anything fancy in our implementation here, except record the AWS SDK call to the console window:

```csharp
internal sealed class AWSPipelineHandler : PipelineHandler
{
    public override Task<T> InvokeAsync<T>(IExecutionContext executionContext)
    {
        Console.WriteLine("Executing: " + executionContext.RequestContext.RequestName);
        return base.InvokeAsync<T>(executionContext);
    }

    public override void InvokeSync(IExecutionContext executionContext)
    {
        Console.WriteLine("Executing: " + executionContext.RequestContext.RequestName);
        base.InvokeSync(executionContext);
    }
}
```

When you combine all of the code, you should receive an output similar to the following:

![Output after customization](/img/extending-the-aws-sdk/final-output.jpg)

The instance of `IExecutionContext` that you are passed contains both the request and (eventually) the response object, plus other useful information like the invocation id and whether the last exception is one that can be retried or not.

That's it for this article, I hope that you find this extension point useful for your own code base!

## Appendix

You can also view the files on my [Videos Github Repository](https://github.com/Im5tu/videos/tree/main/TipsAndTricks/8%20-%20Extending%20the%20AWS%20SDK).

### Docker Compose File

```yaml
version: "3.5"
services:
  localstack:
    image: localstack/localstack:0.12.12
    restart: always
    ports:
      - "4566:4566"
    container_name: localstack
    environment:
      - HOSTNAME_EXTERNAL=localstack
      - SERVICES=dynamodb
      - DEFAULT_REGION=eu-north-1
      - AWS_ACCESS_KEY_ID=xxx
      - AWS_SECRET_ACCESS_KEY=xxx
      - AWS_DEFAULT_REGION=eu-north-1
    volumes:
      - ./scripts/init.sh:/docker-entrypoint-initaws.d/init.sh

```

### Localstack init script

```bash
#!/bin/sh
#Make sure this file is saved with LF line endings (not CRLF)
#Open this file in VSCode and look in the bottom right corner
set -x

aws dynamodb create-table \
    --table-name test \
    --attribute-definitions AttributeName=Key,AttributeType=S AttributeName=Code,AttributeType=S \
    --key-schema AttributeName=Key,KeyType=HASH AttributeName=Code,KeyType=RANGE \
    --provisioned-throughput ReadCapacityUnits=10,WriteCapacityUnits=5 \
    --endpoint-url http://localstack:4566

```
