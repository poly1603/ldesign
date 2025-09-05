---
title: PWA 配置
description: 使用 @ldesign/plugin-pwa 配置 manifest、缓存与更新策略
---

# PWA 配置

使用内置 PWA 插件实现离线与缓存策略。

## 配置

```ts
import { defineConfig } from '@ldesign/launcher'
import pwa from '@ldesign/plugin-pwa'

export default defineConfig({
  plugins: [
    pwa({
      manifest: {
        name: 'Demo',
        short_name: 'Demo',
        start_url: '/',
        display: 'standalone',
        theme_color: '#42b883'
      },
      // workbox: { /* 缓存策略 */ }
    })
  ]
})
```

## 注册 Service Worker（示例）

```ts
// src/register-sw.ts
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}
```

## 更新提示

- 首次访问后离线可用
- 有新版本时提示刷新或静默更新（按你的策略）
