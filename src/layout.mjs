/**
 * 页面框架：统一生成 <head>、顶部导航、页脚、评论挂载点。
 * 所有页面都从这里出，所以改导航/页脚只需要改这一个文件。
 */
import { escapeHtml } from "./md.mjs";

const LANG_LABEL = { zh: "中文", en: "English" };
const HTML_LANG = { zh: "zh-CN", en: "en" };

/* ---------- 内联 SVG 图标（不依赖任何图标字体/CDN） ---------- */
const ICONS = {
  home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  person: '<path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4m0 2c-4 0-7 2-7 4.5V21h14v-2.5C19 16 16 14 12 14"/>',
  work: '<path d="M4 7h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1m5 0V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>',
  article: '<path d="M5 3h9l5 5v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1m9 1v4h4M7.5 12h9M7.5 16h6"/>',
  arrow: '<path d="M5 12h13m-5-6 6 6-6 6"/>',
  external: '<path d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  translate: '<path d="M4 5h10M9 3v2c0 4-2.5 7-5 9m2-6c.8 2.6 3 5 6 6m2-1 3.5-8 3.5 8m-6-2.5h5"/>',
  sun: '<path d="M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10m0-14v2m0 18v-2M5 12H3m18 0h-2M6.3 6.3 4.9 4.9m14.2 14.2-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  mail: '<path d="M3 6.5h18v11H3zM3.5 7l8.5 6 8.5-6"/>',
  github:
    '<path fill="currentColor" stroke="none" d="M12 .8C5.7.8 1 5.5 1 11.8c0 4.9 3.1 9 7.5 10.4.6.1.8-.2.8-.5v-1.9c-3 .6-3.7-1.4-3.7-1.4-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.4-.3-5-1.2-5-5.4 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 1.1a10.4 10.4 0 0 1 5.5 0c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.8 1.1 3 0 4.2-2.6 5.1-5 5.4.4.4.7 1 .7 2v3c0 .3.2.6.8.5 4.4-1.5 7.4-5.5 7.4-10.4C23 5.5 18.3.8 12 .8"/>',
  x: '<path d="M4 4l7.5 9.5L4.5 20h2.2l6-6.6L17.5 20H20l-7.7-9.8L19.3 4h-2.2l-5.5 6L7 4z"/>',
  linkedin:
    '<path fill="currentColor" stroke="none" d="M4.5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4M3 9h3v12H3zM9 9h2.9v1.7h.1c.4-.8 1.5-1.9 3.4-1.9 3 0 3.6 2 3.6 4.6V21h-3v-6.3c0-1.5 0-3.4-2-3.4s-2.3 1.6-2.3 3.3V21H9z"/>',
  bilibili:
    '<path d="M6 5 4.5 3.5M18 5l1.5-1.5M4 6.5h16a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1m4 4v5m8-5v5"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/>',
};

export function icon(name, size = 22) {
  const body = ICONS[name] ?? ICONS.link;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

/** 站内链接：自动补语言前缀 */
export function href(lang, path = "") {
  const clean = String(path).replace(/^\/+/, "");
  return `/${lang}/${clean}`;
}

/* ---------- 主题初始化（防止深浅色闪烁，必须放在 <head>） ---------- */
const THEME_INIT = `try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.dataset.theme=t}}catch(e){}`;

/* ---------- 页面交互脚本（主题切换 / 移动端菜单 / 评论主题同步） ---------- */
const PAGE_SCRIPT = `
(function(){
  var root=document.documentElement;
  function isDark(){
    return root.dataset.theme==='dark'||(!root.dataset.theme&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  }
  function syncGiscus(){
    var f=document.querySelector('iframe.giscus-frame');
    if(!f)return;
    f.contentWindow.postMessage({giscus:{setConfig:{theme:isDark()?'dark':'light'}}},'https://giscus.app');
  }
  var t=document.getElementById('themeToggle');
  if(t){t.addEventListener('click',function(){
    root.dataset.theme=isDark()?'light':'dark';
    try{localStorage.setItem('theme',root.dataset.theme)}catch(e){}
    syncGiscus();
  });}
  var n=document.getElementById('navToggle'),nav=document.getElementById('nav');
  if(n&&nav){n.addEventListener('click',function(){
    var open=nav.classList.toggle('is-open');
    n.setAttribute('aria-expanded',open?'true':'false');
  });}
})();
`;

function head({ site, lang, title, description, canonical, altZh, altEn, isRoot = false }) {
  const htmlLang = isRoot ? "zh-CN" : HTML_LANG[lang];
  const themeColorLight = "#4f46e5";
  const themeColorDark = "#121216";
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="zh-CN" href="${altZh}">
<link rel="alternate" hreflang="en" href="${altEn}">
<link rel="alternate" hreflang="x-default" href="${site.url}/">
<meta name="theme-color" content="${themeColorLight}" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="${themeColorDark}" media="(prefers-color-scheme: dark)">
<meta name="author" content="${escapeHtml(site.author)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${escapeHtml(site.author)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="${htmlLang === "zh-CN" ? "zh_CN" : "en_US"}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/avatar.svg">
<link rel="stylesheet" href="/assets/material.css">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
<script>${THEME_INIT}</script>`;
}

function appBar({ site, lang, active, altHref }) {
  const navLinks = site.nav
    .map((item) => {
      const isActive = item.key === active;
      return `<a class="nav__link${isActive ? " is-active" : ""}" href="${href(lang, item.href)}"${
        isActive ? ' aria-current="page"' : ""
      }>${escapeHtml(item[lang])}</a>`;
    })
    .join("\n        ");

  const otherLang = lang === "zh" ? "en" : "zh";

  return `<header class="app-bar">
  <div class="app-bar__inner container">
    <a class="brand" href="${href(lang)}">
      <img class="brand__avatar" src="${site.avatar}" alt="${escapeHtml(site.author)}" width="34" height="34">
      <span class="brand__name">${escapeHtml(site.author)}</span>
    </a>

    <nav class="nav" id="nav" aria-label="${lang === "zh" ? "主导航" : "Main navigation"}">
        ${navLinks}
    </nav>

    <div class="app-bar__actions">
      <a class="lang-switch" href="${altHref}" hreflang="${HTML_LANG[otherLang]}" lang="${HTML_LANG[otherLang]}" title="${
        otherLang === "zh" ? "切换到中文" : "Switch to English"
      }">
        ${icon("translate", 18)}<span>${otherLang === "zh" ? "中文" : "EN"}</span>
      </a>
      <button class="icon-btn" id="themeToggle" type="button" aria-label="${
        lang === "zh" ? "切换深浅色" : "Toggle dark mode"
      }" title="${lang === "zh" ? "切换深浅色" : "Dark / light"}">
        <span class="icon-sun">${icon("sun")}</span>
        <span class="icon-moon">${icon("moon")}</span>
      </button>
      <button class="icon-btn nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="nav" aria-label="${
        lang === "zh" ? "打开菜单" : "Open menu"
      }">${icon("menu")}</button>
    </div>
  </div>
</header>`;
}

function footer({ site, lang }) {
  const year = site.autoYear ? new Date().getFullYear() : "";
  const socials = site.socials
    .map(
      (s) =>
        `<a class="social-link" href="${s.url}"${/^https?:/i.test(s.url) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${icon(
          s.icon,
          17,
        )}<span>${escapeHtml(s.label)}</span></a>`,
    )
    .join("\n      ");

  return `<footer class="footer">
  <div class="footer__inner container">
    <div>
      <div class="footer__copy">© ${year} ${escapeHtml(site.author)} · ${escapeHtml(site.domain)}</div>
      <div class="footer__links">
        <a href="${href(lang, "about/")}">${lang === "zh" ? "关于" : "About"}</a>
        <a href="${href(lang, "blog/")}">${lang === "zh" ? "博客" : "Blog"}</a>
        <a href="/sitemap.xml">Sitemap</a>
      </div>
    </div>
    <div class="footer__socials">
      ${socials}
    </div>
  </div>
</footer>`;
}

function giscusBlock({ site, lang }) {
  const g = site.giscus;
  if (!g?.enabled || !g.repo || !g.repoId) {
    return `<section class="comments">
      <h2 class="comments__title">${lang === "zh" ? "评论" : "Comments"}</h2>
      <p class="comments__note">${
        lang === "zh"
          ? "评论区尚未启用。完成 Giscus 配置后，这里会显示留言框。"
          : "Comments are not enabled yet. Configure Giscus to turn this on."
      }</p>
    </section>`;
  }
  return `<section class="comments">
      <h2 class="comments__title">${lang === "zh" ? "评论" : "Comments"}</h2>
      <div class="giscus"></div>
      <script src="https://giscus.app/client.js"
        data-repo="${g.repo}"
        data-repo-id="${g.repoId}"
        data-category="${g.category}"
        data-category-id="${g.categoryId}"
        data-mapping="${g.mapping}"
        data-strict="0"
        data-reactions-enabled="${g.reactionsEnabled}"
        data-emit-metadata="0"
        data-input-position="${g.inputPosition}"
        data-theme="${g.theme}"
        data-lang="${lang === "zh" ? "zh-CN" : "en"}"
        data-loading="lazy"
        crossorigin="anonymous"
        async>
      </script>
    </section>`;
}

/** 渲染一个普通页面 */
export function renderDocument({
  site,
  lang,
  active = "",
  title,
  description,
  path = "",
  content,
  comments = false,
  type = "website",
  altHref,
}) {
  const canonical = `${site.url}${href(lang, path)}`;
  const altZh = altHref?.zh ?? `${site.url}/zh/`;
  const altEn = altHref?.en ?? `${site.url}/en/`;
  const fullTitle = title ? `${title} · ${site.author}` : site.title[lang];

  return `<!doctype html>
<html lang="${HTML_LANG[lang]}">
<head>
${head({
    site,
    lang,
    title: fullTitle,
    description: description || site.description[lang],
    canonical,
    altZh,
    altEn,
  })}
</head>
<body>
<a class="skip-link" href="#main">${lang === "zh" ? "跳到主要内容" : "Skip to content"}</a>
${appBar({ site, lang, active, altHref: altHref ? altHref[lang === "zh" ? "en" : "zh"] : href(lang === "zh" ? "en" : "zh", path) })}
<main id="main">
${content}
</main>
${footer({ site, lang })}
<script>${PAGE_SCRIPT}</script>
</body>
</html>`;
}

/** 根路径：中英双语选择页 */
export function renderRoot({ site }) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
${head({
    site,
    lang: "zh",
    title: site.title.zh,
    description: site.description.zh,
    canonical: `${site.url}/`,
    altZh: `${site.url}/zh/`,
    altEn: `${site.url}/en/`,
    isRoot: true,
  })}
</head>
<body>
<main id="main">
  <div class="chooser">
    <div class="chooser__inner container">
      <img class="chooser__avatar" src="${site.avatar}" alt="${escapeHtml(site.author)}" width="104" height="104">
      <h1 class="chooser__title">${escapeHtml(site.author)}</h1>
      <p class="chooser__sub">${escapeHtml(site.tagline.zh)} / ${escapeHtml(site.tagline.en)}</p>
      <div class="chooser__grid">
        <a class="card card--link" href="/zh/">
          <div class="card__icon">${icon("translate")}</div>
          <h2 class="card__title">中文</h2>
          <p class="card__text">进入中文版：作品集、关于我、博客。</p>
          <span class="card__cta">${"进入网站"}${icon("arrow", 18)}</span>
        </a>
        <a class="card card--link" href="/en/">
          <div class="card__icon">${icon("translate")}</div>
          <h2 class="card__title">English</h2>
          <p class="card__text">Enter the English site: portfolio, about and blog.</p>
          <span class="card__cta">Enter site${icon("arrow", 18)}</span>
        </a>
      </div>
    </div>
  </div>
</main>
<footer class="footer">
  <div class="footer__inner container">
    <div class="footer__copy">© ${new Date().getFullYear()} ${escapeHtml(site.author)} · ${escapeHtml(site.domain)}</div>
    <div class="footer__socials">
      ${site.socials
        .map(
          (s) =>
            `<a class="social-link" href="${s.url}"${/^https?:/i.test(s.url) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${icon(
              s.icon,
              17,
            )}<span>${escapeHtml(s.label)}</span></a>`,
        )
        .join("\n      ")}
    </div>
  </div>
</footer>
<script>${PAGE_SCRIPT}</script>
</body>
</html>`;
}

export { giscusBlock, icon as iconSvg, LANG_LABEL };
