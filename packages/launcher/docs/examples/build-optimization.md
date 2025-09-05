---
title: 构建优化
description: 代码分割、缓存策略、压缩与资源优化示例
---

# 构建优化

代码分割、缓存策略、压缩与资源优化。

## 代码分割（manualChunks）

```ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('vue')) return 'vue-vendor'
            if (id.includes('react')) return 'react-vendor'
            if (id.includes('element-plus')) return 'ui-vendor'
            return 'vendor'
          }
        }
      }
    }
  }
})
```

## 压缩与 Source Map

```ts
export default defineConfig({
  build: {
    minify: 'esbuild',   // 或 'terser'
    sourcemap: false     // 生产谨慎开启
  }
})
```

## 资源优化

```ts
export default defineConfig({
  build: {
    assetsInlineLimit: 4096, // 小资源内联
    cssCodeSplit: true
  }
})
```

## 体积分析

```ts
import analyzer from '@ldesign/plugin-analyzer'
export default defineConfig({
  plugins: [analyzer({ open: true })]
})
```
