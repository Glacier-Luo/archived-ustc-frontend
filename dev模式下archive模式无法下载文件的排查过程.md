# ARCHIVE 模式下 /media/ 静态文件无法在浏览器中下载的问题分析

## 问题现象

在 ARCHIVE 模式下（`pnpm archive:dev`），访问 `http://localhost:3333/media/puzzle/504/meteor.zip`：
- **wget/curl**：正常下载（200 OK）
- **浏览器**（包括新标签页直接打开）：显示网站自己的 404 页面

## 排查过程

### 1. 排除 .env.local 覆盖问题

上一个 AI 认为 `.env.local` 中 `VITE_ARCHIVE_MODE=FALSE` 会覆盖 `cross-env` 设置的值，导致 proxy 误启用。

**实际情况：** Vite 的 `loadEnv()` 中 `process.env` 优先级最高，不会被 `.env` 文件覆盖。`cross-env VITE_ARCHIVE_MODE=true` 设置的值会正确生效，proxy 在 ARCHIVE 模式下是正确禁用的。

### 2. 确认文件存在且可访问

- 文件位于 `public/media/puzzle/504/meteor.zip`（40MB）
- 目录权限正常（755），无 symlink
- wget 能正常下载，证明 Vite 的静态文件服务本身能提供该文件

### 3. 分析 wget 与浏览器的差异

关键区别在于 HTTP 请求头 `Accept`：
- wget：`Accept: */*`
- 浏览器：`Accept: text/html, application/xhtml+xml, ...`

### 4. 检查 Vite 7 中间件链

Vite dev server 的中间件注册顺序（`node_modules/vite/dist/node/chunks/dep-Bm2ujbhY.js:28261`）：

```
1. [插件 configureServer 中间件]  ← 插件注册的中间件在这里
2. servePublicMiddleware          ← 提供 public/ 目录静态文件
3. transformMiddleware
4. serveRawFsMiddleware
5. serveStaticMiddleware
6. htmlFallbackMiddleware         ← SPA fallback，重写为 /index.html
```

`servePublicMiddleware` 在 `htmlFallbackMiddleware` 之前，理论上应该先提供静态文件。

### 5. 定位到 vite-plugin-html

检查 `createHtmlPlugin` 的 `configureServer` 实现（`node_modules/vite-plugin-html/dist/index.mjs:118-154`）：

```js
configureServer(server) {
    // ... 构建 rewrites 规则 ...
    server.middlewares.use(history({
        disableDotRule: void 0,
        htmlAcceptHeaders: ["text/html", "application/xhtml+xml"],
        rewrites
    }));
}
```

由于 `configureServer` 没有返回函数，这个 `connect-history-api-fallback` 中间件被注册在 Vite 所有内置中间件**之前**——包括 `servePublicMiddleware`。

### 6. 分析 rewrite 规则

`createRewire` 函数（`index.mjs:281-298`）：

```js
function createRewire(reg, page, baseUrl, proxyUrlKeys) {
    return {
        from: new RegExp(`^/${reg}*`),  // reg="" → 匹配所有 URL
        to({ parsedUrl }) {
            const pathname = parsedUrl.path;
            // 只有 proxyUrlKeys 中的路径会被放行
            const isApiUrl = proxyUrlKeys.some(
                (item) => pathname.startsWith(path.resolve(baseUrl, item))
            );
            return isApiUrl ? parsedUrl.path : template; // 非 API → 返回 index.html
        }
    };
}
```

对于 SPA，`reg=""` → 正则 `^/*` 匹配**所有 URL**。

## 根因

完整因果链：

1. `vite-plugin-html` 在 Vite 内置中间件之前注册了 `connect-history-api-fallback`
2. rewrite 规则 `^/*` 匹配所有 URL（包括 `/media/puzzle/504/meteor.zip`）
3. `to` 函数中，只有 `proxyUrlKeys` 中的路径被放行。在 ARCHIVE 模式下 proxy 被禁用，`proxyUrlKeys` 为空 → `/media/` 不被识别为 API 路径 → 重写为 `index.html`
4. `htmlAcceptHeaders: ["text/html", "application/xhtml+xml"]` 过滤：
   - **浏览器** `Accept: text/html` → 匹配 → 请求被重写为 `/index.html` → SPA 渲染 → React Router 无匹配路由 → 404 页面
   - **wget** `Accept: */*` → 不匹配 → 跳过 → 到达 `servePublicMiddleware` → 正常下载

## 修复

`createHtmlPlugin({ minify: true })` 的 HTML minify 功能只在 build 时生效。dev 模式下它唯一的作用就是注册这个有问题的 history fallback 中间件。将其限制为仅 production 构建时启用：

```js
// vite.config.ts
...(mode === 'production' ? [createHtmlPlugin({ minify: true })] : []),
```
