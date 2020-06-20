{
   "categories": [ "Development" ],
   "date": "2017-06-11T20:50:11+01:00",
   "description": "A handy URL Rewrite snippet to mark cookies as samesite.",
   "tags": [ "IIS", "Url Rewrite", "Cookies" ],
   "series": ["Url Rewriting"],
   "title": "Ensuring samesite cookies with URL Rewrite"
}

In this article, we will increase our websites level of protecting against Cross-Site Request Forgery and Cross-Site Script Inclusion attacks by appending an additional modifier to the `Set-Cookie` HTTP header.

<!--more-->

This article extends my [previous article](/article/2017/06/ensuring-secure-cookies-with-url-rewrite/) by using an outbound rewrite rule again.

## What are SameSite cookies?

In a cross-origin request context, which is when you request resources from a different site, any cookies that you have for that site are also sent. We can restrict this through applying the `SameSite` modifier to the `Set-Cookie` HTTP header.

The goals of SameSite cookies are to:

- Prevent cross origin timing attacks;
- Prevent cross origin script inclusion;
- Prevent cross site request forgery;
- Increasing privacy protections

When the modification is applied to the `Set-Cookie` HTTP header, the browser will only send cookies in a first party context (ie: when you are using the website directly).

There are two possible modes for the attribute: Strict & lax. The difference is which HTTP verbs the security policy should be applied to. In lax mode, cookies are not sent when `POST`ing to a third party site. In strict mode, cookies are not sent when `GET`ting or `POST`ing to a third party site. Strict mode is the default mode if the mode is obmitted.

## Ensuring our cookies are marked secure with URL Rewrite

As per the snippet in our previous post, we are going to create an outbound rule (which lives under `system.web > rewrite > outboundRules` in our `web.config`). This rewrite snippet requires two portions: the rule and a set of preconditions:

```xml
<rewrite>
    <outboundRules> 
        <rule name="Ensure samesite Cookies" preCondition="Missing samesite cookie">
        <match serverVariable="RESPONSE_Set_Cookie" pattern=".*" negate="false" />
        <action type="Rewrite" value="{R:0}; SameSite=strict" />
        </rule>
        <preConditions>
            <preCondition name="Missing samesite cookie">
                <!-- Don't remove the first line here, it does do stuff! -->
                <add input="{RESPONSE_Set_Cookie}" pattern="." />
                <add input="{RESPONSE_Set_Cookie}" pattern="; SameSite=strict" negate="true" />
            </preCondition>
        </preconditions>
    </outboundRules>
</rewrite>
```

Within our rule, we are defining the name of the rule which can be viewed inside of `inetmgr (IIS Manager)`. Next, we match the server varible for a `Set-Cookie` HTTP header (`RESPONSE_Set_Cookie`) and ensure that it's present for us to continue. For our action, we rewrite the `Set-Cookie` header to be the original value, with the `SameSite` modifier appended with the mode set to strict as detailed above. Alternatively, you can use `SameSite=lax` for the lax mode of operation.

Within the precondition, which is matched by name to the `preCondition` attribute in the rule, we do two things:

- (_I think, see below_) Make sure that the `Set-Cookie` header has been set (via the server variable `{RESPONSE_Set_Cookie}`);
- Make sure that we do not already have the `SameSite` modifier set

As per my previous post, due to a knowledge gap, the first line is required within the pre-condition or funky things happen.

That's it. If you check your debug tool of choice after implementing this, you should see that all cookies are now sent with the `SameSite` modifier.