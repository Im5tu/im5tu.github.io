---
title: "Setting Up A Repository Template In Github For K6"
description: A look into how we can create K6 performance test suite from a Github repository template.
date: 2020-10-11T10:45:00+01:00
toc: true
includeInSitemap: true
series: "Repository Templates"
tags:
- dotnet
- devops
---

In my [previous article](/article/2020/10/setting-up-a-repository-template-in-github-for-.net/), we took a look at setting up a template repository for our .Net projects. Repository templates can massively help with the consistency and startup speed of a new project. In this article, we will take a look at a different repository template that I've been using for work for running our performance tests.

<!--more-->

For our performance tests, I generally use [K6](https://k6.io) which if you're unfamiliar with it, is a simple and easy to use Javascript library for writing simple performance tests such as load tests, spike tests and soak tests. To give you an idea of what you can do with this, I've used this setup to automate load tests in an Octopus Deploy pipeline by running an ECS task post-deployment. You could also trigger nightly performance tests and have the results posted to Slack if you wanted as well.

Here is an overview of what the [repository template](https://github.com/Im5tu/template-k6) looks like at the time of writing:

![Overview](/img/template-k6/overview.png)

## Folders

The template contains a number of different folders for different purposes:

- `lib`: javascript extensions that are common to all scripts that are run
- `options`: contains the k6 options such as duration, target virtual users etc
- `services`: contains the urls and other service specific settings

Logically splitting out the options and services allows us to run the same set of tests against different url's (service settings) and different styles of performance tests (option settings).

### lib

In the template, I have a single `k6_extensions.js` file, though you could easily split out the file into multiple if it grows significantly or depending on your needs. The core functionality this file provides is:

- `parseResponse` - a simple function that checks for a 200/201/202/204 response code. If the check fails, a message is logged to console and the error rate counter incremented.
- `errorRate` - this is a counter that's incremented by the `parseResponse` function, used as a threshold in the options settings (detailed below)
- `loadOptions` - a helper for loading a file from the `options` directory
- `loadServiceConfig` - a helper for loading a file from the `services` directory and adding the execution environment from the command line
- `withHeaders` - sets up the header collection ready for use in the scripts
- `merge` - simple JS object merge utility function

To use the functions, we add `import { <comma separated function names> } from "./lib/k6_extensions.js";` to the top of our load test file, replacing `<comma separated function names>` with `loadOptions, parseResponse, loadServiceConfig, withHeaders` for example.

### options

Each file under the `options` folder is designed to control the execution of the K6 runtime. For example, for a soak test, you might want to restrict the maximum requests per second to save on costs. It can also be used to set the thresholds for success/failure and other K6 options.

Here is an example of a soak test that runs for 4 hours in total:

```json
{
    "stages": [
        { "target": 400, "duration": "2m" },
        { "target": 400, "duration": "3h56m" },
        { "target": 0, "duration": "2m" }
    ],
    "thresholds": {
        "errors": ["rate=0"],
        "http_req_duration": ["p(95) < 750"],
        "http_reqs": ["rate>=500"]
    },
    "rps": 2000,
    "batchPerHost": 0
}
```

### services

A service file indicates the base url for a given service. It can be extended with other information if you wanted, such as a client id specific to that environment. The environment is selected by the `K6_HOSTENV` environment variable that is supplied to the command line execution. The format of the files are:

```
- environment 1
  - baseUrl
  - Setting 1 for environment 1 (optional)
  - Setting 2 for environment 1 (optional)
- environment 2
  - baseUrl
  - Setting 1 for environment 2 (optional)
  - Setting 2 for environment 2 (optional)
```

Here is an example of a service config:

```json
{
    "local": {
        "baseUrl": "https://localhost:5001"
    },
    "qa": {
        "baseUrl": "https://test-api.k6.io"
    }
}
```

## TEMPLATE.js

The `TEMPLATE.js` file is your quick start for writing the tests, simply copy and paste this and being writing the tests. There are a few todo's for you to complete in the file, including:

- Setting the options file to use
- Setting the service file to use
- Updating the tests to point to the correct url's by appending to the base url

Each web request that is run calls the `parseResponse` function I mentioned earlier to automatically parse the result of the web call and increment the error counter if appropriate. The template file in the repository will run against the K6 test website, with a successful and unsuccessful call so that you can see what happens in both scenarios.

## Running with Docker

To run the tests with docker, we need to run the following commands (which is encapsulated by the `run.ps1` file in the template):

```bash
docker build -t test .
docker run -it -e K6_HOSTENV=qa -e K6_SCRIPT=TEMPLATE.js test
```

This copies all of the files into the docker image, so you can use the same image with different execution values at runtime. We set two environment variables that control the execution:

- `K6_HOSTENV` - this selects the right section from the `service` config file from the loaded script.
- `K6_SCRIPT` - this tells K6 which script to run when the container is started.

Please note that the environment variables are case sensitive. By using K6's check & threshold functionality in the template, if there is a failed request, the K6 process will exit with a non-zero exit code, which is also returned out through the container as well. This can be very useful in scripted scenarios.

Now that you've got an overview of how the repository is setup, you can copy it and make it your own. It would be great to see what you do with your repositories!

Happy performance testing!
