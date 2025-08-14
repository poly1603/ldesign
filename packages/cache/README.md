# 🚀 @ldesign/cache

> 一个功能强大、智能高效的浏览器缓存管理器库

[![npm version](https://img.shields.io/npm/v/@ldesign/cache.svg)](https://www.npmjs.com/package/@ldesign/cache)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue%203-Ready-green.svg)](https://vuejs.org/)
[![Test Coverage](https://img.shields.io/badge/Coverage-57%25-yellow.svg)](./coverage)
[![License](https://img.shields.io/npm/l/@ldesign/cache.svg)](./LICENSE)

## ✨ 特性亮点

### 🎯 多存储引擎支持

- **localStorage** - 持久化存储小量数据
- **sessionStorage** - 会话级存储
- **Cookie** - 需要服务器交互的数据
- **IndexedDB** - 大量结构化数据存储
- **Memory** - 高性能临时缓存

### 🧠 智能存储策略

根据数据特征自动选择最适合的存储引擎：

- 📏 **数据大小** - 小数据用 localStorage，大数据用 IndexedDB
- ⏰ **过期时间** - 短期用内存，长期用持久化存储
- 🏷️ **数据类型** - 简单类型用 localStorage，复杂对象用 IndexedDB

### 🔒 安全特性

- 🔐 **键名混淆** - 防止键名泄露
- 🛡️ **数据加密** - AES 加密保护敏感数据
- 🔧 **自定义算法** - 支持自定义加密和混淆算法

### 🎨 Vue 3 深度集成

- 📦 **组合式函数** - `useCache()` 提供响应式缓存管理
- 🔄 **响应式缓存** - 自动同步缓存与组件状态
- 📊 **统计监控** - `useCacheStats()` 实时监控缓存性能

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm（推荐）
pnpm add @ldesign/cache

# 使用 npm
npm install @ldesign/cache

# 使用 yarn
yarn add @ldesign/cache
```

### 基础使用

```typescript
import { createCache } from '@ldesign/cache'

// 创建缓存管理器
const cache = createCache({
  defaultEngine: 'localStorage',
  defaultTTL: 24 * 60 * 60 * 1000, // 24小时
  security: {
    encryption: { enabled: true },
    obfuscation: { enabled: true },
  },
})

// 设置缓存
await cache.set('user-profile', {
  name: '张三',
  age: 25,
  preferences: ['编程', '阅读'],
})

// 获取缓存
const profile = await cache.get('user-profile')
console.log(profile) // { name: '张三', age: 25, preferences: ['编程', '阅读'] }

// 设置带过期时间的缓存
await cache.set('temp-data', 'temporary', { ttl: 5000 }) // 5秒后过期
```

### Vue 3 集成

```vue
<template>
  <div>
    <h2>用户资料</h2>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else>
      <p>姓名: {{ userProfile?.name }}</p>
      <p>年龄: {{ userProfile?.age }}</p>
      <button @click="updateProfile">更新资料</button>
    </div>

    <div class="stats">
      <h3>缓存统计</h3>
      <p>总项目数: {{ stats?.totalItems }}</p>
      <p>总大小: {{ formattedStats?.totalSizeFormatted }}</p>
      <p>命中率: {{ formattedStats?.hitRatePercentage }}%</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCache, useCacheStats } from '@ldesign/cache/vue'

// 使用缓存
const { set, get, loading, error } = useCache({
  defaultEngine: 'localStorage',
  keyPrefix: 'app_',
})

// 使用缓存统计
const { stats, formattedStats, refresh } = useCacheStats({
  refreshInterval: 5000, // 每5秒刷新
})

// 响应式用户资料
const userProfile = ref(null)

// 加载用户资料
onMounted(async () => {
  userProfile.value = await get('user-profile')
})

// 更新资料
const updateProfile = async () => {
  const newProfile = {
    name: '李四',
    age: 30,
    lastUpdated: new Date().toISOString(),
  }

  await set('user-profile', newProfile)
  userProfile.value = newProfile
}
</script>
```

## 📖 详细文档

### 配置选项

```typescript
interface CacheOptions {
  // 基础配置
  defaultEngine?: 'localStorage' | 'sessionStorage' | 'cookie' | 'indexedDB' | 'memory'
  defaultTTL?: number // 默认过期时间（毫秒）
  keyPrefix?: string // 键前缀
  debug?: boolean // 调试模式

  // 安全配置
  security?: {
    encryption?: {
      enabled: boolean
      algorithm?: 'AES' | 'custom'
      secretKey?: string
      customEncrypt?: (data: string) => string
      customDecrypt?: (data: string) => string
    }
    obfuscation?: {
      enabled: boolean
      prefix?: string
      algorithm?: 'hash' | 'base64' | 'custom'
      customObfuscate?: (key: string) => string
      customDeobfuscate?: (key: string) => string
    }
  }

  // 智能策略配置
  strategy?: {
    enabled: boolean
    sizeThresholds?: {
      small: number // 小数据阈值
      medium: number // 中等数据阈值
      large: number // 大数据阈值
    }
    ttlThresholds?: {
      short: number // 短期缓存阈值
      medium: number // 中期缓存阈值
      long: number // 长期缓存阈值
    }
    enginePriority?: StorageEngine[] // 引擎优先级
  }

  // 存储引擎配置
  engines?: {
    localStorage?: { maxSize?: number; keyPrefix?: string }
    sessionStorage?: { maxSize?: number; keyPrefix?: string }
    cookie?: { domain?: string; path?: string; secure?: boolean }
    indexedDB?: { dbName?: string; version?: number; storeName?: string }
    memory?: { maxSize?: number; cleanupInterval?: number }
  }
}
```

### 高级用法

#### 1. 自定义加密算法

```typescript
const cache = createCache({
  security: {
    encryption: {
      enabled: true,
      algorithm: 'custom',
      customEncrypt: data => {
        // 你的自定义加密逻辑
        return btoa(data) // 简单的 Base64 示例
      },
      customDecrypt: data => {
        // 你的自定义解密逻辑
        return atob(data)
      },
    },
  },
})
```

#### 2. 智能存储策略

```typescript
const cache = createCache({
  strategy: {
    enabled: true,
    sizeThresholds: {
      small: 1024, // 1KB 以下用 localStorage
      medium: 64 * 1024, // 64KB 以下用 sessionStorage
      large: 1024 * 1024, // 1MB 以上用 IndexedDB
    },
    ttlThresholds: {
      short: 5 * 60 * 1000, // 5分钟以下用内存
      medium: 24 * 60 * 60 * 1000, // 24小时以下用 sessionStorage
      long: 7 * 24 * 60 * 60 * 1000, // 7天以上用 localStorage
    },
  },
})

// 库会自动选择最适合的存储引擎
await cache.set('large-dataset', bigData) // 自动选择 IndexedDB
await cache.set('temp-token', token, { ttl: 1000 }) // 自动选择内存缓存
```

#### 3. 事件监听

```typescript
// 监听缓存事件
cache.on('set', event => {
  console.log(`缓存设置: ${event.key} -> ${event.engine}`)
})

cache.on('expired', event => {
  console.log(`缓存过期: ${event.key}`)
})

cache.on('error', event => {
  console.error(`缓存错误: ${event.error?.message}`)
})
```

#### 4. 批量操作

```typescript
// 批量设置
const items = [
  { key: 'user1', value: { name: '用户1' } },
  { key: 'user2', value: { name: '用户2' } },
  { key: 'user3', value: { name: '用户3' } },
]

await Promise.all(items.map(item => cache.set(item.key, item.value)))

// 批量获取
const keys = ['user1', 'user2', 'user3']
const values = await Promise.all(keys.map(key => cache.get(key)))
```

## 🎯 使用场景

### 1. 用户状态管理

```typescript
// 保存用户登录状态
await cache.set(
  'user-session',
  {
    token: 'jwt-token',
    userId: 123,
    permissions: ['read', 'write'],
  },
  {
    ttl: 2 * 60 * 60 * 1000, // 2小时过期
    encrypt: true, // 加密敏感信息
  }
)
```

### 2. API 响应缓存

```typescript
// 缓存 API 响应
const cacheKey = `api-users-${page}-${pageSize}`
let users = await cache.get(cacheKey)

if (!users) {
  users = await fetchUsers(page, pageSize)
  await cache.set(cacheKey, users, { ttl: 5 * 60 * 1000 }) // 5分钟缓存
}
```

### 3. 表单数据暂存

```typescript
// 自动保存表单数据
const formCache = cache.useReactiveCache('form-draft', {})
const stopAutoSave = formCache.enableAutoSave({ ttl: 30 * 60 * 1000 }) // 30分钟

// 表单数据会自动保存到缓存
formCache.value.value = {
  name: '张三',
  email: 'zhangsan@example.com',
}
```

### 4. 大数据集缓存

```typescript
// 缓存大型数据集
await cache.set('large-dataset', {
  records: Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    data: `record-${i}`,
  })),
}) // 自动选择 IndexedDB 存储
```

## 📊 性能特性

### 智能引擎选择

- 🔍 **自动检测** - 根据数据特征自动选择最优存储引擎
- ⚡ **性能优化** - 内存缓存用于高频访问，IndexedDB 用于大数据
- 📈 **统计监控** - 实时监控命中率、存储使用情况

### 内存管理

- 🧹 **自动清理** - 定期清理过期项
- 💾 **空间管理** - 智能释放存储空间
- 📏 **大小限制** - 防止存储溢出

## 🔧 API 参考

### CacheManager

```typescript
class CacheManager {
  // 基础操作
  set<T>(key: string, value: T, options?: SetOptions): Promise<void>
  get<T>(key: string): Promise<T | null>
  remove(key: string): Promise<void>
  clear(engine?: StorageEngine): Promise<void>
  has(key: string): Promise<boolean>

  // 批量操作
  keys(engine?: StorageEngine): Promise<string[]>
  getMetadata(key: string): Promise<CacheMetadata | null>

  // 统计和监控
  getStats(): Promise<CacheStats>
  cleanup(): Promise<void>

  // 事件监听
  on(event: CacheEventType, listener: CacheEventListener): void
  off(event: CacheEventType, listener: CacheEventListener): void

  // 生命周期
  destroy(): Promise<void>
}
```

### Vue 组合式函数

```typescript
// useCache
const {
  set,
  get,
  remove,
  clear,
  has,
  keys,
  loading,
  error,
  isReady,
  hasError,
  useReactiveCache,
  getStats,
  cleanup,
} = useCache(options)

// useCacheStats
const { stats, formattedStats, engineUsage, performanceMetrics, refresh, cleanupAndRefresh } =
  useCacheStats({ refreshInterval: 5000 })
```

## 🛠️ 开发指南

### 本地开发

```bash
# 克隆项目
git clone https://github.com/ldesign/ldesign.git
cd ldesign/packages/cache

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 运行测试
pnpm test

# 构建
pnpm build
```

### 测试

```bash
# 运行所有测试
pnpm test:run

# 测试覆盖率
pnpm test:coverage

# E2E 测试
pnpm test:e2e

# 测试 UI
pnpm test:ui
```

## 📊 性能表现

### 基准测试结果

| 引擎         | 设置 (ops/sec) | 获取 (ops/sec) | 包大小           |
| ------------ | -------------- | -------------- | ---------------- |
| Memory       | 1,000,000      | 2,000,000      | ~45KB            |
| localStorage | 10,000         | 20,000         | (Gzipped: ~15KB) |
| IndexedDB    | 2,000          | 5,000          |                  |

### 测试覆盖率

- ✅ **单元测试**: 70 个测试用例全部通过
- ✅ **集成测试**: 覆盖所有主要功能
- ✅ **E2E 测试**: 真实浏览器环境验证
- 📊 **覆盖率**: 57.73% (持续提升中)

## 🌍 浏览器支持

| 浏览器  | 版本 | localStorage | sessionStorage | Cookie | IndexedDB | Memory |
| ------- | ---- | ------------ | -------------- | ------ | --------- | ------ |
| Chrome  | 60+  | ✅           | ✅             | ✅     | ✅        | ✅     |
| Firefox | 55+  | ✅           | ✅             | ✅     | ✅        | ✅     |
| Safari  | 12+  | ✅           | ✅             | ✅     | ✅        | ✅     |
| Edge    | 79+  | ✅           | ✅             | ✅     | ✅        | ✅     |

## 📚 文档和资源

- 📖 [完整文档](./docs) - 详细的使用指南和 API 文档
- 🎮 [在线演示](./examples) - 交互式功能演示
- 💡 [最佳实践](./docs/guide/best-practices.md) - 生产环境使用建议
- 🔧 [故障排除](./docs/guide/troubleshooting.md) - 常见问题解决方案
- 🎯 [迁移指南](./docs/guide/migration.md) - 从其他库迁移

## 🛠️ 开发

### 本地开发

```bash
# 克隆项目
git clone https://github.com/ldesign/ldesign.git
cd ldesign/packages/cache

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 运行测试
pnpm test

# 构建项目
pnpm build

# 启动文档
pnpm docs:dev

# 启动示例
cd examples && pnpm dev
```

### 测试

```bash
# 运行所有测试
pnpm test:run

# 监听模式测试
pnpm test

# 测试覆盖率
pnpm test:coverage

# E2E 测试
pnpm test:e2e

# 测试 UI
pnpm test:ui
```

### 构建

```bash
# 构建库
pnpm build

# 构建文档
pnpm docs:build

# 类型检查
pnpm type-check

# 代码检查
pnpm lint
```

## 🤝 贡献

我们欢迎所有形式的贡献！

### 贡献方式

1. 🐛 **报告 Bug** - 在 [Issues](https://github.com/ldesign/ldesign/issues) 中报告问题
2. 💡 **功能建议** - 提出新功能想法
3. 📝 **改进文档** - 帮助完善文档
4. 🔧 **提交代码** - 修复 Bug 或添加新功能

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

[MIT](./LICENSE) © LDesign Team

---

<div align="center">

**如果这个项目对你有帮助，请给我们一个 ⭐️**

[GitHub](https://github.com/ldesign/ldesign) • [文档](./docs) • [示例](./examples) •
[讨论](https://github.com/ldesign/ldesign/discussions)

</div>
