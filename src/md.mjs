/**
 * 极简 Markdown → HTML 转换器（零依赖）
 * 支持：frontmatter、标题、段落、粗体/斜体、行内代码、链接、图片、
 *      无序/有序列表、引用、分割线、围栏代码块。
 * 所有文本都会做 HTML 转义，避免注入问题。
 */

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(str = "") {
  return String(str).replace(/[&<>"']/g, (c) => ESCAPES[c]);
}

/** 解析文件开头的 --- 元数据块 */
export function parseFrontmatter(raw = "") {
  const text = raw.replace(/^\uFEFF/, "");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!match) return { data: {}, content: text };

  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      data[key] = value;
    }
  }
  return { data, content: text.slice(match[0].length) };
}

/** 行内语法：图片、链接、粗体、斜体、行内代码 */
function inline(text) {
  let out = escapeHtml(text);

  // 行内代码（先处理，避免内部被其它规则改写）
  const codes = [];
  out = out.replace(/`([^`]+)`/g, (_, code) => {
    codes.push(code);
    return `\u0000CODE${codes.length - 1}\u0000`;
  });

  // 图片 ![alt](src)
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (_, alt, src, title) =>
      `<img src="${src}" alt="${alt}"${title ? ` title="${title}"` : ""} loading="lazy">`);

  // 链接 [text](href)
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_, label, href) => {
      const external = /^https?:\/\//i.test(href);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${href}"${attrs}>${label}</a>`;
    });

  // 粗体 / 斜体
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  out = out.replace(/~~([^~]+)~~/g, "<del>$1</del>");

  // 还原行内代码
  out = out.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`);
  return out;
}

/** 渲染正文 */
export function renderMarkdown(markdown = "") {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let i = 0;

  const flushParagraph = (buffer) => {
    if (buffer.length) html.push(`<p>${inline(buffer.join(" ").trim())}</p>`);
    buffer.length = 0;
  };

  const paragraph = [];

  while (i < lines.length) {
    const line = lines[i];

    // 围栏代码块
    const fence = /^```\s*([\w+-]*)\s*$/.exec(line);
    if (fence) {
      flushParagraph(paragraph);
      const lang = fence[1];
      const body = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++; // 跳过结束 ```
      const cls = lang ? ` class="language-${escapeHtml(lang)}"` : "";
      html.push(`<pre><code${cls}>${escapeHtml(body.join("\n"))}</code></pre>`);
      continue;
    }

    // 标题
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph(paragraph);
      const level = heading[1].length;
      const text = heading[2].trim();
      const id = text.toLowerCase().replace(/[^\w\u4e00-\u9fa5]+/g, "-").replace(/^-|-$/g, "");
      html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    // 分割线
    if (/^\s*([-*_])\s*\1\s*\1[\s\-*_]*$/.test(line)) {
      flushParagraph(paragraph);
      html.push("<hr>");
      i++;
      continue;
    }

    // 引用
    if (/^>\s?/.test(line)) {
      flushParagraph(paragraph);
      const body = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      html.push(`<blockquote>${renderMarkdown(body.join("\n"))}</blockquote>`);
      continue;
    }

    // 列表
    const isUl = /^\s*[-*+]\s+/.test(line);
    const isOl = /^\s*\d+\.\s+/.test(line);
    if (isUl || isOl) {
      flushParagraph(paragraph);
      const ordered = isOl;
      const items = [];
      while (
        i < lines.length &&
        (ordered ? /^\s*\d+\.\s+/.test(lines[i]) : /^\s*[-*+]\s+/.test(lines[i]))
      ) {
        items.push(lines[i].replace(/^\s*(?:[-*+]|\d+\.)\s+/, ""));
        i++;
      }
      const tag = ordered ? "ol" : "ul";
      html.push(`<${tag}>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</${tag}>`);
      continue;
    }

    // 空行 → 结束当前段落
    if (!line.trim()) {
      flushParagraph(paragraph);
      i++;
      continue;
    }

    paragraph.push(line.trim());
    i++;
  }

  flushParagraph(paragraph);
  return html.join("\n");
}

/** 取纯文本摘要（用于列表页的 excerpt） */
export function plainText(markdown = "", max = 160) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}
