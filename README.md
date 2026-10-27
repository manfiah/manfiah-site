# manfiah.win — 个人网站

深色编辑风首页 + 浅色阅读页；零依赖静态站、中英双语、博客与评论。
部署在 Cloudflare Pages（免费、自动 HTTPS、全球 CDN）。

首屏设计参考 jiro.build 的 **Luxury Residential Properties – Estaymart** 模板。

---

## 一、本地预览

在 `manfiah-site` 文件夹里打开终端：

```powershell
node build.mjs      # 把 content/ + src/ 生成到 dist/
node serve.mjs      # 启动本地预览
```

浏览器打开 <http://localhost:8080> ，停止按 `Ctrl + C`。

> 想直接看截图（不用开浏览器）：`node tools/shot.mjs`，会把桌面版/手机版整页截图存到 `..\ref\`。

---

## 二、平时改内容，动这几个文件就够

| 我想改… | 改这个文件 |
| --- | --- |
| 站点名、邮箱、社交链接、导航 | `site.config.mjs` |
| 首屏大标题、副标题、各区块文案（中英） | `build.mjs` 顶部的 `UI` 对象 |
| 首屏主视觉图 | 覆盖 `src/assets/hero-1920.jpg` 和 `hero-960.jpg` |
| 「关于」页正文（汽车展览馆） | `content/about.zh.md`、`content/about.en.md` |
| 摄影集系列 | `content/projects.mjs` |
| 新增中文文章 | `content/posts/zh/新文件名.md` |
| 新增英文文章 | `content/posts/en/新文件名.md` |
| 颜色、字体、圆角、间距 | `src/styles/site.css` 开头的变量 |
| 导航 / 页脚 / 移动端菜单 | `src/layout.mjs` |
| Markdown 支持的语法 | `src/md.mjs` |

### 写一篇新文章

```markdown
---
title: "文章标题"
date: 2026-10-20
tags: [标签一, 标签二]
excerpt: "列表页显示的一句话摘要。"
---

正文从这里开始，支持 **粗体**、*斜体*、`行内代码`、[链接](https://example.com)、图片。

## 小标题

- 列表项
- 列表项

> 引用

```js
// 代码块
const hello = "world";
```
```

**文件名就是网址**：`content/posts/zh/hello-world.md` → `https://manfiah.win/zh/blog/hello-world/`
中英文用**相同文件名**，语言切换就能互相对应。

### 换首屏大图

1. 准备一张宽屏图（建议 1920×1080 左右，JPG）
2. 覆盖 `src/assets/hero-1920.jpg`，再存一份 960 宽的为 `hero-960.jpg`
3. 重新构建并上传即可

---

## 三、部署到 Cloudflare Pages（GitHub 方式）

> 你的站点已经部署过一次，以下步骤留作记录。

### 1. 把代码传到 GitHub

1. <https://github.com/new> → 仓库名 `manfiah-site` → **Public** → **Create repository**
2. 仓库页 **Add file → Upload files**
3. 把 `C:\deep seek\upload-to-github` 里的**所有文件和文件夹**拖进去（`dist/` 不需要传）
4. **Commit changes**

### 2. 在 Cloudflare 创建 Pages 项目

1. <https://dash.cloudflare.com/> → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. 选仓库 `manfiah/manfiah-site` → **Begin setup**
3. 构建配置：

   | 项目 | 填写内容 |
   | --- | --- |
   | Project name | `manfiah-win` |
   | Production branch | `main` |
   | Framework preset | `None` |
   | Build command | `node build.mjs` |
   | Build output directory | `dist` |

4. **Save and Deploy** → 约 1 分钟后上线

> 不需要 `npm install`：本项目零第三方依赖。

### 3. 绑定域名

1. 项目 → **Custom domains** → **Set up a custom domain** → `manfiah.win` → Activate
2. 再来一次 → `www.manfiah.win` → Activate
3. 两个都显示 **Active** 后，HTTPS 证书自动签发

**www 跳主域名**：Cloudflare → **Rules → Redirect Rules** → 新建：
`Hostname equals www.manfiah.win` → `https://manfiah.win/$1`（301）。

---

## 四、以后怎么更新

**方式一（最简单）**：在 GitHub 网页上改

1. 仓库 → `content/posts/zh/` → **Add file → Create new file**
2. 文件名 `my-new-post.md`，粘贴文章模板
3. **Commit changes** → Cloudflare 自动重新构建，约 1 分钟线上更新

**方式二（本地改）**：

```powershell
node build.mjs      # 本地确认能构建成功
node serve.mjs      # 本地看一眼
```
确认没问题再把改动的文件拖到 GitHub（网页上传即可）。

---

## 五、开启评论区（Giscus）

1. 仓库 → **Settings → General → Features** → 勾选 **Discussions**
2. 仓库 → **Discussions** → 确认有 `Announcements` 分类
3. <https://github.com/apps/giscus> → **Install** → 选择 `manfiah-site`
4. <https://giscus.app/zh-CN> → Repository 填 `manfiah/manfiah-site` → Category 选 `Announcements`
   → 复制 `data-repo-id` 和 `data-category-id`
5. 编辑 `site.config.mjs`：

```js
giscus: {
  enabled: true,                 // ← 改成 true
  repo: "manfiah/manfiah-site",
  repoId: "R_kgDOUos5bg",        // ← 已预填（可核对）
  category: "Announcements",
  categoryId: "DIC_xxxxxxx",     // ← 粘贴
  ...
}
```

6. 重新构建 + 上传（或直接在 GitHub 网页上改这个文件）

---

## 六、常见问题

| 现象 | 原因与解决 |
| --- | --- |
| `node build.mjs` 报错找不到模块 | 确认终端当前目录是 `manfiah-site` |
| 线上还是旧内容 | Cloudflare 构建要 1–2 分钟；Pages → Deployments 看状态 |
| 构建失败 | 看部署日志；常见是 `content/posts/` 里 frontmatter 少了 `---` |
| 域名打不开 | 先确认 `xxx.pages.dev` 能开；再看 Custom domains 是否 Active |
| 评论不显示 | `enabled: true`？两个 ID 贴全？仓库是 Public？ |
| 中文页 404 | 网址要带语言前缀：`manfiah.win/zh/` |
| 首页图更新了但没变 | 浏览器缓存；强制刷新（Ctrl+F5）或等 CDN 1 分钟 |

---

## 七、项目结构

```
manfiah-site/
├── build.mjs              构建脚本（Markdown → HTML，零依赖）
├── serve.mjs              本地预览服务器（零依赖）
├── site.config.mjs        站点配置（名字/邮箱/社交/导航/Giscus）
├── package.json           只有脚本命令，没有第三方依赖
├── README.md              本文件
├── 部署清单.md             勾选式部署步骤
├── content/
│   ├── about.zh.md        关于页正文（中文）
│   ├── about.en.md        关于页正文（英文）
│   ├── projects.mjs       摄影集系列数据
│   └── posts/{zh,en}/     博客文章（Markdown）
├── src/
│   ├── layout.mjs         页面框架（导航、移动端菜单、页脚）
│   ├── md.mjs             Markdown 解析器
│   ├── styles/site.css    全站样式（深色 + 浅色两套）
│   └── assets/            头像、favicon、首页主视觉图
├── tools/
│   └── shot.mjs           无头浏览器截图（本地验收用，可选）
└── dist/                  构建产物（部署的就是它，可随时删除重建）
```
