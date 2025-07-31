# 性能优化

本指南介绍如何优化 LDesign Template 的性能，提升应用的加载速度和用户体验。

## 加载优化

### 1. 懒加载

使用动态导入实现模板的懒加载：

```typescript
// 模板组件使用动态导入
const LazyTemplate = defineAsyncComponent(() =>
  import('./templates/dashboard/admin/index.vue')
)

// 在模板配置中使用
export const config = {
  name: 'admin',
  component: () => import('./index.vue'), // 懒加载
  // ... 其他配置
}
```

### 2. 代码分割

按路由或功能分割模板代码：

```typescript
// 路由级别的代码分割
const routes = [
  {
    path: '/dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      // 预加载该路由需要的模板
      preloadTemplates: [
        'dashboard/admin',
        'layout/sidebar'
      ]
    }
  }
]

// 在路由守卫中预加载
router.beforeEach(async (to) => {
  const templates = to.meta?.preloadTemplates || []
  if (templates.length > 0) {
    await templateManager.preload(templates.map((t) => {
      const [category, template] = t.split('/')
      return { category, template, device: 'desktop' }
    }))
  }
})
```

### 3. 预加载策略

智能预加载常用模板：

```typescript
// 应用启动时预加载核心模板
async function preloadCoreTemplates() {
  const coreTemplates = [
    { category: 'layout', template: 'header' },
    { category: 'layout', template: 'footer' },
    { category: 'auth', template: 'login' }
  ]
  
  await templateManager.preload(coreTemplates)
}

// 基于用户行为预加载
async function preloadUserTemplates(userRole: string) {
  const roleTemplates = {
    admin: [
      { category: 'admin', template: 'dashboard' },
      { category: 'admin', template: 'users' }
    ],
    user: [
      { category: 'user', template: 'dashboard' },
      { category: 'user', template: 'profile' }
    ]
  }
  
  const templates = roleTemplates[userRole] || []
  await templateManager.preload(templates)
}
```

## 缓存优化

### 1. 缓存配置

合理配置缓存参数：

```typescript
const manager = new TemplateManager({
  // 缓存配置
  cacheEnabled: true,
  cacheSize: 100, // 根据应用规模调整
  cacheTTL: 30 * 60 * 1000, // 30分钟，根据更新频率调整
  
  // 预加载配置
  preloadEnabled: true,
  preloadBatchSize: 5, // 批量预加载数量
  
  // 性能配置
  loadTimeout: 10000, // 10秒加载超时
  retryAttempts: 3 // 重试次数
})
```

### 2. 缓存策略

实现多层缓存策略：

```typescript
class MultiLevelCache {
  private l1Cache = new LRUCache(20, 5 * 60 * 1000) // 热点缓存
  private l2Cache = new LRUCache(100, 30 * 60 * 1000) // 常用缓存
  private l3Cache = new LRUCache(500, 2 * 60 * 60 * 1000) // 长期缓存
  
  get(key: string) {
    // L1 缓存
    let value = this.l1Cache.get(key)
    if (value) 
      return value
    
    // L2 缓存
    value = this.l2Cache.get(key)
    if (value) {
      this.l1Cache.set(key, value) // 提升到 L1
      return value
    }
    
    // L3 缓存
    value = this.l3Cache.get(key)
    if (value) {
      this.l2Cache.set(key, value) // 提升到 L2
      return value
    }
    
    return null
  }
  
  set(key: string, value: any, priority: 'high' | 'medium' | 'low' = 'medium') {
    switch (priority) {
      case 'high':
        this.l1Cache.set(key, value)
        break
      case 'medium':
        this.l2Cache.set(key, value)
        break
      case 'low':
        this.l3Cache.set(key, value)
        break
    }
  }
}
```

### 3. 缓存预热

在应用启动时预热缓存：

```typescript
async function warmupCache() {
  const startTime = Date.now()
  
  // 预加载关键模板
  const criticalTemplates = [
    { category: 'layout', template: 'header', priority: 'high' },
    { category: 'layout', template: 'footer', priority: 'high' },
    { category: 'auth', template: 'login', priority: 'medium' }
  ]
  
  await Promise.all(
    criticalTemplates.map(async ({ priority, ...template }) => {
      try {
        const component = await templateManager.loadTemplate(
          template.category,
          'desktop',
          template.template
        )
        
        // 设置缓存优先级
        cache.set(getCacheKey(template), component, priority)
      }
      catch (error) {
        console.warn('预热缓存失败:', template, error)
      }
    })
  )
  
  const duration = Date.now() - startTime
  console.log(`缓存预热完成，耗时 ${duration}ms`)
}
```

## 渲染优化

### 1. 虚拟滚动

对于大量模板的列表，使用虚拟滚动：

```vue
<template>
  <div class="template-list">
    <VirtualList
      :items="templates"
      :item-height="200"
      :visible-count="10"
    >
      <template #default="{ item }">
        <LTemplateRenderer
          :category="item.category"
          :template="item.template"
          :template-props="item.props"
        />
      </template>
    </VirtualList>
  </div>
</template>
```

### 2. 组件复用

复用相同类型的模板组件：

```typescript
// 组件池管理
class ComponentPool {
  private pools = new Map<string, Component[]>()
  
  acquire(type: string): Component | null {
    const pool = this.pools.get(type) || []
    return pool.pop() || null
  }
  
  release(type: string, component: Component) {
    const pool = this.pools.get(type) || []
    pool.push(component)
    this.pools.set(type, pool)
  }
  
  clear() {
    this.pools.clear()
  }
}

const componentPool = new ComponentPool()

// 在模板管理器中使用组件池
async function loadTemplateWithPool(category: string, device: string, template: string) {
  const type = `${category}:${device}:${template}`
  
  // 尝试从池中获取
  let component = componentPool.acquire(type)
  
  if (!component) {
    // 池中没有，创建新的
    component = await loadTemplateComponent(category, device, template)
  }
  
  return component
}
```

### 3. 渲染批处理

批量处理模板渲染：

```typescript
class RenderBatcher {
  private queue: RenderTask[] = []
  private isProcessing = false
  
  add(task: RenderTask) {
    this.queue.push(task)
    this.process()
  }
  
  private async process() {
    if (this.isProcessing) 
      return
    this.isProcessing = true
    
    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, 5) // 每批处理5个
      
      await Promise.all(
        batch.map(task => this.renderTemplate(task))
      )
      
      // 让出控制权，避免阻塞UI
      await new Promise(resolve => setTimeout(resolve, 0))
    }
    
    this.isProcessing = false
  }
  
  private async renderTemplate(task: RenderTask) {
    try {
      const component = await templateManager.loadTemplate(
        task.category,
        task.device,
        task.template
      )
      task.resolve(component)
    }
    catch (error) {
      task.reject(error)
    }
  }
}
```

## 内存优化

### 1. 内存监控

监控内存使用情况：

```typescript
class MemoryMonitor {
  private checkInterval: number
  
  constructor(interval = 60000) { // 每分钟检查一次
    this.checkInterval = setInterval(() => {
      this.checkMemoryUsage()
    }, interval)
  }
  
  private checkMemoryUsage() {
    const stats = templateManager.getCacheStats()
    const memoryUsage = stats.memoryUsage
    
    console.log('内存使用情况:', {
      缓存大小: stats.size,
      内存使用: `${(memoryUsage / 1024 / 1024).toFixed(2)}MB`,
      命中率: `${((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2)}%`
    })
    
    // 内存使用过高时清理
    if (memoryUsage > 100 * 1024 * 1024) { // 100MB
      this.cleanup()
    }
  }
  
  private cleanup() {
    console.log('开始内存清理...')
    
    // 清理最少使用的缓存
    templateManager.clearLeastUsedCache(0.3) // 清理30%
    
    // 强制垃圾回收（如果可用）
    if (window.gc) {
      window.gc()
    }
    
    console.log('内存清理完成')
  }
  
  destroy() {
    clearInterval(this.checkInterval)
  }
}

const memoryMonitor = new MemoryMonitor()
```

### 2. 弱引用

使用 WeakMap 避免内存泄漏：

```typescript
class TemplateRegistry {
  private templates = new WeakMap<Component, TemplateMetadata>()
  private refs = new Map<string, WeakRef<Component>>()
  
  register(component: Component, metadata: TemplateMetadata) {
    this.templates.set(component, metadata)
    
    const key = this.getKey(metadata)
    this.refs.set(key, new WeakRef(component))
  }
  
  get(category: string, device: string, template: string): Component | null {
    const key = this.getKey({ category, device, template })
    const ref = this.refs.get(key)
    
    if (ref) {
      const component = ref.deref()
      if (component) {
        return component
      }
      else {
        // 组件已被垃圾回收，清理引用
        this.refs.delete(key)
      }
    }
    
    return null
  }
  
  private getKey(metadata: { category: string, device: string, template: string }) {
    return `${metadata.category}:${metadata.device}:${metadata.template}`
  }
}
```

## 网络优化

### 1. 资源压缩

压缩模板资源：

```typescript
// Vite 配置
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 将模板分组打包
          'templates-auth': ['src/templates/auth/**'],
          'templates-dashboard': ['src/templates/dashboard/**'],
          'templates-layout': ['src/templates/layout/**']
        }
      }
    },
    
    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除 console
        drop_debugger: true
      }
    }
  }
})
```

### 2. HTTP/2 推送

利用 HTTP/2 服务器推送：

```typescript
// 服务器端配置
app.get('/templates/:category/:device/:template', (req, res) => {
  const { category, device, template } = req.params
  
  // 推送相关资源
  res.push('/templates/common/styles.css')
  res.push('/templates/common/utils.js')
  
  // 返回模板
  res.sendFile(getTemplatePath(category, device, template))
})
```

### 3. CDN 优化

使用 CDN 加速模板加载：

```typescript
const templateLoader = {
  async loadFromCDN(category: string, device: string, template: string) {
    const cdnUrl = `https://cdn.example.com/templates/${category}/${device}/${template}.js`
    
    try {
      const response = await fetch(cdnUrl)
      if (response.ok) {
        return await response.text()
      }
    }
    catch (error) {
      console.warn('CDN 加载失败，回退到本地:', error)
    }
    
    // 回退到本地加载
    return await this.loadFromLocal(category, device, template)
  }
}
```

## 性能监控

### 1. 性能指标

收集关键性能指标：

```typescript
class PerformanceTracker {
  private metrics = new Map<string, number[]>()
  
  track(name: string, value: number) {
    const values = this.metrics.get(name) || []
    values.push(value)
    
    // 只保留最近100个数据点
    if (values.length > 100) {
      values.shift()
    }
    
    this.metrics.set(name, values)
  }
  
  getStats(name: string) {
    const values = this.metrics.get(name) || []
    if (values.length === 0) 
      return null
    
    const sorted = [...values].sort((a, b) => a - b)
    
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p90: sorted[Math.floor(sorted.length * 0.9)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    }
  }
  
  report() {
    console.log('性能报告:')
    for (const [name, _] of this.metrics) {
      const stats = this.getStats(name)
      console.log(`${name}:`, stats)
    }
  }
}

const tracker = new PerformanceTracker()

// 在模板加载时记录性能
templateManager.on('template:load', (event) => {
  tracker.track('template-load-time', event.loadTime)
  tracker.track('template-size', event.size)
})
```

### 2. 用户体验监控

监控用户体验指标：

```typescript
// 监控首次内容绘制时间
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name === 'first-contentful-paint') {
      tracker.track('fcp', entry.startTime)
    }
  }
})

observer.observe({ entryTypes: ['paint'] })

// 监控最大内容绘制时间
const lcpObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    tracker.track('lcp', entry.startTime)
  }
})

lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
```

## 最佳实践

1. **合理使用缓存**：根据模板更新频率设置 TTL
2. **预加载关键模板**：提升用户体验
3. **监控性能指标**：及时发现性能问题
4. **代码分割**：避免单个包过大
5. **内存管理**：定期清理不需要的缓存
6. **网络优化**：使用 CDN 和压缩
7. **用户体验优先**：优化关键渲染路径
