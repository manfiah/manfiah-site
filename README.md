# manfiah.win — 个人主页与作品集

零依赖静态网站：Material Design 3 风格、中英双语、博客与评论。
部署在 Cloudflare Pages（免费、自动 HTTPS、全球 CDN）。

---

## 一、本地预览

在 `manfiah-site` 文件夹里打开终端，执行：

```powershell
node build.mjs      # 把 content/ 生成到 dist/
node serve.mjs      # 启动本地预览
```

然后浏览器打开 <http://localhost:8080> 。
停止预览：在终端按 `Ctrl + C`。

> 一条命令搞定预览：`node build.mjs; node serve.mjs`

---

## 二、平时改内容，只需要动这几个文件

| 我想改… | 改这个文件 |
| --- | --- |
| 名字、邮箱、简介、社交链接、导航 | `site.config.mjs` |
| 「关于我」页面正文 | `content/about.zh.md`（中文）、`content/about.en.md`（英文） |
| 作品集里的项目 | `content/projects.mjs` |
| 新增中文文章 | `content/posts/zh/新文件名.md` |
| 新增英文文章 | `content/posts/en/新文件名.md` |
| 颜色、圆角、字体、间距 | `src/styles/material.css` 开头的颜色变量 |
| 页面结构 / 导航栏 / 页脚 | `src/layout.mjs` |
| Markdown 支持的语法 | `src/md.mjs` |

### 写一篇新文章的格式

```markdown
---
title: "文章标题"
date: 2025-10-20
tags: [标签一, 标签二]
excerpt: "列表页显示的一句话摘要。"
---

正文从这里开始，支持 **粗体**、*斜体*、`行内代码`、[链接](https://example.com)。

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

> 想让中英文文章互相切换，两种语言用**相同的文件名**即可自动配对。

---

## 三、部署到 Cloudflare Pages（GitHub 方式，推荐）

### 1. 把代码传到 GitHub

1. 打开 <https://github.com/new>，仓库名填 `manfiah-site`，选 **Public**，点 **Create repository**
2. 在新仓库页面点 **Add file → Upload files**
3. 把 `C:\deep seek\manfiah-site` 里的**所有文件和文件夹**拖进去
   （`dist/` 文件夹不用传，Cloudflare 会自己生成；`.gitignore` 已帮你忽略它）
4. 点 **Commit changes**

### 2. 在 Cloudflare 创建 Pages 项目

1. 打开 <https://dash.cloudflare.com/> 登录
2. 左侧 **Workers & Pages** → **Create** → 选 **Pages** 标签 → **Connect to Git**
3. 授权 GitHub，选择刚才的 `manfiah-site` 仓库 → **Begin setup**
4. 构建配置填（很重要）：

   | 项目 | 填写内容 |
   | --- | --- |
   | Project name | `manfiah-win` |
   | Production branch | `main` |
   | Framework preset | `None` |
   | Build command | `node build.mjs` |
   | Build output directory | `dist` |

5. 点 **Save and Deploy**，等 1–2 分钟，会得到一个 `manfiah-win.pages.dev` 的临时网址

> 这里不需要 `npm install`：本项目零第三方依赖。

### 3. 绑定自定义域名

1. 进入这个 Pages 项目 → **Custom domains** → **Set up a custom domain**
2. 先填 `manfiah.win`（根域名）→ 确认 → Cloudflare 会自动加好 DNS 记录（因为你的 DNS 就在 Cloudflare）
3. 再点一次 **Set up a custom domain**，填 `www.manfiah.win`
4. 等 1–5 分钟，两个域名都会自动签发 HTTPS 证书

**www 怎么处理**：建议让 `www.manfiah.win` 自动跳转到 `manfiah.win`，做法是在 Pages 项目的
**Custom domains** 里把 `manfiah.win` 设为主域名，然后在 Cloudflare 的
**Rules → Redirect Rules** 里建一条规则：`www.manfiah.win/*` → `https://manfiah.win/$1`（301）。

---

## 四、以后怎么更新

**方式一（最简单）**：在 GitHub 网页上直接改

1. 打开仓库 → 进入 `content/posts/zh/` → **Add file → Create new file**
2. 文件名 `my-new-post.md`，粘贴上面的文章模板，写完
3. 点 **Commit changes**
4. Cloudflare Pages 会自动重新构建，约 1 分钟后线上更新

**方式二（本地改）**：

```powershell
node build.mjs      # 本地确认能构建成功
node serve.mjs      # 本地看一眼
```
确认没问题后再把改动上传到 GitHub（网页上传或 Git 命令均可）。

---

## 五、开启评论区（Giscus）

1. **开启 Discussions**：GitHub 仓库 → **Settings** → **General** → 勾选 **Discussions**
2. **建分类**：仓库顶部 **Discussions** → 分类旁的设置 → 确认有 `Announcements` 分类
3. **安装 App**：打开 <https://github.com/apps/giscus> → **Install** → 选择你的仓库
4. **拿 ID**：打开 <https://giscus.app/zh-CN>
   - Repository 填 `你的用户名/manfiah-site`（通过校验后会出现两个 ID）
   - Discussion Category 选 `Announcements`
   - 复制页面给出的 `data-repo-id` 和 `data-category-id`
5. **填配置**：编辑 `site.config.mjs` 里的 `giscus`：

```js
giscus: {
  enabled: true,              // ← 改成 true
  repo: "你的用户名/manfiah-site",
  repoId: "R_xxxxxxx",        // ← 粘贴
  category: "Announcements",
  categoryId: "DIC_xxxxxxx",  // ← 粘贴
  ...
}
```

6. 重新构建并上传（或直接在 GitHub 网页上改这个文件），评论框就会出现在每篇文章底部。

---

## 六、常见问题

| 现象 | 原因与解决 |
| --- | --- |
| `node build.mjs` 报错找不到模块 | 确认终端当前目录是 `manfiah-site` |
| 线上还是旧内容 | Cloudflare 构建需要 1–2 分钟；到 Pages → Deployments 看构建状态 |
| 构建失败 | 看 Pages 部署日志；常见原因是 `content/posts/` 里 frontmatter 少了 `---` |
| 域名打不开 | 先确认 `xxx.pages.dev` 能打开；再检查 Custom domains 里域名状态是否为 Active |
| 评论不显示 | 检查 `enabled: true`、两个 ID 是否贴全、仓库是否为 Public |
| 中文页面 404 | 网址要带语言前缀：`manfiah.win/zh/`；根域名是语言选择页 |

---

## 七、项目结构

```
manfiah-site/
├── build.mjs              构建脚本（Markdown → HTML，零依赖）
├── serve.mjs              本地预览服务器（零依赖）
├── site.config.mjs        站点配置（名字/邮箱/社交/Giscus）
├── package.json           只有脚本命令，没有第三方依赖
├── content/
│   ├── about.zh.md        关于我（中文）
│   ├── about.en.md        关于我（英文）
│   ├── projects.mjs       作品集数据
│   └── posts/{zh,en}/     博客文章（Markdown）
├── src/
│   ├── layout.mjs         页面框架（导航、页脚、评论挂载）
│   ├── md.mjs             Markdown 解析器
│   ├── styles/material.css  Material Design 3 样式
│   └── assets/            头像、favicon
└── dist/                  构建产物（部署的就是它，可随时删除重建）
```
