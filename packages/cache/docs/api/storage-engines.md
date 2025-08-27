# 存储引擎 API

存储引擎是缓存系统的核心组件，负责实际的数据存储和检索。

## IStorageEngine 接口

所有存储引擎都必须实现 `IStorageEngine` 接口：

```typescript
interface IStorageEngine {
  name: string
  isAvailable: boolean
  
  setItem: (key: string, value: string, ttl?: number) => Promise<void>
  getItem: (key: string) => Promise<string | null>
  removeItem: (key: string) => Promise<void>
  clear: () => Promise<void>
  keys: () => Promise<string[]>
  hasItem: (key: string) => Promise<boolean>
  length: () => Promise<number>
  cleanup: () => Promise<void>
}
```

## MemoryEngine

内存存储引擎，数据存储在内存中。

### 构造函数

```typescript
constructor(options?: MemoryEngineOptions)
```

### 配置选项

```typescript
interface MemoryEngineOptions {
  maxSize?: number        // 最大存储大小（字节）
  cleanupInterval?: number // 清理间隔（毫秒）
}
```

### 示例

```typescript
import { MemoryEngine } from '@ldesign/cache'

const engine = new MemoryEngine({
  maxSize: 10 * 1024 * 1024, // 10MB
  cleanupInterval: 60000,     // 1分钟
})
```

## LocalStorageEngine

基于 localStorage 的存储引擎。

### 构造函数

```typescript
constructor(options?: LocalStorageEngineOptions)
```

### 配置选项

```typescript
interface LocalStorageEngineOptions {
  prefix?: string  // 键名前缀
}
```

### 示例

```typescript
import { LocalStorageEngine } from '@ldesign/cache'

const engine = new LocalStorageEngine({
  prefix: 'myapp_',
})
```

## SessionStorageEngine

基于 sessionStorage 的存储引擎。

### 构造函数

```typescript
constructor(options?: SessionStorageEngineOptions)
```

### 配置选项

```typescript
interface SessionStorageEngineOptions {
  prefix?: string  // 键名前缀
}
```

## IndexedDBEngine

基于 IndexedDB 的存储引擎，支持大容量数据存储。

### 构造函数

```typescript
constructor(options?: IndexedDBEngineOptions)
```

### 配置选项

```typescript
interface IndexedDBEngineOptions {
  dbName?: string      // 数据库名称
  storeName?: string   // 存储名称
  version?: number     // 数据库版本
}
```

### 示例

```typescript
import { IndexedDBEngine } from '@ldesign/cache'

const engine = new IndexedDBEngine({
  dbName: 'MyAppCache',
  storeName: 'cache_store',
  version: 1,
})
```

## CookieEngine

基于 Cookie 的存储引擎。

### 构造函数

```typescript
constructor(options?: CookieEngineOptions)
```

### 配置选项

```typescript
interface CookieEngineOptions {
  domain?: string    // Cookie 域名
  path?: string      // Cookie 路径
  secure?: boolean   // 是否仅 HTTPS
  sameSite?: 'strict' | 'lax' | 'none'  // SameSite 策略
}
```

### 示例

```typescript
import { CookieEngine } from '@ldesign/cache'

const engine = new CookieEngine({
  domain: '.example.com',
  path: '/',
  secure: true,
  sameSite: 'lax',
})
```

## StorageEngineFactory

存储引擎工厂类，用于创建和管理存储引擎。

### 静态方法

#### create

创建存储引擎实例：

```typescript
static async create(
  type: StorageEngine,
  options?: any
): Promise<IStorageEngine>
```

#### isAvailable

检查存储引擎是否可用：

```typescript
static isAvailable(type: StorageEngine): boolean
```

#### getAvailableEngines

获取所有可用的存储引擎：

```typescript
static getAvailableEngines(): StorageEngine[]
```

### 示例

```typescript
import { StorageEngineFactory } from '@ldesign/cache'

// 检查可用性
if (StorageEngineFactory.isAvailable('localStorage')) {
  const engine = await StorageEngineFactory.create('localStorage', {
    prefix: 'app_',
  })
}

// 获取所有可用引擎
const available = StorageEngineFactory.getAvailableEngines()
console.log('可用引擎:', available)
```

## 自定义存储引擎

你可以通过实现 `IStorageEngine` 接口来创建自定义存储引擎：

```typescript
class CustomEngine implements IStorageEngine {
  name = 'custom'
  isAvailable = true

  async setItem(key: string, value: string, ttl?: number): Promise<void> {
    // 实现设置逻辑
  }

  async getItem(key: string): Promise<string | null> {
    // 实现获取逻辑
    return null
  }

  async removeItem(key: string): Promise<void> {
    // 实现删除逻辑
  }

  async clear(): Promise<void> {
    // 实现清空逻辑
  }

  async keys(): Promise<string[]> {
    // 实现获取键名逻辑
    return []
  }

  async hasItem(key: string): Promise<boolean> {
    // 实现检查逻辑
    return false
  }

  async length(): Promise<number> {
    // 实现获取数量逻辑
    return 0
  }

  async cleanup(): Promise<void> {
    // 实现清理逻辑
  }
}
```

## 错误处理

所有存储引擎方法都可能抛出错误，建议使用 try-catch 进行错误处理：

```typescript
try {
  await engine.setItem('key', 'value')
} catch (error) {
  console.error('存储失败:', error)
}
```

## 性能考虑

- **MemoryEngine**: 最快，但数据不持久
- **LocalStorageEngine**: 中等速度，数据持久，有大小限制
- **SessionStorageEngine**: 中等速度，会话级持久
- **IndexedDBEngine**: 较慢，但支持大容量数据
- **CookieEngine**: 最慢，有大小限制，会随请求发送

选择合适的存储引擎取决于你的具体需求。
