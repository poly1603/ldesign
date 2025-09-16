---
layout: home

hero:
  name: '@ldesign/cache'
  text: '智能缓存管理器'
  tagline: 功能强大、安全可靠的浏览器缓存解决方案
  image:
    src: /logo.svg
    alt: LDesign Cache
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/getting-started
    - theme: alt
      text: 查看示例
      link: /examples/basic-usage
    - theme: alt
      text: GitHub
      link: https://github.com/ldesign/ldesign

features:
  - icon: 🎯
    title: 多存储引擎
    details:
      支持 localStorage、sessionStorage、Cookie、IndexedDB、Memory
      等多种存储方式，自动选择最适合的引擎

  - icon: 🧠
    title: 智能策略
    details: 根据数据大小、过期时间、数据类型等特征，智能选择最优的存储引擎，提升性能和用户体验

  - icon: 🔒
    title: 安全可靠
    details: 内置键名混淆和数据加密功能，支持自定义加密算法，保护敏感数据安全

  - icon: 🎨
    title: Vue 3 集成
    details: 深度集成 Vue 3，提供响应式缓存管理、组合式函数和组件，开发体验极佳

  - icon: ⚡
    title: 高性能
    details: 智能内存管理、自动清理过期项、批量操作支持，确保应用性能始终最优

  - icon: 🛠️
    title: 开发友好
    details: 完整的 TypeScript 支持、丰富的调试信息、详细的文档和示例，开发效率倍增
---

## 🚀 快速体验

::: code-group

```typescript [基础使用]
import { createCache } from '@ldesign/cache'

const cache = createCache()

// 设置缓存
await cache.set('user', { name: '张三', age: 25 })

// 获取缓存
const user = await cache.get('user')
console.log(user) // { name: '张三', age: 25 }
```

```vue [Vue 组件]
<template>
  <div>
    <p v-if="loading">加载中...</p>
    <p v-else>用户: {{ user?.name }}</p>
  </div>
</template>

<script setup>
import { useCache } from '@ldesign/cache/vue'

const { get, loading } = useCache()
const user = ref(null)

onMounted(async () => {
  user.value = await get('user')
})
</script>
```

```typescript [智能策略]
const cache = createCache({
  strategy: { enabled: true },
  security: {
    encryption: { enabled: true },
    obfuscation: { enabled: true },
  },
})

// 小数据自动用 localStorage
await cache.set('config', { theme: 'dark' })

// 大数据自动用 IndexedDB
await cache.set('dataset', largeArray)

// 临时数据自动用内存
await cache.set('temp', data, { ttl: 1000 })
```

:::

## 📈 性能对比

| 特性       | @ldesign/cache | 其他方案      |
| ---------- | -------------- | ------------- |
| 多存储引擎 | ✅ 5 种引擎    | ❌ 单一引擎   |
| 智能选择   | ✅ 自动优化    | ❌ 手动配置   |
| 安全加密   | ✅ 内置支持    | ❌ 需要额外库 |
| Vue 集成   | ✅ 深度集成    | ❌ 需要封装   |
| TypeScript | ✅ 完整支持    | ⚠️ 部分支持   |
| 测试覆盖   | ✅ 57%+        | ❓ 未知       |

## 🎯 适用场景

- 🌐 **Web 应用** - 用户状态、配置信息、API 缓存
- 📱 **移动端** - 离线数据、表单暂存、媒体缓存
- 🎮 **游戏应用** - 游戏状态、排行榜、资源缓存
- 📊 **数据可视化** - 大数据集、图表配置、用户偏好
- 🛒 **电商平台** - 购物车、商品信息、用户行为

## 🔗 生态系统

- 🎨 [@ldesign/ui](https://github.com/ldesign/ldesign/tree/main/packages/ui) - Vue 3 组件库
- 🎭 [@ldesign/icons](https://github.com/ldesign/ldesign/tree/main/packages/icons) - 图标库
- 🎪 [@ldesign/utils](https://github.com/ldesign/ldesign/tree/main/packages/utils) - 工具函数库
- 🎨 [@ldesign/theme](https://github.com/ldesign/ldesign/tree/main/packages/theme) - 主题系统

## 🧭 功能导航

- 命名空间： [指南](/guide/namespaces) · [API](/api/namespace) · [示例](/examples/namespaces)
- 批量操作： [API](/api/batch)
- 缓存预热： [API](/api/warmup)
- 跨标签页同步： [API](/api/sync)
- 智能预取： [API](/api/prefetch)
- 性能监控： [API](/api/performance-monitor)
- 错误处理： [API](/api/error-handling)
- 数据压缩： [API](/api/compression)
- 存储引擎： [指南](/guide/storage-engines) · [API](/api/storage-engines)
- 迁移示例： [命名空间迁移](/examples/namespace-migration)
