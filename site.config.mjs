/**
 * ============================================================
 *  站点配置文件 —— 你以后主要改这一个文件就够
 * ============================================================
 *  带 "TODO" 的地方是需要你替换成自己信息的内容。
 *  改完保存即可，不需要懂编程。
 * ============================================================
 */

export const site = {
  /** 你的域名（部署后使用） */
  domain: "manfiah.win",
  url: "https://manfiah.win",

  /** 你的名字 / 昵称（会显示在标题和页脚） */
  author: "manfiah",

  /** 头像图片路径：默认用 assets/avatar.svg，可换成 assets/avatar.jpg 后改这里 */
  avatar: "/assets/avatar.svg",

  /** 联系方式：TODO 换成你自己的邮箱 */
  email: "hello@manfiah.win",

  /** 双语标题 */
  title: {
    zh: "manfiah · 个人网站",
    en: "manfiah · Personal site",
  },

  /** 双语一句话简介（显示在首页大标题下） */
  tagline: {
    zh: "车与光影之间的记录者。",
    en: "Documenting cars, light and the space between.",
  },

  /** 双语 SEO 描述 */
  description: {
    zh: "manfiah 的个人网站：汽车展览馆、摄影集与写作。",
    en: "manfiah's personal site: car exhibition hall, photography collection and writing.",
  },

  /** 首页自我介绍段落（TODO 改成你的话） */
  intro: {
    zh: "你好，我是 Manfiah。这里放我做过的项目、写下的文章，以及联系方式。",
    en: "Hi, I'm Manfiah. This is where I keep my projects, notes and ways to reach me.",
  },

  /**
   * 社交链接：TODO 把 url 换成你自己的主页地址。
   * icon 可选：github / mail / x / linkedin / bilibili / wechat
   */
  socials: [
    { label: "GitHub", icon: "github", url: "https://github.com/manfiah" },
    { label: "Email", icon: "mail", url: "mailto:hello@manfiah.win" },
  ],

  /** 顶部导航（href 不用加语言前缀，构建时自动补 /zh/ 或 /en/） */
  nav: [
    { key: "home", href: "", zh: "首页", en: "Home" },
    { key: "about", href: "about/", zh: "关于", en: "About" },
    { key: "gallery", href: "gallery/", zh: "摄影集", en: "Gallery" },
    { key: "blog", href: "blog/", zh: "博客", en: "Journal" },
  ],

  /** 页脚版权年份是否自动更新 */
  autoYear: true,

  /**
   * ------------------------------------------------------------
   *  Giscus 评论（免费，基于 GitHub Discussions）
   * ------------------------------------------------------------
   *  第 9 步会带你去 https://giscus.app/zh-CN 生成下面 4 个值，
   *  填好并把 enabled 改成 true 即可显示评论区。
   */
  giscus: {
    enabled: false,
    repo: "", // 例如 "你的用户名/manfiah-site"
    repoId: "",
    category: "General",
    categoryId: "",
    mapping: "pathname",
    reactionsEnabled: "1",
    inputPosition: "top",
    theme: "preferred_color_scheme",
  },
};

export default site;
