---
title: PWA 插件
description: 为项目提供应用清单、离线缓存与更新策略
---

# PWA 插件

为项目提供渐进式 Web 应用支持，包括 manifest、缓存与更新。

## 使用
```ts path=null start=null
import { defineConfig } from '@ldesign/launcher'
import pwa from '@ldesign/plugin-pwa'

export default defineConfig({
  plugins: [pwa({
    manifest: {
      name: 'Demo',
      short_name: 'Demo',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#42b883'
    },
    // workbox: { /* 缓存策略 */ }
  })]
})
```

## 更新策略
- 首次访问后离线可用
- 当有新版本时提示用户刷新或自动更新（视具体配置而定）
