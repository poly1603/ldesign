---
title: SSR 指南
description: 使用 @ldesign/launcher 配合 Vite SSR 能力实现服务端渲染（开发与构建）
---

# SSR 指南

@ldesign/launcher 基于 Vite，可复用 Vite SSR 能力实现服务端渲染（Server-Side Rendering）。本页给出一个可落地的最小实践，覆盖开发模式与生产构建两条路径。

## 目录结构建议

```text path=null start=null
project/
├─ src/
│  ├─ entry-client.ts            # 客户端入口
│  ├─ entry-server.ts            # 服务端渲染入口（导出 render(ctx)）
│  └─ app/..                     # 应用代码
├─ index.html                    # 模板（包含占位元素）
├─ server/
│  └─ dev-server.ts              # 开发：Node 服务整合 Vite dev 中间件
│  └─ prod-server.ts             # 生产：加载 dist 产物渲染
├─ launcher.config.ts
└─ package.json
```

## 客户端入口（entry-client.ts）

```ts path=null start=null
import { createApp } from './app'

const { app, router } = createApp()

router.isReady().then(() => {
  app.mount('#app')
})
```

## 服务端入口（entry-server.ts）

约定导出 `render(url, manifest?)` 或可扩展的上下文签名，返回 HTML 字符串。

```ts path=null start=null
import { createApp } from './app'

export async function render(url: string, manifest?: Record<string, any>) {
  const { app, router } = createApp()
  await router.push(url)
  await router.isReady()
  const html = await renderToString(app)
  return { html, preloadLinks: renderPreloadLinks(manifest, url) }
}
```

提示：`renderToString`/`renderPreloadLinks` 按使用框架（Vue/React 等）选择具体实现。

## 开发模式：整合 Vite Dev Server

开发模式下，推荐在自建 Node 服务中“内嵌” Vite Dev Server，使得模板转换与模块 HMR 生效。

```ts path=null start=null
// server/dev-server.ts
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const isWin = process.platform === 'win32'
const resolve = (p: string) => path.resolve(process.cwd(), p)

async function createServer() {
  const app = express()
  const vite = await createViteServer({ server: { middlewareMode: true } })
  app.use(vite.middlewares)

  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl
      let template = fs.readFileSync(resolve('index.html'), 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      const { render } = await vite.ssrLoadModule('/src/entry-server.ts')
      const { html, preloadLinks } = await render(url)
      const rendered = template
        .replace('<!--preload-links-->', preloadLinks || '')
        .replace('<!--app-html-->', html)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(rendered)
    } catch (e) {
      vite.ssrFixStacktrace(e as Error)
      next(e)
    }
  })

  const port = 3000
  app.listen(port, '127.0.0.1', () => {
    console.log(`SSR dev server at http://127.0.0.1:${port}`)
  })
}

createServer()
```

运行方式（示例）：
```json path=null start=null
{
  "scripts": {
    "dev:ssr": "ts-node ./server/dev-server.ts"
  }
}
```

## 生产构建：客户端 + 服务端产物

- 客户端：常规 `launcher build` 输出到 `dist/client`
- 服务端：以 SSR 模式构建到 `dist/server`，并开启 manifest 以生成资源映射

最小 Launcher 配置参考：
```ts path=null start=null
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  build: {
    outDir: 'dist/client',
    manifest: true
  },
  launcher: {
    ssr: {
      enabled: true,
      entry: './src/entry-server.ts',
      outDir: 'dist/server',
      manifest: true
    }
  }
})
```

生产服务端代码（加载产物运行）：
```ts path=null start=null
// server/prod-server.ts
import fs from 'node:fs'
import path from 'node:path'
import express from 'express'

const resolve = (p: string) => path.resolve(process.cwd(), p)
const manifest = JSON.parse(fs.readFileSync(resolve('dist/client/manifest.json'), 'utf-8'))

async function createServer() {
  const app = express()
  app.use('/assets', express.static(resolve('dist/client/assets'), { maxAge: '1y', immutable: true }))

  const { render } = await import(pathToFileURL(resolve('dist/server/entry-server.js')).href)

  app.use('*', async (req, res) => {
    const url = req.originalUrl
    const template = fs.readFileSync(resolve('dist/client/index.html'), 'utf-8')
    const { html, preloadLinks } = await render(url, manifest)
    const rendered = template
      .replace('<!--preload-links-->', preloadLinks || '')
      .replace('<!--app-html-->', html)
    res.status(200).set({ 'Content-Type': 'text/html' }).end(rendered)
  })

  app.listen(4173, '127.0.0.1', () => console.log('SSR preview at http://127.0.0.1:4173'))
}

createServer()
```

## Vue 3 实战

### 依赖
```bash
pnpm add vue vue-router
pnpm add -D @vue/server-renderer
```

### 服务端入口（Vue）
```ts path=null start=null
// src/entry-server.ts
import { createSSRApp } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import App from './App.vue'

export async function render(url: string, manifest?: Record<string, any>) {
  const router = createRouter({ history: createMemoryHistory(), routes: [] })
  const app = createSSRApp(App)
  app.use(router)
  await router.push(url)
  await router.isReady()
  const { renderToString } = await import('@vue/server-renderer')
  const html = await renderToString(app)
  return { html, preloadLinks: '' }
}
```

### 客户端入口（Vue）
```ts path=null start=null
// src/entry-client.ts
import { createApp } from 'vue'
import { createWebHistory, createRouter } from 'vue-router'
import App from './App.vue'

const router = createRouter({ history: createWebHistory(), routes: [] })
createApp(App).use(router).mount('#app')
```

## React 实战

### 依赖
```bash
pnpm add react react-dom react-router-dom
```

### 服务端入口（React）
```ts path=null start=null
// src/entry-server.tsx
import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import App from './App'

export async function render(url: string) {
  const html = renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  )
  return { html, preloadLinks: '' }
}
```

### 客户端入口（React）
```ts path=null start=null
// src/entry-client.tsx
import React from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'

const container = document.getElementById('root')!
if (container.hasChildNodes()) {
  hydrateRoot(
    container,
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
} else {
  createRoot(container).render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}
```

## 状态注入与安全

在模板中安全注入 JSON（避免 XSS）：
```ts path=null start=null
function serializeState(state: any) {
  return JSON.stringify(state).replace(/</g, '\\u003c')
}
// 服务端渲染后：
// <script>window.__INITIAL_STATE__ = ${serializeState(state)}</script>
```
客户端读取并恢复：
```ts path=null start=null
const state = (window as any).__INITIAL_STATE__
// 根据框架注入到 store/pinia/redux 等
```

## 流式渲染（提示）

- React 可使用 renderToPipeableStream 获取更好的首屏时效性（需处理超时与错误边界）
- Vue 也可使用流式渲染能力，复杂度更高，建议在确认需求后再接入

## 常见问题与建议

- SSR 与 ESM/CJS：优先使用 ESM；Node 加载产物时注意路径解析（pathToFileURL）
- 外部依赖 external：避免将 Node-only 依赖打入客户端；服务端构建时合理 external（见 config 参考）
- 模板占位：在 index.html 中预留 `<!--app-html-->`/`<!--preload-links-->` 位置
- 环境变量：生产下仅注入必要的变量，避免泄露机密
- 性能：首屏渲染可结合缓存；路由/数据获取建议在服务端提前注入

