---
title: 静态资源插件
description: 统一处理图片、字体、媒体等资源的加载与产物命名
---

# 静态资源插件

处理图片、字体等静态资源，支持内联小体积资源与自定义文件命名。

## 使用
```ts path=null start=null
import { defineConfig } from '@ldesign/launcher'
import assets from '@ldesign/plugin-assets'

export default defineConfig({
  plugins: [assets({
    // threshold: 4096,                    // 内联阈值（字节），示例值；按需调整
    // assetFileNames: 'assets/[name]-[hash][extname]'
  })]
})
```

## 常见场景
- 小图标内联为 base64，减少请求数
- 产物命名包含 hash，提升缓存命中率
- 配合图片优化工具减少体积
