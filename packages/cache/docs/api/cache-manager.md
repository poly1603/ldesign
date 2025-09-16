# CacheManager API

## 🏗️ 构造函数

### `new CacheManager(options?)`

创建缓存管理器实例。

**参数:**

- `options` - 可选的配置选项

**示例:**

```typescript
import { CacheManager } from '@ldesign/cache'

const cache = new CacheManager({
  defaultEngine: 'localStorage',
  keyPrefix: 'myapp_',
})
```

## 📝 核心方法

### `set(key, value, options?)`

设置缓存数据。

**参数:**

- `key: string` - 缓存键名
- `value: any` - 要缓存的数据
- `options?: SetOptions` - 可选的设置选项

**返回:** `Promise<void>`

**示例:**

```typescript
// 基础用法
await cache.set('user-name', '张三')

// 带选项
await cache.set('session-data', userData, {
  ttl: 30 * 60 * 1000, // 30分钟过期
  engine: 'sessionStorage', // 指定引擎
  encrypt: true, // 加密存储
})
```

**SetOptions 接口:**

```typescript
interface SetOptions {
  ttl?: number // 生存时间（毫秒）
  engine?: StorageEngine // 指定存储引擎
  encrypt?: boolean // 是否加密
  compress?: boolean // 是否压缩
  metadata?: any // 自定义元数据
}
```

### `get(key, options?)`

获取缓存数据。

**参数:**

- `key: string` - 缓存键名
- `options?: GetOptions` - 可选的获取选项

**返回:** `Promise<T | null>`

**示例:**

```typescript
// 基础用法
const userName = await cache.get('user-name')

// 带默认值
const config = await cache.get('app-config', {
  defaultValue: { theme: 'light' },
})

// 指定引擎
const data = await cache.get('data', {
  engine: 'indexedDB',
})
```

**GetOptions 接口:**

```typescript
interface GetOptions {
  defaultValue?: any // 默认值
  engine?: StorageEngine // 指定存储引擎
  refresh?: boolean // 是否刷新TTL
}
```

### `has(key, options?)`

检查缓存是否存在。

**参数:**

- `key: string` - 缓存键名
- `options?: HasOptions` - 可选选项

**返回:** `Promise<boolean>`

**示例:**

```typescript
const exists = await cache.has('user-data')
if (exists) {
  const data = await cache.get('user-data')
}
```

### `remove(key, options?)`

删除缓存数据。

**参数:**

- `key: string` - 缓存键名
- `options?: RemoveOptions` - 可选选项

**返回:** `Promise<void>`

**示例:**

```typescript
// 删除单个缓存
await cache.remove('user-session')

// 从所有引擎中删除
await cache.remove('data', { allEngines: true })
```

### `clear(engine?)`

清空缓存数据。

**参数:**

- `engine?: StorageEngine` - 可选的引擎名称

**返回:** `Promise<void>`

**示例:**

```typescript
// 清空所有缓存
await cache.clear()

// 清空指定引擎
await cache.clear('localStorage')
```

### `keys(engine?)`

获取所有缓存键名。

**参数:**

- `engine?: StorageEngine` - 可选的引擎名称

**返回:** `Promise<string[]>`

**示例:**

```typescript
// 获取所有键名
const allKeys = await cache.keys()

// 获取指定引擎的键名
const localKeys = await cache.keys('localStorage')
```

## 📊 统计和监控

### `getStats()`

获取缓存统计信息。

**返回:** `Promise<CacheStats>`

**示例:**

```typescript
const stats = await cache.getStats()

console.log('缓存统计:', {
  totalItems: stats.totalItems,
  totalSize: stats.totalSize,
  hitRate: stats.hitRate,
  engines: stats.engines,
})
```

**CacheStats 接口:**

```typescript
interface CacheStats {
  totalItems: number
  totalSize: number
  totalSizeFormatted: string
  hitRate: number
  hitRatePercentage: number
  missCount: number
  expiredItems: number
  engines: {
    [engine: string]: {
      available: boolean
      itemCount: number
      size: number
      sizeFormatted: string
    }
  }
}
```

### `getEngineStats(engine)`

获取特定引擎的统计信息。

**参数:**

- `engine: StorageEngine` - 引擎名称

**返回:** `Promise<EngineStats>`

**示例:**

```typescript
const localStats = await cache.getEngineStats('localStorage')

console.log('localStorage 统计:', {
  itemCount: localStats.itemCount,
  usedSize: localStats.usedSize,
  maxSize: localStats.maxSize,
  usagePercentage: localStats.usagePercentage,
})
```

## 🔧 配置管理

### `updateConfig(config)`

更新缓存配置。

**参数:**

- `config: Partial<CacheOptions>` - 部分配置选项

**返回:** `void`

**示例:**

```typescript
// 更新默认引擎
cache.updateConfig({
  defaultEngine: 'indexedDB',
})

// 更新安全配置
cache.updateConfig({
  security: {
    encryption: { enabled: true },
  },
})
```

### `getConfig()`

获取当前配置。

**返回:** `CacheOptions`

**示例:**

```typescript
const currentConfig = cache.getConfig()
console.log('当前配置:', currentConfig)
```

## 🎯 引擎管理

### `isEngineAvailable(engine)`

检查引擎是否可用。

**参数:**

- `engine: StorageEngine` - 引擎名称

**返回:** `Promise<boolean>`

**示例:**

```typescript
const isIndexedDBAvailable = await cache.isEngineAvailable('indexedDB')

if (isIndexedDBAvailable) {
  // 使用 IndexedDB 存储大数据
  await cache.set('large-dataset', data, { engine: 'indexedDB' })
}
else {
  // 降级到 localStorage
  await cache.set('large-dataset', data, { engine: 'localStorage' })
}
```

### `getEngine(engine)`

获取引擎实例。

**参数:**

- `engine: StorageEngine` - 引擎名称

**返回:** `Promise<IStorageEngine>`

**示例:**

```typescript
// 直接操作引擎（高级用法）
const localEngine = await cache.getEngine('localStorage')
await localEngine.set('direct-key', 'direct-value')
```

## 🔄 生命周期

### `cleanup()`

手动触发清理操作。

**返回:** `Promise<void>`

**示例:**

```typescript
// 清理过期数据
await cache.cleanup()

// 定期清理
setInterval(() => {
  cache.cleanup()
}, 5 * 60 * 1000) // 每5分钟清理一次
```

### `destroy()`

销毁缓存管理器实例。

**返回:** `Promise<void>`

**示例:**

```typescript
// 组件卸载时清理资源
onUnmounted(async () => {
  await cache.destroy()
})
```

## 📡 事件系统

### `on(event, handler)`

监听缓存事件。

**参数:**

- `event: string` - 事件名称
- `handler: Function` - 事件处理函数

**示例:**

```typescript
// 监听设置事件
cache.on('set', (event) => {
  console.log('数据已设置:', event.key, event.value)
})

// 监听获取事件
cache.on('get', (event) => {
  console.log('数据已获取:', event.key, event.hit)
})

// 监听错误事件
cache.on('error', (event) => {
  console.error('缓存错误:', event.error)
})
```

### `off(event, handler?)`

取消事件监听。

**参数:**

- `event: string` - 事件名称
- `handler?: Function` - 可选的处理函数

**示例:**

```typescript
// 取消特定处理函数
cache.off('set', myHandler)

// 取消所有处理函数
cache.off('set')
```

### `emit(event, data)`

触发自定义事件。

**参数:**

- `event: string` - 事件名称
- `data: any` - 事件数据

**示例:**

```typescript
// 触发自定义事件
cache.emit('custom-event', { message: 'Hello' })
```

## 🔗 相关文档

- [配置选项](../guide/getting-started.md#%E9%85%8D%E7%BD%AE%E7%BC%93%E5%AD%98%E7%AE%A1%E7%90%86%E5%99%A8) - 详细配置说明
- [存储引擎](../guide/storage-engines.md) - 引擎详细介绍
- [Vue 集成](./vue-integration.md) - Vue 集成 API
