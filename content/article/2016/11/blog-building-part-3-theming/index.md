---
title: "Blog Building - Part 3 - Theming"
description: Setting up a theme and creating our first article using hugo and bones
date: 2016-11-18T19:01:38Z
toc: true
includeInSitemap: true
series: "Building A Blog With Hugo"
tags:
- hugo
---

In this article, I will show you how the theme has been constructed and show you how the overrides work. So far we have created a site, setup most of our workflow and posted our first article.
<!--more-->

When we installed the theme in the previous post, a series of conventions took over and began the process of rending our pages for us. Because hugo is convention based, we can override the defaults by placing files in the correct place, but first we need to understand the layout. Below you can see the parts of the website that we care about the most:

``` powershell
/root
    /archetypes
    /content
    /layouts
    /static
    /themes
        /themeA
            /archetypes
            /layouts
                /_default
                /indexes
                /partials
                /taxonomy
            index.html
        /themeB
            <as above>
```

## Defaults

When hugo begins to render a site, the configuration is checked to see if there is a theme configured. If a theme is configured, it looks for that theme under the `themes` directory by checking for a `theme.toml` file under each sub-directory. If one of the `theme.toml` files contains the correct theme name, that theme is loaded and the used as the default for the rest of the rending.

From the directory listing above, you will notice that there are two `layouts` folders. One under the site root and one under themeA. As far as I am aware, the layout of each `layouts` folder is identical. This means that if your theme defines something under `/root/themes/themeA/layouts/_default/list.html` we can override it by placing a file in `/root/layouts/_default/list.html`.

Now that we know this, we can customise the theme how we see fit.

## Rendering

Before continuing, I strongly recommend that you read the [Go Template Primer](http://gohugo.io/templates/go-templates/) created by the hugo team. Don't worry, i'll wait.

### baseOf

A theme creator may decide, like I have for bones, to create a `baseOf` file under the `/root/themes/<theme name>/_default/` folder. This special file allows you to create a master layout, keeping your theme nice and clean. Inside of file, you can define blocks which another page can also define and implement. What happens here is that the `baseOf` file says "You can configure this section called ABC". Then inside of another file, eg: article/full.html, we can say "I want to configure section called ABC and here is what it should contain". In hugo speak, this is called [Block Templates](http://gohugo.io/templates/blocks/) and is how the whole of the bones theme is configured.

You can see an example of this [here](https://github.com/Im5tu/hugo-bones/blob/master/layouts/_default/baseof.html).

### .Render

The [.Render](http://gohugo.io/templates/functions/#render) function is a special kind of function that you can call when rendering a list. It's like rendering a partial view but for the current item in an enumeration.

``` go
{{ range .Data.Pages }}
    {{ .Render "summary"}}
{{ end }}
```

The above sample will inspect the page data and enumerate all the available pages associated with the current page before calling render on each item. C#/Java would look something like:

``` c#
foreach(var page in this.Data.Pages)
    Render("summary", currentItem);
```

You can see an example of this [here](https://github.com/Im5tu/hugo-bones/blob/master/layouts/article/list.html#L4).

### partial

[Partial templates](http://gohugo.io/templates/partials/) are often used to separate out sections of a site into reusable components. The main difference between `partial` and `.Render` is that partial can be used to render whole sections of a site with a specific context where is `.Render` is limited to the current item in an enumeration.

``` go
<body>
{{ block "content" . -}} {{- end }}
{{- partial "header/scripts" . -}}
</body>
```

The above [example from the baseOf file from bones](https://github.com/Im5tu/hugo-bones/blob/master/layouts/_default/baseof.html) does the following:

- Says to the theming engine that it wants to declare an overridable section content, passing in the current page context
- Render the partial called `scripts`, located under the `header` folder, inside of the `partials` folder, supplying the current page context

All partials are located under `<root/theme>/layouts/partials/<path>`. Where `<path>` is the folder structure to the file.

You can see an example of this [here](https://github.com/Im5tu/hugo-bones/blob/master/layouts/_default/baseof.html).

## Archetypes

Archetypes are really just a fancy way of saying content types. A theme can define them for you, or you can define your own like I have for the bones theme.

You can see an example of that [here](https://github.com/Im5tu/hugo-bones/blob/master/archetypes/article.md)

## The Static

Anything under the static folder, will get copied across to the main site when it gets rendered. This behaved slightly differently than I expected when I first tried this out. I had a file located under `/root/static/img/img1.jpg`. When I attempted to render an image tag on the page with the src set to `/static/img/img1.jpg` it didn't work. When I rendered the files to disk by calling `hugo` and checking the public folder, I could see that it rendered the image under `/img/img1.jpg`. Slightly different that what I was expecting, but it still worked nevertheless.

Hopefully you will now have a basic understanding of how a theme is constructed so that you can roll your own and override portions of the theme you have selecting. Next up, I will setup my frontend pipeline of choice so that I can start applying styling to my site.
