# 存储引擎

## 🏪 引擎概览

@ldesign/cache 支持 5 种不同的存储引擎，每种引擎都有其独特的特点和适用场景。

## 📱 localStorage 引擎

### 特点

- **持久化存储** - 数据在浏览器关闭后仍然保留
- **同域共享** - 同一域名下的所有页面共享数据
- **容量较大** - 通常 5-10MB 的存储空间
- **同步 API** - 操作简单直接

### 适用场景

- 用户配置和偏好设置
- 应用状态持久化
- 离线数据缓存
- 长期有效的数据

### 使用示例

```typescript
const cache = createCache({
  defaultEngine: 'localStorage',
  engines: {
    localStorage: {
      enabled: true,
      maxSize: 5 * 1024 * 1024, // 5MB
      compression: true, // 启用压缩
    },
  },
})

// 存储用户配置
await cache.set('user-config', {
  theme: 'dark',
  language: 'zh-CN',
  notifications: true,
})

// 获取配置
const config = await cache.get('user-config')
```

### 配置选项

```typescript
interface LocalStorageConfig {
  enabled?: boolean // 是否启用，默认 true
  maxSize?: number // 最大存储大小（字节）
  compression?: boolean // 是否启用压缩，默认 false
  prefix?: string // 键名前缀
}
```

## 🔄 sessionStorage 引擎

### 特点

- **会话级存储** - 标签页关闭后数据清除
- **标签页隔离** - 不同标签页数据独立
- **容量适中** - 通常 5-10MB 的存储空间
- **安全性高** - 数据不会跨会话泄露

### 适用场景

- 表单数据临时保存
- 页面状态管理
- 敏感的临时数据
- 单次会话的缓存

### 使用示例

```typescript
const cache = createCache({
  defaultEngine: 'sessionStorage',
})

// 保存表单数据
await cache.set('form-draft', {
  name: '张三',
  email: 'zhangsan@example.com',
  message: '这是一条消息...',
})

// 页面刷新后仍然可以获取
const draft = await cache.get('form-draft')
```

## 🍪 Cookie 引擎

### 特点

- **服务器交互** - 自动发送到服务器
- **容量有限** - 每个 Cookie 最大 4KB
- **过期控制** - 支持精确的过期时间
- **域名控制** - 可设置作用域和路径

### 适用场景

- 认证令牌存储
- 用户跟踪数据
- 服务器需要的配置
- 跨子域数据共享

### 使用示例

```typescript
const cache = createCache({
  engines: {
    cookie: {
      enabled: true,
      domain: '.example.com', // 作用域
      secure: true, // 仅 HTTPS
      sameSite: 'strict', // 防 CSRF
    },
  },
})

// 存储认证令牌
await cache.set('auth-token', 'jwt-token-here', {
  ttl: 24 * 60 * 60 * 1000, // 24小时
  httpOnly: false, // 允许 JS 访问
  secure: true, // 仅 HTTPS 传输
})
```

### 配置选项

```typescript
interface CookieConfig {
  enabled?: boolean
  domain?: string // Cookie 域名
  path?: string // Cookie 路径
  secure?: boolean // 是否仅 HTTPS
  sameSite?: 'strict' | 'lax' | 'none'
  maxAge?: number // 最大生存时间
}
```

## 🗄️ IndexedDB 引擎

### 特点

- **大容量存储** - 通常几百 MB 到几 GB
- **结构化查询** - 支持索引和复杂查询
- **异步操作** - 不阻塞主线程
- **事务支持** - 保证数据一致性

### 适用场景

- 大量结构化数据
- 离线应用数据
- 复杂对象存储
- 需要查询的数据集

### 使用示例

```typescript
const cache = createCache({
  engines: {
    indexedDB: {
      enabled: true,
      dbName: 'MyAppDB',
      version: 1,
      storeName: 'cache',
      indexes: [
        { name: 'timestamp', keyPath: 'timestamp' },
        { name: 'category', keyPath: 'metadata.category' },
      ],
    },
  },
})

// 存储复杂数据
await cache.set('user-list', [
  { id: 1, name: '张三', department: '技术部' },
  { id: 2, name: '李四', department: '产品部' },
  // ... 更多数据
])

// 查询数据（未来版本支持）
const users = await cache.query('user-list', {
  where: { department: '技术部' },
})
```

### 配置选项

```typescript
interface IndexedDBConfig {
  enabled?: boolean
  dbName?: string // 数据库名称
  version?: number // 数据库版本
  storeName?: string // 对象存储名称
  indexes?: Array<{
    // 索引配置
    name: string
    keyPath: string
    unique?: boolean
  }>
}
```

## 💾 Memory 引擎

### 特点

- **极高性能** - 内存访问速度最快
- **易失性** - 页面刷新后数据丢失
- **LRU 淘汰** - 自动清理最久未使用的数据
- **容量控制** - 可设置最大内存使用量

### 适用场景

- 计算结果缓存
- 频繁访问的数据
- 临时状态存储
- 性能敏感的场景

### 使用示例

```typescript
const cache = createCache({
  engines: {
    memory: {
      enabled: true,
      maxSize: 50 * 1024 * 1024, // 50MB
      maxItems: 1000, // 最大项目数
      cleanupInterval: 5 * 60 * 1000, // 5分钟清理一次
    },
  },
})

// 缓存计算结果
async function expensiveCalculation(input) {
  const cacheKey = `calc:${JSON.stringify(input)}`

  // 先检查缓存
  let result = await cache.get(cacheKey)
  if (result !== null) {
    return result
  }

  // 执行计算
  result = performExpensiveCalculation(input)

  // 缓存结果（5分钟有效）
  await cache.set(cacheKey, result, { ttl: 5 * 60 * 1000 })

  return result
}
```

### 配置选项

```typescript
interface MemoryConfig {
  enabled?: boolean
  maxSize?: number // 最大内存使用（字节）
  maxItems?: number // 最大项目数量
  cleanupInterval?: number // 清理间隔（毫秒）
  evictionPolicy?: 'lru' | 'lfu' | 'fifo' // 淘汰策略
}
```

## 🔄 引擎切换

### 自动切换

智能策略会根据数据特征自动选择引擎：

```typescript
const cache = createCache({
  strategy: { enabled: true },
})

// 自动选择：小数据 → localStorage
await cache.set('config', { theme: 'dark' })

// 自动选择：大数据 → IndexedDB
await cache.set('dataset', largeDataArray)

// 自动选择：短期数据 → Memory
await cache.set('temp', data, { ttl: 1000 })
```

### 手动指定

也可以为特定操作手动指定引擎：

```typescript
// 强制使用 IndexedDB
await cache.set('large-data', data, { engine: 'indexedDB' })

// 强制使用 Memory
await cache.set('fast-access', data, { engine: 'memory' })
```

### 降级策略

当首选引擎不可用时，自动降级到备用引擎：

```typescript
const cache = createCache({
  defaultEngine: 'indexedDB',
  fallbackEngine: 'localStorage', // 备用引擎
  engines: {
    indexedDB: { enabled: true },
    localStorage: { enabled: true },
  },
})
```

## 📊 性能对比

### 操作性能

| 引擎           | 设置 (ms/op) | 获取 (ms/op) | 删除 (ms/op) |
| -------------- | ------------ | ------------ | ------------ |
| Memory         | 0.1          | 0.05         | 0.05         |
| localStorage   | 1.0          | 0.5          | 0.3          |
| sessionStorage | 1.0          | 0.5          | 0.3          |
| Cookie         | 2.0          | 1.0          | 1.0          |
| IndexedDB      | 5.0          | 2.0          | 3.0          |

### 存储容量

| 引擎           | 典型容量 | 最大容量     |
| -------------- | -------- | ------------ |
| Memory         | 50MB     | 受内存限制   |
| localStorage   | 5-10MB   | 浏览器设置   |
| sessionStorage | 5-10MB   | 浏览器设置   |
| Cookie         | 4KB/个   | 总计约 50 个 |
| IndexedDB      | 几百 MB  | 磁盘空间     |

## 🔧 引擎检测

### 可用性检测

```typescript
// 检查引擎是否可用
const isAvailable = await cache.isEngineAvailable('indexedDB')

if (isAvailable) {
  await cache.set('data', value, { engine: 'indexedDB' })
}
else {
  // 使用备用方案
  await cache.set('data', value, { engine: 'localStorage' })
}
```

### 容量检测

```typescript
// 获取引擎使用情况
const stats = await cache.getEngineStats('localStorage')

console.log(`已使用: ${stats.usedSize} / ${stats.maxSize}`)
console.log(`使用率: ${stats.usagePercentage}%`)
```

## 🎯 选择指南

### 根据数据特征选择

```typescript
// 配置数据 → localStorage
await cache.set('app-config', config)

// 会话数据 → sessionStorage
await cache.set('user-session', session)

// 认证数据 → Cookie
await cache.set('auth-token', token)

// 大数据集 → IndexedDB
await cache.set('offline-data', largeDataset)

// 计算缓存 → Memory
await cache.set('calc-result', result, { ttl: 300000 })
```

### 根据使用场景选择

| 场景         | 推荐引擎       | 原因                   |
| ------------ | -------------- | ---------------------- |
| 用户偏好设置 | localStorage   | 需要持久化，跨会话保留 |
| 表单草稿     | sessionStorage | 会话级，隐私保护       |
| 登录状态     | Cookie         | 服务器需要验证         |
| 离线数据     | IndexedDB      | 大容量，结构化         |
| API 响应缓存 | Memory         | 高频访问，性能优先     |

## 🔗 下一步

- [智能策略](./smart-strategy.md) - 了解自动引擎选择
- [安全特性](./security.md) - 数据加密和保护
- [Vue 集成](./vue-integration.md) - Vue 3 深度集成
