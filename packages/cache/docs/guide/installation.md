# 安装配置

## 📦 安装

### 使用 npm

```bash
npm install @ldesign/cache
```

### 使用 yarn

```bash
yarn add @ldesign/cache
```

### 使用 pnpm

```bash
pnpm add @ldesign/cache
```

## 🚀 快速开始

### 基础使用

```typescript
import { createCache } from '@ldesign/cache'

// 创建缓存管理器实例
const cache = createCache()

// 设置缓存
await cache.set('user-name', '张三')

// 获取缓存
const userName = await cache.get('user-name')
console.log(userName) // '张三'
```

### Vue 3 集成

```vue
<template>
  <div>
    <input v-model="userInput" placeholder="输入用户名" />
    <p>缓存的用户名: {{ cachedName }}</p>
  </div>
</template>

<script setup>
import { useCache } from '@ldesign/cache/vue'

const { value: cachedName, set } = useCache('user-name', {
  defaultValue: '',
  autoSave: true,
})

const userInput = ref('')

// 监听输入变化，自动保存到缓存
watch(userInput, newValue => {
  set(newValue)
})
</script>
```

## ⚙️ 配置选项

### 基础配置

```typescript
const cache = createCache({
  // 默认存储引擎
  defaultEngine: 'localStorage',

  // 键名前缀
  keyPrefix: 'myapp_',

  // 调试模式
  debug: true,

  // 默认TTL（毫秒）
  defaultTTL: 24 * 60 * 60 * 1000, // 24小时
})
```

### 智能策略配置

```typescript
const cache = createCache({
  strategy: {
    enabled: true,
    sizeThresholds: {
      small: 1024, // 1KB
      medium: 64 * 1024, // 64KB
      large: 1024 * 1024, // 1MB
    },
    ttlThresholds: {
      short: 5 * 60 * 1000, // 5分钟
      medium: 24 * 60 * 60 * 1000, // 24小时
      long: 7 * 24 * 60 * 60 * 1000, // 7天
    },
  },
})
```

### 安全配置

```typescript
const cache = createCache({
  security: {
    encryption: {
      enabled: true,
      secretKey: 'your-secret-key',
      algorithm: 'AES',
    },
    obfuscation: {
      enabled: true,
      prefix: 'secure_',
      algorithm: 'hash',
    },
  },
})
```

### 存储引擎配置

```typescript
const cache = createCache({
  engines: {
    localStorage: {
      enabled: true,
      maxSize: 5 * 1024 * 1024, // 5MB
    },
    sessionStorage: {
      enabled: true,
      maxSize: 5 * 1024 * 1024,
    },
    cookie: {
      enabled: true,
      domain: '.example.com',
      secure: true,
      sameSite: 'strict',
    },
    indexedDB: {
      enabled: true,
      dbName: 'MyAppCache',
      version: 1,
      storeName: 'cache',
    },
    memory: {
      enabled: true,
      maxSize: 50 * 1024 * 1024, // 50MB
      maxItems: 1000,
      cleanupInterval: 5 * 60 * 1000, // 5分钟
    },
  },
})
```

## 🌍 环境支持

### 浏览器支持

| 浏览器  | 版本 | localStorage | sessionStorage | Cookie | IndexedDB | Memory |
| ------- | ---- | ------------ | -------------- | ------ | --------- | ------ |
| Chrome  | 60+  | ✅           | ✅             | ✅     | ✅        | ✅     |
| Firefox | 55+  | ✅           | ✅             | ✅     | ✅        | ✅     |
| Safari  | 12+  | ✅           | ✅             | ✅     | ✅        | ✅     |
| Edge    | 79+  | ✅           | ✅             | ✅     | ✅        | ✅     |

### Node.js 支持

```typescript
// Node.js 环境下只支持 Memory 引擎
const cache = createCache({
  defaultEngine: 'memory',
})
```

## 📱 框架集成

### Vue 3

```typescript
import { CacheProvider } from '@ldesign/cache/vue'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 提供全局缓存实例
app.use(CacheProvider, {
  defaultEngine: 'localStorage',
  keyPrefix: 'myapp_',
})

app.mount('#app')
```

### React (计划支持)

```typescript
// 未来版本将支持 React 集成
import { CacheProvider, useCache } from '@ldesign/cache/react'
```

## 🔧 TypeScript 配置

确保你的 `tsconfig.json` 包含以下配置：

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "lib": ["DOM", "ES2020"]
  }
}
```

## 📦 包大小

| 格式      | 大小  | Gzipped |
| --------- | ----- | ------- |
| ES Module | ~45KB | ~15KB   |
| UMD       | ~50KB | ~17KB   |
| CommonJS  | ~48KB | ~16KB   |

## 🚨 常见问题

### Q: 在 SSR 环境下如何使用？

A: 在服务端渲染环境下，浏览器存储 API 不可用，建议使用 Memory 引擎：

```typescript
const cache = createCache({
  defaultEngine: typeof window !== 'undefined' ? 'localStorage' : 'memory',
})
```

### Q: 如何处理存储配额超限？

A: 库会自动处理存储配额问题，并提供降级策略：

```typescript
const cache = createCache({
  fallbackEngine: 'memory', // 当主引擎失败时的备用引擎
  autoCleanup: true, // 自动清理过期数据
})
```

### Q: 如何在多个标签页间同步数据？

A: 使用 localStorage 或 sessionStorage 引擎，并监听存储事件：

```typescript
const cache = createCache({
  defaultEngine: 'localStorage',
  syncAcrossTabs: true,
})

// 监听跨标签页数据变化
cache.on('storage', (event) => {
  console.log('数据在其他标签页中被修改:', event)
})
```

## 🔗 下一步

- [基础概念](./concepts.md) - 了解核心概念
- [存储引擎](./storage-engines.md) - 深入了解各种存储引擎
- [Vue 集成](./vue-integration.md) - Vue 3 集成指南
