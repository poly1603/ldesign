# 安装和配置

本指南将帮助您快速安装和配置 @ldesign/api。

## 📦 安装

### 使用包管理器

::: code-group

```bash [pnpm]
pnpm add @ldesign/api
```

```bash [npm]
npm install @ldesign/api
```

```bash [yarn]
yarn add @ldesign/api
```

:::

### 依赖要求

- **Node.js**: >= 16.0.0
- **TypeScript**: >= 4.5.0 (可选，但推荐)
- **Vue**: >= 3.3.0 (仅在使用 Vue 集成时需要)

## ⚙️ 基础配置

### 1. 创建 API 引擎

```typescript
import { createApiEngine } from '@ldesign/api'

const apiEngine = createApiEngine({
  // 基础配置
  appName: 'MyApp',
  version: '1.0.0',
  debug: process.env.NODE_ENV === 'development',

  // HTTP 客户端配置
  http: {
    baseURL: 'https://api.example.com',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  },
})
```

### 2. 使用内置插件

```typescript
import { systemApiPlugin } from '@ldesign/api'

// 注册系统接口插件
await apiEngine.use(systemApiPlugin)

// 现在可以使用系统接口
const userInfo = await apiEngine.call('getUserInfo')
```

### 3. 环境配置

创建配置文件来管理不同环境的设置：

```typescript
// config/api.ts
import type { ApiEngineConfig } from '@ldesign/api'

const baseConfig: ApiEngineConfig = {
  appName: 'MyApp',
  version: '1.0.0',

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

// 开发环境配置
export const developmentConfig: ApiEngineConfig = {
  ...baseConfig,
  debug: true,
  http: {
    baseURL: 'http://localhost:3000/api',
    timeout: 30000, // 开发环境超时时间更长
  },
}

// 生产环境配置
export const productionConfig: ApiEngineConfig = {
  ...baseConfig,
  debug: false,
  http: {
    baseURL: 'https://api.example.com',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  },

  cache: {
    ...baseConfig.cache,
    storage: 'localStorage', // 生产环境使用持久化缓存
  },
}

// 测试环境配置
export const testConfig: ApiEngineConfig = {
  ...baseConfig,
  debug: false,
  http: {
    baseURL: 'https://test-api.example.com',
    timeout: 15000,
  },

  cache: {
    enabled: false, // 测试环境禁用缓存
  },

  debounce: {
    enabled: false, // 测试环境禁用防抖
  },
}

// 根据环境选择配置
export function getApiConfig(): ApiEngineConfig {
  const env = process.env.NODE_ENV || 'development'

  switch (env) {
    case 'production':
      return productionConfig
    case 'test':
      return testConfig
    default:
      return developmentConfig
  }
}
```

### 4. 使用配置

```typescript
// api/index.ts
import { createApiEngine, systemApiPlugin } from '@ldesign/api'
import { getApiConfig } from '../config/api'

// 创建 API 引擎实例
export const apiEngine = createApiEngine(getApiConfig())

// 注册内置插件
await apiEngine.use(systemApiPlugin)

// 导出供其他模块使用
export default apiEngine
```

## 🔧 高级配置

### HTTP 客户端配置

```typescript
import { createApiEngine } from '@ldesign/api'

const apiEngine = createApiEngine({
  http: {
    // 基础配置
    baseURL: 'https://api.example.com',
    timeout: 10000,

    // 请求头
    headers: {
      'Content-Type': 'application/json',
      'X-App-Version': '1.0.0',
    },

    // 拦截器
    interceptors: {
      request: [
        // 添加认证令牌
        config => {
          const token = localStorage.getItem('token')
          if (token) {
            config.headers.Authorization = `Bearer ${token}`
          }
          return config
        },

        // 添加请求ID
        config => {
          config.headers['X-Request-ID'] = generateRequestId()
          return config
        },
      ],

      response: [
        // 处理响应
        response => {
          // 统一处理响应格式
          if (response.data.code !== 200) {
            throw new Error(response.data.message)
          }
          return response
        },

        // 处理认证失败
        response => {
          if (response.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
          }
          return response
        },
      ],

      error: [
        // 错误处理
        error => {
          console.error('API Error:', error)

          // 网络错误处理
          if (!error.response) {
            showNotification('网络连接失败，请检查网络设置')
          }

          return Promise.reject(error)
        },
      ],
    },

    // 重试配置
    retry: {
      retries: 3,
      retryDelay: 1000,
      retryCondition: error => {
        // 只对网络错误和5xx错误重试
        return !error.response || error.response.status >= 500
      },
    },
  },
})
```

### 缓存配置

```typescript
const apiEngine = createApiEngine({
  cache: {
    enabled: true,
    ttl: 300000, // 默认缓存5分钟
    maxSize: 100, // 最大缓存100个条目
    storage: 'memory', // 使用内存缓存
    prefix: 'myapp_api_', // 缓存键前缀
  },
})

// 也可以为特定方法配置缓存
apiEngine.register('getUserProfile', {
  name: 'getUserProfile',
  config: { method: 'GET', url: '/user/profile' },
  cache: {
    enabled: true,
    ttl: 600000, // 用户资料缓存10分钟
  },
})
```

### 防抖配置

```typescript
const apiEngine = createApiEngine({
  debounce: {
    enabled: true,
    delay: 300, // 默认防抖300ms
  },
})

// 为搜索接口配置更长的防抖时间
apiEngine.register('searchUsers', {
  name: 'searchUsers',
  config: params => ({
    method: 'GET',
    url: '/users/search',
    params,
  }),
  debounce: {
    enabled: true,
    delay: 500, // 搜索防抖500ms
  },
})
```

### 请求去重配置

```typescript
const apiEngine = createApiEngine({
  deduplication: {
    enabled: true,
    keyGenerator: config => {
      // 自定义去重键生成逻辑
      return `${config.method}_${config.url}_${JSON.stringify(config.params)}`
    },
  },
})
```

## 🌍 环境变量

使用环境变量来管理不同环境的配置：

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
VITE_API_DEBUG=true

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_API_TIMEOUT=10000
VITE_API_DEBUG=false

# .env.test
VITE_API_BASE_URL=https://test-api.example.com
VITE_API_TIMEOUT=15000
VITE_API_DEBUG=false
```

```typescript
// 在配置中使用环境变量
const apiEngine = createApiEngine({
  debug: import.meta.env.VITE_API_DEBUG === 'true',
  http: {
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  },
})
```

## ✅ 验证配置

创建一个简单的测试来验证配置是否正确：

```typescript
// test/api-config.test.ts
import { apiEngine } from '../api'

describe('API Configuration', () => {
  it('should create API engine with correct config', () => {
    expect(apiEngine).toBeDefined()
    expect(apiEngine.config).toBeDefined()
    expect(apiEngine.config.http?.baseURL).toBeTruthy()
  })

  it('should register system APIs', async () => {
    const methods = apiEngine.getAllMethods()
    expect(methods.getUserInfo).toBeDefined()
    expect(methods.login).toBeDefined()
    expect(methods.logout).toBeDefined()
  })
})
```

## 🚀 下一步

配置完成后，您可以：

1. [学习基础用法](./basic-usage.md)
2. [了解插件系统](./plugin-system.md)
3. [集成到 Vue 3 项目](./vue.md)
4. [查看完整示例](../examples/basic.md)

---

如果您在配置过程中遇到问题，请查看 [故障排除指南](./faq.md) 或
[提交 Issue](https://github.com/ldesign/ldesign/issues)。
