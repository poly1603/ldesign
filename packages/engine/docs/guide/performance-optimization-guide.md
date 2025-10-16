# Vue3 Engine 性能优化最佳实践指南

## 🎯 概述

这份指南将帮助你充分利用 @ldesign/engine 的性能优化工具，构建高性能、稳定可靠的 Vue 3 应用。我们将涵盖常见的使用场景、最佳实践和问题解决方案。

## 📋 目录

- [快速开始](#快速开始)
- [性能监控最佳实践](#性能监控最佳实践)
- [内存管理策略](#内存管理策略)
- [类型安全开发](#类型安全开发)
- [常见使用场景](#常见使用场景)
- [性能优化清单](#性能优化清单)
- [故障排除指南](#故障排除指南)
- [进阶技巧](#进阶技巧)

---

## 🚀 快速开始

### 安装和导入

```bash
npm install @ldesign/engine
```

```typescript
import {
  debounce,
  globalPerformanceAnalyzer,
  measurePerformance,
  memoryManager,
  safeAsync
} from '@ldesign/engine'
```

### 基础设置

在应用启动时进行基础设置：

```typescript
import { globalPerformanceAnalyzer, memoryManager } from '@ldesign/engine'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 启动全局性能监控
globalPerformanceAnalyzer.startMeasure('app-initialization')

// 启动内存监控
memoryManager.startMonitoring()

app.mount('#app')

globalPerformanceAnalyzer.endMeasure('app-initialization')

// 应用退出时清理资源
window.addEventListener('beforeunload', () => {
  memoryManager.cleanup()
})
```

---

## 📊 性能监控最佳实践

### 1. 使用装饰器进行方法级监控

**✅ 推荐做法：**

```typescript
class ApiService {
  @measurePerformance('fetch-user-data')
  async fetchUserData(userId: string) {
    const response = await fetch(`/api/users/${userId}`)
    return response.json()
  }

  @measurePerformance('batch-upload')
  async uploadFiles(files: File[]) {
    const formData = new FormData()
    files.forEach(file => formData.append('files', file))
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    return response.json()
  }
}
```

### 2. 组件级性能监控

```typescript
// 在 Vue 组件中监控关键操作
export default defineComponent({
  name: 'DataTable',
  setup() {
    const loadData = async () => {
      globalPerformanceAnalyzer.startMeasure('table-data-load')
      
      try {
        const data = await apiService.fetchTableData()
        // 处理数据
        return data
      } finally {
        globalPerformanceAnalyzer.endMeasure('table-data-load')
      }
    }

    return { loadData }
  }
})
```

### 3. 批量操作优化

```typescript
// 使用 BatchProcessor 优化批量 API 请求
import { BatchProcessor } from '@ldesign/engine'

const batchApiProcessor = new BatchProcessor(
  async (requests: ApiRequest[]) => {
    // 将多个请求合并为一个批量请求
    const response = await fetch('/api/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests })
    })
    return response.json()
  },
  { batchSize: 10, delay: 100 }
)

// 使用批量处理器
const result = await batchApiProcessor.add({
  method: 'GET',
  url: '/api/user/123'
})
```

### 4. 性能报告生成和分析

```typescript
// 定期生成性能报告
setInterval(() => {
  const report = globalPerformanceAnalyzer.generateReport()
  
  // 发送到监控服务
  if (report.totalMeasures > 0) {
    sendToMonitoringService({
      timestamp: Date.now(),
      metrics: {
        totalOperations: report.totalMeasures,
        averageResponseTime: report.averageDuration,
        slowOperations: report.slowOperations.slice(0, 5), // 前5个最慢的操作
        operationStats: report.operationStats
      }
    })
    
    // 清理旧数据
    globalPerformanceAnalyzer.clearMeasures()
  }
}, 60000) // 每分钟一次
```

---

## 🧠 内存管理策略

### 1. 定时器生命周期管理

**❌ 不推荐的做法：**
```typescript
// 容易造成内存泄漏
export default defineComponent({
  setup() {
    onMounted(() => {
      setInterval(() => {
        // 定期更新数据
        updateData()
      }, 5000)
    })
  }
})
```

**✅ 推荐做法：**
```typescript
export default defineComponent({
  setup() {
    onMounted(() => {
      const timerId = memoryManager.setInterval(() => {
        updateData()
      }, 5000)
      
      // 组件销毁时自动清理
      onUnmounted(() => {
        memoryManager.clearInterval(timerId)
      })
    })
  }
})
```

### 2. 事件监听器管理

```typescript
export default defineComponent({
  setup() {
    onMounted(() => {
      // 使用托管的事件监听器
      const listenerId = memoryManager.addEventListener(
        window,
        'scroll',
        throttle(handleScroll, 100),
        { passive: true }
      )
      
      onUnmounted(() => {
        memoryManager.removeEventListener(listenerId)
      })
    })
    
    const handleScroll = () => {
      // 处理滚动事件
    }
  }
})
```

### 3. 资源组管理

```typescript
class FeatureModule {
  private resourceIds: string[] = []
  
  async initialize() {
    // 注册WebSocket连接到'websocket'组
    const wsId = memoryManager.registerResource(
      { connection: new WebSocket('ws://example.com') },
      resource => resource.connection.close(),
      'websocket'
    )
    
    // 注册数据库连接到'database'组
    const dbId = memoryManager.registerResource(
      { connection: await createDatabaseConnection() },
      resource => resource.connection.disconnect(),
      'database'
    )
    
    this.resourceIds.push(wsId, dbId)
  }
  
  dispose() {
    // 清理特定组的资源
    memoryManager.cleanupGroup('websocket')
    memoryManager.cleanupGroup('database')
  }
}
```

### 4. 对象池优化

```typescript
// 用于频繁创建的对象
const vectorPool = new ObjectPool(
  () => ({ x: 0, y: 0, z: 0 }),
  vector => {
    vector.x = 0
    vector.y = 0
    vector.z = 0
  },
  1000 // 最多缓存1000个对象
)

// 在渲染循环或动画中使用
function animationLoop() {
  const particles = []
  
  for (let i = 0; i < particleCount; i++) {
    const particle = vectorPool.get()
    particle.x = Math.random() * canvas.width
    particle.y = Math.random() * canvas.height
    particle.z = Math.random() * 100
    
    particles.push(particle)
  }
  
  // 动画更新逻辑...
  
  // 归还对象到池中
  particles.forEach(particle => {
    vectorPool.release(particle)
  })
}
```

---

## 🛡️ 类型安全开发

### 1. 安全的异步操作

```typescript
// API 调用的类型安全包装
async function fetchUserSafely(userId: string) {
  const result = await safeAsync(async () => {
    const response = await fetch(`/api/users/${userId}`)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }, 5000) // 5秒超时
  
  if (result.success) {
    return result.data
  } else {
    // 统一错误处理
    console.error('获取用户数据失败:', result.error)
    throw result.error
  }
}
```

### 2. 配置管理

```typescript
// 创建类型化配置
interface AppConfig {
  api: {
    baseUrl: string
    timeout: number
    retryAttempts: number
  }
  features: {
    enableAnalytics: boolean
    enableDebugMode: boolean
  }
  ui: {
    theme: 'light' | 'dark'
    locale: string
  }
}

const configManager = createTypedConfigManager<AppConfig>({
  api: {
    baseUrl: process.env.VUE_APP_API_BASE_URL || 'https://api.example.com',
    timeout: 10000,
    retryAttempts: 3
  },
  features: {
    enableAnalytics: process.env.NODE_ENV === 'production',
    enableDebugMode: process.env.NODE_ENV === 'development'
  },
  ui: {
    theme: 'light',
    locale: 'zh-CN'
  }
})

// 类型安全的配置访问
const apiTimeout = configManager.get('api.timeout') // TypeScript 知道这是 number
const theme = configManager.get('ui.theme') // TypeScript 知道这是 'light' | 'dark'
```

### 3. 输入验证

```typescript
const validator = new InputValidator()

// 用户注册表单验证
const userRegistrationSchema = {
  username: {
    required: true,
    type: 'string' as const,
    validator: (value: string) => {
      if (value.length < 3) return '用户名至少3个字符'
      if (!/^\w+$/.test(value)) return '用户名只能包含字母、数字和下划线'
      return null
    }
  },
  email: {
    required: true,
    type: 'string' as const,
    validator: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/
      return emailRegex.test(value) ? null : '请输入有效的邮箱地址'
    }
  },
  age: {
    required: false,
    type: 'number' as const,
    validator: (value: number) => {
      return value >= 13 ? null : '年龄必须至少13岁'
    }
  }
}

// 在组件中使用
const validateForm = (formData: any) => {
  const result = validator.validate(formData, userRegistrationSchema)
  
  if (!result.success) {
    // 显示验证错误
    showErrors(result.errors)
    return false
  }
  
  return true
}
```

---

## 🎨 常见使用场景

### 场景1：高频事件处理（滚动、输入、调整大小）

```typescript
export default defineComponent({
  setup() {
    // 防抖搜索
    const debouncedSearch = debounce(async (query: string) => {
      if (query.length < 2) return
      
      const result = await safeAsync(() => 
        searchService.search(query)
      )
      
      if (result.success) {
        searchResults.value = result.data
      }
    }, 300)
    
    // 节流滚动处理
    const throttledScrollHandler = throttle(() => {
      // 处理滚动逻辑，如懒加载
      handleLazyLoading()
    }, 100, { leading: true, trailing: false })
    
    onMounted(() => {
      const scrollListenerId = memoryManager.addEventListener(
        window,
        'scroll',
        throttledScrollHandler,
        { passive: true }
      )
      
      onUnmounted(() => {
        memoryManager.removeEventListener(scrollListenerId)
        debouncedSearch.cancel()
      })
    })
  }
})
```

### 场景2：数据列表优化

```typescript
class DataListManager {
  private batchProcessor: BatchProcessor<DataRequest, DataItem>
  private objectPool: ObjectPool<ListItem>
  
  constructor() {
    // 批处理数据请求
    this.batchProcessor = new BatchProcessor(
      async (requests: DataRequest[]) => {
        const response = await fetch('/api/batch-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requests })
        })
        return response.json()
      },
      { batchSize: 50, delay: 10 }
    )
    
    // 列表项对象池
    this.objectPool = new ObjectPool(
      () => ({ id: '', data: null, rendered: false }),
      item => { 
        item.id = ''
        item.data = null
        item.rendered = false 
      }
    )
  }
  
  @measurePerformance('load-data-batch')
  async loadDataBatch(ids: string[]) {
    const promises = ids.map(id => 
      this.batchProcessor.add({ id, type: 'user-data' })
    )
    
    const results = await Promise.allSettled(promises)
    return results
      .filter(result => result.status === 'fulfilled')
      .map(result => (result as PromiseFulfilledResult<DataItem>).value)
  }
  
  createListItem(data: DataItem): ListItem {
    const item = this.objectPool.get()
    item.id = data.id
    item.data = data
    item.rendered = true
    return item
  }
  
  recycleListItem(item: ListItem) {
    this.objectPool.release(item)
  }
}
```

### 场景3：文件上传优化

```typescript
class FileUploadManager {
  private uploadPromises = new Map<string, ManagedPromise<UploadResult>>()
  
  @measurePerformance('file-upload')
  async uploadFile(file: File, onProgress?: (progress: number) => void) {
    const fileId = `${file.name}-${Date.now()}`
    
    const managedPromise = createManagedPromise<UploadResult>((resolve, reject) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const xhr = new XMLHttpRequest()
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100)
          onProgress(progress)
        }
      }
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText))
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`))
        }
      }
      
      xhr.onerror = () => reject(new Error('Upload failed'))
      
      xhr.open('POST', '/api/upload')
      xhr.send(formData)
      
      // 返回清理函数
      return () => {
        xhr.abort()
      }
    })
    
    this.uploadPromises.set(fileId, managedPromise)
    
    try {
      const result = await managedPromise.promise
      return result
    } finally {
      this.uploadPromises.delete(fileId)
    }
  }
  
  cancelUpload(fileId: string) {
    const promise = this.uploadPromises.get(fileId)
    if (promise) {
      promise.cancel()
      this.uploadPromises.delete(fileId)
    }
  }
  
  cancelAllUploads() {
    for (const [fileId, promise] of this.uploadPromises) {
      promise.cancel()
    }
    this.uploadPromises.clear()
  }
}
```

### 场景4：实时数据监控

```typescript
class RealTimeMonitor {
  private wsConnection: WebSocket | null = null
  private reconnectTimer: string | null = null
  private heartbeatTimer: string | null = null
  
  @measurePerformance('websocket-connect')
  async connect(url: string) {
    return new Promise<void>((resolve, reject) => {
      try {
        this.wsConnection = new WebSocket(url)
        
        this.wsConnection.onopen = () => {
          console.log('WebSocket连接已建立')
          this.startHeartbeat()
          resolve()
        }
        
        this.wsConnection.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data))
        }
        
        this.wsConnection.onclose = () => {
          console.log('WebSocket连接已关闭')
          this.scheduleReconnect()
        }
        
        this.wsConnection.onerror = (error) => {
          console.error('WebSocket错误:', error)
          reject(error)
        }
        
        // 注册资源清理
        memoryManager.registerResource(
          { connection: this.wsConnection },
          (resource) => {
            if (resource.connection.readyState === WebSocket.OPEN) {
              resource.connection.close()
            }
          }
        )
        
      } catch (error) {
        reject(error)
      }
    })
  }
  
  private startHeartbeat() {
    this.heartbeatTimer = memoryManager.setInterval(() => {
      if (this.wsConnection?.readyState === WebSocket.OPEN) {
        this.wsConnection.send(JSON.stringify({ type: 'ping' }))
      }
    }, 30000) // 每30秒发送心跳
  }
  
  private scheduleReconnect() {
    this.reconnectTimer = memoryManager.setTimeout(() => {
      console.log('尝试重新连接WebSocket...')
      this.connect(this.wsConnection?.url || '')
    }, 5000) // 5秒后重连
  }
  
  private handleMessage(data: any) {
    // 使用防抖处理高频消息
    const debouncedHandler = debounce((messageData: any) => {
      // 处理消息逻辑
      this.processMessage(messageData)
    }, 100)
    
    debouncedHandler(data)
  }
  
  disconnect() {
    if (this.reconnectTimer) {
      memoryManager.clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    if (this.heartbeatTimer) {
      memoryManager.clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    
    if (this.wsConnection) {
      this.wsConnection.close()
      this.wsConnection = null
    }
  }
}
```

---

## ✅ 性能优化清单

### 启动时优化
- [ ] 配置全局性能监控
- [ ] 启动内存管理监控
- [ ] 设置资源清理策略
- [ ] 配置错误收集和上报

### 运行时优化
- [ ] 使用防抖/节流处理高频事件
- [ ] 批处理API请求
- [ ] 使用对象池减少GC压力
- [ ] 监控关键操作性能

### 内存管理
- [ ] 使用托管的定时器和事件监听器
- [ ] 按功能模块分组管理资源
- [ ] 设置定期内存泄漏检查
- [ ] 组件销毁时清理资源

### 错误处理
- [ ] 使用类型安全的异步操作
- [ ] 实现输入验证
- [ ] 配置全局错误处理
- [ ] 记录和分析错误趋势

### 监控和分析
- [ ] 定期生成性能报告
- [ ] 监控慢操作和瓶颈
- [ ] 跟踪内存使用趋势
- [ ] 设置性能阈值告警

---

## 🔧 故障排除指南

### 常见问题

#### 1. 内存泄漏问题

**症状：** 应用长时间运行后内存占用持续增长

**排查步骤：**
```typescript
// 启用内存监控
memoryManager.startMonitoring()

// 定期检查内存泄漏
setInterval(() => {
  const stats = memoryManager.getOverallStats()
  console.log('内存统计:', stats)
  
  // 检查定时器泄漏
  if (stats.timers.total > 100) {
    console.warn('定时器数量过多，可能存在泄漏')
  }
  
  // 检查监听器泄漏
  if (stats.listeners.totalListeners > 200) {
    console.warn('事件监听器数量过多，可能存在泄漏')
  }
}, 30000)
```

**解决方案：**
- 确保所有定时器和事件监听器都通过 `memoryManager` 创建
- 组件销毁时调用相应的清理方法
- 使用资源分组进行批量清理

#### 2. 性能瓶颈识别

**症状：** 某些操作响应缓慢

**排查步骤：**
```typescript
// 生成性能报告
const report = globalPerformanceAnalyzer.generateReport()

// 识别最慢的操作
console.log('最慢的操作:', report.slowOperations.slice(0, 10))

// 查看操作统计
Object.entries(report.operationStats).forEach(([name, stats]) => {
  if (stats.averageDuration > 1000) { // 超过1秒的操作
    console.warn(`慢操作 ${name}:`, {
      平均耗时: stats.averageDuration,
      最大耗时: stats.maxDuration,
      调用次数: stats.count
    })
  }
})
```

#### 3. 类型安全问题

**症状：** 运行时类型错误

**解决方案：**
```typescript
// 使用类型守护进行检查
function processUserData(data: unknown) {
  if (!isValidObject(data)) {
    throw new Error('Invalid user data: not an object')
  }
  
  const userName = safeGet(data, 'name', '')
  const userAge = safeGet(data, 'age', 0)
  
  if (!isString(userName) || !isNumber(userAge)) {
    throw new Error('Invalid user data: incorrect field types')
  }
  
  // 现在可以安全使用 userName 和 userAge
}
```

### 调试技巧

#### 1. 性能调试

```typescript
// 创建专用的调试分析器
const debugAnalyzer = new PerformanceAnalyzer()

// 包装需要调试的函数
function debugWrapper<T>(fn: () => T, operationName: string): T {
  debugAnalyzer.startMeasure(operationName)
  try {
    const result = fn()
    return result
  } finally {
    const measure = debugAnalyzer.endMeasure(operationName)
    if (measure && measure.duration > 100) { // 超过100ms的操作
      console.log(`[性能警告] ${operationName} 耗时 ${measure.duration}ms`)
    }
  }
}
```

#### 2. 内存调试

```typescript
// 内存快照比较
let previousStats = memoryManager.getOverallStats()

setInterval(() => {
  const currentStats = memoryManager.getOverallStats()
  
  const timerDiff = currentStats.timers.total - previousStats.timers.total
  const listenerDiff = currentStats.listeners.totalListeners - previousStats.listeners.totalListeners
  
  if (timerDiff > 0 || listenerDiff > 0) {
    console.log('内存变化:', {
      新增定时器: timerDiff,
      新增监听器: listenerDiff
    })
  }
  
  previousStats = currentStats
}, 10000)
```

---

## 🚀 进阶技巧

### 1. 自定义性能监控中间件

```typescript
// 创建 Vue 3 性能监控插件
import { App } from 'vue'

export const PerformanceMonitoringPlugin = {
  install(app: App) {
    // 监控组件渲染性能
    app.mixin({
      beforeCreate() {
        if (this.$options.name) {
          globalPerformanceAnalyzer.startMeasure(`component-${this.$options.name}-create`)
        }
      },
      created() {
        if (this.$options.name) {
          globalPerformanceAnalyzer.endMeasure(`component-${this.$options.name}-create`)
        }
      },
      beforeMount() {
        if (this.$options.name) {
          globalPerformanceAnalyzer.startMeasure(`component-${this.$options.name}-mount`)
        }
      },
      mounted() {
        if (this.$options.name) {
          globalPerformanceAnalyzer.endMeasure(`component-${this.$options.name}-mount`)
        }
      }
    })
  }
}
```

### 2. 智能批处理策略

```typescript
class SmartBatchProcessor<T, R> {
  private batchProcessor: BatchProcessor<T, R>
  private priorityQueue: Array<{ item: T; priority: number; resolve: (value: R) => void }>
  
  constructor(processFn: (batch: T[]) => Promise<R[]>) {
    this.priorityQueue = []
    
    this.batchProcessor = new BatchProcessor(
      async (batch: T[]) => {
        // 按优先级排序
        const sortedBatch = batch.sort((a, b) => {
          const priorityA = this.getPriority(a)
          const priorityB = this.getPriority(b)
          return priorityB - priorityA
        })
        
        return processFn(sortedBatch)
      },
      { 
        batchSize: this.calculateOptimalBatchSize(),
        delay: this.calculateOptimalDelay()
      }
    )
  }
  
  private calculateOptimalBatchSize(): number {
    // 基于当前系统负载动态调整批大小
    const report = globalPerformanceAnalyzer.generateReport()
    const avgDuration = report.averageDuration
    
    if (avgDuration > 1000) {
      return 5  // 系统负载高，减小批大小
    } else if (avgDuration < 100) {
      return 50 // 系统负载低，增大批大小
    }
    
    return 20 // 默认批大小
  }
  
  private calculateOptimalDelay(): number {
    // 基于网络延迟动态调整延迟
    const networkLatency = this.getNetworkLatency()
    return Math.min(Math.max(networkLatency / 2, 10), 1000)
  }
}
```

### 3. 自适应对象池

```typescript
class AdaptiveObjectPool<T> extends ObjectPool<T> {
  private usageStats = {
    gets: 0,
    releases: 0,
    misses: 0 // 池为空时的获取次数
  }
  
  get(): T {
    this.usageStats.gets++
    
    const obj = super.get()
    if (this.size() === 0) {
      this.usageStats.misses++
    }
    
    // 动态调整池大小
    this.adjustPoolSize()
    
    return obj
  }
  
  release(obj: T): void {
    this.usageStats.releases++
    super.release(obj)
  }
  
  private adjustPoolSize(): void {
    const missRate = this.usageStats.misses / this.usageStats.gets
    
    // 如果缺失率过高，增加池大小
    if (missRate > 0.1 && this.maxSize < 1000) {
      this.maxSize = Math.min(this.maxSize * 1.5, 1000)
      console.log(`对象池扩容至 ${this.maxSize}`)
    }
    
    // 重置统计数据
    if (this.usageStats.gets > 1000) {
      this.usageStats = { gets: 0, releases: 0, misses: 0 }
    }
  }
}
```

### 4. 性能预算监控

```typescript
class PerformanceBudgetMonitor {
  private budgets = new Map<string, { limit: number; current: number }>()
  
  setBudget(operation: string, limitMs: number) {
    this.budgets.set(operation, { limit: limitMs, current: 0 })
  }
  
  @measurePerformance('budget-check')
  checkBudget(operation: string, duration: number): boolean {
    const budget = this.budgets.get(operation)
    if (!budget) return true
    
    budget.current += duration
    
    if (budget.current > budget.limit) {
      console.warn(`性能预算超标: ${operation}`, {
        预算: budget.limit,
        实际: budget.current,
        超标: budget.current - budget.limit
      })
      
      // 发送告警
      this.sendBudgetAlert(operation, budget)
      
      return false
    }
    
    return true
  }
  
  resetBudgets() {
    for (const [operation, budget] of this.budgets) {
      budget.current = 0
    }
  }
  
  private sendBudgetAlert(operation: string, budget: any) {
    // 发送到监控系统
    fetch('/api/performance-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'budget_exceeded',
        operation,
        budget: budget.limit,
        actual: budget.current,
        timestamp: Date.now()
      })
    }).catch(err => console.error('Failed to send alert:', err))
  }
}

// 使用示例
const budgetMonitor = new PerformanceBudgetMonitor()
budgetMonitor.setBudget('page-load', 3000) // 页面加载预算3秒
budgetMonitor.setBudget('api-request', 1000) // API请求预算1秒

// 在性能监控中集成预算检查
globalPerformanceAnalyzer.onMeasureComplete = (measure) => {
  budgetMonitor.checkBudget(measure.name, measure.duration)
}
```

---

## 📈 持续优化

### 性能监控仪表板

创建一个简单的性能监控仪表板：

```typescript
class PerformanceDashboard {
  private metricsHistory: Array<{
    timestamp: number
    metrics: PerformanceReport
  }> = []
  
  updateMetrics() {
    const report = globalPerformanceAnalyzer.generateReport()
    const memoryStats = memoryManager.getOverallStats()
    
    this.metricsHistory.push({
      timestamp: Date.now(),
      metrics: {
        ...report,
        memoryStats
      }
    })
    
    // 保留最近100个数据点
    if (this.metricsHistory.length > 100) {
      this.metricsHistory.shift()
    }
    
    this.displayMetrics()
  }
  
  private displayMetrics() {
    const latest = this.metricsHistory[this.metricsHistory.length - 1]
    if (!latest) return
    
    console.table({
      '总操作数': latest.metrics.totalMeasures,
      '平均响应时间': `${latest.metrics.averageDuration.toFixed(2)}ms`,
      '活跃定时器': latest.metrics.memoryStats.timers.total,
      '活跃监听器': latest.metrics.memoryStats.listeners.totalListeners,
      '管理资源数': latest.metrics.memoryStats.resources.totalResources
    })
  }
  
  getTrend(metricName: string): 'improving' | 'degrading' | 'stable' {
    if (this.metricsHistory.length < 10) return 'stable'
    
    const recent = this.metricsHistory.slice(-10)
    const values = recent.map(entry => entry.metrics[metricName])
    
    const trend = this.calculateTrend(values)
    return trend > 0.1 ? 'degrading' : trend < -0.1 ? 'improving' : 'stable'
  }
  
  private calculateTrend(values: number[]): number {
    // 简单的线性回归斜率计算
    const n = values.length
    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0)
    const sumXX = values.reduce((sum, _, x) => sum + x * x, 0)
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  }
}
```

这个指南涵盖了 @ldesign/engine 性能优化工具的主要使用场景和最佳实践。通过遵循这些建议，你可以构建高性能、内存安全的 Vue 3 应用。

记住，性能优化是一个持续的过程。定期监控、分析和改进是保持应用最佳性能的关键。
