---
title: "你好，世界：这个网站是怎么搭起来的"
date: 2026-09-10
tags: [建站, Cloudflare, 教程]
excerpt: "从零开始：零依赖静态网站 + Cloudflare Pages + 自定义域名，全程免费，自动 HTTPS。"
---

这是这个网站的第一篇文章。趁着刚把它搭好，我把整个过程记下来——包括为什么这么选，以及踩过的坑。

## 为什么要做成静态站

我的需求其实很朴素：

- 展示作品和文章
- 手机访问要快
- 不想付服务器钱，也不想维护数据库

静态站刚好全部满足：所有页面在构建时就已经是最终的 HTML 文件，访客访问时只是下载文件。没有数据库、没有后端进程，也就没有可以挂掉的东西。

## 技术选择

- **构建**：一个几十行的 Node 脚本，把 Markdown 转成 HTML，零第三方依赖
- **托管**：Cloudflare Pages，免费、自带全球 CDN 和自动 HTTPS
- **评论**：Giscus，基于 GitHub Discussions，不需要自己写后端
- **域名**：直接指向 Pages，DNS 也在 Cloudflare，配置只要点几下

## 一个最小例子

整个构建的核心逻辑大概是这样：

```js
const html = renderMarkdown(markdown);
await writeFile("dist/index.html", wrap(html), "utf8");
```

就这么简单。没有打包器，没有依赖树，`node build.mjs` 一跑，网站就出来了。

## 小结

工具越少，坏掉的地方就越少。这个站现在只有三个概念：**内容**（Markdown）、**模板**（几个 JS 文件）、**构建**（一个脚本）。

> 下一篇我会写写为什么值得做中英双语，以及怎么让两种语言互不打架。
