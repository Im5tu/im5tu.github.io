{
   "categories": [ "Development" ],
   "date": "2017-06-04T15:00:55+01:00",
   "description": "A quick explanition of canonical host urls and how to achieve them with url rewriting.",
   "tags": [ "IIS", "Url Rewrite", "SEO", "devops" ],
   "series": ["Url Rewriting"],
   "title": "Canonical host urls with URL Rewrite"
}

In the [previous post](/article/2017/06/up-and-running-with-url-rewrite---going-from-http-to-https/), I gave a brief intoduction to URL Rewriting and showed you how to get from HTTP to HTTPS. In this article, I will show you how to have a canonical host url.<!-- more -->

## What is a canonical host url?

It can be incredibly easy to distribute different urls for your website. Lets say that we have `www.site.com/post1` and `site.com/post1`. If you're a search engine, you think that these are different different pages with the same content. When you have the same content, you ranking decreases because the content is not original. As a human looking at the site, we think that the pages are the same content on the same site, so we don't see the duplication.

So a canonical url is basically saying to the search engine: hey, `www.site.com/post1` and `site.com/post1` are the same content and you should access me through this link (*which we define to be a single one of the above*).

We can set this through metadata on our webpages, but this doesn't guarentee that people will distribute the correct link to your site. To fix this, we can rewrite the url to either append or remove the `www.`. In this case, because I prefer shorter url's, we will remove the www sub-domain prefix.

## Making a canonical host url via URL Rewrite

As per the snippet in our previous post, we are going to create an inbound rule (which lives under `system.web > rewrite > rules` in our `web.config`):

```xml
<rule name="Canonical Hostname" stopProcessing="true">
    <match url="(.*)" />
    <conditions logicalGrouping="MatchAll" trackAllCaptures="false">
        <add input="{HTTP_HOST}" pattern="^www\.([.a-zA-Z0-9]+)$"/>
    </conditions>
    <action type="Redirect" url="https://{C:1}/{R:1}" redirectType="Temporary" />
</rule>
```

In the first line, we are defining the name of the rule which can be viewed inside of `inetmgr (IIS Manager)` saying that we want to stop at this rule and return the response to the client. Next up, we give our matching criteria which we have wildcarded to match all requests. Then we have added a condition which takes a server variable (`{HTTP_HOST}` which tells us the DNS name or IP address that has been used to reach this server eg: site.com or www.site.com), and we've matched it against any request starting with `www.`.

Finally, we define the action that we wish to take if both the `match` and `conditions` sections have been satisfied. The action that we wish to take is to redirect the user to a non `www.` version of the page. In order to do this, we use one of the capture groups (which comes from the conditions section regex) to redirect to (in this case it's `{C:1}`) and combine it with the original path and query.

And that's it, you should be redirecting people from say `www.site.com` to `site.com`.
