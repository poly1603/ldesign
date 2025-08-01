# 性能优化指南

@ldesign/store 提供了多种性能优化策略，帮助你构建高性能的状态管理应用。

## 缓存策略

### 计算属性缓存

使用 `@CachedGetter` 装饰器来缓存计算密集的操作：

```typescript
class DataAnalysisStore extends BaseStore {
  @State({ default: [] })
  largeDataset: DataPoint[] = []

  // 自动缓存，只有依赖变化时才重新计算
  @CachedGetter(['largeDataset'])
  get processedData() {
    console.log('执行复杂计算...') // 只在数据变化时执行
    return this.largeDataset.map(point => ({
      ...point,
      processed: this.expensiveProcessing(point)
    }))
  }

  // 记忆化缓存，支持参数
  @MemoizedGetter({ maxSize: 100, ttl: 60000 })
  getFilteredData(category: string, dateRange: [Date, Date]) {
    return this.processedData.filter(point => 
      point.category === category &&
      point.date >= dateRange[0] &&
      point.date <= dateRange[1]
    )
  }

  private expensiveProcessing(point: DataPoint) {
    // 模拟复杂计算
    let result = 0
    for (let i = 0; i < 10000; i++) {
      result += Math.sin(point.value * i)
    }
    return result
  }
}
```

### Action 缓存

缓存 API 请求和计算结果：

```typescript
class ApiStore extends BaseStore {
  @State({ default: new Map() })
  cache: Map<string, any> = new Map()

  // 缓存 API 请求 5 分钟
  @CachedAction(300000)
  async fetchUserProfile(userId: string) {
    console.log(`获取用户 ${userId} 的资料...`)
    const response = await userApi.getProfile(userId)
    return response.data
  }

  // 缓存计算结果
  @CachedAction(60000)
  calculateComplexMetrics(data: any[]) {
    console.log('计算复杂指标...')
    return data.reduce((metrics, item) => {
      // 复杂的计算逻辑
      return {
        ...metrics,
        [item.id]: this.performComplexCalculation(item)
      }
    }, {})
  }

  @Action()
  clearCache() {
    this.cache.clear()
  }
}
```

## 防抖和节流

### 防抖优化

防止频繁的状态更新和 API 调用：

```typescript
class SearchStore extends BaseStore {
  @State({ default: '' })
  query: string = ''

  @State({ default: [] })
  results: SearchResult[] = []

  @State({ default: false })
  searching: boolean = false

  // 防抖搜索，避免频繁 API 调用
  @DebouncedAction(300)
  async performSearch(query: string) {
    this.query = query
    
    if (!query.trim()) {
      this.results = []
      return
    }

    this.searching = true
    try {
      const response = await searchApi.search(query)
      this.results = response.data
    } finally {
      this.searching = false
    }
  }

  // 立即更新 UI，但不触发搜索
  @Action()
  updateQuery(query: string) {
    this.query = query
  }
}
```

### 节流优化

限制高频事件的处理频率：

```typescript
class ScrollStore extends BaseStore {
  @State({ default: 0 })
  scrollY: number = 0

  @State({ default: 0 })
  scrollDirection: number = 0

  private lastScrollY = 0

  // 节流滚动事件处理
  @ThrottledAction(16) // 约 60fps
  updateScrollPosition(y: number) {
    this.scrollDirection = y > this.lastScrollY ? 1 : -1
    this.scrollY = y
    this.lastScrollY = y
  }

  @Getter()
  get isScrollingDown() {
    return this.scrollDirection > 0
  }

  @Getter()
  get scrollProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    return Math.min(this.scrollY / maxScroll, 1)
  }
}
```

## 懒加载和按需创建

### Store 懒加载

只在需要时创建 Store 实例：

```typescript
// stores/registry.ts
class StoreRegistry {
  private instances = new Map<string, any>()
  private factories = new Map<string, () => any>()

  register<T>(id: string, factory: () => T) {
    this.factories.set(id, factory)
  }

  getInstance<T>(id: string): T {
    if (!this.instances.has(id)) {
      const factory = this.factories.get(id)
      if (!factory) {
        throw new Error(`Store ${id} not registered`)
      }
      this.instances.set(id, factory())
    }
    return this.instances.get(id)
  }

  dispose(id: string) {
    const instance = this.instances.get(id)
    if (instance && typeof instance.$dispose === 'function') {
      instance.$dispose()
    }
    this.instances.delete(id)
  }
}

export const storeRegistry = new StoreRegistry()

// 注册 Store 工厂
storeRegistry.register('user', () => new UserStore('user'))
storeRegistry.register('cart', () => new CartStore('cart'))
storeRegistry.register('products', () => new ProductStore('products'))
```

### 组件级懒加载

```vue
<template>
  <div>
    <button @click="loadHeavyComponent">加载重型组件</button>
    <component :is="heavyComponent" v-if="heavyComponent" />
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import { storeRegistry } from '@/stores/registry'

const heavyComponent = ref(null)

const loadHeavyComponent = async () => {
  if (!heavyComponent.value) {
    // 懒加载组件和对应的 Store
    const [component] = await Promise.all([
      import('@/components/HeavyComponent.vue'),
      // 预加载相关 Store
      storeRegistry.getInstance('heavyData')
    ])
    
    heavyComponent.value = component.default
  }
}
</script>
```

## 内存管理

### 自动清理

实现自动的内存清理机制：

```typescript
class MemoryManagedStore extends BaseStore {
  @State({ default: new Map() })
  cache: Map<string, any> = new Map()

  @State({ default: new Set() })
  activeSubscriptions: Set<() => void> = new Set()

  private cleanupTimer: NodeJS.Timeout | null = null

  constructor(id: string) {
    super(id)
    this.startCleanupTimer()
  }

  @Action()
  addToCache(key: string, value: any, ttl: number = 300000) {
    this.cache.set(key, {
      value,
      expires: Date.now() + ttl
    })
  }

  @Action()
  subscribe(callback: () => void) {
    const unsubscribe = this.$subscribe(callback)
    this.activeSubscriptions.add(unsubscribe)
    
    return () => {
      unsubscribe()
      this.activeSubscriptions.delete(unsubscribe)
    }
  }

  private startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      this.cleanupExpiredCache()
    }, 60000) // 每分钟清理一次
  }

  private cleanupExpiredCache() {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (item.expires < now) {
        this.cache.delete(key)
      }
    }
  }

  $dispose() {
    // 清理定时器
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    // 清理订阅
    this.activeSubscriptions.forEach(unsubscribe => unsubscribe())
    this.activeSubscriptions.clear()

    // 清理缓存
    this.cache.clear()

    super.$dispose()
  }
}
```

### 弱引用管理

使用 WeakMap 和 WeakSet 避免内存泄漏：

```typescript
class WeakReferenceStore extends BaseStore {
  // 使用 WeakMap 存储临时关联数据
  private elementData = new WeakMap<Element, any>()
  private componentRefs = new WeakSet<any>()

  @Action()
  attachElementData(element: Element, data: any) {
    this.elementData.set(element, data)
  }

  @Action()
  getElementData(element: Element) {
    return this.elementData.get(element)
  }

  @Action()
  registerComponent(component: any) {
    this.componentRefs.add(component)
  }

  @Action()
  isComponentRegistered(component: any) {
    return this.componentRefs.has(component)
  }
}
```

## 批量操作优化

### 批量状态更新

减少响应式更新的频率：

```typescript
class BatchUpdateStore extends BaseStore {
  @State({ default: [] })
  items: Item[] = []

  @State({ default: false })
  updating: boolean = false

  // 批量添加项目
  @Action()
  addItemsBatch(newItems: Item[]) {
    // 使用 $patch 进行批量更新
    this.$patch({
      items: [...this.items, ...newItems]
    })
  }

  // 批量更新多个状态
  @Action()
  batchUpdate(updates: {
    items?: Item[]
    updating?: boolean
    [key: string]: any
  }) {
    this.$patch(updates)
  }

  // 使用事务进行复杂的批量操作
  @Action()
  performComplexUpdate(data: any[]) {
    // 开始批量更新
    this.updating = true

    try {
      // 批量处理数据
      const processedItems = data.map(item => this.processItem(item))
      const filteredItems = processedItems.filter(item => item.isValid)
      const sortedItems = filteredItems.sort((a, b) => a.priority - b.priority)

      // 一次性更新所有状态
      this.$patch({
        items: sortedItems,
        updating: false,
        lastUpdated: new Date()
      })
    } catch (error) {
      this.updating = false
      throw error
    }
  }

  private processItem(item: any): Item {
    // 处理单个项目
    return {
      ...item,
      processed: true,
      timestamp: Date.now()
    }
  }
}
```

## 虚拟化和分页

### 大列表虚拟化

处理大量数据时使用虚拟化：

```typescript
class VirtualizedListStore extends BaseStore {
  @State({ default: [] })
  allItems: Item[] = []

  @State({ default: 0 })
  scrollTop: number = 0

  @State({ default: 50 })
  itemHeight: number = 50

  @State({ default: 600 })
  containerHeight: number = 600

  @Getter()
  get visibleRange() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight)
    const endIndex = Math.min(
      startIndex + Math.ceil(this.containerHeight / this.itemHeight) + 1,
      this.allItems.length
    )
    return { startIndex, endIndex }
  }

  @CachedGetter(['allItems', 'scrollTop', 'containerHeight'])
  get visibleItems() {
    const { startIndex, endIndex } = this.visibleRange
    return this.allItems.slice(startIndex, endIndex).map((item, index) => ({
      ...item,
      virtualIndex: startIndex + index,
      top: (startIndex + index) * this.itemHeight
    }))
  }

  @ThrottledAction(16)
  updateScrollTop(scrollTop: number) {
    this.scrollTop = scrollTop
  }

  @Getter()
  get totalHeight() {
    return this.allItems.length * this.itemHeight
  }
}
```

### 分页加载

实现高效的分页数据管理：

```typescript
class PaginatedStore extends BaseStore {
  @State({ default: new Map() })
  pages: Map<number, Item[]> = new Map()

  @State({ default: 1 })
  currentPage: number = 1

  @State({ default: 20 })
  pageSize: number = 20

  @State({ default: 0 })
  totalItems: number = 0

  @State({ default: false })
  loading: boolean = false

  @AsyncAction()
  async loadPage(page: number) {
    if (this.pages.has(page)) {
      this.currentPage = page
      return this.pages.get(page)
    }

    this.loading = true
    try {
      const response = await api.getItems({
        page,
        pageSize: this.pageSize
      })

      this.pages.set(page, response.items)
      this.totalItems = response.total
      this.currentPage = page

      return response.items
    } finally {
      this.loading = false
    }
  }

  @Action()
  async preloadNextPage() {
    const nextPage = this.currentPage + 1
    if (!this.pages.has(nextPage) && this.hasNextPage) {
      await this.loadPage(nextPage)
    }
  }

  @Getter()
  get currentItems() {
    return this.pages.get(this.currentPage) || []
  }

  @Getter()
  get totalPages() {
    return Math.ceil(this.totalItems / this.pageSize)
  }

  @Getter()
  get hasNextPage() {
    return this.currentPage < this.totalPages
  }

  @Getter()
  get hasPrevPage() {
    return this.currentPage > 1
  }

  // 清理旧页面数据，保持内存使用合理
  @Action()
  cleanupOldPages() {
    const keepPages = 3 // 保留当前页前后各3页
    const minPage = Math.max(1, this.currentPage - keepPages)
    const maxPage = Math.min(this.totalPages, this.currentPage + keepPages)

    for (const [page] of this.pages) {
      if (page < minPage || page > maxPage) {
        this.pages.delete(page)
      }
    }
  }
}
```

## 性能监控

### 性能指标收集

```typescript
class PerformanceStore extends BaseStore {
  @State({ default: new Map() })
  metrics: Map<string, PerformanceMetric> = new Map()

  @Action()
  startTiming(operation: string) {
    this.metrics.set(operation, {
      startTime: performance.now(),
      endTime: null,
      duration: null
    })
  }

  @Action()
  endTiming(operation: string) {
    const metric = this.metrics.get(operation)
    if (metric) {
      metric.endTime = performance.now()
      metric.duration = metric.endTime - metric.startTime
    }
  }

  @Getter()
  get slowOperations() {
    return Array.from(this.metrics.entries())
      .filter(([_, metric]) => metric.duration && metric.duration > 100)
      .sort((a, b) => b[1].duration! - a[1].duration!)
  }

  @Action()
  logPerformance() {
    console.table(
      Array.from(this.metrics.entries()).map(([name, metric]) => ({
        操作: name,
        耗时: metric.duration ? `${metric.duration.toFixed(2)}ms` : '进行中'
      }))
    )
  }
}

// 使用装饰器自动监控性能
function MonitorPerformance(operationName?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const name = operationName || `${target.constructor.name}.${propertyKey}`

    descriptor.value = async function (...args: any[]) {
      const perfStore = new PerformanceStore('performance')
      perfStore.startTiming(name)
      
      try {
        const result = await originalMethod.apply(this, args)
        return result
      } finally {
        perfStore.endTiming(name)
      }
    }
  }
}
```

## 最佳实践总结

### 1. 选择合适的优化策略

```typescript
// ✅ 根据场景选择优化方式
class OptimizedStore extends BaseStore {
  // 频繁变化的数据使用节流
  @ThrottledAction(100)
  updateFrequentData(data: any) { /* ... */ }

  // 搜索使用防抖
  @DebouncedAction(300)
  search(query: string) { /* ... */ }

  // 计算密集的使用缓存
  @CachedGetter(['largeDataset'])
  get expensiveCalculation() { /* ... */ }

  // API 请求使用缓存
  @CachedAction(300000)
  async fetchData() { /* ... */ }
}
```

### 2. 避免过度优化

```typescript
// ❌ 过度优化
class OverOptimizedStore extends BaseStore {
  @CachedAction(100) // 简单操作不需要缓存
  increment() {
    this.count++
  }
}

// ✅ 适度优化
class ReasonablyOptimizedStore extends BaseStore {
  @Action()
  increment() {
    this.count++
  }

  @CachedAction(60000) // 只对需要的操作使用缓存
  async fetchExpensiveData() { /* ... */ }
}
```

### 3. 监控和测量

定期监控应用性能，根据实际数据进行优化：

```typescript
// 性能监控 Hook
export function usePerformanceMonitor() {
  const metrics = ref(new Map())

  const measure = (name: string, fn: () => any) => {
    const start = performance.now()
    const result = fn()
    const duration = performance.now() - start
    
    metrics.value.set(name, duration)
    
    if (duration > 100) {
      console.warn(`慢操作检测: ${name} 耗时 ${duration.toFixed(2)}ms`)
    }
    
    return result
  }

  return { metrics, measure }
}
```

## 下一步

- 学习 [最佳实践](/guide/best-practices) 编写更好的代码
- 查看 [API 参考](/api/) 了解详细接口
- 探索 [示例](/examples/) 查看实际应用
