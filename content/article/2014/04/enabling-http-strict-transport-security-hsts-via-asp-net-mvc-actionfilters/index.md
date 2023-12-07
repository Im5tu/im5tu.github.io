---
title: Enabling HTTP Strict Transport Security HSTS via ASP Net MVC ActionFilters
description: This post describes how to enable HSTS in ASP.Net MVC using an ActionFilter
date: 2014-04-21T18:19:47Z
toc: true
includeInSitemap: true
tags:
- dotnet
---

After reading [Troy Hunt's](http://www.troyhunt.com/) free ebook on the [OWASP Top 10 for .Net Developers](http://www.troyhunt.com/2011/12/free-ebook-owasp-top-10-for-net.html), I discovered an additional mechanism to help developers secure their websites. That mechanism is HTTP Strict Transport Security.<!--more-->

>HTTP Strict Transport Security (HSTS) is an opt-in security enhancement that is specified by a web application through the use of a special response header. Once a supported browser receives this header that browser will prevent any communications from being sent over HTTP to the specified domain and will instead send all communications over HTTPS. It also prevents HTTPS click through prompts on browsers. The specification has been released and published end of 2012 as [RFC 6797](https://tools.ietf.org/html/rfc6797). [Source](https://www.owasp.org/index.php/HTTP_Strict_Transport_Security)

There are three main categories of attacks that are addressed in this specification: Passive Network Attacks, Active Network Attacks and Web Site Development & Deployment Bugs. These are present in [RFC 6797 - Section 2.3.1](https://tools.ietf.org/html/rfc6797) but are re-produced here.

## Passive Network Attacks

>When a user browses the web on a local wireless network (e.g., an
   802.11-based wireless local area network) a nearby attacker can
   possibly eavesdrop on the user's unencrypted Internet Protocol-based
   connections, such as HTTP, regardless of whether or not the local
   wireless network itself is secured [BeckTews09].  Freely available
   wireless sniffing toolkits (e.g., [Aircrack-ng]) enable such passive
   eavesdropping attacks, even if the local wireless network is
   operating in a secure fashion.  A passive network attacker using such
   tools can steal session identifiers/cookies and hijack the user's web
   session(s) by obtaining cookies containing authentication credentials
   [ForceHTTPS].  For example, there exist widely available tools, such
   as Firesheep (a web browser extension) [Firesheep], that enable their
   wielder to obtain other local users' session cookies for various web
   applications.

>To mitigate such threats, some web sites support, but usually do not
   force, access using end-to-end secure transport -- e.g., signaled
   through URIs constructed with the "https" scheme [RFC2818].  This can
   lead users to believe that accessing such services using secure
   transport protects them from passive network attackers.
   Unfortunately, this is often not the case in real-world deployments,
   as session identifiers are often stored in non-Secure cookies to
   permit interoperability with versions of the service offered over
   insecure transport ("Secure cookies" are those cookies containing the
    "Secure" attribute [RFC6265]).  For example, if the session
   identifier for a web site (an email service, say) is stored in a
   non-Secure cookie, it permits an attacker to hijack the user's
   session if the user's UA makes a single insecure HTTP request to the
   site.

## Active Network Attacks

>A determined attacker can mount an active attack, either by
   impersonating a user's DNS server or, in a wireless network, by
   spoofing network frames or offering a similarly named evil twin
   access point.  If the user is behind a wireless home router, an
   attacker can attempt to reconfigure the router using default
   passwords and other vulnerabilities.  Some sites, such as banks, rely
   on end-to-end secure transport to protect themselves and their users
   from such active attackers.  Unfortunately, browsers allow their
   users to easily opt out of these protections in order to be usable for sites that incorrectly deploy secure transport, for example by
   generating and self-signing their own certificates (without also
   distributing their certification authority (CA) certificate to their
   users' browsers).

## Website Development & Deployment Bugs

>The security of an otherwise uniformly secure site (i.e., all of its
   content is materialized via "https" URIs) can be compromised
   completely by an active attacker exploiting a simple mistake, such as
   the loading of a cascading style sheet or a SWF (Shockwave Flash)
   movie over an insecure connection (both cascading style sheets and
   SWF movies can script the embedding page, to the surprise of many web
   developers, plus some browsers do not issue so-called "mixed content
   warnings" when SWF files are embedded via insecure connections).
   Even if the site's developers carefully scrutinize their login page
   for "mixed content", a single insecure embedding anywhere on the
   overall site compromises the security of their login page because an
   attacker can script (i.e., control) the login page by injecting code
   (e.g., a script) into another, insecurely loaded, site page.

   >NOTE:  "Mixed content" as used above (see also Section 5.3 in
          [W3C.REC-wsc-ui-20100812]) refers to the notion termed "mixed
          security context" in this specification and should not be
          confused with the same "mixed content" term used in the
          context of markup languages such as XML and HTML.

## Implementation Details

Implementing the HSTS from the web server is simply a case of having the site running over HTTPS and appending a single header onto the response. The header required is:

    Strict-Transport-Security: max-age=300

Alternatively, if you wish the security to cover all sub-domains of your site, then the header is:

    Strict-Transport-Security: max-age=300; includeSubDomains

*Where 300 is, replace with the duration in seconds.*

## Implementing HSTS as an action filter

The implementation that I provide below **SHOULD** be used alongside the `RequireHttpsAttribute` in order to have the specification fully implemented. The reason is that the header will only be sent over a secure connection, if not already present. Furthermore, the `RequireHttpsAttribute` already takes care of the redirection to a secure connection, so this is not something that I have to worry about implementing correctly.

## Browser support

- Chromium and Google Chrome since version 4.0.211.0
- Firefox since version 4; with Firefox 17, Mozilla integrates a list of websites supporting HSTS
- Opera since version 12
- Safari as of OS X Mavericks
-Internet Explorer does not support HSTS, but is expected to support it in the next major release after IE 11
