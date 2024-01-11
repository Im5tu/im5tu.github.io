---
title: "Observed No. 12 - Removing Pre-Commit Dependencies With Docker"
description: The 12th edition of Observed shows you how to remove dependencies when using Pre-Commit by utilizing docker images.
date: 2023-05-01T01:00:00+00:00
toc: true
includeInSitemap: true
tags:
- devops
---

Welcome to the 12th edition of Observed! The newsletter delivers a tip you can implement across many categories like AWS, Terraform and General DevOps practices in your infrastructure. This week's edition looks how we can use Precommit with existing docker images.

<!--more-->

## What is Pre-Commit?

Pre-commit is a tool that helps developers to ensure that the code they commit is consistent with the project's guidelines and standards. This framework allows developers to define a set of hooks or scripts to run before a commit is made to a Git repository. These hooks can perform various checks and tests, such as code formatting, syntax checking, linting, and security scanning.

Pre-commit provides a convenient way to automate these checks and ensure that code is consistently formatted and meets the project's quality standards. It can be configured to run automatically on every commit or manually by running a command in the terminal. Pre-commit is written in Python and is available as an open-source tool that can be used with any programming language. There are many community-built hooks for languages such as Terraform & .NET.

## Why should we use Pre-Commit?

If you aren't already using Pre-Commit, there are several reasons why you should consider using Pre-commit in your projects:

1. Consistency: Pre-commit helps ensure that code is consistently formatted and adheres to the project's guidelines and standards. This can make it easier for developers to read and understand code and reduce errors and bugs.
1. Efficiency: Pre-commit allows developers to automate checks and tests that would otherwise need to be done manually. This can save time and reduce the risk of human error.
1. Security: Before code is committed to the repository, Pre-Commit can be configured to run security checks, such as scanning for vulnerabilities or checking for sensitive data. This can help reduce the risk of security breaches.

## Why Are Dependencies A Problem For Pre-Commit?

Dependencies can be problematic for Pre-Commit because they can lead to compatibility issues or version conflicts. Pre-commit hooks are executed in a separate environment from the main project, and this environment may have different dependencies or versions of dependencies installed.

If a hook relies on a specific version of a package or library that is not installed on the machine, it may fail to execute. Similarly, if multiple hooks require different versions of the same package, conflicts may prevent one or more hooks from running correctly.

To avoid these issues, we can, where available, use the docker functionality of pre-commit to isolate the dependencies of our Pre-Commit hooks from the machine running the checks, resulting in a more stable and consistent output.

## How To Use Docker Images With Pre-Commit

Pre-commit hooks can be run via Docker to ensure they are executed consistently across different environments. This can be especially useful for developers who need the necessary tools or dependencies installed on their local machines.

To use Docker with pre-commit, you'll need to specify a Docker image for each hook in your `.pre-commit-config.yaml` file. Here’s an example from [Terraform Docs](https://terraform-docs.io/how-to/pre-commit-hooks/):

```yaml
repos:
  - repo: local
    hooks:
      - id: terraform-docs
        name: terraform-docs
        language: docker_image
        entry: quay.io/terraform-docs/terraform-docs:latest  # or, change latest to pin to a specific version
        args: ["ARGS", "TO PASS", "INCLUDING PATH"]          # e.g. ["--output-file", "README.md", "./mymodule/path"]
        pass_filenames:false
```

Note that building a Docker image from the repo can be slow, so it is recommended to download the pre-built image instead, as shown in the example. As these are docker references, we can change the tag we wish Pre-Commit to pull, enabling easy versioning of dependencies.

In addition to specifying the Docker image, you can pass arguments to the pre-commit hook using the args key. This can be useful for customizing the behaviour of the hook, such as specifying the output file or passing additional command-line arguments.

To build custom docker images for Pre-Commit, check [this section of the Pre-Commit documentation](https://pre-commit.com/index.html#docker). As mentioned above, it’s advised that you pre-build your docker images for your team's performance.

**📣 Get the Weekly Newsletter Straight to Your Inbox! 📣**

Don't miss out on the latest updates! Subscribe to the [Observed! Newsletter](https://news.codewithstu.tv) now and stay up-to-date with the latest tips and tricks across AWS, Devops and Architecture. [Click here](https://news.codewithstu.tv) to subscribe and start receiving your weekly dose of tech news!
