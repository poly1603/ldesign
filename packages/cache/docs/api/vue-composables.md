# Vue 组合式函数 API

Vue 集成模块提供了组合式函数和组件，让你在 Vue 应用中轻松使用缓存功能。

## useCache

主要的 Vue 组合式函数，提供完整的缓存功能。

### 函数签名

```typescript
function useCache(options?: UseCacheOptions): UseCacheReturn
```

### 配置选项

```typescript
interface UseCacheOptions {
  engines?: StorageEngine[]
  strategy?: StorageStrategy
  security?: SecurityOptions
  debug?: boolean
}
```

### 返回值

```typescript
interface UseCacheReturn {
  // 缓存操作
  set: <T = any>(key: string, value: T, options?: SetOptions) => Promise<void>
  get: <T = any>(key: string) => Promise<T | null>
  remove: (key: string) => Promise<void>
  clear: () => Promise<void>
  has: (key: string) => Promise<boolean>
  keys: () => Promise<string[]>
  cleanup: () => Promise<void>

  // 统计信息
  getStats: () => Promise<CacheStats>
  refreshStats: () => Promise<void>
  stats: ComputedRef<CacheStats | null>

  // 状态
  loading: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  isReady: ComputedRef<boolean>
  hasError: ComputedRef<boolean>

  // 响应式缓存
  useReactiveCache: <T = any>(key: string, defaultValue?: T) => ReactiveCache<T>

  // 缓存管理器实例
  manager: CacheManager
}
```

### 基础用法

```typescript
import { useCache } from '@ldesign/cache/vue'

export default defineComponent({
  setup() {
    const cache = useCache({
      engines: ['localStorage', 'memory'],
      debug: true,
    })

    const saveData = async () => {
      await cache.set('user', { name: 'John', age: 30 })
    }

    const loadData = async () => {
      const user = await cache.get('user')
      console.log(user)
    }

    return {
      saveData,
      loadData,
      stats: cache.stats,
      loading: cache.loading,
      error: cache.error,
    }
  },
})
```

### 响应式缓存

```typescript
export default defineComponent({
  setup() {
    const cache = useCache()
    
    // 创建响应式缓存
    const userCache = cache.useReactiveCache('user', { name: '', age: 0 })

    // 监听数据变化
    watch(userCache.value, (newUser) => {
      console.log('用户数据更新:', newUser)
    })

    const updateUser = async () => {
      await userCache.update({ name: 'Jane', age: 25 })
    }

    return {
      user: userCache.value,
      loading: userCache.loading,
      error: userCache.error,
      updateUser,
      refreshUser: userCache.refresh,
      removeUser: userCache.remove,
    }
  },
})
```

## useReactiveCache

独立的响应式缓存组合式函数。

### 函数签名

```typescript
function useReactiveCache<T = any>(
  key: string,
  defaultValue?: T,
  options?: ReactiveOptions
): ReactiveCache<T>
```

### 配置选项

```typescript
interface ReactiveOptions {
  autoSave?: boolean
  saveDelay?: number
  manager?: CacheManager
}
```

### 返回值

```typescript
interface ReactiveCache<T> {
  value: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  refresh: () => Promise<void>
  update: (newValue: T, options?: SetOptions) => Promise<void>
  remove: () => Promise<void>
  enableAutoSave: (delay?: number) => void
}
```

### 示例

```typescript
import { useReactiveCache } from '@ldesign/cache/vue'

export default defineComponent({
  setup() {
    const userSettings = useReactiveCache('settings', {
      theme: 'light',
      language: 'zh-CN',
    }, {
      autoSave: true,
      saveDelay: 1000,
    })

    // 自动保存功能
    userSettings.enableAutoSave(500)

    return {
      settings: userSettings.value,
      loading: userSettings.loading,
      error: userSettings.error,
    }
  },
})
```

## useCacheStats

缓存统计信息组合式函数。

### 函数签名

```typescript
function useCacheStats(manager?: CacheManager): CacheStatsReturn
```

### 返回值

```typescript
interface CacheStatsReturn {
  stats: ComputedRef<CacheStats | null>
  loading: ComputedRef<boolean>
  error: ComputedRef<Error | null>
  refresh: () => Promise<void>
  autoRefresh: (interval: number) => void
  stopAutoRefresh: () => void
}
```

### 示例

```typescript
import { useCacheStats } from '@ldesign/cache/vue'

export default defineComponent({
  setup() {
    const { stats, loading, refresh, autoRefresh } = useCacheStats()

    // 自动刷新统计信息
    autoRefresh(5000) // 每5秒刷新一次

    return {
      stats,
      loading,
      refresh,
    }
  },
})
```

## CacheProvider

Vue 缓存提供者组件，为子组件提供缓存上下文。

### Props

```typescript
interface CacheProviderProps {
  options?: CacheManagerOptions
}
```

### 示例

```vue
<template>
  <CacheProvider :options="cacheOptions">
    <UserProfile />
    <Settings />
  </CacheProvider>
</template>

<script setup>
import { CacheProvider } from '@ldesign/cache/vue'

const cacheOptions = {
  engines: ['localStorage', 'memory'],
  strategy: 'performance',
  debug: true,
}
</script>
```

## useInjectCache

注入缓存管理器的组合式函数。

### 函数签名

```typescript
function useInjectCache(): CacheManager | null
```

### 示例

```typescript
import { useInjectCache } from '@ldesign/cache/vue'

export default defineComponent({
  setup() {
    const cache = useInjectCache()
    
    if (!cache) {
      throw new Error('缓存管理器未找到，请确保在 CacheProvider 内使用')
    }

    const saveData = async () => {
      await cache.set('data', 'value')
    }

    return { saveData }
  },
})
```

## 类型定义

### UseCacheOptions

```typescript
interface UseCacheOptions {
  engines?: StorageEngine[]
  strategy?: StorageStrategy
  security?: SecurityOptions
  debug?: boolean
}
```

### SetOptions

```typescript
interface SetOptions {
  ttl?: number
  engine?: StorageEngine
  compress?: boolean
  encrypt?: boolean
}
```

### CacheStats

```typescript
interface CacheStats {
  totalItems: number
  totalSize: number
  hitRate: number
  engines: Record<string, EngineStats>
}
```

### EngineStats

```typescript
interface EngineStats {
  items: number
  size: number
  hits: number
  misses: number
}
```

## 最佳实践

### 1. 使用 CacheProvider

在应用根组件使用 `CacheProvider` 提供全局缓存上下文：

```vue
<template>
  <CacheProvider :options="globalCacheOptions">
    <App />
  </CacheProvider>
</template>
```

### 2. 响应式缓存

对于需要响应式更新的数据，使用 `useReactiveCache`：

```typescript
const userProfile = cache.useReactiveCache('profile', {})
```

### 3. 错误处理

始终处理缓存操作的错误：

```typescript
const { error } = useCache()

watch(error, (err) => {
  if (err) {
    console.error('缓存错误:', err)
    // 显示错误提示
  }
})
```

### 4. 性能监控

使用统计信息监控缓存性能：

```typescript
const { stats } = useCacheStats()

watch(stats, (newStats) => {
  if (newStats && newStats.hitRate < 0.8) {
    console.warn('缓存命中率较低:', newStats.hitRate)
  }
})
```

### 5. 生命周期管理

在组件卸载时清理资源：

```typescript
onUnmounted(() => {
  cache.cleanup()
})
```
