# Cache 集成文档

## 概述

`@ldesign/cache` 已成功集成到 LDesign Simple App 中，提供强大的缓存管理功能。

## 功能特性

- ✅ 多存储引擎支持（localStorage, sessionStorage, IndexedDB, Memory, Cookie）
- ✅ 自动过期管理（TTL）
- ✅ 缓存统计和监控
- ✅ Remember 模式（记忆化函数）
- ✅ Vue 3 深度集成
- ✅ TypeScript 类型支持

## 使用方式

### 1. 在组件中使用 useAppCache

```vue
<script setup lang="ts">
import { useAppCache } from '@/composables/useAppCache'

const cache = useAppCache()

// 设置缓存
await cache.set('user-data', { name: '张三', age: 25 })

// 获取缓存
const user = await cache.get('user-data')

// 删除缓存
await cache.remove('user-data')

// Remember 模式（自动缓存函数结果）
const apiData = await cache.remember('api-data', async () => {
  const response = await fetch('/api/data')
  return response.json()
}, 60000) // 缓存 60 秒
</script>
```

### 2. 通过全局属性使用

```typescript
// 在任何地方访问
const cache = app.config.globalProperties.$cache

await cache.set('key', 'value')
const value = await cache.get('key')
```

### 3. 使用原生 Cache Manager

```vue
<script setup lang="ts">
import { useCacheManager } from '@ldesign/cache/vue'

const manager = useCacheManager()

// 访问所有 CacheManager 方法
const stats = await manager.getStats()
const keys = await manager.keys()
</script>
```

## 配置

缓存配置位于 `src/config/cache.config.ts`：

```typescript
{
  defaultEngine: 'localStorage',     // 默认存储引擎
  defaultTTL: 24 * 60 * 60 * 1000,  // 24小时
  namespace: 'ldesign-app',          // 命名空间
  engines: {
    memory: { maxSize: 10 * 1024 * 1024 },      // 10MB
    localStorage: { maxSize: 5 * 1024 * 1024 }  // 5MB
  }
}
```

## Dashboard 集成

在 Dashboard 页面可以查看：
- 缓存项数
- 总大小
- 命中率
- 存储引擎数量

还可以执行：
- 清空缓存
- 刷新统计

## API 参考

### cache.set(key, value, ttl?)
设置缓存，可选 TTL（生存时间）

### cache.get(key)
获取缓存值

### cache.remove(key)
删除指定缓存

### cache.clear()
清空所有缓存

### cache.has(key)
检查缓存是否存在

### cache.keys()
获取所有缓存键

### cache.getStats()
获取缓存统计信息

### cache.remember(key, fetcher, ttl?)
记忆化函数：如果缓存不存在则执行 fetcher 并缓存结果

## 示例

查看 `src/components/CacheDemo.vue` 了解完整的使用示例。

## 注意事项

1. 所有缓存操作都是异步的，需要使用 `await`
2. 缓存数据会自动序列化/反序列化
3. TTL 过期的数据会自动清理
4. 支持 5 种存储引擎，根据环境自动选择
5. 开发环境可通过 `window.__APP__.config.globalProperties.$cache` 访问




