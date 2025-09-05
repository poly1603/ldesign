---
title: 插件开发指南
description: 从零实现一个 @ldesign/launcher 插件，涵盖项目结构、常用 Hook、调试与发布
---

# 插件开发指南

本文介绍如何从零开始开发一个 @ldesign/launcher 插件。Launcher 复用 Vite 插件机制，除了常见的 Rollup/Vite Hook，还可以结合 Launcher 的配置生命周期一起工作。

## 前置准备
- 推荐使用 Node.js ≥ 18 与 TypeScript 开发
- 安装类型：`@types/node`（如需 Node API）
- 建议以独立包的方式维护插件（便于复用与发布）

## 最小示例
```ts path=null start=null
// my-plugin.ts
import type { Plugin } from '@ldesign/launcher'

export default function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    enforce: 'pre',            // 可选：'pre' | 'post' 调整执行顺序
    apply: 'serve',            // 可选：'serve' | 'build' | ((config, env) => boolean)

    configResolved(config) {
      // 配置已解析，可读取最终配置（mode、server、build 等）
    },
    transform(code, id) {
      if (id.endsWith('.special')) {
        return { code: code.replace(/__FLAG__/g, 'ok'), map: null }
      }
    }
  }
}
```

## 按需启用与执行阶段
- `apply`：在开发(`serve`)或构建(`build`)阶段启用插件，也可以传入函数进行更细粒度的控制。
- `enforce`：`pre` 先于普通插件运行；`post` 晚于普通插件运行。

```ts path=null start=null
export default function conditional(): Plugin {
  return {
    name: 'conditional',
    apply: (config, env) => env.command === 'build',
    enforce: 'post',
  }
}
```

## 虚拟模块与工具化思维
将可配置/可缓存的数据通过虚拟模块导出，避免重复 I/O 或昂贵计算：
```ts path=null start=null
const PREFIX = 'virtual:sample:'
export default function virtualSample(data: Record<string, any>): Plugin {
  return {
    name: 'virtual-sample',
    resolveId(id) {
      if (id.startsWith(PREFIX)) return id
    },
    load(id) {
      if (id.startsWith(PREFIX)) {
        const key = id.slice(PREFIX.length)
        return `export default ${JSON.stringify(data[key] ?? null)}`
      }
    }
  }
}
```

## 与 Launcher 配合
Launcher 支持在配置中定义自身生命周期钩子（具体以配置文档为准），可在构建前后执行自定义逻辑：
```ts path=null start=null
import myPlugin from './my-plugin'
import { defineConfig } from '@ldesign/launcher'

export default defineConfig({
  launcher: {
    hooks: {
      beforeBuild: async () => {
        // 例如：生成临时文件、下载字典、清理缓存
      },
      afterBuild: async (result) => {
        // 例如：上传产物、生成报告
      }
    }
  },
  plugins: [myPlugin()]
})
```

## HMR 与调试
- `handleHotUpdate`：可根据变更文件类型决定是否触发全量刷新
- 使用 `console.time/console.timeEnd` 为关键路径打点
- 在转换阶段打印 `id` 与 `code.length`，定位性能瓶颈
- 如遇循环依赖引起的 HMR 问题，可退回到 `full-reload`

```ts path=null start=null
export default function hmrGuard(): Plugin {
  return {
    name: 'hmr-guard',
    handleHotUpdate(ctx) {
      if (ctx.file.endsWith('.schema.json')) return [] // 全量刷新
    }
  }
}
```

## 性能建议
- 缓存昂贵计算（如正则编译、AST 解析），避免在每个文件上重复执行
- 尽量只在需要的文件类型上工作（先判断 `id` 后再做转换）
- 对大体量工程，减少 `transform` 中的同步阻塞 I/O

## 测试与发布
- 本地联调：在示例项目中引用本地插件源码进行验证
- 编写最小用例：确保关键 Hook（`resolveId/load/transform`）都被覆盖
- 包命名建议：`launcher-plugin-xxx` 或 `vite-plugin-xxx`
- 包含 README 文档与使用示例，注明兼容的 Launcher/Vite 版本

