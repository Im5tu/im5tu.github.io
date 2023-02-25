{
    "categories": [ "Development", "Building a blog" ],
    "date": "2016-12-29T20:25:58Z",
    "description": "A very quick look at how to inline a css file using Hugo static site generator.",
    "tags": ["hugo", "blog", "Quick Tips"],
    "title": "Hugo Quick Tip: Inlining Css Files",
    "toc": true
}

Today I have been doing a little bit of work on my site and one of the things that I wanted to do is inline the css file. It's quite a small file anyway, and once compressed with gzip should make a fairly minimal difference to the size of the page.
<!--more-->
## The `readFile` function

In Hugo, the `readFile` function looks for a file relative to the current project working directory and returns it as a string. If we had a file located at: `<root>/static/css/site.css`, then we could render the file out like so:

    <style>{ {- renderFile "/static/css/site.css" -} }</style>

**NB:** *Remember to close the squiggly brackets so that Hugo renders it correctly.*

There is a gotcha with this approach so far. Hugo will try and do its thing with the resultant string and what you will end up with is something along the lines of:

    <script>ZgotmplZ</script>

as opposed to your intented css contents. Luckily, there is a piped method that we can use to sort this out for us:

    <style>{ {- renderFile "css/site.css" | safeCss -} }</style>

## Reading a hashed file

As you may recall in [my previous Hugo post](/article/2016/11/blog-building---part-4---frontend/), I setup my css files with cache busting capabilites by appending the hash onto the filename. In order to render this as part of the HTML, we need a few things:

- Find the name of the hashed file
- Build the file path
- Call readFile

In order to get the hashed file name, we can inspect the site's data sources, looking for the file name (requires post mentioned above):

    {{ $siteCssHash := (index .Site.Data.hash "site.css")}}

Next, we need to build up the correct file path. Note, this is the file path prior to rendering:

    {{ $siteCssPath := (printf "/static/css/%s" $siteCssHash) }}

Finally, we need to call `readFile` and ensure that it is marked as a safe css string:

    <style>{{- readFile $siteCssPath | safeCSS -}}</style>

So putting the three together:

    {{ $siteCssHash := (index .Site.Data.hash "site.css")}}
    {{ $siteCssPath := (printf "/static/css/%s" $siteCssHash) }}
    <style>{{- readFile $siteCssPath | safeCSS -}}</style>

And that's it. When the page reloads/is rebuilt, your pages should now contain inlined css. You can view this [exact commit here](https://github.com/Im5tu/im5tu-hugo/blob/84ee887616acbe6cfef7e37b0dc9b4779aad31fd/layouts/partials/header/styles.html).
