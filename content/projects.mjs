/**
 * ============================================================
 *  作品集数据 —— TODO 把下面的示例项目换成你自己的项目
 * ============================================================
 *  每个项目支持这些字段：
 *    icon     图标：work / article / github / link / mail
 *    year     年份（数字）
 *    title    { zh: "中文名", en: "English name" }
 *    summary  { zh: "中文简介", en: "English summary" }
 *    tags     标签数组，例如 ["React", "TypeScript"]
 *    link     项目在线地址（没有就留空字符串）
 *    repo     源码地址（没有就留空字符串）
 *  link 和 repo 都留空时，卡片不可点击。
 * ============================================================
 */

export const projects = [
  {
    slug: "manfiah-win",
    icon: "work",
    year: 2025,
    title: { zh: "个人网站 manfiah.win", en: "Personal site manfiah.win" },
    summary: {
      zh: "零依赖静态站点：Material Design 3 风格、中英双语、博客与评论，免费托管在 Cloudflare Pages 上。",
      en: "A zero-dependency static site: Material Design 3 styling, bilingual content, blog and comments, hosted free on Cloudflare Pages.",
    },
    tags: ["HTML", "CSS", "Node.js", "Cloudflare Pages"],
    link: "https://manfiah.win",
    repo: "",
  },
  {
    slug: "sample-project-two",
    icon: "article",
    year: 2025,
    title: { zh: "示例项目二：写作与发布流程", en: "Sample project two: writing workflow" },
    summary: {
      zh: "用 Markdown 写文章、提交到 GitHub，网站自动重新构建并上线。这段文字是示例，请替换成你自己的项目。",
      en: "Write in Markdown, push to GitHub, and the site rebuilds and redeploys itself. This is sample text — replace it with your own project.",
    },
    tags: ["Markdown", "GitHub", "CI"],
    link: "",
    repo: "",
  },
  {
    slug: "sample-project-three",
    icon: "github",
    year: 2024,
    title: { zh: "示例项目三：小工具 / 实验", en: "Sample project three: tool or experiment" },
    summary: {
      zh: "这里可以放一个开源小工具、一次技术实验，或者任何你想展示的东西。",
      en: "Put an open-source utility, a technical experiment, or anything else worth showing here.",
    },
    tags: ["Open Source"],
    link: "",
    repo: "",
  },
];
