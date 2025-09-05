---
title: 高级配置
description: 多入口、库模式、别名、依赖优化等综合配置范例
---

# 高级配置

复杂场景下的综合配置范例与说明。

```ts
import { defineConfig } from '@ldesign/launcher'
import { resolve } from 'path'

export default defineConfig({
  // 多入口
  launcher: {
    entry: {
      entries: {
        main: './src/main.ts',
        admin: './src/admin/main.ts'
      }
    },
    // 库模式（组件库）
    lib: {
      entry: './src/index.ts',
      name: 'MyLib',
      formats: ['es', 'cjs', 'umd']
    }
  },

  // 别名与去重
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
    dedupe: ['vue', 'react']
  },

  // 依赖优化
  optimizeDeps: {
    include: ['vue', 'vue-router']
  },

  // 构建优化
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router']
        }
      }
    }
  }
})
```
