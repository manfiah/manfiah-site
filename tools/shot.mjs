/**
 * 用系统自带的 Edge（无头模式）给站点截图，方便肉眼验收设计。
 * 用法：node tools/shot.mjs
 * 输出：ref/shot-desktop.png、ref/shot-mobile.png
 *
 * 原理：起一个临时静态服务器 → 用 CDP 协议驱动 Edge →
 *       注入“关闭动画 + 展开所有入场元素”的样式 → 整页截图。
 */
import { createServer } from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join, extname, resolve, sep } from "node:path";

const PROJECT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ROOT = join(PROJECT, "dist");
const OUT = join(PROJECT, "..", "ref");
const PORT = 8099;
const DEBUG_PORT = 9333;
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
};

/* ---------- 静态服务器 ---------- */
function startServer() {
  return new Promise((ok) => {
    const server = createServer(async (req, res) => {
      try {
        let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
        let file = resolve(join(ROOT, p));
        if (!file.startsWith(ROOT)) return res.writeHead(403).end();
        let body = await readFile(file).catch(() => null);
        if (body === null && !extname(file)) {
          file = join(file, "index.html");
          body = await readFile(file).catch(() => null);
        }
        if (body === null) return res.writeHead(404).end("404");
        res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
        res.end(body);
      } catch {
        res.writeHead(500).end();
      }
    });
    server.listen(PORT, "127.0.0.1", () => ok(server));
  });
}

/* ---------- 极简 CDP 客户端 ---------- */
class CDP {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { res, rej } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? rej(new Error(JSON.stringify(msg.error))) : res(msg.result);
      }
    };
  }
  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((res, rej) => {
      this.pending.set(id, { res, rej });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitJson(url, tries = 60) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.json();
    } catch {}
    await sleep(250);
  }
  throw new Error("CDP endpoint not reachable: " + url);
}

const FREEZE = `(() => {
  const s = document.createElement('style');
  s.textContent = '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}';
  document.head.appendChild(s);
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-in'));
  document.querySelectorAll('.hero__title .line > span').forEach(el => { el.style.transform = 'none'; });
  window.scrollTo(0, 0);
})();`;

async function main() {
  await mkdir(OUT, { recursive: true });
  const server = await startServer();

  const edge = spawn(
    EDGE,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${join(OUT, "edge-profile")}`,
      "about:blank",
    ],
    { stdio: "ignore", detached: false },
  );

  const list = await waitJson(`http://127.0.0.1:${DEBUG_PORT}/json/list`);
  const page = list.find((t) => t.type === "page");
  if (!page) throw new Error("no page target");

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    ws.onopen = res;
    ws.onerror = rej;
  });
  const cdp = new CDP(ws);
  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");

  async function shot({ width, height, url, file, mobile }) {
    await cdp.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: mobile ? 2 : 1,
      mobile: !!mobile,
    });
    await cdp.send("Page.navigate", { url });
    await sleep(1800);
    await cdp.send("Runtime.evaluate", { expression: FREEZE, awaitPromise: false });
    await sleep(900);
    const { data } = await cdp.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
    });
    await writeFile(join(OUT, file), Buffer.from(data, "base64"));
    console.log("saved", file);
  }

  await shot({ width: 1440, height: 900, url: `http://127.0.0.1:${PORT}/zh/`, file: "shot-desktop.png" });
  await shot({ width: 390, height: 844, url: `http://127.0.0.1:${PORT}/zh/`, file: "shot-mobile.png", mobile: true });
  await shot({ width: 1440, height: 900, url: `http://127.0.0.1:${PORT}/`, file: "shot-root.png" });
  await shot({ width: 1440, height: 900, url: `http://127.0.0.1:${PORT}/zh/gallery/`, file: "shot-gallery.png" });
  await shot({ width: 1440, height: 900, url: `http://127.0.0.1:${PORT}/zh/about/`, file: "shot-about.png" });
  await shot({ width: 1440, height: 900, url: `http://127.0.0.1:${PORT}/zh/blog/hello-world/`, file: "shot-post.png" });

  // --- 验证：滚动后动效能否重播 ---
  await cdp.send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await cdp.send("Page.navigate", { url: `http://127.0.0.1:${PORT}/zh/` });
  await sleep(1500);
  await cdp.send("Runtime.evaluate", { expression: "document.documentElement.style.scrollBehavior='auto'" });

  const state = async (label) => {
    const r = await cdp.send("Runtime.evaluate", {
      expression: `(function(){
        var els = document.querySelectorAll('.reveal');
        var first = els[0];
        var top = Math.round(first.getBoundingClientRect().top);
        var marked = document.querySelectorAll('.reveal.is-in').length;
        return 'firstTop=' + top + ' firstIn=' + first.classList.contains('is-in') + ' marked=' + marked + '/' + els.length;
      })()`,
      returnByValue: true,
    });
    console.log("[reveal] " + label + ": " + r.result.value);
  };

  await state("页面顶部");
  await cdp.send("Runtime.evaluate", { expression: "window.scrollTo(0, 1400)" });
  await sleep(1100);
  await state("下滑到 1400");
  await cdp.send("Runtime.evaluate", { expression: "window.scrollTo(0, 0)" });
  await sleep(1100);
  await state("回到顶部");
  await cdp.send("Runtime.evaluate", { expression: "window.scrollTo(0, 1400)" });
  await sleep(1100);
  await state("再次下滑");

  ws.close();
  edge.kill();
  server.close();
  console.log("done");
}

main().catch((e) => {
  console.error("shot failed:", e);
  process.exit(1);
});
