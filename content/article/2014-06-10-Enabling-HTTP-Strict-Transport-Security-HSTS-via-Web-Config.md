{
   "categories": [ "Development" ],
   "date": "2014-06-10T18:19:47Z",
   "description": "This post describes how to enable HTTP Strict Transport Security (HSTS) via a web configuration file",
   "tags": [ "csharp", "dotnet", "mvc" ],
   "title": "Enabling HTTP Strict Transport Security HSTS via Web Config"
}

In my previous post, I discussed how to [enable HSTS via MVC Action Filters](/article/2014/04/enabling-http-strict-transport-security-hsts-via-asp-net-mvc-actionfilters/). I thought that I would just do a follow up post showing you how to enable it via the web.config. <!--more-->

In order to do this via a web configuration file, you must be running IIS 7.0 or higher, [according to this compatability chart](http://www.iis.net/configreference/system.webserver/httpprotocol/customheaders#002). The reason for this, is that the `HttpProtocol` element was added in IIS 7.0. This is the element that is responsible for generating custom headers.

Below is a small sample configuration that enables a custom header called `Header Name` with the value `Header Value`:

	<configuration>
	  <system.webServer>
		<httpProtocol>
		  <customHeaders>
			<add name="Header Name" value="Header Value" />
		  </customHeaders>
		</httpProtocol>
	  </system.webServer>
	</configuration>

In order to enable HSTS, we need to change the header name to be `Strict-Transport-Security` and the value to be `max-age=x` (where x is, replace with the maximum age in seconds). If you wish to enable this for sub-domains as well, append `; includeSubDomains` to the header value. 

The end result for enabling HSTS with a 300 second limit is:

	<configuration>
	  <system.webServer>
		<httpProtocol>
		  <customHeaders>
			<add name="Strict-Transport-Security" value="max-age=300" />
		  </customHeaders>
		</httpProtocol>
	  </system.webServer>
	</configuration>

Including the sub-domain protection:

	<configuration>
	  <system.webServer>
		<httpProtocol>
		  <customHeaders>
			<add name="Strict-Transport-Security" value="max-age=300; includeSubDomains" />
		  </customHeaders>
		</httpProtocol>
	  </system.webServer>
	</configuration>