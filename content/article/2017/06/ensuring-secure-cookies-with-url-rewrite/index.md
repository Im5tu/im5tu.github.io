---
title: "Ensuring secure cookies with URL Rewrite"
description: A handy URL Rewrite snippet to mark cookies as secure.
date: 2017-06-11T20:38:07+01:00
toc: true
includeInSitemap: true
series: "Url Rewriting"
tags:
- dotnet
- devops
- seo
---

In this article, we will take a look at secure cookies, that is by appending an additional modifier to the `Set-Cookie` HTTP header.

<!--more-->

This article extends my [previous article](/article/2017/06/ensuring-httponly-cookies-with-url-rewrite/) by using an outbound rewrite rule again.

## What are secure cookies?

As the name suggests, by appending `secure` to the `Set-Cookie` HTTP header, we instruct a browser to only send the cookie when the connection to the web server is secure. This helps protect against any information leakage or eves-dropping.

*For more information, checkout [Scott Helme's incredible post](https://scotthelme.co.uk/tough-cookies/) on getting tougher cookies.*

## Ensuring our cookies are marked secure with URL Rewrite

As per the snippet in our previous post, we are going to create an outbound rule (which lives under `system.web > rewrite > outboundRules` in our `web.config`). This rewrite snippet requires two portions, the rule and a set of preconditions:

```xml
<rewrite>
    <outboundRules>
        <rule name="Ensure secure Cookies" preCondition="Missing secure cookie">
            <match serverVariable="RESPONSE_Set_Cookie" pattern=".*" negate="false" />
            <action type="Rewrite" value="{R:0}; secure" />
        </rule>
        <preConditions>
            <preCondition name="Missing secure cookie">
                <!-- Don't remove the first line here, it does do stuff! -->
                <add input="{RESPONSE_Set_Cookie}" pattern="." />
                <add input="{RESPONSE_Set_Cookie}" pattern="; secure" negate="true" />
            </preCondition>
        </preconditions>
    </outboundRules>
</rewrite>
```

Within our rule, we are defining the name of the rule which can be viewed inside of `inetmgr (IIS Manager)`. Next, we match the server varible for a `Set-Cookie` HTTP header (`RESPONSE_Set_Cookie`) and ensure that it's present for us to continue. For our action, we rewrite the `Set-Cookie` header to be the original value, with the `secure` modifier appended.

Within the precondition, which is matched by name to the `preCondition` attribute in the rule, we do two things:

- (*I think, see below*) Make sure that the `Set-Cookie` header has been set (via the server variable `{RESPONSE_Set_Cookie}`);
- Make sure that we do not already have the `secure` modifier set

As per my previous post, due to a knowledge gap, the first line is required within the pre-condition or funky things happen.

That's it. If you check your debug tool of choice after implementing this, you should see that all cookies are now sent with the `secure` modifier.
