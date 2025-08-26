# 缓存机制

> 💾 智能缓存系统，让你的应用飞速运行！

## 🎯 概述

缓存机制是 `@ldesign/template` 的核心性能优化功能，通过多层缓存策略显著提升模板加载和渲染性能。

## 🏗️ 缓存架构

### 多层缓存结构

```
┌─────────────────┐
│   内存缓存       │ ← 最快，易失性
├─────────────────┤
│   本地存储缓存   │ ← 持久化，中等速度
├─────────────────┤
│   IndexedDB缓存  │ ← 大容量，持久化
├─────────────────┤
│   网络请求       │ ← 最慢，但最新
└─────────────────┘
```

### 缓存类型

```typescript
interface CacheConfig {
  memory: MemoryCacheConfig // 内存缓存
  localStorage: LocalCacheConfig // 本地存储缓存
  indexedDB: IDBCacheConfig // IndexedDB 缓存
  network: NetworkCacheConfig // 网络缓存
}
```

## 🚀 基础用法

### 启用缓存

```typescript
import { TemplateManager } from '@ldesign/template'

const manager = new TemplateManager({
  enableCache: true,
  cacheConfig: {
    // 内存缓存配置
    memory: {
      maxSize: 50, // 最大缓存数量
      ttl: 30 * 60 * 1000 // 30分钟过期
    },

    // 本地存储缓存
    localStorage: {
      enabled: true,
      prefix: 'ldesign_template_',
      maxSize: 10 * 1024 * 1024 // 10MB
    },

    // IndexedDB 缓存
    indexedDB: {
      enabled: true,
      dbName: 'LDesignTemplateCache',
      version: 1,
      maxSize: 100 * 1024 * 1024 // 100MB
    }
  }
})
```

### 缓存策略

```typescript
// 缓存优先策略
const template = await manager.render({
  category: 'login',
  device: 'desktop',
  template: 'modern',
  cacheStrategy: 'cache-first' // 优先使用缓存
})

// 网络优先策略
const freshTemplate = await manager.render({
  category: 'login',
  device: 'desktop',
  template: 'modern',
  cacheStrategy: 'network-first' // 优先获取最新版本
})
```

## 💾 内存缓存

### 配置选项

```typescript
const memoryCache = {
  maxSize: 100, // 最大缓存条目数
  ttl: 60 * 60 * 1000, // 1小时过期时间
  checkInterval: 5 * 60 * 1000, // 5分钟检查一次过期

  // LRU 策略配置
  evictionPolicy: 'lru', // 'lru' | 'lfu' | 'fifo'

  // 内存使用限制
  maxMemoryUsage: 50 * 1024 * 1024, // 50MB

  // 预热配置
  preload: [
    { category: 'login', device: 'desktop', template: 'modern' },
    { category: 'dashboard', device: 'desktop', template: 'admin' }
  ]
}
```

### 手动操作

```typescript
// 获取缓存管理器
const cacheManager = manager.getCacheManager()

// 手动添加到缓存
await cacheManager.set('login-desktop-modern', templateData, {
  ttl: 30 * 60 * 1000 // 30分钟
})

// 从缓存获取
const cached = await cacheManager.get('login-desktop-modern')

// 检查是否存在
const exists = await cacheManager.has('login-desktop-modern')

// 删除缓存项
await cacheManager.delete('login-desktop-modern')

// 清空所有缓存
await cacheManager.clear()
```

## 🗄️ 持久化缓存

### LocalStorage 缓存

```typescript
const localStorageConfig = {
  enabled: true,
  prefix: 'ldt_', // 键名前缀
  maxSize: 5 * 1024 * 1024, // 5MB 限制
  compression: true, // 启用压缩
  encryption: false, // 是否加密

  // 过期策略
  defaultTTL: 24 * 60 * 60 * 1000, // 24小时

  // 存储策略
  storageStrategy: 'metadata-only', // 'full' | 'metadata-only'

  // 清理策略
  cleanupInterval: 60 * 60 * 1000, // 1小时清理一次
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7天后强制过期
}
```

### IndexedDB 缓存

```typescript
const indexedDBConfig = {
  enabled: true,
  dbName: 'LDesignTemplateCache',
  version: 1,

  // 对象存储配置
  stores: {
    templates: {
      keyPath: 'id',
      indexes: [
        { name: 'category', keyPath: 'category' },
        { name: 'device', keyPath: 'device' },
        { name: 'timestamp', keyPath: 'timestamp' }
      ]
    },
    metadata: {
      keyPath: 'key'
    }
  },

  // 容量管理
  maxSize: 200 * 1024 * 1024, // 200MB
  quotaWarningThreshold: 0.8, // 80% 时警告

  // 清理策略
  autoCleanup: true,
  maxAge: 30 * 24 * 60 * 60 * 1000 // 30天
}
```

## 🌐 网络缓存

### HTTP 缓存头

```typescript
const networkConfig = {
  // 缓存控制
  cacheControl: {
    maxAge: 3600, // 1小时
    staleWhileRevalidate: 86400, // 24小时内可使用过期缓存
    mustRevalidate: false
  },

  // ETag 支持
  etag: {
    enabled: true,
    weak: true
  },

  // 条件请求
  conditionalRequests: {
    ifModifiedSince: true,
    ifNoneMatch: true
  }
}
```

### 离线支持

```typescript
const manager = new TemplateManager({
  offlineSupport: {
    enabled: true,
    fallbackStrategy: 'cache-only',

    // 离线检测
    onOffline: () => {
      console.log('应用已离线，使用缓存模板')
    },

    onOnline: () => {
      console.log('网络已恢复，同步最新模板')
      manager.syncTemplates()
    }
  }
})
```

## 🔄 缓存同步

### 版本控制

```typescript
// 模板版本管理
const template = {
  id: 'login-desktop-modern',
  version: '1.2.0',
  lastModified: '2024-01-20T10:30:00Z',
  checksum: 'sha256:abc123...'
}

// 检查版本更新
const hasUpdate = await manager.checkForUpdates('login-desktop-modern')
if (hasUpdate) {
  await manager.updateTemplate('login-desktop-modern')
}
```

### 增量同步

```typescript
// 增量更新配置
const syncConfig = {
  strategy: 'incremental', // 'full' | 'incremental'
  batchSize: 10, // 批量大小
  interval: 60 * 60 * 1000, // 1小时同步一次

  // 冲突解决
  conflictResolution: 'server-wins', // 'server-wins' | 'client-wins' | 'merge'

  // 同步回调
  onSyncStart: () => console.log('开始同步'),
  onSyncProgress: progress => console.log(`同步进度: ${progress}%`),
  onSyncComplete: () => console.log('同步完成')
}
```

## 📊 缓存监控

### 性能指标

```typescript
// 获取缓存统计
const stats = await cacheManager.getStats()
console.log('缓存统计:', {
  hitRate: stats.hitRate, // 命中率
  missRate: stats.missRate, // 未命中率
  totalRequests: stats.totalRequests, // 总请求数
  cacheSize: stats.cacheSize, // 缓存大小
  memoryUsage: stats.memoryUsage, // 内存使用量

  // 分层统计
  layers: {
    memory: stats.memory,
    localStorage: stats.localStorage,
    indexedDB: stats.indexedDB
  }
})
```

### 实时监控

```typescript
// 启用缓存监控
const manager = new TemplateManager({
  monitoring: {
    enabled: true,
    reportInterval: 60 * 1000, // 1分钟报告一次

    onReport: (report) => {
      console.log('缓存报告:', {
        timestamp: report.timestamp,
        hitRate: report.hitRate,
        avgLoadTime: report.avgLoadTime,
        errorRate: report.errorRate
      })
    },

    // 性能阈值告警
    thresholds: {
      hitRate: 0.8, // 命中率低于80%告警
      loadTime: 1000, // 加载时间超过1秒告警
      errorRate: 0.05 // 错误率超过5%告警
    }
  }
})
```

## 🎯 缓存策略

### 智能缓存

```typescript
const smartCacheConfig = {
  // 基于使用频率的缓存
  frequencyBased: {
    enabled: true,
    threshold: 3, // 使用3次以上才缓存
    decayFactor: 0.9 // 频率衰减因子
  },

  // 基于时间的缓存
  timeBased: {
    enabled: true,
    peakHours: ['09:00', '18:00'], // 高峰时段
    offPeakTTL: 2 * 60 * 60 * 1000, // 非高峰2小时
    peakTTL: 30 * 60 * 1000 // 高峰30分钟
  },

  // 预测性缓存
  predictive: {
    enabled: true,
    algorithm: 'ml', // 'pattern' | 'ml' | 'rule'
    confidence: 0.7 // 预测置信度
  }
}
```

### 缓存预热

```typescript
// 应用启动时预热缓存
await manager.warmupCache([
  // 常用模板
  { category: 'login', device: 'desktop', template: 'modern' },
  { category: 'login', device: 'mobile', template: 'card' },
  { category: 'dashboard', device: 'desktop', template: 'admin' }
])

// 基于用户行为预热
const userPreferences = getUserPreferences()
await manager.warmupCacheByPreferences(userPreferences)
```

## 🔧 高级配置

### 自定义缓存适配器

```typescript
class CustomCacheAdapter implements CacheAdapter {
  async get(key: string): Promise<any> {
    // 自定义获取逻辑
  }

  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    // 自定义存储逻辑
  }

  async delete(key: string): Promise<boolean> {
    // 自定义删除逻辑
  }

  async clear(): Promise<void> {
    // 自定义清空逻辑
  }
}

// 使用自定义适配器
const manager = new TemplateManager({
  cacheAdapter: new CustomCacheAdapter()
})
```

### 缓存中间件

```typescript
// 缓存中间件
const cacheMiddleware = {
  beforeGet: async (key: string) => {
    console.log(`准备获取缓存: ${key}`)
  },

  afterGet: async (key: string, value: any) => {
    console.log(`缓存获取完成: ${key}`, value ? '命中' : '未命中')
  },

  beforeSet: async (key: string, value: any) => {
    console.log(`准备设置缓存: ${key}`)
  },

  afterSet: async (key: string, value: any) => {
    console.log(`缓存设置完成: ${key}`)
  }
}

manager.useCacheMiddleware(cacheMiddleware)
```

## 💡 最佳实践

### 1. 缓存键设计

```typescript
// 使用结构化的缓存键
function generateCacheKey(category: string, device: string, template: string, version?: string) {
  return `template:${category}:${device}:${template}${version ? `:${version}` : ''}`
}
```

### 2. 内存管理

```typescript
// 监控内存使用
const manager = new TemplateManager({
  memoryManagement: {
    maxMemoryUsage: 100 * 1024 * 1024, // 100MB
    gcThreshold: 0.8, // 80%时触发GC
    onMemoryWarning: () => {
      console.warn('内存使用过高，建议清理缓存')
    }
  }
})
```

### 3. 错误处理

```typescript
const manager = new TemplateManager({
  cacheErrorHandling: {
    onCacheError: (error, operation, key) => {
      console.error(`缓存操作失败: ${operation} ${key}`, error)
      // 降级到网络请求
      return manager.loadFromNetwork(key)
    },

    retryPolicy: {
      maxRetries: 3,
      backoffFactor: 2,
      initialDelay: 1000
    }
  }
})
```

## 🔗 相关链接

- [性能优化](/guide/performance)
- [模板管理](/guide/template-management)
- [故障排除](/guide/troubleshooting)
- [API 参考](/api/cache-manager)
