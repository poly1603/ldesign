# @ldesign/api 文档

欢迎使用 @ldesign/api！这是一个功能强大的通用系统接口管理包，专为现代前端应用设计。

## 🎯 设计理念

@ldesign/api 基于以下核心理念设计：

- **插件化优先**: 通过插件系统实现功能的模块化和可扩展性
- **性能至上**: 内置缓存、防抖、请求去重等性能优化机制
- **类型安全**: 完整的 TypeScript 支持，提供出色的开发体验
- **框架无关**: 核心功能独立于任何框架，同时为 Vue 3 提供深度集成
- **开发友好**: 简洁的 API 设计，丰富的配置选项

## 🏗️ 架构概览

```mermaid
graph TB
    A[API Engine] --> B[Plugin Manager]
    A --> C[HTTP Client]
    A --> D[Cache Manager]
    A --> E[Debounce Manager]
    A --> F[Deduplication Manager]

    B --> G[System APIs Plugin]
    B --> H[Custom Plugins]

    A --> I[Vue Integration]
    I --> J[Vue Plugin]
    I --> K[Composables]

    C --> L[@ldesign/http]
```

### 核心组件

- **API Engine**: 核心引擎，负责协调各个组件
- **Plugin Manager**: 插件管理器，处理插件的注册、依赖和生命周期
- **Cache Manager**: 缓存管理器，支持内存、localStorage、sessionStorage
- **Debounce Manager**: 防抖管理器，避免频繁的重复请求
- **Deduplication Manager**: 去重管理器，合并相同的并发请求
- **Vue Integration**: Vue 3 集成模块，提供插件和组合式 API

## 📚 文档导航

### 快速开始

- [安装和配置](./guide/installation.md)
- [基础用法](./guide/basic-usage.md)
- [Vue 3 集成](./guide/vue.md)

### 核心概念

- [API 引擎](./guide/api-engine.md)
- [插件系统](./guide/plugin-system.md)
- [性能优化](./guide/performance.md)
- [错误处理](./guide/error-handling.md)

### API 参考

- [API 参考](./api/core.md)
- [插件 API](./api/plugins.md)
- [Vue API](./api/vue.md)
- [类型定义](./api/types.md)

### 高级主题

- [自定义插件开发](./advanced/custom-plugins.md)
- [中间件和拦截器](./advanced/middleware.md)
- [最佳实践](./advanced/best-practices.md)
- [性能调优](./advanced/performance-tuning.md)

### 示例和教程

- [基础示例](./examples/basic.md)
- [Vue 3 示例](./examples/vue.md)
- [插件开发示例](./examples/plugins.md)
- [实战项目](./examples/real-world.md)

## 🚀 快速体验

### 1. 安装

```bash
pnpm add @ldesign/api
```

### 2. 基础使用

```typescript
import { createApiEngine, systemApiPlugin } from '@ldesign/api'

// 创建 API 引擎
const apiEngine = createApiEngine({
  http: {
    baseURL: 'https://api.example.com',
  },
})

// 使用系统接口插件
await apiEngine.use(systemApiPlugin)

// 调用接口
const userInfo = await apiEngine.call('getUserInfo')
```

### 3. Vue 3 集成

```typescript
import { ApiVuePlugin } from '@ldesign/api'
// main.ts
import { createApp } from 'vue'

const app = createApp(App)
app.use(ApiVuePlugin, {
  http: {
    baseURL: 'https://api.example.com',
  },
})
```

```vue
<!-- 组件中使用 -->
<script setup lang="ts">
import { useSystemApi } from '@ldesign/api'

const { getUserInfo } = useSystemApi()
const { data, loading, execute } = getUserInfo({ immediate: true })
</script>
```

## 🌟 核心特性

### 插件化架构

通过插件系统，您可以：

- 模块化管理不同业务领域的接口
- 轻松扩展和自定义功能
- 实现接口方法的热插拔
- 管理插件间的依赖关系

### 性能优化

内置多种性能优化机制：

- **智能缓存**: 支持多种存储方式，自动过期清理
- **请求防抖**: 避免频繁的重复请求
- **请求去重**: 合并相同的并发请求
- **懒加载**: 按需加载插件和功能

### 类型安全

完整的 TypeScript 支持：

- 强类型的 API 定义
- 智能的代码提示
- 编译时错误检查
- 优秀的开发体验

### Vue 3 深度集成

专为 Vue 3 设计：

- 响应式的 API 调用状态
- 组合式 API 支持
- 自动的生命周期管理
- 无缝的错误处理

## 🔧 配置选项

### 基础配置

```typescript
interface ApiEngineConfig {
  // 应用信息
  appName?: string
  version?: string
  debug?: boolean

  // HTTP 配置
  http?: HttpClientConfig

  // 性能优化配置
  cache?: CacheConfig
  debounce?: DebounceConfig
  deduplication?: DeduplicationConfig
}
```

### 缓存配置

```typescript
interface CacheConfig {
  enabled?: boolean // 是否启用
  ttl?: number // 缓存时间（毫秒）
  maxSize?: number // 最大缓存条目数
  storage?: 'memory' | 'localStorage' | 'sessionStorage'
  prefix?: string // 缓存键前缀
}
```

### 防抖配置

```typescript
interface DebounceConfig {
  enabled?: boolean // 是否启用
  delay?: number // 防抖延迟（毫秒）
}
```

## 🎨 使用场景

### 1. 企业级管理系统

```typescript
// 用户管理模块
const userManagementPlugin = {
  name: 'user-management',
  apis: {
    getUserList: {
      /* ... */
    },
    createUser: {
      /* ... */
    },
    updateUser: {
      /* ... */
    },
    deleteUser: {
      /* ... */
    },
  },
}

// 权限管理模块
const permissionPlugin = {
  name: 'permission-management',
  apis: {
    getRoles: {
      /* ... */
    },
    getPermissions: {
      /* ... */
    },
    assignRole: {
      /* ... */
    },
  },
}
```

### 2. 电商应用

```typescript
// 商品管理
const productPlugin = {
  name: 'product-apis',
  apis: {
    getProducts: {
      /* ... */
    },
    getProductDetail: {
      /* ... */
    },
    searchProducts: {
      /* ... */
    },
  },
}

// 订单管理
const orderPlugin = {
  name: 'order-apis',
  apis: {
    createOrder: {
      /* ... */
    },
    getOrderList: {
      /* ... */
    },
    getOrderDetail: {
      /* ... */
    },
  },
}
```

### 3. 内容管理系统

```typescript
// 文章管理
const articlePlugin = {
  name: 'article-apis',
  apis: {
    getArticles: {
      /* ... */
    },
    createArticle: {
      /* ... */
    },
    updateArticle: {
      /* ... */
    },
    publishArticle: {
      /* ... */
    },
  },
}
```

## 🤝 社区和支持

- **GitHub**: [https://github.com/ldesign/ldesign](https://github.com/ldesign/ldesign)
- **Issues**: [报告问题](https://github.com/ldesign/ldesign/issues)
- **讨论**: [GitHub Discussions](https://github.com/ldesign/ldesign/discussions)

## 📈 路线图

- [ ] 支持 GraphQL
- [ ] 支持 WebSocket
- [ ] 支持离线缓存
- [ ] 支持请求重试策略
- [ ] 支持请求优先级
- [ ] 支持更多框架集成

---

准备好开始了吗？查看 [安装和配置](./guide/installation.md) 开始您的 @ldesign/api 之旅！
