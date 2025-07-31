# 缓存机制

LDesign Template 内置了高效的缓存机制，提升模板加载性能和用户体验。

## 缓存类型

### 1. 组件缓存

缓存已加载的 Vue 组件实例：

```typescript
const manager = new TemplateManager({
  cacheEnabled: true,
  cacheSize: 100, // 最大缓存数量
  cacheTTL: 10 * 60 * 1000 // 10分钟过期
})
```

### 2. 元数据缓存

缓存模板配置和元数据信息：

```typescript
// 元数据缓存通常比组件缓存更大
const manager = new TemplateManager({
  cacheSize: 50, // 组件缓存
  metadataCacheSize: 100 // 元数据缓存
})
```

## 缓存策略

### LRU 策略

使用 LRU（Least Recently Used）算法管理缓存：

```typescript
import { LRUCache } from '@ldesign/template'

// 创建 LRU 缓存
const cache = new LRUCache(50) // 最多缓存 50 个项目

// 设置缓存
cache.set('key1', value1)
cache.set('key2', value2)

// 获取缓存（会更新访问时间）
const value = cache.get('key1')

// 检查是否存在
const exists = cache.has('key1')
```

### TTL 过期策略

设置缓存过期时间：

```typescript
const cache = new LRUCache(50, 5 * 60 * 1000) // 5分钟过期

// 设置带过期时间的缓存
cache.set('key', value, 2 * 60 * 1000) // 2分钟过期
```

## 缓存操作

### 手动缓存管理

```typescript
// 清空所有缓存
manager.clearCache()

// 清空指定分类的缓存
manager.clearCache('auth')

// 清空指定模板的缓存
manager.clearCache('auth', 'desktop', 'login')

// 预加载模板到缓存
await manager.preload([
  { category: 'auth', device: 'desktop', template: 'login' },
  { category: 'dashboard', device: 'desktop', template: 'admin' }
])
```

### 缓存统计

```typescript
// 获取缓存统计信息
const stats = manager.getCacheStats()

console.log('缓存统计:', {
  hits: stats.hits, // 命中次数
  misses: stats.misses, // 未命中次数
  size: stats.size, // 当前缓存大小
  hitRate: stats.hits / (stats.hits + stats.misses) // 命中率
})
```

## 缓存配置

### 全局配置

```typescript
const manager = new TemplateManager({
  // 启用缓存
  cacheEnabled: true,
  
  // 缓存大小
  cacheSize: 100,
  
  // 缓存过期时间（毫秒）
  cacheTTL: 30 * 60 * 1000, // 30分钟
  
  // 启用预加载
  preloadEnabled: true
})
```

### 组件级配置

```vue
<template>
  <!-- 启用缓存 -->
  <LTemplateRenderer
    category="auth"
    template="login"
    :cache="true"
  />
  
  <!-- 禁用缓存（每次都重新加载） -->
  <LTemplateRenderer
    category="dynamic"
    template="realtime"
    :cache="false"
  />
</template>
```

### 指令级配置

```vue
<template>
  <!-- 启用缓存 -->
  <div
    v-template="{
      category: 'auth',
      template: 'login',
      cache: true,
    }"
  />
  
  <!-- 禁用缓存 -->
  <div
    v-template="{
      category: 'dynamic',
      template: 'realtime',
      cache: false,
    }"
  />
</template>
```

## 预加载策略

### 应用启动预加载

```typescript
// 在应用启动时预加载关键模板
onMounted(async () => {
  await manager.preload([
    { category: 'layout', template: 'header' },
    { category: 'layout', template: 'footer' },
    { category: 'auth', template: 'login' }
  ])
})
```

### 路由级预加载

```typescript
// 在路由变化时预加载相关模板
router.beforeEach(async (to) => {
  const templates = getTemplatesForRoute(to.name)
  await manager.preload(templates)
})

function getTemplatesForRoute(routeName: string) {
  const routeTemplates = {
    dashboard: [
      { category: 'dashboard', template: 'admin' },
      { category: 'layout', template: 'sidebar' }
    ],
    profile: [
      { category: 'user', template: 'profile' }
    ]
  }
  
  return routeTemplates[routeName] || []
}
```

### 智能预加载

```typescript
// 基于用户行为预加载
const preloadManager = {
  // 预加载用户可能访问的模板
  async preloadForUser(userRole: string) {
    const templates = []
    
    if (userRole === 'admin') {
      templates.push(
        { category: 'admin', template: 'dashboard' },
        { category: 'admin', template: 'users' }
      )
    }
    else {
      templates.push(
        { category: 'user', template: 'dashboard' },
        { category: 'user', template: 'profile' }
      )
    }
    
    await manager.preload(templates)
  },
  
  // 基于设备类型预加载
  async preloadForDevice(device: DeviceType) {
    const commonTemplates = [
      { category: 'layout', device, template: 'header' },
      { category: 'layout', device, template: 'footer' }
    ]
    
    await manager.preload(commonTemplates)
  }
}
```

## 缓存优化

### 内存管理

```typescript
// 监控内存使用
function monitorCache() {
  const stats = manager.getCacheStats()
  
  // 内存使用过高时清理缓存
  if (stats.memoryUsage > 50 * 1024 * 1024) { // 50MB
    manager.clearCache()
    console.log('缓存已清理，释放内存')
  }
}

// 定期检查
setInterval(monitorCache, 60000) // 每分钟检查一次
```

### 缓存键优化

```typescript
// 自定义缓存键生成器
manager.setCacheKeyGenerator((category, device, template) => {
  // 包含版本信息的缓存键
  const version = getTemplateVersion(category, device, template)
  return `${category}:${device}:${template}:${version}`
})
```

### 分层缓存

```typescript
// 创建多层缓存
const l1Cache = new LRUCache(20, 5 * 60 * 1000) // L1: 20个项目，5分钟
const l2Cache = new LRUCache(100, 30 * 60 * 1000) // L2: 100个项目，30分钟

function getFromCache(key: string) {
  // 先从 L1 缓存获取
  let value = l1Cache.get(key)
  if (value) 
    return value
  
  // 再从 L2 缓存获取
  value = l2Cache.get(key)
  if (value) {
    // 提升到 L1 缓存
    l1Cache.set(key, value)
    return value
  }
  
  return null
}
```

## 缓存事件

### 监听缓存事件

```typescript
// 监听缓存命中
manager.on('cache:hit', (event) => {
  console.log('缓存命中:', event.key)
})

// 监听缓存未命中
manager.on('cache:miss', (event) => {
  console.log('缓存未命中:', event.key)
})

// 监听缓存清理
manager.on('cache:clear', (event) => {
  console.log('缓存已清理')
})
```

### 性能监控

```typescript
// 缓存性能监控
const cacheMonitor = {
  startTime: Date.now(),
  
  logStats() {
    const stats = manager.getCacheStats()
    const runtime = Date.now() - this.startTime
    
    console.log('缓存性能报告:', {
      运行时间: `${runtime / 1000}秒`,
      总请求: stats.hits + stats.misses,
      命中率: `${((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2)}%`,
      缓存大小: stats.size,
      内存使用: `${(stats.memoryUsage / 1024 / 1024).toFixed(2)}MB`
    })
  }
}

// 定期输出性能报告
setInterval(() => cacheMonitor.logStats(), 5 * 60 * 1000) // 每5分钟
```

## 最佳实践

1. **合理设置缓存大小**：根据应用规模和内存限制
2. **使用 TTL**：为动态内容设置合适的过期时间
3. **预加载关键模板**：提升用户体验
4. **监控缓存性能**：定期检查命中率和内存使用
5. **及时清理缓存**：在模板更新时清理相关缓存

## 调试缓存

### 开发环境调试

```typescript
if (process.env.NODE_ENV === 'development') {
  // 开发环境禁用缓存
  manager.setCacheEnabled(false)
  
  // 或者设置较短的过期时间
  manager.setCacheTTL(10 * 1000) // 10秒
}
```

### 缓存可视化

```typescript
// 获取缓存内容用于调试
function debugCache() {
  const cache = manager.getCache()
  const entries = cache.entries()
  
  console.table(Array.from(entries).map(([key, value]) => ({
    键: key,
    大小: JSON.stringify(value).length,
    访问时间: new Date(value.lastAccessed).toLocaleString()
  })))
}

// 在控制台中调用
window.debugCache = debugCache
```
