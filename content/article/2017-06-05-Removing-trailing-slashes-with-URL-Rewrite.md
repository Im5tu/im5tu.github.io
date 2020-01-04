{
   "categories": [ "Development" ],
   "date": "2017-06-05T15:00:59+01:00",
   "description": "A quick explanition of why consistent urls are important and how to achieve them with url rewriting.",
   "tags": [ "IIS", "Url Rewrite", "SEO" ],
   "title": "Removing trailing slashes with URL Rewrite"
}

In the [previous post](/article/2017/06/canonical-host-urls-with-url-rewrite/), I explained why canonical urls are important and how to enforce them . In this article, I will show you how to have a canonical host url.

<!--more-->

## Why does adding or removing trailing slashes matter?

In essence, it matters for the same reasons as I described in [my previous post](/article/2017/06/canonical-host-urls-with-url-rewrite/). That is, search engines will see `site.com/post1` as different content to `site.com/post1/` so we need to correct this in order to get a bit of SEO benefit. In this article, I will be redirecting any URL that comes with a slash at the end to one without.

## Adding or removing trailing slashes via URL Rewrite

As per the snippet in our previous posts, we are going to create an inbound rule (which lives under `system.web > rewrite > rules` in our `web.config`):

```xml
<rule name="Remove trailing slash" stopProcessing="true">
    <match url="(.*)/$" />
    <conditions logicalGrouping="MatchAll" trackAllCaptures="false">
        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
        <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
    </conditions>
    <action type="Redirect" url="{R:1}" redirectType="Temporary" />
</rule>
```

In the first line, we are defining the name of the rule which can be viewed inside of `inetmgr (IIS Manager)` saying that we want to stop at this rule and return the response to the client. Next up, we give our matching criteria which we have wildcarded to match all requests that end with a `/`. Then we have added a condition set which is definted to match all criteria inside. We use the server variable `{REQUEST_FILENAME}` to determine whether or not the path requested is a physical file or directory on disk. The last attribute in each condition is a negation, which is equivilent of saying don't match a physical directory or file (we don't want to screw the routing for those!).

Finally, we define the action that we wish to take if both the `match` and all the conditions in the `conditions` section have been satisfied. The action that we wish to take is to redirect the user to the page without the slash, so we use the request capture group `{R:1}` (more on this in a future article).

And that's it, you should be redirecting people from say `site.com/post1/` to `site.com/post1`.

## Other Posts In This Series

1. [Up and running with URL Rewrite - going from HTTP to HTTPS](/article/2017/06/up-and-running-with-url-rewrite---going-from-http-to-https/)
2. [Canonical host urls with URL Rewrite](/article/2017/06/canonical-host-urls-with-url-rewrite/)
3. [Removing trailing slashes with URL Rewrite](/article/2017/06/removing-trailing-slashes-with-url-rewrite/) *(This Post)*
4. [Ensuring httpOnly cookies with URL Rewrite](/article/2017/06/ensuring-httponly-cookies-with-url-rewrite/)
5. [Ensuring secure cookies with URL Rewrite](/article/2017/06/ensuring-secure-cookies-with-url-rewrite/)
6. [Ensuring samesite cookies with URL Rewrite](/article/2017/06/ensuring-samesite-cookies-with-url-rewrite/)