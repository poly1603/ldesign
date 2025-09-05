---
title: Chrome 扩展开发（MV3）
description: 使用 @ldesign/launcher 构建 MV3 扩展，含 manifest、开发与打包流程
---

# Chrome 扩展开发（MV3）

以 Manifest V3 为例在扩展脚本中使用 Launcher/Vite 构建。

## 目录结构示例

```
extension/
├─ public/
│  └─ manifest.json
├─ src/
│  ├─ background.ts      # Service Worker
│  ├─ content.ts         # 内容脚本
│  └─ popup/main.ts      # 弹窗页面
├─ popup.html
└─ launcher.config.ts
```

## manifest.json（MV3）

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "action": {
    "default_popup": "popup.html"
  },
  "background": {
    "service_worker": "assets/background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["assets/content.js"],
      "run_at": "document_end"
    }
  ],
  "permissions": ["storage", "tabs"]
}
```

提示：放在 public/ 下的 manifest.json 会被原样复制进 dist。

## Launcher 配置（多入口构建）

```ts
// launcher.config.ts
import { defineConfig } from '@ldesign/launcher'
import { resolve } from 'node:path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        background: resolve(__dirname, 'src/background.ts'),
        content: resolve(__dirname, 'src/content.ts')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
})
```

## 开发与调试

- 扩展在浏览器下运行，无法直接使用 dev server 进行 HMR。推荐：
  - 使用 `launcher build --watch` 持续构建
  - 在 Chrome 的扩展页面加载“未打包扩展”，指向 dist 目录
  - 变更后浏览器扩展页“重新加载”

```json
// package.json
{
  "scripts": {
    "watch": "launcher build --watch",
    "build": "launcher build"
  }
}
```

## 常见问题
- 背景脚本路径：在 manifest.json 中指向打包输出路径（如 assets/background.js）
- 跨域权限：需要在 manifest 中申请对应 host 权限
- 大体积依赖：可用手动分包与 analyzer 优化
