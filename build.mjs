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
import { renderDocument, renderRoot, giscusBlock, icon, href } from "./src/layout.mjs";
import { parseFrontmatter, renderMarkdown, plainText, escapeHtml } from "./src/md.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DIST = join(HERE, "dist");
const SRC = join(HERE, "src");
const CONTENT = join(HERE, "content");
const LANGS = ["zh", "en"];

const HERO = "/assets/hero-1920.jpg";
const HERO_SET = `/assets/hero-960.jpg 960w, ${HERO} 1920w`;

/* ---------------- 文案 ---------------- */
const UI = {
  zh: {
    heroEyebrow: "车 · 影像 · 文字",
    heroSub: "这是枯萎中的绽放",
    explore: "Explore",
    aboutEyebrow: "01/ 关于",
    aboutTitle: "汽车展览馆",
    aboutLead:
      "一个把车、光与空间放在一起的地方。这里记录车辆、展览，以及那些只在傍晚才出现的颜色。",
    moreAbout: "More about us",
    galleryEyebrow: "02/ 摄影集",
    galleryTitle: "为你的生活方式而造的空间",
    galleryLead: "每一个系列，都是一次关于光线的练习。",
    viewAll: "查看全部",
    galleryTitlePage: "摄影集",
    galleryPageLead: "按系列整理的照片：车、展馆、公路与静物。",
    seriesEyebrow: "04/ 系列",
    seriesTitle: "精选画面",
    tabs: ["全部", "展馆", "公路", "静物"],
    cardTitle: "日落与车",
    cardMeta: "2026 · 12 张",
    cardCta: "查看",
    badge: "4.9 · 精选",
    experienceEyebrow: "05/ 体验",
    statement: "有些风景，只适合慢慢开过去。",
    statementSub:
      "从一个展厅走到另一段公路，细节比目的地更重要。这里放一些我反复看过的画面。",
    blogEyebrow: "03/ 博客",
    blogTitle: "博客",
    blogPageLead: "记录做过的事、踩过的坑，和一些还没想清楚的想法。",
    posts: "全部文章",
    readMore: "阅读全文",
    published: "发布于",
    backToBlog: "← 返回博客列表",
    notFoundTitle: "页面走失了",
    notFoundText: "你访问的页面不存在，或者已经搬走了。",
    backHome: "回到首页",
    aboutPageEyebrow: "01/ 关于",
    aboutPageLead: "关于这个空间、这些车，以及我为什么拍它们。",
    aboutCta: "去看摄影集",
    seriesCount: "张",
    home: "首页",
    footerExplore: "浏览",
    footerConnect: "联系",
  },
  en: {
    heroEyebrow: "Cars · Images · Words",
    heroSub: "A bloom within the withering",
    explore: "Explore",
    aboutEyebrow: "01/ About",
    aboutTitle: "Car Exhibition Hall",
    aboutLead:
      "A place where cars, light and space meet. Vehicles, exhibitions, and the colours that only appear near sunset.",
    moreAbout: "More about us",
    galleryEyebrow: "02/ Photography Collection",
    galleryTitle: "Spaces crafted for the way you live",
    galleryLead: "Every series is a study of light.",
    viewAll: "View all",
    galleryTitlePage: "Photography Collection",
    galleryPageLead: "Photographs arranged in series: cars, halls, roads and still lifes.",
    seriesEyebrow: "04/ Series",
    seriesTitle: "Selected frames",
    tabs: ["All", "Halls", "Roads", "Still"],
    cardTitle: "Sunset & Car",
    cardMeta: "2026 · 12 frames",
    cardCta: "View",
    badge: "4.9 · Selected",
    experienceEyebrow: "05/ Experience",
    statement: "Some landscapes are best passed slowly.",
    statementSub:
      "From one showroom to the next stretch of road, the details matter more than the destination. Here are frames I keep coming back to.",
    blogEyebrow: "03/ Journal",
    blogTitle: "Journal",
    blogPageLead: "Notes on what I built, what broke, and what I have not figured out yet.",
    posts: "All posts",
    readMore: "Read more",
    published: "Published",
    backToBlog: "← Back to journal",
    notFoundTitle: "Page not found",
    notFoundText: "The page you are looking for does not exist or has moved.",
    backHome: "Back home",
    aboutPageEyebrow: "01/ About",
    aboutPageLead: "About this space, these cars, and why I photograph them.",
    aboutCta: "View the collection",
    seriesCount: "frames",
    home: "Home",
    footerExplore: "Explore",
    footerConnect: "Connect",
  },
};

/* ---------------- 工具 ---------------- */
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

function tagChips(list) {
  if (!list?.length) return "";
  return `<span class="series-item__tags">${list.map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</span>`;
}

/* ---------------- 页面片段 ---------------- */
function hero({ lang }) {
  const ui = UI[lang];
  return `<section class="hero">
  <div class="hero__media">
    <img src="${HERO}" srcset="${HERO_SET}" sizes="100vw" alt="" fetchpriority="high" decoding="async">
  </div>
  <div class="hero__inner container">
    <p class="hero__eyebrow">${escapeHtml(ui.heroEyebrow)}</p>
    <h1 class="hero__title">
      <span class="line"><span>PERSONAL</span></span>
      <span class="line"><span>WEBSITE</span></span>
    </h1>
    <p class="hero__sub">${escapeHtml(ui.heroSub)}</p>
    <div class="hero__cta">
      <a class="pill pill--solid pill--big" href="${href(lang, "about/")}">${escapeHtml(ui.explore)}${icon("arrow", 16)}</a>
    </div>
  </div>
  <span class="hero__scroll" aria-hidden="true">Scroll</span>
</section>`;
}

function aboutSection({ lang }) {
  const ui = UI[lang];
  return `<section class="section section--dark">
  <div class="container">
    <div class="about-preview">
      <div class="reveal">
        <p class="eyebrow">${escapeHtml(ui.aboutEyebrow)}</p>
        <h2 class="about-preview__title">${escapeHtml(ui.aboutTitle)}</h2>
        <p class="section__lead">${escapeHtml(ui.aboutLead)}</p>
        <a class="pill" href="${href(lang, "about/")}">${escapeHtml(ui.moreAbout)}${icon("arrow", 15)}</a>
      </div>
      <div class="about-preview__media reveal" style="--d:140ms">
        <img src="${HERO}" srcset="${HERO_SET}" sizes="(max-width: 1024px) 100vw, 40vw" alt="" loading="lazy" decoding="async" style="object-position: 56% 62%">
      </div>
    </div>
  </div>
</section>`;
}

function gallerySection({ lang, series }) {
  const ui = UI[lang];
  const items = series
    .slice(0, 4)
    .map(
      (s, i) => `<li>
        <a href="${href(lang, "gallery/")}">
          <span class="cat-list__idx">0${i + 1}</span>
          <span class="cat-list__label">${escapeHtml(s.title[lang])}</span>
          <span class="cat-list__meta">${escapeHtml(String(s.year || ""))} · ${escapeHtml(
            String(s.count || ""),
          )} ${ui.seriesCount}</span>
        </a>
      </li>`,
    )
    .join("\n        ");

  return `<section class="section section--paper">
  <div class="container">
    <p class="eyebrow">${escapeHtml(ui.galleryEyebrow)}</p>
    <h2 class="section__title reveal">${escapeHtml(ui.galleryTitle)}</h2>
    <p class="section__lead reveal" style="--d:80ms">${escapeHtml(ui.galleryLead)}</p>
    <ul class="cat-list reveal" style="--d:160ms">
        ${items}
    </ul>
    <p class="section__foot reveal" style="--d:220ms">
      <a class="pill" href="${href(lang, "gallery/")}">${escapeHtml(ui.viewAll)}${icon("arrow", 15)}</a>
    </p>
  </div>
</section>`;
}

function seriesSection({ lang }) {
  const ui = UI[lang];
  const tabs = ui.tabs
    .map(
      (t, i) =>
        `<button type="button" role="tab" data-tab aria-selected="${i === 0 ? "true" : "false"}" class="${
          i === 0 ? "is-active" : ""
        }">${escapeHtml(t)}</button>`,
    )
    .join("\n          ");

  return `<section class="section section--dark section--alt">
  <div class="container">
    <p class="eyebrow">${escapeHtml(ui.seriesEyebrow)}</p>
    <h2 class="section__title reveal">${escapeHtml(ui.seriesTitle)}</h2>
    <div class="tabs reveal" role="tablist" aria-label="${escapeHtml(ui.seriesTitle)}">
          ${tabs}
    </div>
    <div class="media-card reveal" style="--d:120ms">
      <img src="${HERO}" srcset="${HERO_SET}" sizes="100vw" alt="" loading="lazy" decoding="async" style="object-position: 58% 58%">
      <span class="media-card__badge">${icon("star", 15)}${escapeHtml(ui.badge)}</span>
      <div class="media-card__caption">
        <div>
          <h3>${escapeHtml(ui.cardTitle)}</h3>
          <p>${escapeHtml(ui.cardMeta)}</p>
        </div>
        <a class="pill" href="${href(lang, "gallery/")}">${escapeHtml(ui.cardCta)}${icon("arrow", 15)}</a>
      </div>
    </div>
  </div>
</section>`;
}

function experienceSection({ lang }) {
  const ui = UI[lang];
  return `<section class="section section--dark">
  <div class="container">
    <p class="eyebrow reveal" style="text-align:center">${escapeHtml(ui.experienceEyebrow)}</p>
    <h2 class="statement reveal" style="--d:60ms">${escapeHtml(ui.statement)}</h2>
    <p class="statement__sub reveal" style="--d:120ms">${escapeHtml(ui.statementSub)}</p>
    <div class="curve reveal" style="--d:180ms">
      <img src="${HERO}" srcset="${HERO_SET}" sizes="(max-width: 1180px) 100vw, 1180px" alt="" loading="lazy" decoding="async" style="object-position: 46% 40%">
    </div>
  </div>
</section>`;
}

function homePage({ lang, series }) {
  return `${hero({ lang })}
${aboutSection({ lang })}
${gallerySection({ lang, series })}
${seriesSection({ lang })}
${experienceSection({ lang })}`;
}

/* ---------------- 内容页 ---------------- */
function aboutPage({ lang, bodyHtml }) {
  const ui = UI[lang];
  return `<article class="container">
  <header class="page-head">
    <p class="page-head__eyebrow">${escapeHtml(ui.aboutPageEyebrow)}</p>
    <h1 class="page-head__title">${escapeHtml(ui.aboutTitle)}</h1>
    <div class="page-head__meta"><span>${escapeHtml(site.author)}</span><span>2026</span></div>
  </header>
  <div class="prose">
    ${bodyHtml}
  </div>
  <p style="margin-bottom: 80px;"><a class="pill" href="${href(lang, "gallery/")}">${escapeHtml(
    ui.aboutCta,
  )}${icon("arrow", 15)}</a></p>
</article>`;
}

function galleryPage({ lang, series }) {
  const ui = UI[lang];
  const items = series
    .map(
      (s) => `<li class="series-item">
      <a href="${href(lang, "gallery/")}">
        <span class="series-item__title">${escapeHtml(s.title[lang])}</span>
        ${tagChips(s.tags)}
        <span class="series-item__meta">${escapeHtml(String(s.year || ""))} · ${escapeHtml(
          String(s.count || ""),
        )} ${ui.seriesCount}</span>
      </a>
    </li>`,
    )
    .join("\n    ");

  return `<section class="container">
  <header class="page-head">
    <p class="page-head__eyebrow">${escapeHtml(ui.galleryEyebrow)}</p>
    <h1 class="page-head__title">${escapeHtml(ui.galleryTitlePage)}</h1>
    <div class="page-head__meta"><span>${escapeHtml(ui.galleryPageLead)}</span></div>
  </header>
  <ul class="series-list">
    ${items}
  </ul>
</section>`;
}

function blogPage({ lang, posts }) {
  const ui = UI[lang];
  const items = posts
    .map(
      (p) => `<li class="post-item">
      <a href="${href(lang, `blog/${p.slug}/`)}">
        <span class="post-item__date">${escapeHtml(formatDate(p.date, lang))}</span>
        <span class="post-item__title">${escapeHtml(p.title)}</span>
        <span class="post-item__arrow">${icon("arrow", 18)}</span>
        <span class="post-item__excerpt">${escapeHtml(p.excerpt)}</span>
      </a>
    </li>`,
    )
    .join("\n    ");

  return `<section class="container">
  <header class="page-head">
    <p class="page-head__eyebrow">${escapeHtml(ui.blogEyebrow)}</p>
    <h1 class="page-head__title">${escapeHtml(ui.blogTitle)}</h1>
    <div class="page-head__meta"><span>${escapeHtml(ui.blogPageLead)}</span></div>
  </header>
  ${
    posts.length
      ? `<ul class="post-list">${items}</ul>`
      : `<p class="comments__note">${lang === "zh" ? "还没有文章。" : "No posts yet."}</p>`
  }
</section>`;
}

function postPage({ site, lang, post }) {
  const ui = UI[lang];
  return `<article class="container">
  <header class="page-head">
    <p class="page-head__eyebrow">${escapeHtml(ui.blogEyebrow)}</p>
    <h1 class="page-head__title">${escapeHtml(post.title)}</h1>
    <div class="page-head__meta">
      <span>${escapeHtml(ui.published)} ${escapeHtml(formatDate(post.date, lang))}</span>
      ${post.tags.length ? tagChips(post.tags) : ""}
    </div>
  </header>
  <div class="prose">
    ${renderMarkdown(post.body)}
  </div>
  ${giscusBlock({ site, lang })}
  <p style="margin-bottom: 80px;"><a href="${href(lang, "blog/")}">${escapeHtml(ui.backToBlog)}</a></p>
</article>`;
}

function notFoundPage({ lang }) {
  const ui = UI[lang];
  return `<section class="container">
  <header class="page-head">
    <p class="page-head__eyebrow">404</p>
    <h1 class="page-head__title">${escapeHtml(ui.notFoundTitle)}</h1>
    <div class="page-head__meta"><span>${escapeHtml(ui.notFoundText)}</span></div>
  </header>
  <p style="margin-bottom: 120px;"><a class="pill" href="${href(lang)}">${escapeHtml(ui.backHome)}</a></p>
</section>`;
}

/* ---------------- 主流程 ---------------- */
async function build() {
  const projectsModule = await import("./content/projects.mjs");
  const series = projectsModule.projects ?? [];

  const aboutBody = {};
  const posts = {};
  for (const lang of LANGS) {
    const aboutPath = join(CONTENT, `about.${lang}.md`);
    aboutBody[lang] = existsSync(aboutPath)
      ? renderMarkdown(parseFrontmatter(await readFile(aboutPath, "utf8")).content)
      : `<p>${escapeHtml(UI[lang].aboutLead)}</p>`;
    posts[lang] = await readMarkdownDir(join(CONTENT, "posts", lang));
  }

  const alt = (pathZh, pathEn) => ({ zh: `${site.url}${href("zh", pathZh)}`, en: `${site.url}${href("en", pathEn)}` });

  await rm(DIST, { recursive: true, force: true });
  await mkdir(DIST, { recursive: true });

  // 静态资源
  await mkdir(join(DIST, "assets"), { recursive: true });
  await copyFile(join(SRC, "styles", "site.css"), join(DIST, "assets", "site.css"));
  written.push("assets/site.css");

  const assetDir = join(SRC, "assets");
  if (existsSync(assetDir)) {
    for (const file of await readdir(assetDir)) {
      await copyFile(join(assetDir, file), join(DIST, "assets", file));
      written.push(`assets/${file}`);
    }
  }

  // 根路径：语言选择
  await emit("index.html", renderRoot({ site }));

  for (const lang of LANGS) {
    const other = lang === "zh" ? "en" : "zh";

    await emit(
      `${lang}/index.html`,
      renderDocument({
        site,
        lang,
        active: "home",
        path: "",
        content: homePage({ lang, series }),
        altHref: alt("", ""),
        preloadHero: true,
      }),
    );

    await emit(
      `${lang}/about/index.html`,
      renderDocument({
        site,
        lang,
        active: "about",
        title: UI[lang].aboutTitle,
        description: UI[lang].aboutLead,
        path: "about/",
        bodyClass: "page-light",
        content: aboutPage({ lang, bodyHtml: aboutBody[lang] }),
        altHref: alt("about/", "about/"),
      }),
    );

    await emit(
      `${lang}/gallery/index.html`,
      renderDocument({
        site,
        lang,
        active: "gallery",
        title: UI[lang].galleryTitlePage,
        description: UI[lang].galleryPageLead,
        path: "gallery/",
        bodyClass: "page-light",
        content: galleryPage({ lang, series }),
        altHref: alt("gallery/", "gallery/"),
      }),
    );

    await emit(
      `${lang}/blog/index.html`,
      renderDocument({
        site,
        lang,
        active: "blog",
        title: UI[lang].blogTitle,
        description: UI[lang].blogPageLead,
        path: "blog/",
        bodyClass: "page-light",
        content: blogPage({ lang, posts: posts[lang] }),
        altHref: alt("blog/", "blog/"),
      }),
    );

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
          bodyClass: "page-light",
          content: postPage({ site, lang, post }),
          comments: true,
          altHref: alt(`blog/${post.slug}/`, counterpart ? `blog/${counterpart.slug}/` : "blog/"),
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
        bodyClass: "page-light",
        content: notFoundPage({ lang }),
        altHref: alt("404.html", "404.html"),
      }),
    );
  }

  await emit(
    "404.html",
    renderDocument({
      site,
      lang: "zh",
      active: "",
      title: "页面不存在 · Not found",
      path: "404.html",
      bodyClass: "page-light",
      content: notFoundPage({ lang: "zh" }),
      altHref: { zh: `${site.url}/zh/`, en: `${site.url}/en/` },
    }),
  );

  // robots / sitemap / headers
  await emit("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

  const urls = [`${site.url}/`];
  for (const lang of LANGS) {
    urls.push(
      `${site.url}${href(lang)}`,
      `${site.url}${href(lang, "about/")}`,
      `${site.url}${href(lang, "gallery/")}`,
      `${site.url}${href(lang, "blog/")}`,
    );
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

  await emit(
    "_headers",
    `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()

/assets/*
  Cache-Control: public, max-age=86400
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
