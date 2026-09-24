/**
 * 本地预览服务器（零依赖，只用 Node 自带模块）
 * 用法：node serve.mjs          → http://localhost:8080
 *      node serve.mjs 3000     → 换端口
 * 只读取 dist/ 目录，不会修改你的源码。
 */
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("./dist/", import.meta.url)));
const PORT = Number(process.argv[2]) || 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".woff2": "font/woff2",
  ".webmanifest": "application/manifest+json",
};

async function readMaybe(file) {
  try {
    return await readFile(file);
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  try {
    const urlPath = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let target = resolve(join(ROOT, urlPath));

    // 安全检查：禁止跳出 dist 目录
    if (!target.startsWith(ROOT + sep) && target !== ROOT) {
      res.writeHead(403).end("403 Forbidden");
      return;
    }

    let body = await readMaybe(target);
    if (body === null && !extname(target)) {
      body = await readMaybe(join(target, "index.html"));
      if (body !== null) target = join(target, "index.html");
    }
    if (body === null) {
      const notFound = (await readMaybe(join(ROOT, "404.html"))) ?? Buffer.from("404 Not Found");
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" }).end(notFound);
      console.log(`404  ${urlPath}`);
      return;
    }

    res.writeHead(200, {
      "content-type": MIME[extname(target).toLowerCase()] ?? "application/octet-stream",
      "cache-control": "no-cache",
    });
    res.end(body);
    console.log(`200  ${urlPath}`);
  } catch (err) {
    res.writeHead(500).end("500 " + err.message);
    console.error("500 ", err.message);
  }
});

server.listen(PORT, () => {
  console.log(`\n  本地预览已启动：http://localhost:${PORT}`);
  console.log(`  目录：${ROOT}`);
  console.log("  按 Ctrl + C 停止\n");
});
