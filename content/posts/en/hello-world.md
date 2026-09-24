---
title: "Hello, world: how this site was built"
date: 2025-10-01
tags: [meta, cloudflare, tutorial]
excerpt: "A zero-dependency static site, Cloudflare Pages and a custom domain — free, with automatic HTTPS."
---

First post on the new site. Since I just finished building it, here is the whole story — including why I chose this stack and what tripped me up.

## Why static

My requirements were modest:

- Show my work and my writing
- Load fast on phones
- No server bill, no database to maintain

A static site covers all three. Every page is already a finished HTML file at build time, so a visit is just a file download. No database, no backend process — and nothing that can fall over at 3 a.m.

## The stack

- **Build**: a few dozen lines of Node that turn Markdown into HTML, with zero third-party dependencies
- **Hosting**: Cloudflare Pages — free, global CDN, automatic HTTPS
- **Comments**: Giscus on top of GitHub Discussions, so there is no comment backend to write
- **Domain**: pointed straight at Pages, with DNS already on Cloudflare

## The smallest possible example

The core of the build is roughly this:

```js
const html = renderMarkdown(markdown);
await writeFile("dist/index.html", wrap(html), "utf8");
```

That is it. No bundler, no dependency tree. Run `node build.mjs` and the site exists.

## Takeaway

Fewer tools means fewer things that break. This site has exactly three concepts: **content** (Markdown), **templates** (a few JS files) and **build** (one script).

> Next up: why a bilingual site is worth the trouble, and how to keep two languages from fighting each other.
