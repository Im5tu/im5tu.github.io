{
    "title": "Using Certificates From AWS Private Certificate Authority in .NET",
    "description": "As companies grow, moving to a zero-trust architecture is majorly important. This article explores how to build it in AWS.",
    "tags": ["aspnet", "dotnet", "AWS"],
    "date": "2021-01-17T11:43:01Z",
    "categories": ["Development"],
    "toc": true
}

As more and more companies get hacked, there is a strong resurgence in the community for the desire to have TLS for everything, everywhere. There are many valuable projects, tools and resources, such as [LetsEncrypt](https://letsencrypt.org/) available to help both individuals & companies secure their resources. One of those tools is AWS Private Certificate Authority.

<!--more-->

Traditionally, running a private certificate authority has been costly but this paradigm has changed with the advent of free certificate authorities and cloud-based offerings. But why would we want to run our own still? One of the main reasons is that some networks are private in nature, much like the majority of banking networks, and clouds like AWS will not issue certificates for private networks unless you have your own AWS Private Certificate Authority instance.

## What is AWS Private Certificate Authority?

AWS Private Certificate Authority provides you a highly-available private Certificate Authority service without the ongoing maintenance costs of operating your own private Certificate Authority. It extends ACM’s certificate management capabilities to both public and private certificates. AWS Private Certificate Authority allows developers to be more agile by providing them APIs to create and deploy private certificates programmatically. You also have the flexibility to create private certificates for applications that require custom certificate lifetimes or resource names. With ACM Private Certificate Authority, you can create and manage private certificates for your connected resources in one place with a secure, pay as you go, managed private Certificate Authority service. _[Source](https://aws.amazon.com/certificate-manager/private-certificate-authority/)._

## Exporting a certificate from AWS Private Certificate Authority

This article assumes that you already have a certificate issued from your Private Certificate Authority and you have the ARN available. There are a few different that we need to implement to our certificate loader:

1. A class that's going to load certificates from AWS PCA ACM;
2. A instance of `IPasswordFinder` so that BouncyCastle can read the exported PEM file;
3. A few handy [extension methods](/article/2012/12/extension-methods-in-dotnet/) for hooking up the exported certificate with Kestrel

In order to export and read the certificates, we are going to need to install the following packages:

```xml
<ItemGroup>
    <PackageReference Include="AWSSDK.CertificateManager" Version="3.3.101.48" />
    <PackageReference Include="Portable.BouncyCastle" Version="1.8.6" />
</ItemGroup>
```

We are going to be using `AWSSDK.CertificateManager` to export the certificate from AWS Private Certificate Authority and `Portable.BouncyCastle` to read the exported PEM file, turning it into a `X509Certificate2` that we can push into the Kestrel webserver. First, we are going to create our interface which will allow us to swap out the implementation later for testing purposes, should that be desired:

```csharp
public interface ICertificateAuthorityLoader
{
    Task<X509Certificate2> LoadCertificateAsync(string certificateArn);
}
```

Next, we have the implementation itself:

```csharp
internal sealed class DefaultCertificateAuthorityLoader : ICertificateAuthorityLoader
{
    private IAmazonCertificateManager _certificateManager;

    public DefaultCertificateAuthorityLoader() : this(new AmazonCertificateManagerClient())
    {
    }

    public DefaultCertificateAuthorityLoader(IAmazonCertificateManager certificateManager)
    {
        _certificateManager = certificateManager;
    }

    public async Task<X509Certificate2> LoadCertificateAsync(string certificateArn)
    {
        var pwd = Guid.NewGuid().ToString("N");
        using var passphrase = new MemoryStream(Encoding.UTF8.GetBytes(pwd));

        // Get the certificate from PCA
        var exportedCert = await _certificateManager.ExportCertificateAsync(new ExportCertificateRequest
        {
            CertificateArn = certificateArn,
            Passphrase = passphrase
        });

        byte[] certBytes = Encoding.ASCII.GetBytes(exportedCert.Certificate);
        var cert = new X509Certificate2(certBytes, pwd);

        // Ensure that the private key is loaded
        var privateKey = DecodePrivateKey(exportedCert.PrivateKey, pwd);
        cert = cert.CopyWithPrivateKey(DotNetUtilities.ToRSA(privateKey.rsaPrivatekey));

        return cert;
    }

    private static (AsymmetricCipherKeyPair keyPair, RsaPrivateCrtKeyParameters rsaPrivatekey) DecodePrivateKey(string encryptedPrivateKey, string password)
    {
        TextReader textReader = new StringReader(encryptedPrivateKey);
        PemReader pemReader = new PemReader(textReader, new PasswordFinder(password));
        object privateKeyObject = pemReader.ReadObject();
        RsaPrivateCrtKeyParameters rsaPrivatekey = (RsaPrivateCrtKeyParameters)privateKeyObject;
        RsaKeyParameters rsaPublicKey = new RsaKeyParameters(false, rsaPrivatekey.Modulus, rsaPrivatekey.PublicExponent);
        AsymmetricCipherKeyPair kp = new AsymmetricCipherKeyPair(rsaPublicKey, rsaPrivatekey);
        return (kp, rsaPrivatekey);
    }
}
```

The `LoadCertificateAsync` method is the primary workhorse for exporting the certificate. We generate a random GUID, which could be swapped out for a more secure method, as a temporary password as one will need to be supplied when we call the AWS Private Certificate Authority API. This password is then added to the `ExportCertificateRequest` that we generate before we request that the certificate is exported. There are a couple of points where this could fail:

- We didn't supply a password
- The certificate is unavailable
- The certificate was not issued by an AWS Private Certificate Authority. This is probably going to be the most common case in my experience. Only AWS Private Certificate Authority issued certificates can be exported with the private key, which is needed to load the certificate into Kestrel

Asuming that our request was successful, we have a property called `Certificate` which we can pass straight into a new `X509Certificate2` instance. This **does not** contain the private key, so we need to use BouncyCastle to parse the private key from a secondary property on the response object, which is fortunately called `PrivateKey`. As this primary key is secured, we need to use BouncyCastle's `PemReader` in order to read the private key, supplying the password via an instance of `IPasswordFinder`, which you can see below. From here, it can then be converted to an `AsymmetricCipherKeyPair`. Finally, we can use the `CopyWithPrivateKey` to create a new instance of the `X509Certificate2` certificate, but this time with the private key. This can then be loaded into Kestrel to secure web requests.

For completeness, here is the implementation of `IPasswordFinder` that I used which simply converts the plaintext password into a char array:

```csharp
internal sealed class PasswordFinder : IPasswordFinder
{
    private string _password;

    public PasswordFinder(string password)
    {
        _password = password;
    }

    public char[] GetPassword()
    {
        return _password.ToCharArray();
    }
}
```

Finally, we have a series of [extension methods](/article/2012/12/extension-methods-in-dotnet/) that allow us to hook up our application in various ways. There's not too much to explain here, as this is hooking up our code above with the Kestrel webserver:

```csharp
/// <summary>
///     Extensions for configuration of a Kestrel Web Server
/// </summary>
public static class HostingExtensions
{
    /// <summary>
    ///     Loads a certificate from a Private Certificate Authority instance, based on ARN.
    /// </summary>
    public static IWebHostBuilder UseHttpsCertificateFromPCA(this IWebHostBuilder builder, IConfiguration configuration, IAmazonCertificateManager? certificateManagerClient = null)
    {
        builder.ConfigureKestrel(server => server.UseHttpsCertificateFromPCA(configuration, certificateManagerClient));
        return builder;
    }

    /// <summary>
    ///     Loads a certificate from a Private Certificate Authority instance, based on ARN.
    /// </summary>
    public static IWebHostBuilder UseHttpsCertificateFromPCA(this IWebHostBuilder builder, string arnOrEnvironmentVar, IAmazonCertificateManager? certificateManagerClient = null)
    {
        builder.ConfigureKestrel(server => server.UseHttpsCertificateFromPCA(arnOrEnvironmentVar, certificateManagerClient));
        return builder;
    }

    /// <summary>
    ///     Loads a certificate from a Private Certificate Authority instance, based on ARN.
    /// </summary>
    public static KestrelServerOptions UseHttpsCertificateFromPCA(this KestrelServerOptions options, IConfiguration configuration, IAmazonCertificateManager? certificateManagerClient = null)
    {
        return options.UseHttpsCertificateFromPCA(configuration.GetValue<string>("CertificateArn"), certificateManagerClient);
    }

    /// <summary>
    ///     Loads a certificate from a Private Certificate Authority instance, based on ARN.
    /// </summary>
    public static KestrelServerOptions UseHttpsCertificateFromPCA(this KestrelServerOptions options, string arnOrEnvironmentVar, IAmazonCertificateManager? certificateManagerClient = null)
    {
        if (string.IsNullOrWhiteSpace(arnOrEnvironmentVar))
            throw new ArgumentNullException(nameof(arnOrEnvironmentVar));

        if (!arnOrEnvironmentVar.StartsWith("arn:"))
        {
            var arn = Environment.GetEnvironmentVariable(arnOrEnvironmentVar);

            if (string.IsNullOrWhiteSpace(arnOrEnvironmentVar))
                throw new ArgumentException($"Cannot load the details of the arn from the environment variable '{arnOrEnvironmentVar}'. Please check the environment variable is set and is not null, empty or whitespace.");

            if (arn?.StartsWith("arn:") != true)
                throw new ArgumentException("The specified arn was loaded from the environment variable but does not meet the required format");

            arnOrEnvironmentVar = arn;
        }

        // Yes async in sync method sucks, but the client only has a async method on it...
        var certificate = (certificateManagerClient is null ? new DefaultCertificateAuthorityLoader() : new DefaultCertificateAuthorityLoader(certificateManagerClient)).LoadCertificateAsync(arnOrEnvironmentVar).Result;

        return options.UseHttpsCertificate(certificate);
    }

    /// <summary>
    ///    Configures the kestrel web server with the specified certificate
    /// </summary>
    public static IWebHostBuilder UseHttpsCertificate(this IWebHostBuilder builder, X509Certificate2 certificate)
    {
        builder.ConfigureKestrel(server => server.UseHttpsCertificate(certificate));
        return builder;
    }

    /// <summary>
    ///    Configures the kestrel web server with the specified certificate
    /// </summary>
    public static KestrelServerOptions UseHttpsCertificate(this KestrelServerOptions options, X509Certificate2 certificate)
    {
        options.ConfigureHttpsDefaults(o => o.ServerCertificate = certificate);
        return options;
    }
}
```

Unfortunately, the configuration above does rely on the use of asynchronous invocation in a synchronous context, which we can't do too much about because of the differences between the SDK and the way Kestrel is built. Our usage of the extensions is as follows:

```csharp
public static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(webBuilder => {
            webBuilder.UseStartup<Startup>()
                .UseHttpsCertificateFromPCA("arn:aws:acm:eu-west-1:**************:certificate/**********");
        });
```

or:

```csharp
public static IHostBuilder CreateHostBuilderAlt(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(webBuilder =>
        {
            webBuilder.ConfigureKestrel((context, options) => options.UseHttpsCertificateFromPCA(context.Configuration))
                .UseStartup<Startup>();
        });
```

After this, you should be able to use a certificate from AWS Private Certificate Authority inside your application. Enjoy!
