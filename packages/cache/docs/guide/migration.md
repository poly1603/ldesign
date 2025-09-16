# 迁移指南

本指南帮助你从“零散存储/自研方案/其他库”迁移到 @ldesign/cache。

## 1. 规划命名空间
- 约定统一的 key 前缀：`app:module:sub:key`
- 建议把用户、配置、API 响应等分别放入不同前缀

```ts
const userCache = createCache({ keyPrefix: 'app:user:' })
const configCache = createCache({ keyPrefix: 'app:config:' })
```

## 2. 梳理数据分类与 TTL
- 配置类：7~30 天
- 会话类：30 分钟~2 小时
- API 缓存：30 秒~5 分钟

```ts
await configCache.set('theme', 'dark', { ttl: 7 * 24 * 60 * 60 * 1000 })
await userCache.set('session', session, { ttl: 60 * 60 * 1000 })
```

## 3. 批量迁移与预热
- 使用 `mset/mget` 或 `setBatch/getBatch` 进行批量导入
- 大体量数据建议分批迁移，并结合 `WarmupManager` 在启动时预热关键数据

```ts
const cache = createCache({ preset: 'browser' })
await cache.setBatch({
  'config:theme': 'dark',
  'config:locale': 'zh-CN',
})
```

## 4. 替换直连存储 API
- 替换 `localStorage.getItem/setItem` 为 `cache.get/set`
- 替换 `IndexedDB` 手写事务为 `cache.set` + 智能策略（自动选择引擎）

## 5. Vue 集成替换
- 使用 `@ldesign/cache/vue` 的组合式函数与 `<CacheProvider />` 组件
- 详见 /guide/vue-integration 与 /api/vue-composables

## 6. 回滚与灰度
- 在切换期间可双写（原逻辑 + 新缓存），并对比命中率与性能
- 通过 `debug` 与性能监控组件观察行为

## 7. 常见问题
- 见 /guide/faq

