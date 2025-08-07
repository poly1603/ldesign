# 实现细节

## 核心引擎实现

### Engine 类实现

```typescript
class Engine implements IEngine {
  private _config: EngineConfig
  private _managers = new Map<string, Manager>()
  private _plugins = new Set<Plugin>()
  private _isInitialized = false
  private _isDestroyed = false

  constructor(config: EngineConfig) {
    this._config = this.normalizeConfig(config)
    this.initializeManagers()
  }

  // 管理器初始化
  private initializeManagers(): void {
    // 按依赖顺序初始化管理器
    const managerOrder = [
      'logger',
      'events',
      'state',
      'cache',
      'security',
      'performance',
      'notifications',
      'errors',
      'plugins',
      'middleware',
      'directives',
    ]

    managerOrder.forEach(name => {
      const ManagerClass = this.getManagerClass(name)
      const manager = new ManagerClass(this, this._config[name])
      this._managers.set(name, manager)
    })
  }

  // 插件使用
  use(plugin: Plugin): Engine {
    if (this._plugins.has(plugin)) {
      this.logger.warn(`Plugin ${plugin.name} already registered`)
      return this
    }

    // 检查依赖
    this.checkPluginDependencies(plugin)

    // 注册插件
    this._plugins.add(plugin)

    // 安装插件
    this.installPlugin(plugin)

    return this
  }

  // Vue 应用挂载
  mount(app: App): void {
    if (this._isInitialized) {
      throw new Error('Engine already mounted')
    }

    // 注册全局属性
    app.config.globalProperties.$engine = this

    // 提供依赖注入
    app.provide('engine', this)

    // 注册指令
    this.registerDirectives(app)

    // 触发挂载事件
    this.events.emit('engine:mounted', { app })

    this._isInitialized = true
  }
}
```

### 配置规范化

```typescript
class ConfigNormalizer {
  static normalize(config: EngineConfig): NormalizedConfig {
    const defaultConfig = this.getDefaultConfig()

    return {
      ...defaultConfig,
      ...config,
      // 深度合并嵌套配置
      state: { ...defaultConfig.state, ...config.state },
      events: { ...defaultConfig.events, ...config.events },
      cache: { ...defaultConfig.cache, ...config.cache },
      // ... 其他配置项
    }
  }

  private static getDefaultConfig(): DefaultConfig {
    return {
      config: {
        debug: false,
        logLevel: 'info',
        enablePerformanceMonitoring: true,
        enableErrorReporting: false,
      },
      state: {
        initialState: {},
        persistence: { enabled: false },
      },
      events: {
        maxListeners: 100,
        async: true,
      },
      cache: {
        maxSize: 1000,
        defaultTTL: 300000,
      },
    }
  }
}
```

## 插件系统实现

### 插件管理器

```typescript
class PluginManager implements IPluginManager {
  private plugins = new Map<string, Plugin>()
  private dependencyGraph = new DependencyGraph()
  private loadOrder: string[] = []

  async register(plugin: Plugin): Promise<void> {
    // 验证插件格式
    this.validatePlugin(plugin)

    // 检查名称冲突
    if (this.plugins.has(plugin.name)) {
      throw new PluginError(`Plugin ${plugin.name} already registered`)
    }

    // 添加到依赖图
    this.dependencyGraph.addNode(plugin.name, plugin.dependencies || [])

    // 解析加载顺序
    this.loadOrder = this.dependencyGraph.topologicalSort()

    // 注册插件
    this.plugins.set(plugin.name, plugin)

    // 安装插件
    await this.installPlugin(plugin)

    this.engine.events.emit('plugin:registered', { plugin })
  }

  private async installPlugin(plugin: Plugin): Promise<void> {
    try {
      const startTime = performance.now()

      // 执行安装
      await plugin.install(this.engine)

      const duration = performance.now() - startTime

      this.engine.events.emit('plugin:installed', {
        plugin,
        duration,
      })
    } catch (error) {
      this.engine.events.emit('plugin:error', {
        plugin,
        error,
        phase: 'install',
      })
      throw error
    }
  }
}
```

### 依赖解析算法

```typescript
class DependencyGraph {
  private nodes = new Map<string, string[]>()
  private visited = new Set<string>()
  private visiting = new Set<string>()

  addNode(name: string, dependencies: string[]): void {
    this.nodes.set(name, dependencies)
  }

  topologicalSort(): string[] {
    const result: string[] = []
    this.visited.clear()
    this.visiting.clear()

    for (const [name] of this.nodes) {
      if (!this.visited.has(name)) {
        this.dfs(name, result)
      }
    }

    return result.reverse()
  }

  private dfs(name: string, result: string[]): void {
    if (this.visiting.has(name)) {
      throw new Error(`Circular dependency detected: ${name}`)
    }

    if (this.visited.has(name)) {
      return
    }

    this.visiting.add(name)

    const dependencies = this.nodes.get(name) || []
    for (const dep of dependencies) {
      if (!this.nodes.has(dep)) {
        throw new Error(`Dependency not found: ${dep}`)
      }
      this.dfs(dep, result)
    }

    this.visiting.delete(name)
    this.visited.add(name)
    result.push(name)
  }
}
```

## 中间件系统实现

### 中间件管理器

```typescript
class MiddlewareManager implements IMiddlewareManager {
  private middlewares: Middleware[] = []
  private pipeline: MiddlewarePipeline

  constructor(private engine: Engine) {
    this.pipeline = new MiddlewarePipeline()
  }

  use(middleware: Middleware): void {
    // 验证中间件
    this.validateMiddleware(middleware)

    // 插入到正确位置（按优先级排序）
    this.insertMiddleware(middleware)

    // 重建管道
    this.pipeline.rebuild(this.middlewares)

    this.engine.events.emit('middleware:registered', { middleware })
  }

  private insertMiddleware(middleware: Middleware): void {
    const priority = middleware.priority || 0
    let insertIndex = this.middlewares.length

    // 找到插入位置
    for (let i = 0; i < this.middlewares.length; i++) {
      const currentPriority = this.middlewares[i].priority || 0
      if (priority > currentPriority) {
        insertIndex = i
        break
      }
    }

    this.middlewares.splice(insertIndex, 0, middleware)
  }

  async execute(phase: string, context: any): Promise<void> {
    const middlewareContext: MiddlewareContext = {
      engine: this.engine,
      phase,
      data: context,
    }

    await this.pipeline.execute(middlewareContext)
  }
}
```

### 中间件管道

```typescript
class MiddlewarePipeline {
  private middlewares: Middleware[] = []

  rebuild(middlewares: Middleware[]): void {
    this.middlewares = [...middlewares]
  }

  async execute(context: MiddlewareContext): Promise<void> {
    let index = 0

    const next = async (): Promise<void> => {
      if (index >= this.middlewares.length) return

      const middleware = this.middlewares[index++]

      try {
        await middleware.handler(context, next)
      } catch (error) {
        // 中间件错误处理
        context.engine.events.emit('middleware:error', {
          middleware,
          error,
          context,
        })
        throw error
      }
    }

    await next()
  }
}
```

## 事件系统实现

### 事件管理器

```typescript
class EventManager implements IEventManager {
  private listeners = new Map<string, EventListener[]>()
  private maxListeners = 100
  private eventQueue: EventQueueItem[] = []
  private processing = false

  on(event: string, handler: Function, priority = 0): () => void {
    const listener: EventListener = {
      handler,
      priority,
      once: false,
      id: generateId(),
    }

    this.addListener(event, listener)

    // 返回取消订阅函数
    return () => this.removeListener(event, listener.id)
  }

  emit(event: string, data?: any): void {
    const eventItem: EventQueueItem = {
      event,
      data,
      timestamp: Date.now(),
    }

    if (this.isAsync) {
      this.eventQueue.push(eventItem)
      this.processQueue()
    } else {
      this.processEvent(eventItem)
    }
  }

  private addListener(event: string, listener: EventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }

    const listeners = this.listeners.get(event)!

    // 检查监听器数量限制
    if (listeners.length >= this.maxListeners) {
      console.warn(`Max listeners (${this.maxListeners}) exceeded for event: ${event}`)
    }

    // 按优先级插入
    this.insertByPriority(listeners, listener)
  }

  private async processEvent(eventItem: EventQueueItem): Promise<void> {
    const { event, data } = eventItem
    const listeners = this.getMatchingListeners(event)

    for (const listener of listeners) {
      try {
        await listener.handler(data)

        // 一次性监听器处理
        if (listener.once) {
          this.removeListener(event, listener.id)
        }
      } catch (error) {
        this.engine.errors.capture(error, {
          event,
          listener: listener.id,
        })
      }
    }
  }

  private getMatchingListeners(event: string): EventListener[] {
    const listeners: EventListener[] = []

    // 精确匹配
    if (this.listeners.has(event)) {
      listeners.push(...this.listeners.get(event)!)
    }

    // 通配符匹配
    for (const [pattern, patternListeners] of this.listeners) {
      if (pattern.includes('*') && this.matchPattern(event, pattern)) {
        listeners.push(...patternListeners)
      }
    }

    return listeners.sort((a, b) => b.priority - a.priority)
  }
}
```

### 事件队列处理

```typescript
class EventQueue {
  private queue: EventQueueItem[] = []
  private processing = false
  private batchSize = 10

  async processQueue(): Promise<void> {
    if (this.processing) return

    this.processing = true

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize)

      await Promise.all(batch.map(item => this.processEvent(item)))

      // 让出控制权，避免阻塞主线程
      await this.nextTick()
    }

    this.processing = false
  }

  private nextTick(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0))
  }
}
```

## 状态管理实现

### 响应式状态存储

```typescript
class ReactiveStateStore implements IStateStore {
  private state: Record<string, any>
  private watchers = new Map<string, StateWatcher[]>()
  private history: StateSnapshot[] = []
  private maxHistorySize = 50

  constructor(initialState: Record<string, any> = {}) {
    this.state = reactive(initialState)
  }

  set(key: string, value: any): void {
    const oldValue = this.get(key)

    // 创建快照
    this.createSnapshot(key, oldValue, value)

    // 设置值
    this.setNestedValue(this.state, key, value)

    // 通知观察者
    this.notifyWatchers(key, value, oldValue)

    // 触发事件
    this.engine.events.emit('state:changed', { key, value, oldValue })
  }

  get(key: string): any {
    return this.getNestedValue(this.state, key)
  }

  subscribe(key: string, callback: StateCallback): () => void {
    const watcher: StateWatcher = {
      callback,
      id: generateId(),
    }

    if (!this.watchers.has(key)) {
      this.watchers.set(key, [])
    }

    this.watchers.get(key)!.push(watcher)

    // 返回取消订阅函数
    return () => this.unsubscribe(key, watcher.id)
  }

  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    current[keys[keys.length - 1]] = value
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key]
    }, obj)
  }
}
```

### 状态持久化

```typescript
class StatePersistence {
  private storage: Storage
  private prefix: string
  private keys: string[]

  constructor(config: PersistenceConfig) {
    this.storage = this.getStorage(config.storage)
    this.prefix = config.prefix || 'engine:'
    this.keys = config.keys || []
  }

  save(key: string, value: any): void {
    if (!this.shouldPersist(key)) return

    try {
      const serialized = this.serialize(value)
      const storageKey = this.getStorageKey(key)
      this.storage.setItem(storageKey, serialized)
    } catch (error) {
      console.warn('Failed to persist state:', error)
    }
  }

  load(key: string): any {
    if (!this.shouldPersist(key)) return undefined

    try {
      const storageKey = this.getStorageKey(key)
      const serialized = this.storage.getItem(storageKey)

      if (serialized === null) return undefined

      return this.deserialize(serialized)
    } catch (error) {
      console.warn('Failed to load persisted state:', error)
      return undefined
    }
  }

  private serialize(value: any): string {
    return JSON.stringify(value)
  }

  private deserialize(serialized: string): any {
    return JSON.parse(serialized)
  }

  private shouldPersist(key: string): boolean {
    if (this.keys.length === 0) return true
    return this.keys.some(pattern => this.matchKey(key, pattern))
  }

  private matchKey(key: string, pattern: string): boolean {
    if (pattern === '*') return true
    if (pattern.endsWith('*')) {
      return key.startsWith(pattern.slice(0, -1))
    }
    return key === pattern
  }
}
```

## 缓存系统实现

### LRU 缓存实现

```typescript
class LRUCache<T = any> implements ICache<T> {
  private cache = new Map<string, CacheNode<T>>()
  private head: CacheNode<T>
  private tail: CacheNode<T>
  private maxSize: number

  constructor(maxSize = 1000) {
    this.maxSize = maxSize

    // 创建哨兵节点
    this.head = { key: '', value: undefined as any, prev: null, next: null }
    this.tail = { key: '', value: undefined as any, prev: null, next: null }

    this.head.next = this.tail
    this.tail.prev = this.head
  }

  set(key: string, value: T, ttl?: number): void {
    const existing = this.cache.get(key)

    if (existing) {
      // 更新现有节点
      existing.value = value
      existing.ttl = ttl ? Date.now() + ttl : undefined
      this.moveToHead(existing)
    } else {
      // 创建新节点
      const node: CacheNode<T> = {
        key,
        value,
        ttl: ttl ? Date.now() + ttl : undefined,
        prev: null,
        next: null,
      }

      this.cache.set(key, node)
      this.addToHead(node)

      // 检查容量限制
      if (this.cache.size > this.maxSize) {
        this.removeTail()
      }
    }
  }

  get(key: string): T | undefined {
    const node = this.cache.get(key)

    if (!node) return undefined

    // 检查过期
    if (node.ttl && Date.now() > node.ttl) {
      this.delete(key)
      return undefined
    }

    // 移动到头部（最近使用）
    this.moveToHead(node)

    return node.value
  }

  delete(key: string): boolean {
    const node = this.cache.get(key)

    if (!node) return false

    this.removeNode(node)
    this.cache.delete(key)

    return true
  }

  private addToHead(node: CacheNode<T>): void {
    node.prev = this.head
    node.next = this.head.next

    this.head.next!.prev = node
    this.head.next = node
  }

  private removeNode(node: CacheNode<T>): void {
    node.prev!.next = node.next
    node.next!.prev = node.prev
  }

  private moveToHead(node: CacheNode<T>): void {
    this.removeNode(node)
    this.addToHead(node)
  }

  private removeTail(): void {
    const last = this.tail.prev!
    this.removeNode(last)
    this.cache.delete(last.key)
  }
}
```

## 性能监控实现

### 性能指标收集器

```typescript
class PerformanceCollector {
  private metrics = new Map<string, PerformanceMetric>()
  private observers: PerformanceObserver[] = []

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers(): void {
    // 观察导航性能
    if ('PerformanceObserver' in window) {
      const navigationObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          this.processNavigationEntry(entry as PerformanceNavigationTiming)
        }
      })

      navigationObserver.observe({ entryTypes: ['navigation'] })
      this.observers.push(navigationObserver)
    }

    // 观察资源加载性能
    const resourceObserver = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        this.processResourceEntry(entry as PerformanceResourceTiming)
      }
    })

    resourceObserver.observe({ entryTypes: ['resource'] })
    this.observers.push(resourceObserver)
  }

  mark(name: string): void {
    performance.mark(name)

    this.metrics.set(name, {
      type: 'mark',
      timestamp: performance.now(),
      name,
    })
  }

  measure(name: string, start: string, end: string): number {
    performance.measure(name, start, end)

    const entry = performance.getEntriesByName(name, 'measure')[0]
    const duration = entry.duration

    this.metrics.set(name, {
      type: 'measure',
      duration,
      name,
      startTime: entry.startTime,
    })

    return duration
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
  }

  private processNavigationEntry(entry: PerformanceNavigationTiming): void {
    const metrics = {
      'navigation.domContentLoaded':
        entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      'navigation.load': entry.loadEventEnd - entry.loadEventStart,
      'navigation.firstPaint': this.getFirstPaint(),
      'navigation.firstContentfulPaint': this.getFirstContentfulPaint(),
    }

    Object.entries(metrics).forEach(([name, value]) => {
      if (value > 0) {
        this.metrics.set(name, {
          type: 'navigation',
          duration: value,
          name,
        })
      }
    })
  }

  private getFirstPaint(): number {
    const paintEntries = performance.getEntriesByType('paint')
    const fpEntry = paintEntries.find(entry => entry.name === 'first-paint')
    return fpEntry ? fpEntry.startTime : 0
  }

  private getFirstContentfulPaint(): number {
    const paintEntries = performance.getEntriesByType('paint')
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint')
    return fcpEntry ? fcpEntry.startTime : 0
  }
}
```

这些实现细节展示了 LDesign Engine 的核心技术实现，包括插件系统的依赖解析、中间件的管道处理、事件系统
的异步处理、状态管理的响应式实现、缓存系统的 LRU 算法以及性能监控的指标收集等关键技术点。
