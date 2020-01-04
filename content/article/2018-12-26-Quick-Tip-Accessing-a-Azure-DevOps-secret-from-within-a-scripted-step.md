{
    "title": "Quick Tip: Accessing a Azure DevOps secret from within a scripted step",
    "description": "Learn how to access a Azure DevOps library secret inside of a scripted step",
    "tags": ["devops", "vsts", "azure"],
    "date": "2018-12-26T14:00:00+00:00",
    "categories": ["Development"]
}

In today's quick tip, we are going to see how we can access a secret that we've defined in a variable group as part of a Azure DevOps yml based build.

<!--more-->

By design, any variable from a linked variable set will:

- Be hidden from logs; and
- Not be placed in as an environment variable

In the blog posts that I've seen to date, they've mentioned about using the `##vso[task.setvariable name]value` command inside of a script. I personally dislike this way as it clutters the build with extra steps that I feel are unnecessary and it makes it harder to find when looking at the configuration file. You may still have to use this approach when the following tip does not work.

In order to pull in a value from a variable group, you must link the variables by using the following snippet:

```yml
variables:
- group: MY_VARIABLE_GROUP_NAME
```

_Replace `MY_VARIABLE_GROUP_NAME` with your variable group name._

Multiple groups can be added like so:

```yml
variables:
- group: MY_VARIABLE_GROUP_NAME
- group: MY_VARIABLE_GROUP_NAME_2
```

And then in the steps, and the `env:` section linking the `SECRET_TOKEN` variable as follows:

```yml
steps:
- script: 'echo Your script here'
displayName: 'My Test Script'
env:
    SECRET_TOKEN: $(SECRET_TOKEN)
```

_Replace `SECRET_TOKEN` with the name of your variable that you wish to access._

That's it. From now you should be able to access your secret variables from within your scripts and not have them written out to logs.

### Further Reading

- [Build variables - Microsoft Azure Docs](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/variables?view=vsts&tabs=yaml%2Cbatch)
- [Sample YML - Github - Im5tu/dns](https://github.com/Im5tu/dns/blob/master/azure-pipelines.yml)