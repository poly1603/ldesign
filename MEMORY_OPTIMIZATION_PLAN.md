# LDesign 内存优化计划

## 内存泄漏风险分析

基于代码分析，发现以下潜在的内存泄漏风险点：

### 1. 事件监听器未正确清理

#### 问题代码示例：
```typescript
// webcomponent/src/components/modal/modal.tsx
document.addEventListener('wheel', this.scrollLockHandler, { passive: false });
document.addEventListener('touchmove', this.scrollLockHandler, { passive: false });
document.addEventListener('keydown', this.keyScrollLockHandler, { passive: false });
window.addEventListener('resize', this.handleWindowResize, { passive: true });

// 缺少对应的 removeEventListener
```

#### 优化方案：
```typescript
class ModalComponent {
  private eventCleanups: (() => void)[] = []
  
  private addEventListenerWithCleanup(
    target: EventTarget, 
    event: string, 
    handler: EventListener, 
    options?: AddEventListenerOptions
  ) {
    target.addEventListener(event, handler, options)
    this.eventCleanups.push(() => {
      target.removeEventListener(event, handler, options)
    })
  }
  
  connectedCallback() {
    this.addEventListenerWithCleanup(document, 'wheel', this.scrollLockHandler, { passive: false })
    this.addEventListenerWithCleanup(window, 'resize', this.handleWindowResize, { passive: true })
  }
  
  disconnectedCallback() {
    // 清理所有事件监听器
    this.eventCleanups.forEach(cleanup => cleanup())
    this.eventCleanups = []
  }
}
```

### 2. 定时器未清理

#### 问题代码示例：
```typescript
// template/src/composables/useResponsiveTemplate.ts
switchTimer = window.setTimeout(async () => {
  // 逻辑处理
}, 100)

// webcomponent/src/components/notification/notification.tsx
this.closeTimer = setTimeout(() => this.close(), this.duration)
```

#### 优化方案：
```typescript
class TimerManager {
  private timers = new Set<number>()
  
  setTimeout(callback: () => void, delay: number): number {
    const id = window.setTimeout(() => {
      this.timers.delete(id)
      callback()
    }, delay)
    this.timers.add(id)
    return id
  }
  
  clearTimeout(id: number) {
    window.clearTimeout(id)
    this.timers.delete(id)
  }
  
  clearAll() {
    this.timers.forEach(id => window.clearTimeout(id))
    this.timers.clear()
  }
}
```

### 3. Observer 对象未释放

#### 问题代码示例：
```typescript
// webcomponent/src/components/tabs/tabs.tsx
this.mutationObserver = new MutationObserver(() => this.collectPanels())
this.resizeObserver = new ResizeObserver(() => this.scheduleCalcOverflow())
```

#### 优化方案：
```typescript
class ObserverManager {
  private observers: Array<{ observer: any; cleanup: () => void }> = []
  
  addMutationObserver(callback: MutationCallback, options?: MutationObserverInit) {
    const observer = new MutationObserver(callback)
    this.observers.push({
      observer,
      cleanup: () => observer.disconnect()
    })
    return observer
  }
  
  addResizeObserver(callback: ResizeObserverCallback) {
    const observer = new ResizeObserver(callback)
    this.observers.push({
      observer,
      cleanup: () => observer.disconnect()
    })
    return observer
  }
  
  cleanup() {
    this.observers.forEach(({ cleanup }) => cleanup())
    this.observers = []
  }
}
```

### 4. 全局变量和单例模式

#### 问题代码示例：
```typescript
// template/src/utils/template-scanner-simple.ts
private static instance: SimpleTemplateScanner | null = null

// template/src/utils/i18n.ts
let globalI18n: I18nInstance | null = null
```

#### 优化方案：
```typescript
// 使用 WeakMap 替代全局变量
const instanceMap = new WeakMap<object, SimpleTemplateScanner>()

class SimpleTemplateScanner {
  static getInstance(context: object): SimpleTemplateScanner {
    if (!instanceMap.has(context)) {
      instanceMap.set(context, new SimpleTemplateScanner())
    }
    return instanceMap.get(context)!
  }
  
  // 提供清理方法
  static clearInstance(context: object) {
    const instance = instanceMap.get(context)
    if (instance) {
      instance.cleanup()
      instanceMap.delete(context)
    }
  }
}
```

## 内存管理最佳实践

### 1. 统一的资源管理器

```typescript
// utils/resource-manager.ts
export class ResourceManager {
  private resources = new Set<() => void>()
  
  addResource(cleanup: () => void) {
    this.resources.add(cleanup)
  }
  
  addEventListener(
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ) {
    target.addEventListener(event, handler, options)
    this.addResource(() => {
      target.removeEventListener(event, handler, options)
    })
  }
  
  setTimeout(callback: () => void, delay: number): number {
    const id = window.setTimeout(callback, delay)
    this.addResource(() => window.clearTimeout(id))
    return id
  }
  
  setInterval(callback: () => void, delay: number): number {
    const id = window.setInterval(callback, delay)
    this.addResource(() => window.clearInterval(id))
    return id
  }
  
  addObserver(observer: { disconnect(): void }) {
    this.addResource(() => observer.disconnect())
    return observer
  }
  
  cleanup() {
    this.resources.forEach(cleanup => {
      try {
        cleanup()
      } catch (error) {
        console.warn('Resource cleanup failed:', error)
      }
    })
    this.resources.clear()
  }
}
```

### 2. Vue 组件内存管理

```typescript
// composables/useResourceManager.ts
import { onBeforeUnmount } from 'vue'
import { ResourceManager } from '../utils/resource-manager'

export function useResourceManager() {
  const resourceManager = new ResourceManager()
  
  onBeforeUnmount(() => {
    resourceManager.cleanup()
  })
  
  return resourceManager
}

// 在组件中使用
export default defineComponent({
  setup() {
    const rm = useResourceManager()
    
    onMounted(() => {
      // 自动管理事件监听器
      rm.addEventListener(window, 'resize', handleResize)
      
      // 自动管理定时器
      rm.setTimeout(() => {
        console.log('Delayed action')
      }, 1000)
      
      // 自动管理 Observer
      const observer = rm.addObserver(
        new ResizeObserver(handleResize)
      )
      observer.observe(element)
    })
    
    return {
      // ...
    }
  }
})
```

### 3. 缓存优化

```typescript
// utils/smart-cache.ts
export class SmartCache<K, V> {
  private cache = new Map<K, { value: V; timestamp: number; accessCount: number }>()
  private maxSize: number
  private maxAge: number
  
  constructor(maxSize = 100, maxAge = 5 * 60 * 1000) { // 5分钟
    this.maxSize = maxSize
    this.maxAge = maxAge
    
    // 定期清理过期缓存
    setInterval(() => this.cleanup(), 60 * 1000) // 每分钟清理一次
  }
  
  set(key: K, value: V) {
    // 如果缓存已满，删除最少使用的项
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed()
    }
    
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 0
    })
  }
  
  get(key: K): V | undefined {
    const item = this.cache.get(key)
    if (!item) return undefined
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key)
      return undefined
    }
    
    // 更新访问计数
    item.accessCount++
    return item.value
  }
  
  private evictLeastUsed() {
    let leastUsedKey: K | undefined
    let minAccessCount = Infinity
    
    for (const [key, item] of this.cache) {
      if (item.accessCount < minAccessCount) {
        minAccessCount = item.accessCount
        leastUsedKey = key
      }
    }
    
    if (leastUsedKey !== undefined) {
      this.cache.delete(leastUsedKey)
    }
  }
  
  private cleanup() {
    const now = Date.now()
    for (const [key, item] of this.cache) {
      if (now - item.timestamp > this.maxAge) {
        this.cache.delete(key)
      }
    }
  }
  
  clear() {
    this.cache.clear()
  }
  
  size() {
    return this.cache.size
  }
}
```

### 4. 内存监控

```typescript
// utils/memory-monitor.ts
export class MemoryMonitor {
  private static instance: MemoryMonitor
  private isMonitoring = false
  private monitoringInterval?: number
  
  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor()
    }
    return MemoryMonitor.instance
  }
  
  startMonitoring(interval = 10000) { // 10秒
    if (this.isMonitoring) return
    
    this.isMonitoring = true
    this.monitoringInterval = window.setInterval(() => {
      this.checkMemoryUsage()
    }, interval)
  }
  
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = undefined
    }
    this.isMonitoring = false
  }
  
  private checkMemoryUsage() {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return
    }
    
    const memory = (window.performance as any).memory
    if (!memory) return
    
    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
    const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024)
    const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
    
    console.log(`Memory Usage: ${usedMB}MB / ${totalMB}MB (Limit: ${limitMB}MB)`)
    
    // 内存使用率超过 80% 时发出警告
    if (usedMB / limitMB > 0.8) {
      console.warn('High memory usage detected!', {
        used: usedMB,
        total: totalMB,
        limit: limitMB,
        percentage: Math.round((usedMB / limitMB) * 100)
      })
      
      // 触发垃圾回收（如果可能）
      this.triggerGC()
    }
  }
  
  private triggerGC() {
    // 强制垃圾回收的一些技巧
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc()
    }
    
    // 清理一些可能的缓存
    this.clearCaches()
  }
  
  private clearCaches() {
    // 清理各种缓存
    // 这里可以调用各个模块的清理方法
  }
  
  getMemoryInfo() {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return null
    }
    
    const memory = (window.performance as any).memory
    if (!memory) return null
    
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
    }
  }
}
```

## 实施计划

### 阶段一：基础清理 (1周)
1. **事件监听器审计**
   - 扫描所有 `addEventListener` 调用
   - 确保每个都有对应的 `removeEventListener`
   - 实现统一的事件管理器

2. **定时器清理**
   - 审计所有 `setTimeout` 和 `setInterval`
   - 实现定时器管理器
   - 确保组件销毁时清理定时器

### 阶段二：Observer 优化 (1周)
1. **Observer 管理**
   - 统一管理 MutationObserver、ResizeObserver 等
   - 实现自动清理机制
   - 添加错误处理

2. **缓存优化**
   - 实现智能缓存系统
   - 添加缓存大小限制
   - 实现 LRU 淘汰策略

### 阶段三：全局状态优化 (1周)
1. **单例模式重构**
   - 使用 WeakMap 替代全局变量
   - 实现上下文相关的实例管理
   - 添加清理接口

2. **内存监控**
   - 实现内存使用监控
   - 添加内存泄漏检测
   - 实现自动清理机制

### 阶段四：测试和验证 (1周)
1. **内存泄漏测试**
   - 编写内存泄漏测试用例
   - 使用 Chrome DevTools 进行验证
   - 性能基准测试

2. **文档和培训**
   - 编写内存管理最佳实践文档
   - 团队培训和代码审查规范

## 预期效果

### 内存使用优化
- **减少内存泄漏**: 消除 90% 以上的内存泄漏风险
- **降低内存占用**: 平均内存使用减少 30-40%
- **提升稳定性**: 长时间运行不再出现内存溢出

### 性能提升
- **垃圾回收优化**: 减少 GC 压力，提升响应速度
- **缓存效率**: 智能缓存策略提升 20-30% 的访问速度
- **资源利用**: 更高效的资源管理和释放

### 开发体验
- **统一的资源管理**: 简化开发者的内存管理工作
- **自动化清理**: 减少手动管理的复杂性
- **监控和调试**: 提供内存使用的可视化监控

---

*文档创建时间: 2024年*
*优化目标: 零内存泄漏，最优性能*