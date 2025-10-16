# 性能优化工具 API 文档

## 概述

@ldesign/engine 提供了一套完整的性能优化工具，包括性能监控、类型安全、内存管理等功能。这些工具可以帮助开发者构建高性能、稳定可靠的 Vue 3 应用。

## 目录

- [性能分析工具](#性能分析工具)
- [类型安全工具](#类型安全工具)  
- [内存管理工具](#内存管理工具)

---

## 性能分析工具

### PerformanceAnalyzer

性能分析器类，用于监控和分析应用性能。

#### 构造函数

```typescript
new PerformanceAnalyzer()
```

#### 方法

##### startMeasure(name: string): void

开始一个性能测量。

**参数：**
- `name` (string): 测量操作的名称

**示例：**
```typescript
const analyzer = new PerformanceAnalyzer()
analyzer.startMeasure('api-request')
```

##### endMeasure(name: string): PerformanceMeasure | null

结束一个性能测量并返回测量结果。

**参数：**
- `name` (string): 测量操作的名称

**返回值：**
- `PerformanceMeasure | null`: 性能测量结果

**示例：**
```typescript
const result = analyzer.endMeasure('api-request')
if (result) {
  console.log(`API请求耗时: ${result.duration}ms`)
}
```

##### recordMeasure(measure: PerformanceMeasure): void

手动记录性能测量数据。

**参数：**
- `measure` (PerformanceMeasure): 性能测量对象

##### getMeasures(filter?: string): PerformanceMeasure[]

获取性能测量数据。

**参数：**
- `filter?` (string): 可选的过滤条件

**返回值：**
- `PerformanceMeasure[]`: 性能测量数据数组

##### generateReport(): PerformanceReport

生成性能分析报告。

**返回值：**
- `PerformanceReport`: 包含统计信息的性能报告

**示例：**
```typescript
const report = analyzer.generateReport()
console.log(`总测量次数: ${report.totalMeasures}`)
console.log(`平均耗时: ${report.averageDuration}ms`)
```

##### clearMeasures(): void

清除所有性能测量数据。

### globalPerformanceAnalyzer

全局性能分析器实例，提供应用级别的性能监控。

**示例：**
```typescript
import { globalPerformanceAnalyzer } from '@ldesign/engine'

globalPerformanceAnalyzer.startMeasure('page-load')
// ... 页面加载逻辑
globalPerformanceAnalyzer.endMeasure('page-load')
```

### measurePerformance 装饰器

用于自动测量方法性能的装饰器。

**语法：**
```typescript
@measurePerformance(operationName: string)
```

**参数：**
- `operationName` (string): 操作名称

**示例：**
```typescript
class ApiService {
  @measurePerformance('fetch-user-data')
  async fetchUserData(userId: string) {
    // 异步操作
    return await this.httpClient.get(`/users/${userId}`)
  }
}
```

### 工具函数

#### debounce(fn: Function, delay: number): DebouncedFunction

创建一个防抖函数。

**参数：**
- `fn` (Function): 要防抖的函数
- `delay` (number): 延迟时间（毫秒）

**返回值：**
- `DebouncedFunction`: 防抖函数

**示例：**
```typescript
const debouncedSearch = debounce((query: string) => {
  performSearch(query)
}, 300)

// 使用
debouncedSearch('搜索内容')

// 取消防抖
debouncedSearch.cancel()
```

#### throttle(fn: Function, limit: number, options?: ThrottleOptions): ThrottledFunction

创建一个节流函数。

**参数：**
- `fn` (Function): 要节流的函数
- `limit` (number): 时间限制（毫秒）
- `options?` (ThrottleOptions): 节流选项

**ThrottleOptions：**
```typescript
interface ThrottleOptions {
  leading?: boolean  // 是否立即执行第一次调用
  trailing?: boolean // 是否执行最后一次调用
}
```

**示例：**
```typescript
const throttledScroll = throttle((event: Event) => {
  handleScroll(event)
}, 100, { leading: true, trailing: false })

window.addEventListener('scroll', throttledScroll)
```

### ObjectPool<T>

对象池类，用于复用对象以减少垃圾回收压力。

#### 构造函数

```typescript
new ObjectPool<T>(
  createFn: () => T,
  resetFn?: (obj: T) => void,
  maxSize?: number
)
```

**参数：**
- `createFn` (() => T): 创建对象的函数
- `resetFn?` ((obj: T) => void): 重置对象的函数
- `maxSize?` (number): 池的最大大小

#### 方法

##### get(): T

从池中获取对象。

##### release(obj: T): void

将对象返回到池中。

##### clear(): void

清空对象池。

##### size(): number

获取池中对象数量。

**示例：**
```typescript
const vectorPool = new ObjectPool(
  () => ({ x: 0, y: 0 }),
  (vector) => { vector.x = 0; vector.y = 0 },
  100
)

const vector = vectorPool.get()
vector.x = 10
vector.y = 20
// 使用完毕后归还
vectorPool.release(vector)
```

### BatchProcessor<T, R>

批处理器类，用于批量处理任务以提升性能。

#### 构造函数

```typescript
new BatchProcessor<T, R>(
  processFn: (batch: T[]) => Promise<R[]>,
  options?: BatchOptions
)
```

**参数：**
- `processFn` ((batch: T[]) => Promise<R[]>): 批处理函数
- `options?` (BatchOptions): 批处理选项

**BatchOptions：**
```typescript
interface BatchOptions {
  batchSize?: number    // 批大小，默认10
  delay?: number        // 延迟时间，默认0
}
```

#### 方法

##### add(item: T): Promise<R>

添加项目到批处理队列。

##### clear(): void

清空待处理队列。

##### getPendingCount(): number

获取待处理项目数量。

**示例：**
```typescript
const batchProcessor = new BatchProcessor(
  async (urls: string[]) => {
    return Promise.all(urls.map(url => fetch(url)))
  },
  { batchSize: 5, delay: 100 }
)

// 添加任务
const response1 = await batchProcessor.add('/api/data1')
const response2 = await batchProcessor.add('/api/data2')
```

---

## 类型安全工具

### 事件系统

#### typedEmit(emitter: EventEmitter, event: string, data?: any): SafeResult<boolean>

类型安全的事件发射。

**参数：**
- `emitter` (EventEmitter): 事件发射器
- `event` (string): 事件名称
- `data?` (any): 事件数据

**返回值：**
- `SafeResult<boolean>`: 安全结果对象

**示例：**
```typescript
const result = typedEmit(eventBus, 'user-login', { userId: '123' })
if (result.success) {
  console.log('事件发射成功')
} else {
  console.error('事件发射失败:', result.error)
}
```

#### typedOn(emitter: EventEmitter, event: string, handler: Function): SafeEventResult

类型安全的事件监听。

**示例：**
```typescript
const result = typedOn(eventBus, 'user-login', (data) => {
  console.log('用户登录:', data)
})

if (result.success && result.unsubscribe) {
  // 稍后取消订阅
  result.unsubscribe()
}
```

### 配置系统

#### getTypedConfig<T>(manager: ConfigManager, key: string, defaultValue: T, validator?: TypeGuard<T>): SafeConfigResult<T>

类型安全的配置获取。

**参数：**
- `manager` (ConfigManager): 配置管理器
- `key` (string): 配置键
- `defaultValue` (T): 默认值
- `validator?` (TypeGuard<T>): 类型验证函数

#### setTypedConfig(manager: ConfigManager, key: string, value: any): SafeResult<void>

类型安全的配置设置。

#### createTypedConfigManager<T>(initialConfig: T): TypedConfigWrapper<T>

创建类型化配置管理器。

**示例：**
```typescript
const configManager = createTypedConfigManager({
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000
  }
})

const baseUrl = configManager.get('api.baseUrl')
configManager.set('api.timeout', 10000)
```

### 类型守护函数

#### isString(value: any): value is string

检查值是否为字符串。

#### isNumber(value: any): value is number

检查值是否为数字（排除 NaN）。

#### isBoolean(value: any): value is boolean

检查值是否为布尔值。

#### isFunction(value: any): value is Function

检查值是否为函数。

#### isArray(value: any): value is Array<any>

检查值是否为数组。

#### isPromise(value: any): value is Promise<any>

检查值是否为 Promise 或 thenable 对象。

#### isValidObject(value: any): value is Record<string, any>

检查值是否为有效的普通对象。

**示例：**
```typescript
if (isString(userInput)) {
  // TypeScript 知道这里 userInput 是 string 类型
  console.log(userInput.toLowerCase())
}
```

### 安全工具函数

#### safeDeepClone<T>(obj: T): SafeResult<T>

安全的深拷贝。

**示例：**
```typescript
const original = { a: 1, b: { c: 2 } }
const cloneResult = safeDeepClone(original)

if (cloneResult.success) {
  const cloned = cloneResult.data
  cloned.b.c = 3 // 不影响原对象
}
```

#### safeMerge<T, U>(obj1: T, obj2: U): SafeResult<T & U>

安全的对象合并。

#### safeGet<T>(obj: any, key: string, defaultValue?: T): T

安全的属性获取。

#### safeGetNested<T>(obj: any, path: string, defaultValue?: T): T

安全的嵌套属性获取。

**示例：**
```typescript
const user = { profile: { name: 'John' } }
const name = safeGetNested(user, 'profile.name', 'Anonymous')
const age = safeGetNested(user, 'profile.age', 0)
```

#### safeFilter<T>(array: T[], predicate: (item: T) => boolean): SafeResult<T[]>

安全的数组过滤。

#### safeMap<T, U>(array: T[], mapper: (item: T) => U): SafeResult<U[]>

安全的数组映射。

#### safeAsync<T>(fn: () => Promise<T>, timeout?: number): Promise<SafeResult<T>>

安全的异步函数执行。

**示例：**
```typescript
const result = await safeAsync(async () => {
  const response = await fetch('/api/data')
  return response.json()
}, 5000)

if (result.success) {
  console.log('数据:', result.data)
} else {
  console.error('请求失败:', result.error)
}
```

#### safeJsonParse<T>(json: string, defaultValue?: T): SafeResult<T>

安全的 JSON 解析。

#### safeJsonStringify(obj: any): SafeResult<string>

安全的 JSON 序列化。

### InputValidator

输入验证器类。

#### validate(data: any, schema: ValidationSchema): ValidationResult

验证数据。

**ValidationSchema：**
```typescript
interface ValidationSchema {
  [key: string]: {
    required?: boolean
    type?: 'string' | 'number' | 'boolean' | 'object' | 'array'
    validator?: (value: any) => string | null
  }
}
```

**示例：**
```typescript
const validator = new InputValidator()
const schema = {
  name: { required: true, type: 'string' },
  age: { 
    required: true, 
    type: 'number',
    validator: (value) => value >= 0 ? null : 'Age must be non-negative'
  }
}

const result = validator.validate({ name: 'John', age: 25 }, schema)
if (!result.success) {
  console.error('验证失败:', result.errors)
}
```

### ErrorUtil

错误处理工具类。

#### static formatError(error: Error): string

格式化错误信息。

#### static createTypedError(type: string, message: string, details?: any): TypedError

创建类型化错误。

#### static safeErrorMessage(error: any): string

安全提取错误消息。

### PromiseUtil

Promise 工具类。

#### static retry<T>(fn: () => Promise<T>, maxAttempts: number, delay?: number): Promise<T>

Promise 重试。

#### static timeout<T>(promise: Promise<T>, ms: number): Promise<T>

Promise 超时。

#### static allSettledTyped<T>(promises: Promise<T>[]): Promise<{ fulfilled: T[]; rejected: Error[] }>

类型化的 Promise.allSettled。

**示例：**
```typescript
// 重试示例
const result = await PromiseUtil.retry(
  () => fetch('/api/data').then(r => r.json()),
  3,
  1000
)

// 超时示例
const timeoutResult = await PromiseUtil.timeout(
  fetch('/api/slow-endpoint'),
  5000
)

// 批处理示例
const results = await PromiseUtil.allSettledTyped([
  fetch('/api/data1').then(r => r.json()),
  fetch('/api/data2').then(r => r.json()),
  fetch('/api/data3').then(r => r.json())
])
console.log(`成功: ${results.fulfilled.length}, 失败: ${results.rejected.length}`)
```

---

## 内存管理工具

### memoryManager (GlobalMemoryManager)

全局内存管理器，统一管理应用中的各种资源。

#### 定时器管理

##### setTimeout(callback: Function, delay: number): string

创建托管的 setTimeout。

##### setInterval(callback: Function, delay: number): string

创建托管的 setInterval。

##### requestAnimationFrame(callback: Function): string

创建托管的 requestAnimationFrame。

##### clearTimeout(id: string): void

清除托管的 setTimeout。

##### clearInterval(id: string): void

清除托管的 setInterval。

##### cancelAnimationFrame(id: string): void

取消托管的 requestAnimationFrame。

#### 事件监听器管理

##### addEventListener(target: EventTarget, event: string, handler: Function, options?: AddEventListenerOptions): string

添加托管的事件监听器。

##### removeEventListener(id: string): void

移除托管的事件监听器。

#### 资源管理

##### registerResource<T>(resource: T, cleanup: (resource: T) => void, group?: string): string

注册资源。

##### releaseResource(id: string): void

释放资源。

#### 内存监控

##### startMonitoring(): void

开始内存监控。

##### stopMonitoring(): void

停止内存监控。

##### isMonitoring(): boolean

检查是否正在监控。

#### 统计和清理

##### getOverallStats(): OverallMemoryStats

获取整体内存统计。

##### cleanup(): void

清理所有托管资源。

**示例：**
```typescript
import { memoryManager } from '@ldesign/engine'

// 创建托管定时器
const timerId = memoryManager.setTimeout(() => {
  console.log('定时器触发')
}, 1000)

// 添加托管事件监听器
const listenerId = memoryManager.addEventListener(
  document.getElementById('button'),
  'click',
  () => console.log('按钮点击')
)

// 注册自定义资源
const resourceId = memoryManager.registerResource(
  { connection: 'websocket' },
  (resource) => resource.connection.close()
)

// 应用退出时统一清理
window.addEventListener('beforeunload', () => {
  memoryManager.cleanup()
})
```

### TimerManager

定时器管理器。

**方法：**
- `setTimeout(callback, delay)`: 创建 setTimeout
- `setInterval(callback, delay)`: 创建 setInterval
- `requestAnimationFrame(callback)`: 创建 requestAnimationFrame
- `clearTimeout(id)`: 清除 setTimeout
- `clearInterval(id)`: 清除 setInterval
- `cancelAnimationFrame(id)`: 取消 requestAnimationFrame
- `clearAll()`: 清除所有定时器
- `getActiveCount()`: 获取活跃定时器数量
- `getStats()`: 获取定时器统计信息

### ListenerManager

事件监听器管理器。

**方法：**
- `addEventListener(target, event, handler, options?)`: 添加事件监听器
- `removeEventListener(id)`: 移除事件监听器
- `removeByTarget(target)`: 按目标移除监听器
- `removeAll()`: 移除所有监听器
- `getActiveCount()`: 获取活跃监听器数量
- `getStats()`: 获取监听器统计信息

### ResourceManager

资源管理器。

**方法：**
- `register<T>(resource, cleanup, group?)`: 注册资源
- `release(id)`: 释放资源
- `cleanupGroup(group)`: 清理指定组的资源
- `cleanup()`: 清理所有资源
- `getResourceCount()`: 获取资源数量
- `getStats()`: 获取资源统计信息

### MemoryLeakDetector

内存泄漏检测器。

**方法：**
- `startMonitoring()`: 开始监控
- `stopMonitoring()`: 停止监控
- `isMonitoring()`: 检查监控状态
- `trackObjectCreation(type, size?)`: 跟踪对象创建
- `trackObjectDestruction(type)`: 跟踪对象销毁
- `trackMemoryUsage(bytes)`: 跟踪内存使用
- `detectPotentialLeaks()`: 检测潜在泄漏
- `generateReport()`: 生成报告

### ReferenceTracker

引用跟踪器。

**方法：**
- `trackReference(obj, type?)`: 跟踪引用
- `releaseReference(id)`: 释放引用
- `isTracked(id)`: 检查是否被跟踪
- `findDanglingReferences()`: 查找悬垂引用
- `getReferenceCount()`: 获取引用数量
- `getStats()`: 获取统计信息

### managedLifecycle 装饰器

用于自动管理资源生命周期的装饰器。

**示例：**
```typescript
class DatabaseConnection {
  @managedLifecycle
  connect() {
    const connection = new Connection()
    return {
      connection,
      cleanup: () => connection.close()
    }
  }
  
  disconnect() {
    // 装饰器会自动调用清理函数
  }
}
```

### createManagedPromise<T>

创建可取消的托管 Promise。

**语法：**
```typescript
createManagedPromise<T>(
  executor: (resolve: (value: T) => void, reject: (error: Error) => void) => (() => void) | void
): ManagedPromise<T>
```

**ManagedPromise 接口：**
```typescript
interface ManagedPromise<T> {
  promise: Promise<T>
  cancel: () => void
  isCancelled: () => boolean
  onCancel: (callback: () => void) => void
}
```

**示例：**
```typescript
const managedPromise = createManagedPromise<string>((resolve, reject) => {
  const timer = setTimeout(() => resolve('完成'), 5000)
  
  // 返回清理函数
  return () => clearTimeout(timer)
})

// 监听取消事件
managedPromise.onCancel(() => {
  console.log('Promise 被取消')
})

// 在需要时取消
setTimeout(() => {
  if (!managedPromise.isCancelled()) {
    managedPromise.cancel()
  }
}, 2000)

try {
  const result = await managedPromise.promise
  console.log('结果:', result)
} catch (error) {
  if (error.message.includes('cancelled')) {
    console.log('操作被取消')
  }
}
```

## 类型定义

### 核心类型

```typescript
// 安全结果类型
interface SafeResult<T> {
  success: boolean
  data?: T
  error?: Error
}

// 性能测量类型
interface PerformanceMeasure {
  name: string
  startTime: number
  endTime: number
  duration: number
  metadata?: Record<string, any>
}

// 性能报告类型
interface PerformanceReport {
  totalMeasures: number
  uniqueOperations: number
  totalDuration: number
  averageDuration: number
  operationStats: Record<string, OperationStats>
  slowOperations: PerformanceMeasure[]
  metadataGroups: Record<string, GroupStats>
}
```

更多详细的类型定义，请参考源代码中的 TypeScript 声明文件。
