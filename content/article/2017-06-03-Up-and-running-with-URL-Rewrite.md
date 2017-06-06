{
   "categories": [ "Development" ],
   "date": "2017-06-03T15:00:51+01:00",
   "description": "A quick introduction to URL Rewrite module for IIS and a snippet from going from HTTP to HTTPS.",
   "tags": [ "IIS", "Url Rewrite" ],
   "title": "Up and running with URL Rewrite - going from HTTP to HTTPS"
}

In this series, I am going to take you through a few `web.config` snippets that have come in handy for me when using URL Rewrite on IIS. Firstly, I am going to introduce the URL Rewrite module then show a sample of going from HTTP to HTTPS.

<!--more-->

## What is URL Rewrite?

[URL Rewrite](https://www.iis.net/downloads/microsoft/url-rewrite)  is a module extensions for IIS which allows administrators to create powerful inbound and outbound rules that alter a HTTP request or response. Scenarios where you might consider using the URL Rewrite module include:

- Rewrite URLs based on the values of server variables or HTTP headers
- Provide SEO benefits such as canonical host names
- Setup redirects from old posts to new

*URL rewrite can be install from the [Web Platform Installer](http://go.microsoft.com/fwlink/?LinkID=615137) for IIS 7.5 or above.*

## URL Rewrite and Web.Config

Inside of the `web.config` you can define a `<rewrite>` section beneath the `<system.web>` section:

    <system.web>
        <rewrite>
            <!-- Your rules here -->
        </rewrite>
    </system.web>

Within the `<rewrite>` section you can define either a `<rules>` section or an `<outbound>` section. The former is for inbound request rewriting and the latter is for response rewriting. I'll expand on each section as we go through the series.

***Note:** if you don't have the URL Rewrite module installed, you'll get a lovely yellow screen of death when you start your application.*

## Redirecting HTTP to HTTPS

The are some obvious benefits to serving pages over a secure connection (HTTPS), which include:

- Encryption: The data exchanged between client and server cannot easily be read
- Authority: Proving that the server you are talking to is who you are expecting to talk to

However, there are a few lesser known benefits including:

- SEO: Search engines are preferring websites that are secure by default
- HTTP2: Major browsers do not support HTTP2 over insecure connections

Assuming you would like all of the above benefit, here is the rule snippet that you will need:

    <system.web>
      <rewrite>
          <rules>
              <rule name="Redirect to http" patternSyntax="Wildcard" stopProcessing="true">
                <match url="*" negate="false" />
                <conditions logicalGrouping="MatchAny" trackAllCaptures="false">
                      <add input="{HTTPS}" pattern="off" />
                  </conditions>
                <action type="Redirect" url="https://{HTTP_HOST}/{R:1}" redirectType="Temporary" />
            </rule>
          </rules>
        </rewrite>
    </system.web>

So what's going on in the snippet above?

In the first line, we are defining the name of the rule which can be viewed inside of `inetmgr (IIS Manager)`; saying which pattern style we are going to use (either regex or wildcard) and saying that we want to stop at this rule and return the response to the client. Next up, we give our matching criteria which we have wildcarded to match all requests. Then we have added a condition which takes a server variable (`{HTTPS}` which indicates whether or not this request has been delivered over a secure connection), and made sure we only track insecure requests.

*With conditions inside of a rule, you can match a single entry in the condition set or all the conditions within the set. Use either `MatchAny` or `MatchAll` depending on your needs.*

Finally, we define the action that we wish to take if both the `match` and `conditions` sections have been satisfied. The action `type` can be `Redirect` or `Rewrite` depending on your needs. We wish to redirect a user to a secure connection, so we define the type as `Redirect` and the url equal to a secure connection to the host requested with the original path & query appended. The final attribute is the redirect type which can be one of the following:

- Permenant: [A HTTP 301 Response](https://httpstatuses.com/301)
- Found: [A HTTP 302 Response](https://httpstatuses.com/302)
- SeeOther: [A HTTP 303 Response](https://httpstatuses.com/303)
- Temporary: [A HTTP 307 Response](https://httpstatuses.com/307)

That's it! Hopefully this article gives you everything that you need to get HTTP to HTTPS redirects working without 

## Other Posts In This Series

1. [Up and running with URL Rewrite - going from HTTP to HTTPS](/article/2017/06/up-and-running-with-url-rewrite---going-from-http-to-https/) *(This Post)*
2. [Canonical host urls with URL Rewrite](/article/2017/06/canonical-host-urls-with-url-rewrite/)
3. [Removing trailing slashes with URL Rewrite](/article/2017/06/removing-trailing-slashes-with-url-rewrite/)
4. [Ensuring httpOnly cookies with URL Rewrite](/article/2017/06/ensuring-httponly-cookies-with-url-rewrite/)
5. [Ensuring secure cookies with URL Rewrite](/article/2017/06/ensuring-secure-cookies-with-url-rewrite/)
6. [Ensuring samesite cookies with URL Rewrite](/article/2017/06/ensuring-samesite-cookies-with-url-rewrite/)