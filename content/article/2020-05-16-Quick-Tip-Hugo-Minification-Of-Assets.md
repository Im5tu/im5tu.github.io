{
    "title": "Quick Tip: Minification of assets with Hugo",
    "description": "This article",
    "tags": ["hugo", "blogging", "Quick Tips"],
    "date": "2020-05-16T13:00:00",
    "categories": [ "Development", "Building a blog" ]
}

Today, I have been doing a general tidy up of my blog repository. One of the things that I decided to do, was reduce the overall amount of whitespace in the generated html files.
<!--more-->

Reducing the overall amount of data that's needed for an asset is called _minification_. Reducing the amount of data that's required should not remove it where it will affect the rending of a webpage, eg: a preformatted code block. We minimise assets to improve the overall performance of downloading that asset. This can help improve page load speed for lower-bandwidth situations like mobile devices.

With hugo, you generate your site using the following command:

```bash
hugo
```

This outputs the static site on your behalf. To minify the HTML output, simply change the above command to:

```bash
hugo --minify
```

That's it. The only thing that's left to do is to publish your website. 

Should you need it, Hugo also allows you to minify any CSS, JS, JSON, SVG or XML resource. To minify a resource, you need to pipe it to `resources.Minify` like this:

```bash
{{ $css := resources.Get "css/main.css" }}
{{ $style := $css | resources.Minify }}
```

Happy Hugo-ing!