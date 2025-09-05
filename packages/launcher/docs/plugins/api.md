---
title: 插件 API 概览
description: @ldesign/launcher 插件生命周期、钩子签名、执行顺序与常见用法
---

# 插件 API 概览

@ldesign/launcher 复用并扩展了 Vite 的插件系统。绝大多数插件 Hook 与 Vite/ Rollup 保持一致，你可以直接按 Vite 插件的写法来开发。

- 基本类型：`import type { Plugin } from '@ldesign/launcher'`
- 适用阶段：`apply: 'serve' | 'build' | ((config, env) => boolean)`
- 执行顺序：`enforce: 'pre' | undefined | 'post'`

## 快速上手
```ts path=null start=null
import type { Plugin } from '@ldesign/launcher'

export default function demo(): Plugin {
  return {
    name: 'demo',
    apply: 'serve',      // 仅在开发阶段生效（可省略表示两者都生效）
    enforce: 'pre',      // 在常规插件之前运行

    // 配置阶段
    config(config, env) {
      // 返回的配置会与用户配置深合并
      return { define: { __BUILD_TIME__: JSON.stringify(Date.now()) } }
    },
    configResolved(resolved) {
      // 可以读取最终解析后的完整配置
      // 如：resolved.mode / resolved.build / resolved.server 等
    },

    // 服务器阶段
    configureServer(server) {
      // 添加中间件或 websocket 事件
      server.middlewares.use('/healthz', (req, res) => { res.end('ok') })
    },
    configurePreviewServer(server) {
      // 调整预览服务器（例如静态中间件顺序）
    },

    // 文件处理阶段（与 Rollup 类似）
    resolveId(id, importer) {
      if (id === 'virtual:demo') return id
    },
    load(id) {
      if (id === 'virtual:demo') return 'export const msg = "hello"'
    },
    async transform(code, id) {
      if (id.endsWith('.special')) {
        return { code: code.replace(/__FLAG__/g, 'ok'), map: null }
      }
    },

    // HMR
    handleHotUpdate(ctx) {
      // 返回空数组可触发 full-reload
      if (ctx.file.endsWith('.special')) return []
    },

    // 构建产物阶段
    buildStart() {},
    buildEnd(err) {},
    generateBundle(options, bundle) {},
    writeBundle(options, bundle) {},
    closeBundle() {},
  }
}
```

## 核心字段
- name：插件唯一名称，建议使用「作用域/插件名」命名
- enforce：控制执行阶段，`pre` 先于普通插件，`post` 晚于普通插件
- apply：控制生效范围
  - `'serve'` 仅开发服务器
  - `'build'` 仅构建/预览
  - 函数签名：`(config, env) => boolean`，方便按条件启用

```ts path=null start=null
export default function onlyDev(): Plugin {
  return {
    name: 'only-dev',
    apply: (config, env) => env.command === 'serve',
  }
}
```

## 配置阶段 Hook
- config(config, env)：可返回局部配置对象；多插件返回值会深合并
- configResolved(resolvedConfig)：所有配置解析完成后触发，适合读取最终值

```ts path=null start=null
export default function defineVars(): Plugin {
  return {
    name: 'define-vars',
    config(_, { mode }) {
      return { define: { __MODE__: JSON.stringify(mode) } }
    },
    configResolved(rc) {
      // rc.build.ssr / rc.server.port 等
    }
  }
}
```

## 服务器阶段 Hook
- configureServer(server)：定制开发服务器（中间件、WebSocket、文件监听）
- configurePreviewServer(server)：定制预览服务器
- handleHotUpdate(ctx)：自定义热更新行为
- transformIndexHtml?: 在 HTML 转换阶段注入标签（如果你需要操作 index.html）

```ts path=null start=null
export default function injectMeta(): Plugin {
  return {
    name: 'inject-meta',
    transformIndexHtml(html) {
      return html.replace('</head>', '<meta name="x-demo" content="on" /></head>')
    }
  }
}
```

## 构建与产物阶段 Hook（与 Rollup 对齐）
- buildStart(options)
- resolveId(id, importer, options)
- load(id, options)
- transform(code, id, options)
- generateBundle(outputOptions, bundle, isWrite)
- writeBundle(outputOptions, bundle)
- buildEnd(error?)
- closeBundle()

返回值约定：
- `transform` 可返回 `string` 或 `{ code, map }`；返回 `null/undefined` 表示不处理
- 多个插件的 `transform` 将按顺序依次处理（注意 `enforce` 顺序）

## 虚拟模块与命名约定
- 虚拟模块常以 `virtual:` 前缀开头，避免与真实文件冲突
- 推荐将可配置数据注入为虚拟模块，避免重复 I/O

```ts path=null start=null
const prefix = 'virtual:config:'
export default function virtualConfig(data: Record<string, any>): Plugin {
  return {
    name: 'virtual-config',
    resolveId(id) {
      if (id.startsWith(prefix)) return id
    },
    load(id) {
      if (id.startsWith(prefix)) {
        const key = id.slice(prefix.length)
        return `export default ${JSON.stringify(data[key] ?? null)}`
      }
    }
  }
}
```

## 执行顺序（简化）
1) config（pre → normal → post）
2) configResolved
3) serve 阶段：configureServer → transformIndexHtml(开发) → handleHotUpdate
4) build 阶段：buildStart → resolveId/load/transform → generateBundle → writeBundle → closeBundle → buildEnd

提示：尽量在“前置阶段”做轻量工作，把重计算放到 `transform` 或缓存里，以提升整体性能。
