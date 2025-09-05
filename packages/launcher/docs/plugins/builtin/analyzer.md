---
title: 构建分析插件
description: 可视化分析体积与依赖，辅助优化拆包与缓存
---

# 构建分析插件

可视化分析构建产物大小与依赖，定位大体积模块与重复依赖。

## 使用
```ts path=null start=null
import { defineConfig } from '@ldesign/launcher'
import analyzer from '@ldesign/plugin-analyzer'

export default defineConfig({
  plugins: [analyzer({
    open: true,                 // 构建后自动打开报告
    // filename: 'stats.html',  // 指定报告文件名
  })]
})
```

## 在 CI 中生成报告
```ts path=null start=null
import analyzer from '@ldesign/plugin-analyzer'
export default {
  plugins: [analyzer({ open: false, filename: 'stats.html' })]
}
```

将构建产物与报告作为 CI 工件上传，便于回溯对比。
