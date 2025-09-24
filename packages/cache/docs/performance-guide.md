# 性能优化指南

## 📊 当前性能状况

### 打包体积分析
- **主入口文件 (ESM)**: 4.8 KB (gzip: 1.7 KB)
- **UMD 压缩版本**: 101.2 KB (gzip: 24.9 KB)
- **最大模块**: cache-manager.js (29.8 KB)
- **总体积**: 2.31 MB (包含所有格式和 source maps)

### 测试覆盖率
- **当前覆盖率**: 50.85%
- **目标覆盖率**: 80%+
- **通过测试**: 278 个

## 🚀 性能优化策略

### 1. 按需加载 (Tree Shaking)

#### 推荐的导入方式

```typescript
// ✅ 推荐：按需导入
import { CacheManager } from '@ldesign/cache/core'
import { MemoryEngine } from '@ldesign/cache/engines/memory'
import { useCache } from '@ldesign/cache/vue'

// ❌ 避免：全量导入
import * as Cache from '@ldesign/cache'
```

#### 模块化导入

```typescript
// 核心功能
import { CacheManager } from '@ldesign/cache/core/cache-manager'
import { StorageStrategy } from '@ldesign/cache/strategies/storage-strategy'

// 存储引擎
import { MemoryEngine } from '@ldesign/cache/engines/memory'
import { LocalStorageEngine } from '@ldesign/cache/engines/local-storage'
import { IndexedDBEngine } from '@ldesign/cache/engines/indexeddb'

// 安全功能
import { SecurityManager } from '@ldesign/cache/security/security-manager'
import { AESCrypto } from '@ldesign/cache/security/aes-crypto'

// 工具函数
import { compress, decompress } from '@ldesign/cache/utils/compressor'
import { validate } from '@ldesign/cache/utils/validator'

// Vue 集成
import { useCache, useCacheStats } from '@ldesign/cache/vue'
```

### 2. 动态导入

#### 延迟加载大型模块

```typescript
class OptimizedCacheManager {
  private analyzer?: CacheAnalyzer
  private monitor?: PerformanceMonitor

  async getAnalyzer() {
    if (!this.analyzer) {
      const { CacheAnalyzer } = await import('@ldesign/cache/core/cache-analyzer')
      this.analyzer = new CacheAnalyzer()
    }
    return this.analyzer
  }

  async getMonitor() {
    if (!this.monitor) {
      const { PerformanceMonitor } = await import('@ldesign/cache/core/performance-monitor')
      this.monitor = new PerformanceMonitor()
    }
    return this.monitor
  }
}
```

#### 条件加载

```typescript
// 只在需要时加载 Vue 集成
if (typeof window !== 'undefined' && window.Vue) {
  const { useCacheProvider } = await import('@ldesign/cache/vue')
  // 使用 Vue 功能
}

// 只在支持 IndexedDB 时加载
if ('indexedDB' in window) {
  const { IndexedDBEngine } = await import('@ldesign/cache/engines/indexeddb')
  // 使用 IndexedDB
}
```

### 3. 配置优化

#### 最小化配置

```typescript
// ✅ 最小化配置，只启用需要的功能
const cache = new CacheManager({
  engines: {
    memory: { maxSize: 10 * 1024 * 1024 }, // 只配置需要的引擎
  },
  strategy: 'memory-first', // 简单策略
  performance: {
    enableAnalytics: false, // 生产环境关闭分析
    enableMonitoring: false // 生产环境关闭监控
  }
})

// ❌ 避免：过度配置
const cache = new CacheManager({
  engines: {
    memory: { /* 大量配置 */ },
    localStorage: { /* 大量配置 */ },
    sessionStorage: { /* 大量配置 */ },
    indexedDB: { /* 大量配置 */ },
    cookie: { /* 大量配置 */ }
  },
  // 启用所有功能...
})
```

#### 环境特定配置

```typescript
const isDevelopment = process.env.NODE_ENV === 'development'

const cache = new CacheManager({
  engines: {
    memory: { maxSize: isDevelopment ? 50 * 1024 * 1024 : 10 * 1024 * 1024 }
  },
  performance: {
    enableAnalytics: isDevelopment,
    enableMonitoring: isDevelopment
  },
  security: {
    encryption: { enabled: !isDevelopment } // 开发环境关闭加密
  }
})
```

### 4. 批量操作优化

#### 使用批量 API

```typescript
// ✅ 推荐：批量操作
await cache.setMany({
  'user:1': userData1,
  'user:2': userData2,
  'user:3': userData3
})

const users = await cache.getMany(['user:1', 'user:2', 'user:3'])

// ❌ 避免：循环单个操作
for (const [key, value] of Object.entries(data)) {
  await cache.set(key, value) // 性能较差
}
```

#### 批量预热

```typescript
// 应用启动时批量预热
await cache.warmup([
  { key: 'config', fetcher: () => fetchConfig() },
  { key: 'user-preferences', fetcher: () => fetchUserPrefs() },
  { key: 'app-metadata', fetcher: () => fetchMetadata() }
], {
  concurrency: 3, // 并发数
  timeout: 5000   // 超时时间
})
```

### 5. 内存管理

#### 设置合理的限制

```typescript
const cache = new CacheManager({
  engines: {
    memory: {
      maxSize: 50 * 1024 * 1024,    // 50MB 内存限制
      maxItems: 1000,               // 最大项目数
      cleanupInterval: 60 * 1000,   // 1分钟清理一次
      evictionStrategy: 'lru'       // LRU 淘汰策略
    }
  }
})
```

#### 主动清理

```typescript
// 定期清理过期项
setInterval(async () => {
  await cache.cleanup()
}, 5 * 60 * 1000) // 每5分钟清理一次

// 页面隐藏时清理
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) {
    await cache.cleanup()
  }
})
```

### 6. Vue 性能优化

#### 合理使用响应式

```typescript
// ✅ 推荐：只在需要响应式时使用
const { data } = useCache('static-config', {
  staleWhileRevalidate: false // 静态数据不需要后台更新
})

// ✅ 推荐：使用防抖
const { data } = useCache(searchQuery, {
  fetcher: debouncedSearch,
  refreshInterval: 0 // 禁用自动刷新
})

// ❌ 避免：过度响应式
const { data } = useCache(computedKey, {
  refreshInterval: 1000 // 频繁刷新影响性能
})
```

#### 条件启用

```typescript
const enabled = ref(false)

const { data } = useCache('expensive-data', {
  fetcher: expensiveOperation,
  enabled, // 只在需要时启用
  staleWhileRevalidate: true
})

// 只在用户交互时启用
onMounted(() => {
  enabled.value = true
})
```

## 📈 性能监控

### 使用内置监控

```typescript
const cache = new CacheManager({
  performance: {
    enableMonitoring: true
  }
})

// 获取性能统计
const stats = cache.getStats()
console.log(`命中率: ${stats.hitRate}%`)
console.log(`平均响应时间: ${stats.averageResponseTime}ms`)

// 获取详细分析
const analysis = await cache.analyze()
console.log('热点数据:', analysis.hotKeys)
console.log('存储效率:', analysis.storageEfficiency)
```

### 自定义性能监控

```typescript
import PerformanceMonitor from './scripts/performance-monitor.js'

const monitor = new PerformanceMonitor()

monitor.mark('cache-init-start')
const cache = new CacheManager(config)
monitor.measure('缓存初始化', 'cache-init-start')

monitor.mark('data-fetch-start')
const data = await cache.get('large-dataset')
monitor.measure('数据获取', 'data-fetch-start')

monitor.report() // 生成性能报告
```

## 🔧 构建优化

### Webpack 配置

```javascript
module.exports = {
  resolve: {
    alias: {
      '@ldesign/cache': '@ldesign/cache/es' // 使用 ES 模块版本
    }
  },
  optimization: {
    usedExports: true, // 启用 Tree Shaking
    sideEffects: false // 标记为无副作用
  }
}
```

### Vite 配置

```javascript
export default {
  build: {
    rollupOptions: {
      external: ['vue'], // 外部化 Vue
      output: {
        manualChunks: {
          'cache-core': ['@ldesign/cache/core'],
          'cache-vue': ['@ldesign/cache/vue']
        }
      }
    }
  }
}
```

## 📊 性能基准

### 操作性能 (1000 次操作)

| 操作 | 内存引擎 | LocalStorage | IndexedDB |
|------|----------|--------------|-----------|
| set  | ~0.1ms   | ~0.5ms       | ~2ms      |
| get  | ~0.05ms  | ~0.3ms       | ~1.5ms    |
| delete | ~0.05ms | ~0.3ms       | ~1ms      |

### 内存使用

| 数据量 | 内存占用 | 推荐引擎 |
|--------|----------|----------|
| < 1MB  | 低       | Memory   |
| 1-10MB | 中       | LocalStorage |
| > 10MB | 高       | IndexedDB |

## 🎯 最佳实践总结

1. **按需导入** - 只导入需要的模块
2. **动态加载** - 延迟加载大型功能
3. **批量操作** - 使用批量 API 提高效率
4. **合理配置** - 根据环境调整配置
5. **内存管理** - 设置限制和定期清理
6. **性能监控** - 持续监控和优化
7. **构建优化** - 配置打包工具支持 Tree Shaking
