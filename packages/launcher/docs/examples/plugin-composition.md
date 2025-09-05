---
title: 插件组合
description: 多插件协同时的执行顺序、依赖与冲突处理
---

# 插件组合

多插件协同时的顺序、依赖与冲突处理示例。

## 执行顺序与 enforce

- `pre` 先于普通插件执行
- 未指定的为普通阶段
- `post` 最后执行

```ts
import a from './plugins/a'
import b from './plugins/b'
import c from './plugins/c'

export default {
  plugins: [
    a({ enforce: 'pre' }),
    b(),
    c({ enforce: 'post' })
  ]
}
```

## 条件组合

```ts
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  const plugins = [core(), framework()]
  if (isProd) plugins.push(analyzer())
  else plugins.push(mock({ enable: true }))
  return { plugins }
})
```

## 避免冲突

- 同一能力只保留一个实现（如多个 JSX 处理器）
- 调整顺序：常见为“框架 → 语法增强 → 资源 → 分析”
- 使用 `apply` 精确控制插件生效范围

## 组合技巧

- 将“虚拟模块 + transform”配合，避免重复计算
- 将“HTML 注入 + 构建 banner”区分到 serve/build，减少无用工作
- 使用 `configResolved` 读取最终配置，减少跨插件通信成本
