---
title: CSS 插件
description: CSS Modules、PostCSS 与预处理器集成
---

# CSS 插件

提供常见 CSS 工作流能力，包括 CSS Modules、PostCSS 与预处理器（Sass/Less）。

## 使用
```ts path=null start=null
import { defineConfig } from '@ldesign/launcher'
import css from '@ldesign/plugin-css'

export default defineConfig({
  plugins: [css({
    modules: { scopeBehaviour: 'local' },  // CSS Modules 策略
    postcss: {},                           // 读取 postcss.config.* 或内联配置
    preprocessorOptions: {                 // 预处理器全局变量/路径
      scss: { additionalData: '$injectedColor: orange;' }
    }
  })]
})
```

## 常见用法
- 使用 `*.module.css` 启用 CSS Modules
- 在项目根目录提供 `postcss.config.cjs` 管理 Autoprefixer、Tailwind 等
- 通过 `preprocessorOptions` 注入全局变量，减少重复导入
