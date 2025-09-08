# @ldesign/api

🚀 **一个功能强大的通用系统接口管理包** - 支持插件化架构、内置系统接口、性能优化，完美集成 Vue 3

[![npm version](https://img.shields.io/npm/v/@ldesign/api.svg)](https://www.npmjs.com/package/@ldesign/api)
[![license](https://img.shields.io/npm/l/@ldesign/api.svg)](https://github.com/ldesign/ldesign/blob/main/LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ 特性

### 📚 快速导航（新增）
- 安装与入门：docs/guide/installation.md
- 中间件与重试：docs/guide/middlewares.md
- 系统 API 指南：docs/guide/system-api.md
- REST 插件与分页：docs/guide/rest.md
- Vue 组合式指南：docs/guide/vue.md
- 类型增强：withTypedApi（见 middlewares.md、rest.md 与 typed-registry.md）
- 最佳实践：docs/guide/best-practices.md
- 常见问题：docs/guide/faq.md

🔌 **插件化架构** - 通过 `engine.use()` 方法轻松扩展和管理接口方法 🎯
**内置系统接口** - 提供常用的系统接口，如登录、用户信息、菜单等 ⚡
**性能优化** - 内置缓存、防抖、请求去重等性能优化机制 🌟
**框架无关** - 纯 JavaScript/TypeScript 包，可在任何前端框架中使用 💎 **Vue 3 深度集成** - 专为 Vue
3 设计的组合式 API 和插件系统 🛡️ **TypeScript 优先** - 完整的类型定义，提供出色的开发体验 🔧
**高度可配置** - 灵活的配置选项，满足各种业务需求 📦 **轻量级** - 精心设计的架构，保持包体积小巧

## 🚀 快速开始

### 安装

```bash
# 使用 pnpm（推荐）
pnpm add @ldesign/api

# 使用 npm
npm install @ldesign/api

# 使用 yarn
yarn add @ldesign/api
```

### 基础用法

```typescript
import { createApiEngine, systemApiPlugin } from '@ldesign/api'

// 创建 API 引擎
const apiEngine = createApiEngine({
  debug: true,
  http: {
    baseURL: 'https://api.example.com',
    timeout: 10000,
  },
})

// 使用内置系统接口插件
await apiEngine.use(systemApiPlugin)

// 调用系统接口
const userInfo = await apiEngine.call('getUserInfo')
const menus = await apiEngine.call('getMenus')

// 登录示例
const loginResult = await apiEngine.call('login', {
  username: 'admin',
  password: 'password123',
})
```

### Vue 3 集成

```vue
<script setup lang="ts">
import { useSystemApi } from '@ldesign/api'

const systemApi = useSystemApi()

// 获取用户信息
const {
  data: userInfo,
  loading,
  error,
  execute: fetchUserInfo,
} = systemApi.getUserInfo({
  immediate: true, // 立即执行
})

// 登录
const { execute: login } = systemApi.login({
  onSuccess: result => {
    console.log('登录成功:', result)
  },
  onError: error => {
    console.error('登录失败:', error)
  },
})

const handleLogin = async () => {
  await login({
    username: 'admin',
    password: 'password123',
  })
}
</script>

<template>
  <div>
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">错误: {{ error.message }}</div>
    <div v-else-if="userInfo">
      <h2>欢迎, {{ userInfo.username }}!</h2>
      <p>邮箱: {{ userInfo.email }}</p>
    </div>

    <button @click="handleLogin">登录</button>
  </div>
</template>
```

## 🎯 核心概念

### API 引擎

API 引擎是整个系统的核心，负责管理接口方法、插件、缓存等功能：

```typescript
import { createApiEngine } from '@ldesign/api'

const apiEngine = createApiEngine({
  // HTTP 客户端配置
  http: {
    baseURL: 'https://api.example.com',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  },

  // 缓存配置
  cache: {
    enabled: true,
    ttl: 300000, // 5分钟
    storage: 'memory', // 'memory' | 'localStorage' | 'sessionStorage'
  },

  // 防抖配置
  debounce: {
    enabled: true,
    delay: 300, // 300ms
  },

  // 请求去重配置
  deduplication: {
    enabled: true,
  },
})
```

### 插件系统

通过插件系统可以轻松扩展和管理接口方法：

```typescript
// 创建自定义插件
const customPlugin = {
  name: 'custom-apis',
  version: '1.0.0',
  apis: {
    getProducts: {
      name: 'getProducts',
      config: {
        method: 'GET',
        url: '/products',
      },
      cache: { enabled: true, ttl: 600000 }, // 10分钟缓存
    },

    createProduct: {
      name: 'createProduct',
      config: params => ({
        method: 'POST',
        url: '/products',
        data: params,
      }),
      cache: { enabled: false }, // 不缓存
    },
  },

  install: engine => {
    console.log('自定义插件已安装')
  },
}

// 使用插件
await apiEngine.use(customPlugin)

// 调用自定义接口
const products = await apiEngine.call('getProducts')
const newProduct = await apiEngine.call('createProduct', {
  name: '新产品',
  price: 99.99,
})
```

### 内置系统接口

包含常用的系统接口方法：

```typescript
import { SYSTEM_API_METHODS, systemApiPlugin } from '@ldesign/api'

// 使用系统接口插件
await apiEngine.use(systemApiPlugin)

// 获取验证码
const captcha = await apiEngine.call(SYSTEM_API_METHODS.GET_CAPTCHA)

// 用户登录
const loginResult = await apiEngine.call(SYSTEM_API_METHODS.LOGIN, {
  username: 'admin',
  password: 'password123',
  captcha: '1234',
  captchaId: captcha.captchaId,
})

// 获取用户信息
const userInfo = await apiEngine.call(SYSTEM_API_METHODS.GET_USER_INFO)

// 获取系统菜单
const menus = await apiEngine.call(SYSTEM_API_METHODS.GET_MENUS)

// 用户登出
await apiEngine.call(SYSTEM_API_METHODS.LOGOUT)
```

### 性能优化

#### 缓存机制

```typescript
// 全局缓存配置
const apiEngine = createApiEngine({
  cache: {
    enabled: true,
    ttl: 300000, // 默认缓存5分钟
    maxSize: 100, // 最大缓存条目数
    storage: 'memory', // 缓存存储类型
  },
})

// 方法级缓存配置
apiEngine.register('getUserProfile', {
  name: 'getUserProfile',
  config: { method: 'GET', url: '/user/profile' },
  cache: {
    enabled: true,
    ttl: 600000, // 缓存10分钟
  },
})
```

#### 防抖机制

```typescript
// 全局防抖配置
const apiEngine = createApiEngine({
  debounce: {
    enabled: true,
    delay: 300, // 默认防抖300ms
  },
})

// 方法级防抖配置
apiEngine.register('searchUsers', {
  name: 'searchUsers',
  config: params => ({
    method: 'GET',
    url: '/users/search',
    params,
  }),
  debounce: {
    enabled: true,
    delay: 500, // 防抖500ms
  },
})
```

#### 请求去重

```typescript
// 启用请求去重
const apiEngine = createApiEngine({
  deduplication: {
    enabled: true,
    keyGenerator: config => `${config.method}_${config.url}_${JSON.stringify(config.params)}`,
  },
})

// 同时发起相同请求，只会执行一次
const [result1, result2, result3] = await Promise.all([
  apiEngine.call('getUserInfo'),
  apiEngine.call('getUserInfo'),
  apiEngine.call('getUserInfo'),
])
// result1、result2、result3 都是相同的结果
```

## 🔧 Vue 3 集成

### 安装插件

```typescript
import { ApiVuePlugin, systemApiPlugin } from '@ldesign/api'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 安装 API 插件
app.use(ApiVuePlugin, {
  debug: true,
  http: {
    baseURL: import.meta.env.VITE_API_BASE_URL,
  },
  globalPropertyName: '$api', // 全局属性名称
})

app.mount('#app')
```

### 组合式 API

```vue
<script setup lang="ts">
import { useApiCall, useSystemApi, useApi } from '@ldesign/api/vue'

// 使用系统 API
const systemApi = useSystemApi()

// 用户登录
const {
  data: loginResult,
  loading: loginLoading,
  error: loginError,
  execute: login,
} = systemApi.login({
  onSuccess: result => {
    // 登录成功处理
    localStorage.setItem('token', result.accessToken)
  },
  onError: error => {
    // 登录失败处理
    console.error('登录失败:', error.message)
  },
})

// 获取用户信息（立即执行）
const { data: userInfo, loading: userLoading } = systemApi.getUserInfo({ immediate: true })

// 自定义 API 调用
const {
  data: products,
  loading: productsLoading,
  execute: fetchProducts,
} = useApiCall('getProducts')

// 直接使用 API 引擎
const apiEngine = useApi()

const handleLogin = async () => {
  try {
    await login({
      username: 'admin',
      password: 'password123',
    })
  } catch (error) {
    console.error('登录失败:', error)
  }
}
</script>
```

### 批量 API 调用

```vue
<script setup lang="ts">
import { useBatchApiCall } from '@ldesign/api/vue'

// 批量调用多个 API
const {
  data: batchData,
  loading: batchLoading,
  errors: batchErrors,
  execute: executeBatch,
} = useBatchApiCall(['getUserInfo', 'getMenus', 'getPermissions'])

// 执行批量调用
const loadUserData = async () => {
  await executeBatch()

  // batchData.value 包含所有成功的结果
  // batchErrors.value 包含所有失败的错误
}
</script>
```

## 📚 API 参考

### 核心 API

#### createApiEngine(config?)

创建 API 引擎实例。

**参数:**

- `config` (可选): API 引擎配置

**返回:** `ApiEngine` 实例

#### ApiEngine.use(plugin)

注册插件。

**参数:**

- `plugin`: 插件对象

**返回:** `Promise<void>`

#### ApiEngine.call(methodName, params?)

调用 API 方法。

**参数:**

- `methodName`: 方法名称
- `params` (可选): 请求参数

**返回:** `Promise<any>`

### Vue 组合式 API

#### useApi()

获取 API 引擎实例。

**返回:** `ApiEngine` 实例

#### useApiCall(methodName, options?)

创建 API 调用状态。

**参数:**

- `methodName`: 方法名称
- `options` (可选): 调用选项

**返回:** API 调用状态对象

#### useSystemApi()

获取系统 API 方法。

**返回:** 系统 API 方法对象

## 🛠️ 高级用法

### 自定义插件开发

```typescript
import type { ApiPlugin } from '@ldesign/api'

const advancedPlugin: ApiPlugin = {
  name: 'advanced-plugin',
  version: '1.0.0',
  dependencies: ['system-apis'], // 依赖其他插件

  apis: {
    // 定义 API 方法
    getAdvancedData: {
      name: 'getAdvancedData',
      config: params => ({
        method: 'GET',
        url: '/advanced/data',
        params,
      }),

      // 数据转换
      transform: response => {
        return response.data.items
      },

      // 数据验证
      validate: data => {
        return Array.isArray(data) && data.length > 0
      },

      // 错误处理
      onError: error => {
        console.error('获取高级数据失败:', error)
      },

      // 缓存配置
      cache: {
        enabled: true,
        ttl: 600000, // 10分钟
      },

      // 防抖配置
      debounce: {
        enabled: true,
        delay: 500,
      },
    },
  },

  install: async engine => {
    // 插件安装逻辑
    console.log('高级插件已安装')

    // 可以注册额外的方法
    engine.register('customMethod', {
      name: 'customMethod',
      config: { method: 'GET', url: '/custom' },
    })
  },

  uninstall: engine => {
    // 插件卸载逻辑
    console.log('高级插件已卸载')
  },
}

// 使用插件
await apiEngine.use(advancedPlugin)
```

### 中间件和拦截器

```typescript
import { createApiEngine } from '@ldesign/api'

const apiEngine = createApiEngine({
  http: {
    baseURL: 'https://api.example.com',

    // HTTP 拦截器会自动继承
    interceptors: {
      request: [
        // 请求拦截器
        config => {
          const token = localStorage.getItem('token')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
          return config
        },
      ],

      response: [
        // 响应拦截器
        response => {
          if (response.data.code === 401) {
            // 处理认证失败
            localStorage.removeItem('token')
            window.location.href = '/login'
          }
          return response
        },
      ],
    },
  },
})
```

### 错误处理

```typescript
// 全局错误处理
apiEngine.register('riskyMethod', {
  name: 'riskyMethod',
  config: { method: 'GET', url: '/risky' },
  onError: error => {
    // 方法级错误处理
    console.error('方法执行失败:', error)

    // 可以进行错误上报
    reportError(error)
  },
})

// 调用时的错误处理
try {
  const result = await apiEngine.call('riskyMethod')
} catch (error) {
  // 调用级错误处理
  console.error('调用失败:', error)
}
```

## 📖 最佳实践

### 1. 项目结构

```
src/
├── api/
│   ├── plugins/           # 自定义插件
│   │   ├── user-apis.ts
│   │   └── product-apis.ts
│   ├── config.ts          # API 配置
│   └── index.ts           # API 入口
├── composables/           # Vue 组合式函数
│   └── useAuth.ts
└── main.ts
```

### 2. 配置管理

```typescript
// api/config.ts
import type { ApiEngineConfig } from '@ldesign/api'

export const apiConfig: ApiEngineConfig = {
  debug: import.meta.env.DEV,

  http: {
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  },

  cache: {
    enabled: true,
    ttl: 300000, // 5分钟
    storage: 'memory',
  },

  debounce: {
    enabled: true,
    delay: 300,
  },

  deduplication: {
    enabled: true,
  },
}
```

### 3. 插件组织

```typescript
// api/plugins/user-apis.ts
import type { ApiPlugin } from '@ldesign/api'

export const userApisPlugin: ApiPlugin = {
  name: 'user-apis',
  version: '1.0.0',

  apis: {
    getUserProfile: {
      name: 'getUserProfile',
      config: { method: 'GET', url: '/user/profile' },
      cache: { enabled: true, ttl: 600000 },
    },

    updateUserProfile: {
      name: 'updateUserProfile',
      config: params => ({
        method: 'PUT',
        url: '/user/profile',
        data: params,
      }),
      cache: { enabled: false },
    },
  },

  install: engine => {
    console.log('用户 API 插件已安装')
  },
}
```

### 4. 组合式函数封装

```typescript
import { useSystemApi } from '@ldesign/api/vue'
// composables/useAuth.ts
import { computed, ref } from 'vue'

export function useAuth() {
  const systemApi = useSystemApi()
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))

  const isLoggedIn = computed(() => !!token.value)

  const { execute: loginExecute, loading: loginLoading } = systemApi.login({
    onSuccess: result => {
      token.value = result.accessToken
      user.value = result.userInfo
      localStorage.setItem('token', result.accessToken)
    },
  })

  const { execute: logoutExecute } = systemApi.logout({
    onSuccess: () => {
      token.value = null
      user.value = null
      localStorage.removeItem('token')
    },
  })

  const login = async credentials => {
    await loginExecute(credentials)
  }

  const logout = async () => {
    await logoutExecute()
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    loginLoading,
  }
}
```

## 🔍 故障排除

### 常见问题

**Q: 为什么我的 API 调用没有被缓存？**

A: 检查以下几点：

1. 确保全局缓存已启用：`cache: { enabled: true }`
2. 确保方法级缓存未被禁用：`cache: { enabled: false }`
3. 检查缓存 TTL 是否已过期

**Q: 防抖功能不生效？**

A: 确保：

1. 全局防抖已启用：`debounce: { enabled: true }`
2. 方法级防抖未被禁用
3. 调用参数完全相同（防抖基于参数生成键）

**Q: Vue 组合式 API 报错找不到 API 引擎？**

A: 确保：

1. 已安装 Vue 插件：`app.use(apiVuePlugin)`
2. 在组件内部调用组合式函数
3. 检查注入键是否正确

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](../../CONTRIBUTING.md) 了解详细信息。

## 📄 许可证

[MIT](../../LICENSE) © LDesign Team

## 🔗 相关链接

- [文档](./docs/index.md)
- [API 参考](./docs/api/index.md)
- [示例](./examples/)
- [更新日志](./CHANGELOG.md)

## 特性

- 🚀 **高性能** - 优化的性能表现
- 🎯 **类型安全** - 完整的 TypeScript 支持
- 📦 **轻量级** - 最小化的包体积
- 🔧 **易于使用** - 简洁的 API 设计

## 安装

```bash
npm install @ldesign/api
# 或
pnpm add @ldesign/api
# 或
yarn add @ldesign/api
```

## 使用

### 快速上手：中间件/重试/认证/轮询/类型增强（新增）

```ts
import { createApiEngine, authMiddlewaresPlugin, systemApiPlugin, withTypedApi } from '@ldesign/api'

const api = createApiEngine({
  retry: { enabled: true, retries: 2, delay: 200 },
  middlewares: {
    request: [(cfg) => { cfg.headers = { ...(cfg.headers||{}), 'X-App':'ldesign' }; return cfg }],
    response: [(res) => { if (res.data?.data) res.data = res.data.data; return res }],
  }
})

await api.use(authMiddlewaresPlugin)
await api.use(systemApiPlugin)

// 可选：类型增强（仅类型层，运行时零成本）
type Registry = { getUserInfo: { id: string, username: string } }
const typed = withTypedApi<Registry>(api)
const u = await typed.call('getUserInfo')
```

更多见 docs/guide/middlewares.md 与 docs/guide/rest.md。

### 基础用法

```typescript
import { api } from '@ldesign/api'

api()
```

## API 文档

详细的 API 文档请访问：[文档站点](https://ldesign.github.io/api/)

## 开发

```bash
# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建
pnpm build

# 测试
pnpm test

# E2E 测试
pnpm test:e2e

# 文档开发
pnpm docs:dev
```

## 许可证

MIT © LDesign Team
