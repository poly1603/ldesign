---
title: 第三方插件集成
description: 常见社区插件的集成示例与注意事项
---

# 第三方插件集成

如何挑选并集成社区的 launcher/vite 插件。

## 体积可视化（rollup-plugin-visualizer）

```ts
import { defineConfig } from '@ldesign/launcher'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  build: {
    rollupOptions: {
      plugins: [visualizer({ filename: 'dist/stats.html', open: true })]
    }
  }
})
```

## 自动按需（unplugin-auto-import / unplugin-vue-components）

```ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    AutoImport({ imports: ['vue', 'vue-router'] }),
    Components({ /* resolver: ... */ })
  ]
})
```

## 图标（unplugin-icons）

```ts
import Icons from 'unplugin-icons/vite'
export default { plugins: [Icons({ autoInstall: true })] }
```

注意：第三方插件多基于 Vite 插件规范，通常可直接在 Launcher 配置中使用。
