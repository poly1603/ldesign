# API 接口管理系统

基于 `@ldesign/api` 包实现的 API 接口管理系统，提供统一的接口调用、缓存管理、防抖去重等功能。

## 功能特性

### 🚀 核心功能
- **统一接口管理**: 集中管理所有 API 接口
- **智能缓存系统**: 支持内存、localStorage、sessionStorage 多种缓存策略
- **防抖去重**: 避免重复请求，提升性能
- **插件系统**: 支持扩展和自定义 API 方法
- **Vue 3 集成**: 提供组合式 API 和插件系统
- **TypeScript 支持**: 完整的类型定义

### 📦 内置功能
- **系统 API**: 登录、用户信息、菜单、权限等常用接口
- **自定义 API**: 文章、用户、评论等演示接口
- **批量调用**: 支持同时调用多个接口
- **错误处理**: 统一的错误处理机制
- **性能监控**: 缓存命中率、调用统计等

## 快速开始

### 1. 基础使用

```typescript
import { useApi } from '@ldesign/api/vue'

// 在 Vue 组件中使用
const api = useApi()

// 调用 API
const posts = await api.call('getPosts')
const post = await api.call('getPost', { id: 1 })
```

### 2. 组合式 API

```typescript
import { useApiCall, useSystemApi } from '@ldesign/api/vue'

// 使用 useApiCall 钩子
const { data, loading, error, execute } = useApiCall('getPosts', {
  immediate: true, // 立即执行
  onSuccess: (data) => console.log('成功:', data),
  onError: (error) => console.error('错误:', error),
})

// 使用系统 API
const systemApi = useSystemApi()
const { data: userInfo, execute: fetchUserInfo } = systemApi.getUserInfo()
```

### 3. 批量调用

```typescript
const results = await api.callBatch([
  { methodName: 'getPosts' },
  { methodName: 'getUsers' },
  { methodName: 'getComments', params: { postId: 1 } },
])
```

## 配置说明

### API 引擎配置

```typescript
export const apiPlugin = createApiEnginePlugin({
  name: 'api',
  version: '1.0.0',
  clientConfig: {
    debug: import.meta.env.DEV,
    http: {
      baseURL: 'https://api.example.com',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    },
    cache: {
      enabled: true,
      ttl: 300000, // 5分钟缓存
      maxSize: 100,
      storage: 'memory',
    },
    debounce: {
      enabled: true,
      delay: 300,
    },
    deduplication: {
      enabled: true,
    },
  },
  globalInjection: true,
  globalPropertyName: '$api',
})
```

### 缓存配置

- **enabled**: 是否启用缓存
- **ttl**: 缓存时间 (毫秒)
- **maxSize**: 最大缓存条目数
- **storage**: 缓存存储类型 (`memory` | `localStorage` | `sessionStorage`)

### 防抖配置

- **enabled**: 是否启用防抖
- **delay**: 防抖延迟时间 (毫秒)

### 去重配置

- **enabled**: 是否启用请求去重

## API 方法定义

### 基础方法定义

```typescript
engine.register('methodName', {
  name: 'methodName',
  config: {
    method: 'GET',
    url: '/api/endpoint',
  },
  transform: (response) => response.data,
  validate: (data) => data.success,
  onSuccess: (data) => console.log('成功:', data),
  onError: (error) => console.error('错误:', error),
  cache: {
    enabled: true,
    ttl: 300000,
  },
})
```

### 参数化方法定义

```typescript
engine.register('getPost', {
  name: 'getPost',
  config: (params: { id: number }) => ({
    method: 'GET',
    url: `/posts/${params.id}`,
  }),
  transform: (response) => response.data,
})
```

## 内置 API 方法

### 系统 API

- `getCaptcha`: 获取验证码
- `login`: 用户登录
- `logout`: 用户登出
- `getUserInfo`: 获取用户信息
- `updateUserInfo`: 更新用户信息
- `getMenus`: 获取系统菜单
- `getPermissions`: 获取用户权限
- `refreshToken`: 刷新令牌
- `changePassword`: 修改密码
- `getSystemConfig`: 获取系统配置

### 自定义 API

- `getPosts`: 获取文章列表
- `getPost`: 获取单个文章
- `createPost`: 创建文章
- `updatePost`: 更新文章
- `deletePost`: 删除文章
- `getUsers`: 获取用户列表
- `getComments`: 获取评论列表

## 缓存管理

### 清除缓存

```typescript
// 清除特定方法的缓存
api.clearCache('getPosts')

// 清除所有缓存
api.clearCache()
```

### 获取缓存统计

```typescript
const stats = api.getCacheStats()
console.log('缓存统计:', {
  totalItems: stats.totalItems,
  hits: stats.hits,
  misses: stats.misses,
  hitRate: stats.hitRate,
})
```

## 错误处理

### 全局错误处理

```typescript
// 在方法定义中设置错误处理
{
  onError: (error) => {
    console.error('API 调用失败:', error)
    // 可以在这里添加全局错误处理逻辑
  }
}
```

### 组件级错误处理

```typescript
const { data, error, execute } = useApiCall('getPosts', {
  onError: (error) => {
    // 组件级错误处理
    ElMessage.error(`获取数据失败: ${error.message}`)
  }
})
```

## 性能优化

### 1. 缓存策略
- 根据数据更新频率设置合适的缓存时间
- 对于静态数据使用长时间缓存
- 对于动态数据使用短时间缓存或禁用缓存

### 2. 防抖设置
- 对于搜索等频繁调用的接口启用防抖
- 根据用户体验设置合适的防抖延迟

### 3. 请求去重
- 避免同时发起相同的请求
- 自动合并重复请求的结果

## 最佳实践

### 1. 方法命名
- 使用动词 + 名词的命名方式: `getPosts`, `createUser`
- 保持命名的一致性和可读性

### 2. 参数设计
- 使用 TypeScript 接口定义参数类型
- 提供合理的默认值

### 3. 错误处理
- 为每个方法提供适当的错误处理
- 使用统一的错误格式

### 4. 缓存策略
- 根据业务需求设置缓存策略
- 定期清理过期缓存

## 扩展开发

### 创建自定义插件

```typescript
export const customPlugin = {
  name: 'custom-api',
  version: '1.0.0',
  dependencies: ['api'],
  
  async install(engine: any) {
    if (engine.apiEngine) {
      engine.apiEngine.registerBatch({
        // 自定义 API 方法
      })
    }
  },
  
  async uninstall(engine: any) {
    // 清理逻辑
  },
}
```

### 添加拦截器

```typescript
// 在 HTTP 客户端级别添加拦截器
engine.apiEngine.httpClient.interceptors.request.use(
  (config) => {
    // 请求拦截
    return config
  }
)

engine.apiEngine.httpClient.interceptors.response.use(
  (response) => {
    // 响应拦截
    return response
  }
)
```

## 故障排除

### 常见问题

1. **API 方法未找到**
   - 检查方法是否已注册
   - 确认插件是否正确安装

2. **缓存未生效**
   - 检查缓存配置是否启用
   - 确认缓存键是否正确生成

3. **请求超时**
   - 检查网络连接
   - 调整超时时间配置

4. **类型错误**
   - 确保使用正确的 TypeScript 类型
   - 检查参数类型是否匹配

### 调试技巧

1. 启用调试模式: `debug: true`
2. 查看控制台日志
3. 使用浏览器开发者工具检查网络请求
4. 检查缓存统计信息

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基础 API 调用功能
- 集成缓存、防抖、去重功能
- 提供 Vue 3 组合式 API
- 内置系统 API 和自定义 API 演示
