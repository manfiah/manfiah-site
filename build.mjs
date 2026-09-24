/**
 * 构建脚本：把 content/ + src/ 生成到 dist/
 * 用法：node build.mjs
 * 零外部依赖，只用 Node 自带模块。
 */
import { readFile, writeFile, mkdir, rm, readdir, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

import site from "./site.config.mjs";
import { renderDocument, renderRoot, giscusBlock, iconSvg, href } from "./src/layout.mjs";
import { parseFrontmatter, renderMarkdown, plainText, escapeHtml } from "./src/md.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, "dist");
const SRC = join(HERE, "src");
const CONTENT = join(HERE, "content");
const LANGS = ["zh", "en"];

const UI = {
  zh: {
    projectsAll: "全部项目",
    projectsTitle: "作品集",
    projectsIntro: "我做过的项目、小工具和实验。",
    latestPosts: "最新文章",
    allPosts: "全部文章",
    blogTitle: "博客",
    blogIntro: "记录做过的事、踩过的坑和一些想法。",
    featured: "精选项目",
    viewAll: "查看全部",
    readMore: "阅读全文",
    aboutTitle: "关于我",
    contactTitle: "联系我",
    contactText: "想聊聊合作、工作机会，或只是打个招呼？发邮件给我。",
    sendMail: "写邮件给我",
    backToBlog: "← 返回博客列表",
    published: "发布于",
    notFoundTitle: "页面走丢了",
    notFoundText: "你访问的页面不存在，或者已经移动。",
    backHome: "回到首页",
    viewProject: "查看项目",
    viewCode: "源码",
  },
  en: {
    projectsAll: "All projects",
    projectsTitle: "Projects",
    projectsIntro: "Things I have built, shipped or experimented with.",
    latestPosts: "Latest posts",
    allPosts: "All posts",
    blogTitle: "Blog",
    blogIntro: "Notes on what I built, what broke, and what I learned.",
    featured: "Featured work",
    viewAll: "View all",
    readMore: "Read more",
    aboutTitle: "About",
    contactTitle: "Get in touch",
    contactText: "Want to collaborate, hire me, or just say hi? Send an email.",
    sendMail: "Email me",
    backToBlog: "← Back to blog",
    published: "Published on",
    notFoundTitle: "Page not found",
    notFoundText: "The page you are looking for does not exist or has moved.",
    backHome: "Back home",
    viewProject: "View project",
    viewCode: "Source",
  },
};

const written = [];

async function emit(relPath, content) {
  const full = join(DIST, relPath);
  await mkdir(dirname(full), { recursive: true });
  await writeFile(full, content, "utf8");
  written.push(relPath);
}

async function readMarkdownDir(dir) {
  if (!existsSync(dir)) return [];
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  const posts = [];
  for (const file of files) {
    const raw = await readFile(join(dir, file), "utf8");
    const { data, content } = parseFrontmatter(raw);
    const slug = data.slug || basename(file, ".md");
    posts.push({
      slug,
      title: data.title || slug,
      date: data.date || "",
      tags: Array.isArray(data.tags) ? data.tags : data.tags ? [data.tags] : [],
      excerpt: data.excerpt || plainText(content, 150),
      body: content,
    });
  }
  posts.sort((a, b) => String(b.date).localeCompare(String(a.date)));
  return posts;
}

function formatDate(iso, lang) {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  if (lang === "zh") return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

/** 标签 chip 组 */
function tagChips(list) {
  if (!list?.length) return "";
  return `<div class="chip-row">${list
    .map((t) => `<span class="chip">${escapeHtml(t)}</span>`)
    .join("")}</div>`;
}

function projectCard(project, lang) {
  const title = project.title?.[lang] ?? project.title?.zh ?? "";
  const summary = project.summary?.[lang] ?? project.summary?.zh ?? "";
  const primary = project.link || project.repo;
  const inner = `<div class="card__icon">${iconSvg(project.icon || "work")}</div>
      <h3 class="card__title">${escapeHtml(title)}</h3>
      <p class="card__text">${escapeHtml(summary)}</p>
      ${tagChips(project.tags)}
      <div class="card__meta">
        ${project.year ? `<span>${escapeHtml(String(project.year))}</span>` : ""}
        ${
          primary
            ? `<span class="card__cta">${escapeHtml(
                project.link ? UI[lang].viewProject : UI[lang].viewCode,
              )}${iconSvg("external", 16)}</span>`
            : ""
        }
      </div>`;

  if (!primary) return `<article class="card">${inner}</article>`;
  const external = /^https?:/i.test(primary);
  return `<a class="card card--link" href="${primary}"${
    external ? ' target="_blank" rel="noopener noreferrer"' : ""
  }>${inner}</a>`;
}

/** 首页 */
function homePage({ site, lang, projects, posts }) {
  const ui = UI[lang];
  return `<section class="hero">
  <div class="container hero__inner">
    <img class="hero__avatar" src="${site.avatar}" alt="${escapeHtml(site.author)}" width="128" height="128">
    <div class="hero__text">
      <p class="hero__eyebrow">${escapeHtml(site.domain)}</p>
      <h1 class="hero__title">${escapeHtml(site.author)}</h1>
      <p class="hero__tagline">${escapeHtml(site.tagline[lang])}</p>
      <p class="hero__intro">${escapeHtml(site.intro[lang])}</p>
      <div class="hero__actions">
        <a class="btn btn--filled" href="${href(lang, "projects/")}">${iconSvg("work", 20)}${escapeHtml(
          ui.projectsTitle,
        )}</a>
        <a class="btn btn--outlined" href="${href(lang, "blog/")}">${iconSvg("article", 20)}${escapeHtml(
          ui.blogTitle,
        )}</a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section__head">
      <h2 class="section__title">${escapeHtml(ui.featured)}</h2>
      <a class="section__link" href="${href(lang, "projects/")}">${escapeHtml(ui.viewAll)} →</a>
    </div>
    <div class="grid">
      ${projects.slice(0, 3).map((p) => projectCard(p, lang)).join("\n      ")}
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section__head">
      <h2 class="section__title">${escapeHtml(ui.latestPosts)}</h2>
      <a class="section__link" href="${href(lang, "blog/")}">${escapeHtml(ui.allPosts)} →</a>
    </div>
    ${
      posts.length
        ? `<ul class="post-list">${posts.slice(0, 3).map((p) => postItem(p, lang)).join("")}</ul>`
        : `<p class="comments__note">${lang === "zh" ? "还没有文章。" : "No posts yet."}</p>`
    }
  </div>
</section>`;
}

function postItem(post, lang) {
  return `<li class="post-item">
      <span class="post-item__date">${escapeHtml(formatDate(post.date, lang))}</span>
      <h3 class="post-item__title"><a href="${href(lang, `blog/${post.slug}/`)}">${escapeHtml(post.title)}</a></h3>
      <p class="post-item__excerpt">${escapeHtml(post.excerpt)}</p>
    </li>`;
}

/** 关于页 */
function aboutPage({ site, lang, bodyHtml }) {
  const ui = UI[lang];
  return `<article class="container">
  <header class="page-head">
    <h1 class="page-head__title">${escapeHtml(ui.aboutTitle)}</h1>
    <div class="page-head__meta"><span>${escapeHtml(site.author)}</span></div>
  </header>
  <div class="prose">
    ${bodyHtml}
  </div>
  <section class="section section--tight">
    <div class="section__head"><h2 class="section__title">${escapeHtml(ui.contactTitle)}</h2></div>
    <p class="hero__intro">${escapeHtml(ui.contactText)}</p>
    <div class="hero__actions">
      <a class="btn btn--filled" href="mailto:${escapeHtml(site.email)}">${iconSvg("mail", 20)}${escapeHtml(
        ui.sendMail,
      )}</a>
    </div>
  </section>
</article>`;
}

/** 作品集页 */
function projectsPage({ lang, projects }) {
  const ui = UI[lang];
  return `<section class="container">
  <header class="page-head">
    <h1 class="page-head__title">${escapeHtml(ui.projectsTitle)}</h1>
    <div class="page-head__meta"><span>${escapeHtml(ui.projectsIntro)}</span></div>
  </header>
  <div class="grid">
    ${projects.map((p) => projectCard(p, lang)).join("\n    ")}
  </div>
</section>`;
}

/** 博客列表页 */
function blogPage({ lang, posts }) {
  const ui = UI[lang];
  return `<section class="container">
  <header class="page-head">
    <h1 class="page-head__title">${escapeHtml(ui.blogTitle)}</h1>
    <div class="page-head__meta"><span>${escapeHtml(ui.blogIntro)}</span></div>
  </header>
  ${
    posts.length
      ? `<ul class="post-list">${posts.map((p) => postItem(p, lang)).join("")}</ul>`
      : `<p class="comments__note">${lang === "zh" ? "还没有文章。" : "No posts yet."}</p>`
  }
</section>`;
}

/** 文章详情页 */
function postPage({ site, lang, post, altHref }) {
  const ui = UI[lang];
  return `<article class="container">
  <header class="page-head">
    <h1 class="page-head__title">${escapeHtml(post.title)}</h1>
    <div class="page-head__meta">
      <span>${escapeHtml(ui.published)} ${escapeHtml(formatDate(post.date, lang))}</span>
      ${tagChips(post.tags)}
    </div>
  </header>
  <div class="prose">
    ${renderMarkdown(post.body)}
  </div>
  ${giscusBlock({ site, lang })}
  <p><a href="${href(lang, "blog/")}">${escapeHtml(ui.backToBlog)}</a></p>
</article>`;
}

function notFoundPage({ site, lang }) {
  const ui = UI[lang];
  return `<section class="container">
  <header class="page-head">
    <h1 class="page-head__title">404 · ${escapeHtml(ui.notFoundTitle)}</h1>
    <div class="page-head__meta"><span>${escapeHtml(ui.notFoundText)}</span></div>
  </header>
  <div class="hero__actions">
    <a class="btn btn--filled" href="${href(lang)}">${escapeHtml(ui.backHome)}</a>
  </div>
</section>`;
}

/* ============================ 主流程 ============================ */
async function build() {
  const projectsModule = await import("./content/projects.mjs");
  const projects = projectsModule.projects ?? [];

  const aboutBody = {};
  const posts = {};
  for (const lang of LANGS) {
    const aboutPath = join(CONTENT, `about.${lang}.md`);
    aboutBody[lang] = existsSync(aboutPath)
      ? renderMarkdown(parseFrontmatter(await readFile(aboutPath, "utf8")).content)
      : `<p>${escapeHtml(site.intro[lang])}</p>`;
    posts[lang] = await readMarkdownDir(join(CONTENT, "posts", lang));
  }

  // 语言之间的对应路径（用于 hreflang 与语言切换）
  const alt = (pathZh, pathEn) => ({ zh: `${site.url}${href("zh", pathZh)}`, en: `${site.url}${href("en", pathEn)}` });

  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  // 静态资源
  await mkdir(join(DIST, "assets"), { recursive: true });
  await copyFile(join(SRC, "styles", "material.css"), join(DIST, "assets", "material.css"));
  written.push("assets/material.css");

  const assetDir = join(SRC, "assets");
  if (existsSync(assetDir)) {
    for (const file of await readdir(assetDir)) {
      await copyFile(join(assetDir, file), join(DIST, "assets", file));
      written.push(`assets/${file}`);
    }
  }

  // 首页（语言选择）
  await emit("index.html", renderRoot({ site }));

  for (const lang of LANGS) {
    const other = lang === "zh" ? "en" : "zh";

    // 站内各页
    await emit(
      `${lang}/index.html`,
      renderDocument({
        site,
        lang,
        active: "home",
        path: "",
        content: homePage({ site, lang, projects, posts: posts[lang] }),
        altHref: alt("", ""),
      }),
    );

    await emit(
      `${lang}/about/index.html`,
      renderDocument({
        site,
        lang,
        active: "about",
        title: UI[lang].aboutTitle,
        path: "about/",
        content: aboutPage({ site, lang, bodyHtml: aboutBody[lang] }),
        altHref: alt("about/", "about/"),
      }),
    );

    await emit(
      `${lang}/projects/index.html`,
      renderDocument({
        site,
        lang,
        active: "projects",
        title: UI[lang].projectsTitle,
        path: "projects/",
        content: projectsPage({ lang, projects }),
        altHref: alt("projects/", "projects/"),
      }),
    );

    await emit(
      `${lang}/blog/index.html`,
      renderDocument({
        site,
        lang,
        active: "blog",
        title: UI[lang].blogTitle,
        path: "blog/",
        content: blogPage({ lang, posts: posts[lang] }),
        altHref: alt("blog/", "blog/"),
      }),
    );

    // 文章详情；另一语言若无同 slug 文章，则回退到该语言的博客列表
    for (const post of posts[lang]) {
      const counterpart = posts[other].find((p) => p.slug === post.slug);
      await emit(
        `${lang}/blog/${post.slug}/index.html`,
        renderDocument({
          site,
          lang,
          active: "blog",
          title: post.title,
          description: post.excerpt,
          path: `blog/${post.slug}/`,
          content: postPage({ site, lang, post, altHref: null }),
          comments: true,
          type: "article",
          altHref: alt(
            `blog/${post.slug}/`,
            counterpart ? `blog/${counterpart.slug}/` : "blog/",
          ),
        }),
      );
    }

    await emit(
      `${lang}/404.html`,
      renderDocument({
        site,
        lang,
        active: "",
        title: lang === "zh" ? "页面不存在" : "Not found",
        path: "404.html",
        content: notFoundPage({ site, lang }),
        altHref: alt("404.html", "404.html"),
      }),
    );
  }

  // 根目录 404（Cloudflare Pages 会用 /404.html）
  await emit(
    "404.html",
    renderDocument({
      site,
      lang: "zh",
      active: "",
      title: "页面不存在 · Not found",
      path: "404.html",
      content: notFoundPage({ site, lang: "zh" }),
      altHref: { zh: `${site.url}/zh/`, en: `${site.url}/en/` },
    }),
  );

  // robots.txt / sitemap.xml
  await emit("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

  const urls = [`${site.url}/`];
  for (const lang of LANGS) {
    urls.push(`${site.url}${href(lang)}`, `${site.url}${href(lang, "about/")}`, `${site.url}${href(lang, "projects/")}`, `${site.url}${href(lang, "blog/")}`);
    for (const post of posts[lang]) urls.push(`${site.url}${href(lang, `blog/${post.slug}/`)}`);
  }
  const today = new Date().toISOString().slice(0, 10);
  await emit(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`,
  );

  // Cloudflare Pages 头信息
  await emit(
    "_headers",
    `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()

/assets/*
  Cache-Control: public, max-age=3600
`,
  );

  console.log(`\n✅ 构建完成：${written.length} 个文件 → dist/\n`);
  for (const f of written.sort()) console.log("   " + f);
  console.log("\n本地预览： node serve.mjs   然后打开 http://localhost:8080\n");
}

build().catch((err) => {
  console.error("\n❌ 构建失败：", err);
  process.exit(1);
});
