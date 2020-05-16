{
   "categories": [ "Development" ],
   "date": "2017-06-06T15:01:04+01:00",
   "description": "A brief overview of cookies, why we want them to be httpOnly and how we can ensure this via URL Rewrite.",
   "tags": [ "IIS", "Url Rewrite", "Cookies" ],
   "series": "Url Rewriting",
   "title": "Ensuring httpOnly cookies with URL Rewrite"
}

In this article, I will give a brief overview of cookies, why we want them to be httpOnly and how we can ensure this via URL Rewrite. We will also be creating our first outbound rewrite rule with a pre-condition.

<!--more-->

See my [previous posts](/article/2017/06/removing-trailing-slashes-with-url-rewrite/) for information on inbound rewrite rules.

## What are cookies?

Unfornately, in this sense they are not a snack. They are, usually, small bits of information continually transferred between the browser and the server in order to do things like session tracking & identification, or maintain informantion pertainent to your browsing session. If not secured in the right way, you can expose details of your browsing session unknowingly. First up, we can make the cookies `httpOnly`.

## What are httpOnly cookies?

By adding the modifier to the cookie, we prevent any scripts running from accessing the cookie. The biggest benefit here is protection against Cross-Site Scripting, or XSS. Unless you have very specific requirements for cookies, this flag should always be enabled.

*For more information, checkout [Scott Helme's incredible post](https://scotthelme.co.uk/tough-cookies/) on getting tougher cookies.*

## How can we ensure our cookies are httpOnly with URL Rewrite

When a server indicates that it wants to set a cookie, it does so by sending the `Set-Cookie` HTTP header along with the response. There are a few modifiers that this can have to make them more secure in compliant browsers (eg: Chrome, Firefox, Edge, Safari): `httpOnly`, `secure` and `sameSite=(lax|strict)`.

This rewrite snippet requires two portions: the rule and a set of precondtions.

```xml
<rewrite>
    <outboundRules>
        <rule name="Ensure httpOnly Cookies" preCondition="Missing httpOnly cookie">
            <match serverVariable="RESPONSE_Set_Cookie" pattern=".*" negate="false" />
            <action type="Rewrite" value="{R:0}; HttpOnly" />
        </rule>
        <preConditions>
            <preCondition name="Missing httpOnly cookie">
                <!-- Don't remove the first line! -->
                <add input="{RESPONSE_Set_Cookie}" pattern="." />
                <add input="{RESPONSE_Set_Cookie}" pattern="; HttpOnly" negate="true" />
            </preCondition>
        </preconditions>
    </outboundRules>
</rewrite>
```

Within our rule, we are defining the name of the rule which can be viewed inside of `inetmgr (IIS Manager)`. In previous posts we have added the attribute to stop processing, but here we want to continue processing rewrite rules because we may want to do additional work to the response. Next, we match the server varible for a `Set-Cookie` HTTP header (`RESPONSE_Set_Cookie`) and ensure that it's present for us to continue. For our action, we rewrite the `Set-Cookie` header to be the original value, with the `HttpOnly` modifier appended.

Within the precondition, which is matched by name to the `preCondition` attribute in the rule, we do two things:

- (_I think, see below_) Make sure that the `Set-Cookie` header has been set (via the server variable `{RESPONSE_Set_Cookie}`);
- Make sure that we do not already have the `HttpOnly` modifier set

For an unknown reason, probably due to a knowledge gap, the first line is required. I have made a guess as to what this could be, but I am unsure. Strange things happen in the dev tools in Chrome if that first line is not there.

*It is worth noting that a precondition is not limited to a single rule, it can be re-used. There is probably scope for making this rule smaller, if there is i'll edit the post to reflect the smaller rule.*

That's it. If you check your debug tool of choice after implementing this, you should see that all cookies are now sent with the `HttpOnly` modifier.