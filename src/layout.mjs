/**
 * 页面框架：统一生成 <head>、固定导航、移动端菜单、页脚、评论挂载点。
 */
import { escapeHtml } from "./md.mjs";

const HTML_LANG = { zh: "zh-CN", en: "en" };

/* ---------- 内联 SVG（零图标字体依赖） ---------- */
const ICONS = {
  mark: '<path d="M12 2.6v18.8M2.6 12h18.8M5.4 5.4l13.2 13.2M18.6 5.4 5.4 18.6" stroke-width="1.4"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6" stroke-width="1.6"/>',
  menu: '<path d="M3.5 7h17M3.5 12h17M3.5 17h17" stroke-width="1.6"/>',
  close: '<path d="M6 6l12 12M18 6 6 18" stroke-width="1.6"/>',
  star: '<path d="m12 3.6 2.5 5.3 5.8.8-4.2 4.1 1 5.8-5.1-2.8-5.1 2.8 1-5.8L3.7 9.7l5.8-.8z" fill="currentColor" stroke="none"/>',
  external:
    '<path d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" stroke-width="1.6"/>',
  mail: '<path d="M3 6.5h18v11H3zM3.5 7l8.5 6 8.5-6" stroke-width="1.6"/>',
  github:
    '<path fill="currentColor" stroke="none" d="M12 .8C5.7.8 1 5.5 1 11.8c0 4.9 3.1 9 7.5 10.4.6.1.8-.2.8-.5v-1.9c-3 .6-3.7-1.4-3.7-1.4-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.4-.3-5-1.2-5-5.4 0-1.2.4-2.2 1.1-3-.1-.3-.5-1.4.1-2.9 0 0 .9-.3 3 1.1a10.4 10.4 0 0 1 5.5 0c2.1-1.4 3-1.1 3-1.1.6 1.5.2 2.6.1 2.9.7.8 1.1 1.8 1.1 3 0 4.2-2.6 5.1-5 5.4.4.4.7 1 .7 2v3c0 .3.2.6.8.5 4.4-1.5 7.4-5.5 7.4-10.4C23 5.5 18.3.8 12 .8"/>',
  translate:
    '<path d="M4 5h10M9 3v2c0 4-2.5 7-5 9m2-6c.8 2.6 3 5 6 6m2-1 3.5-8 3.5 8m-6-2.5h5" stroke-width="1.5"/>',
  link: '<path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" stroke-width="1.6"/>',
};

export function icon(name, size = 20) {
  const body = ICONS[name] ?? ICONS.link;
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
}

export function href(lang, path = "") {
  const clean = String(path).replace(/^\/+/, "");
  return `/${lang}/${clean}`;
}

const UI = {
  zh: { menu: "菜单", skip: "跳到主要内容", nav: "主导航", contact: "联系我" },
  en: { menu: "Menu", skip: "Skip to content", nav: "Main navigation", contact: "Get in touch" },
};

const SCRIPT = `
(function () {
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 24) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        mobileMenu.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.08) {
          el.classList.add('is-in');
        } else if (!entry.isIntersecting) {
          el.classList.remove('is-in');
        }
      });
    }, { threshold: [0, 0.08, 0.3, 0.6], rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  document.querySelectorAll('.tabs [data-tab]').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('.tabs [data-tab]').forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');
    });
  });
})();
`;

function head({ site, lang, title, description, canonical, altZh, altEn, preloadHero = false }) {
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="zh-CN" href="${altZh}">
<link rel="alternate" hreflang="en" href="${altEn}">
<link rel="alternate" hreflang="x-default" href="${site.url}/">
<meta name="theme-color" content="#0b3441">
<meta name="author" content="${escapeHtml(site.author)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${escapeHtml(site.author)}">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site.url}/assets/hero-1920.jpg">
<meta property="og:locale" content="${lang === "zh" ? "zh_CN" : "en_US"}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/assets/site.css">
<link rel="sitemap" type="application/xml" href="/sitemap.xml">
${preloadHero ? `<link rel="preload" as="image" href="/assets/hero-1920.jpg" imagesrcset="/assets/hero-960.jpg 960w, /assets/hero-1920.jpg 1920w" imagesizes="100vw">` : ""}`;
}

function header({ site, lang, active, altHref }) {
  const ui = UI[lang];
  const other = lang === "zh" ? "en" : "zh";
  const links = site.nav
    .map((item) => {
      const isActive = item.key === active;
      return `<a class="nav__link${isActive ? " is-active" : ""}" href="${href(lang, item.href)}"${
        isActive ? ' aria-current="page"' : ""
      }>${escapeHtml(item[lang])}</a>`;
    })
    .join("\n        ");

  const mobileLinks = site.nav
    .map((item) => `<a href="${href(lang, item.href)}">${escapeHtml(item[lang])}</a>`)
    .join("\n        ");

  return `<header class="site-header" id="siteHeader">
  <div class="site-header__inner container">
    <a class="brand" href="${href(lang)}" aria-label="manfiah"><img src="/assets/mark-256.jpg" alt="" width="26" height="26"><span>manfiah</span></a>

    <nav class="nav" aria-label="${ui.nav}">
        ${links}
    </nav>

    <div class="header-actions">
      <a class="lang" href="${altHref}" hreflang="${HTML_LANG[other]}" lang="${HTML_LANG[other]}">${icon(
        "translate",
        15,
      )}<span>${other === "zh" ? "中文" : "EN"}</span></a>
      <a class="pill header-cta" href="mailto:${escapeHtml(site.email)}">${escapeHtml(ui.contact)}</a>
      <button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="mobileMenu" aria-label="${ui.menu}">${icon(
        "menu",
        19,
      )}</button>
    </div>
  </div>
</header>

<div class="mobile-menu" id="mobileMenu">
  <nav aria-label="${ui.nav}">
        ${mobileLinks}
  </nav>
  <a class="mobile-lang" href="${altHref}" hreflang="${HTML_LANG[other]}" lang="${HTML_LANG[other]}">${
    other === "zh" ? "中文" : "English"
  }</a>
</div>`;
}

function footer({ site, lang }) {
  const other = lang === "zh" ? "en" : "zh";
  const year = new Date().getFullYear();
  const navLinks = site.nav
    .map((item) => `<a href="${href(lang, item.href)}">${escapeHtml(item[lang])}</a>`)
    .join("\n          ");

  return `<footer class="site-footer">
  <div class="container">
    <div class="site-footer__grid">
      <div>
        <a class="site-footer__brand" href="${href(lang)}"><img src="/assets/mark-256.jpg" alt="" width="24" height="24"><span>manfiah</span></a>
        <p class="site-footer__note">${escapeHtml(site.tagline[lang])}</p>
      </div>
      <div>
        <h3 class="site-footer__title">${lang === "zh" ? "浏览" : "Explore"}</h3>
        <div class="site-footer__links">
          ${navLinks}
        </div>
      </div>
      <div>
        <h3 class="site-footer__title">${lang === "zh" ? "联系" : "Connect"}</h3>
        <div class="site-footer__links">
          ${site.socials
            .map(
              (s) =>
                `<a href="${s.url}"${
                  /^https?:/i.test(s.url) ? ' target="_blank" rel="noopener noreferrer"' : ""
                }>${escapeHtml(s.label)}</a>`,
            )
            .join("\n          ")}
          <a href="/sitemap.xml">Sitemap</a>
        </div>
      </div>
    </div>
    <div class="site-footer__bottom">
      <span>© ${year} ${escapeHtml(site.author)} · ${escapeHtml(site.domain)}</span>
      <span><a href="${href(other)}" hreflang="${HTML_LANG[other]}">${other === "zh" ? "中文" : "English"}</a></span>
    </div>
  </div>
</footer>`;
}

export function giscusBlock({ site, lang }) {
  const g = site.giscus;
  if (!g?.enabled || !g.repo || !g.repoId) {
    return `<section class="comments">
      <h2 class="comments__title">${lang === "zh" ? "评论" : "Comments"}</h2>
      <p class="comments__note">${
        lang === "zh" ? "评论区尚未启用。完成 Giscus 配置后，这里会显示留言框。" : "Comments are not enabled yet."
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
        data-theme="dark_dimmed"
        data-lang="${lang === "zh" ? "zh-CN" : "en"}"
        data-loading="lazy"
        crossorigin="anonymous"
        async>
      </script>
    </section>`;
}

export function renderDocument({
  site,
  lang,
  active = "",
  title,
  description,
  path = "",
  content,
  comments = false,
  bodyClass = "",
  altHref,
  preloadHero = false,
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
    preloadHero,
  })}
</head>
<body class="${bodyClass}">
<a class="skip" href="#main">${UI[lang].skip}</a>
${header({
    site,
    lang,
    active,
    altHref: altHref ? altHref[lang === "zh" ? "en" : "zh"] : href(lang === "zh" ? "en" : "zh", path),
  })}
<main id="main">
${content}
</main>
${footer({ site, lang })}
${comments ? "" : ""}
<script>${SCRIPT}</script>
</body>
</html>`;
}

/** 根路径：中英选择页 */
export function renderRoot({ site }) {
  const socials = site.socials
    .map(
      (s) =>
        `<a href="${s.url}"${/^https?:/i.test(s.url) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(
          s.label,
        )}</a>`,
    )
    .join(" · ");

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
  })}
</head>
<body>
<main id="main">
  <div class="chooser">
    <div class="chooser__inner">
      <img class="chooser__mark" src="/assets/mark-256.jpg" alt="" width="76" height="76">
      <h1 class="chooser__title">manfiah</h1>
      <p class="chooser__sub">${escapeHtml(site.tagline.zh)} / ${escapeHtml(site.tagline.en)}</p>
      <div class="chooser__grid">
        <a class="chooser__card" href="/zh/">
          <h2>中文</h2>
          <p>进入中文版：作品、影像与文字。</p>
          <span class="arrow-line">进入 ${icon("arrow", 15)}</span>
        </a>
        <a class="chooser__card" href="/en/">
          <h2>English</h2>
          <p>Enter the English site: work, images and words.</p>
          <span class="arrow-line">Enter ${icon("arrow", 15)}</span>
        </a>
      </div>
      <p class="site-footer__bottom" style="justify-content:center; border:0; margin-top:48px;">${socials}</p>
    </div>
  </div>
</main>
<script>${SCRIPT}</script>
</body>
</html>`;
}
