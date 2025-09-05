---
title: Electron 桌面应用
description: 使用 @ldesign/launcher 为渲染进程提供前端构建，主进程加载 dev/生产资源
---

# Electron 桌面应用

在 Electron 主进程/渲染进程中配合 launcher 的示例。

## 目录结构

```
app/
├─ src/
│  ├─ main/main.ts      # Electron 主进程
│  ├─ main/preload.ts   # Preload 脚本
│  └─ renderer/main.tsx # 渲染进程入口（由 Launcher 构建）
├─ index.html           # 渲染进程 HTML
└─ launcher.config.ts   # 渲染进程构建配置
```

## 渲染进程构建（Launcher）

```ts
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  server: { port: 3000, host: '127.0.0.1' },
  build: { outDir: 'dist' }
})
```

## 主进程加载 URL/文件

```ts
// src/main/main.ts
import { app, BrowserWindow } from 'electron'
import { join } from 'node:path'

const isDev = process.env.NODE_ENV !== 'production'
let win: BrowserWindow | null

async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js')
    }
  })

  if (isDev) {
    await win.loadURL('http://127.0.0.1:3000')
    win.webContents.openDevTools()
  } else {
    await win.loadFile(join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(createWindow)
```

## 开发体验

- 并行启动：一个终端跑 `launcher dev`，另一个终端跑 `electron .`
- 或使用并行脚本（concurrently）：

```json
// package.json
{
  "scripts": {
    "dev:renderer": "launcher dev",
    "dev:main": "cross-env NODE_ENV=development electron .",
    "dev": "concurrently \"pnpm dev:renderer\" \"pnpm dev:main\"",
    "build:renderer": "launcher build",
    "build:main": "tsc -p tsconfig.main.json",
    "build": "pnpm build:renderer && pnpm build:main"
  }
}
```

## 注意事项
- 渲染进程参考 Web 项目最佳实践；生产加载本地文件，不要依赖 dev server
- 若使用 contextIsolation，确保 preload 暴露受控 API
- 打包 Electron 主进程可使用 electron-builder / forge（此处不展开）
