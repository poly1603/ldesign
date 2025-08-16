# 高级示例

这里展示了 @ldesign/store 的高级使用技巧，包括插件开发、自定义装饰器、复杂状态管理模式等。

## 插件开发

### 状态持久化插件

创建一个高级的状态持久化插件：

```typescript
// plugins/advanced-persist.ts
import { Store, StorePlugin } from '@ldesign/store'

interface AdvancedPersistOptions {
  key?: string
  storage?: Storage
  include?: string[]
  exclude?: string[]
  encrypt?: boolean
  compress?: boolean
  version?: number
  migrations?: Record<number, (data: any) => any>
  debounceTime?: number
  maxRetries?: number
}

export class AdvancedPersistPlugin implements StorePlugin {
  name = 'advanced-persist'
  private options: AdvancedPersistOptions
  private saveTimers = new Map<string, NodeJS.Timeout>()

  constructor(options: AdvancedPersistOptions = {}) {
    this.options = {
      storage: localStorage,
      debounceTime: 1000,
      maxRetries: 3,
      version: 1,
      ...options,
    }
  }

  install(store: Store) {
    const key = this.options.key || `store-${store.$id}`

    // 恢复状态
    this.restoreState(store, key)

    // 监听状态变化并保存
    store.$subscribe((mutation, state) => {
      this.debouncedSave(store, key, state)
    })

    // 添加手动保存方法
    ;(store as any).saveState = () => this.saveState(store, key, store.$state.value)
    ;(store as any).clearPersistedState = () => this.clearState(key)
  }

  private async restoreState(store: Store, key: string) {
    try {
      const stored = this.options.storage?.getItem(key)
      if (!stored) return

      let data = JSON.parse(stored)

      // 解密
      if (this.options.encrypt) {
        data = await this.decrypt(data)
      }

      // 解压缩
      if (this.options.compress) {
        data = await this.decompress(data)
      }

      // 版本迁移
      if (data.version !== this.options.version) {
        data = this.migrateData(data)
      }

      // 过滤字段
      const filteredData = this.filterData(data.state, 'restore')

      store.$hydrate(filteredData)
    } catch (error) {
      console.error('恢复状态失败:', error)
    }
  }

  private debouncedSave(store: Store, key: string, state: any) {
    // 清除之前的定时器
    const existingTimer = this.saveTimers.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // 设置新的定时器
    const timer = setTimeout(() => {
      this.saveState(store, key, state)
      this.saveTimers.delete(key)
    }, this.options.debounceTime)

    this.saveTimers.set(key, timer)
  }

  private async saveState(store: Store, key: string, state: any, retryCount = 0) {
    try {
      // 过滤字段
      const filteredState = this.filterData(state, 'save')

      let data = {
        state: filteredState,
        version: this.options.version,
        timestamp: Date.now(),
      }

      // 压缩
      if (this.options.compress) {
        data = await this.compress(data)
      }

      // 加密
      if (this.options.encrypt) {
        data = await this.encrypt(data)
      }

      this.options.storage?.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('保存状态失败:', error)

      // 重试机制
      if (retryCount < this.options.maxRetries!) {
        setTimeout(() => {
          this.saveState(store, key, state, retryCount + 1)
        }, 2 ** retryCount * 1000)
      }
    }
  }

  private filterData(data: any, operation: 'save' | 'restore'): any {
    if (!data || typeof data !== 'object') return data

    const { include, exclude } = this.options
    const result = { ...data }

    if (include && include.length > 0) {
      // 只包含指定字段
      const filtered = {}
      include.forEach(key => {
        if (key in result) {
          filtered[key] = result[key]
        }
      })
      return filtered
    }

    if (exclude && exclude.length > 0) {
      // 排除指定字段
      exclude.forEach(key => {
        delete result[key]
      })
    }

    return result
  }

  private migrateData(data: any): any {
    const { migrations } = this.options
    if (!migrations) return data

    let currentVersion = data.version || 1
    const targetVersion = this.options.version!

    while (currentVersion < targetVersion) {
      const migration = migrations[currentVersion + 1]
      if (migration) {
        data.state = migration(data.state)
        currentVersion++
      } else {
        break
      }
    }

    data.version = currentVersion
    return data
  }

  private async encrypt(data: any): Promise<any> {
    // 简化的加密实现
    const text = JSON.stringify(data)
    const encoded = btoa(text)
    return { encrypted: encoded }
  }

  private async decrypt(data: any): Promise<any> {
    // 简化的解密实现
    const decoded = atob(data.encrypted)
    return JSON.parse(decoded)
  }

  private async compress(data: any): Promise<any> {
    // 简化的压缩实现（实际项目中可以使用 LZ-string 等库）
    const text = JSON.stringify(data)
    return { compressed: text }
  }

  private async decompress(data: any): Promise<any> {
    // 简化的解压缩实现
    return JSON.parse(data.compressed)
  }

  private clearState(key: string) {
    this.options.storage?.removeItem(key)
  }
}

// 使用插件
const persistPlugin = new AdvancedPersistPlugin({
  encrypt: true,
  compress: true,
  exclude: ['temporaryData', 'cache'],
  version: 2,
  migrations: {
    2: data => {
      // 从版本 1 迁移到版本 2
      return {
        ...data,
        newField: 'default value',
      }
    },
  },
})

class MyStore extends BaseStore {
  constructor(id: string) {
    super(id, {
      plugins: [persistPlugin],
    })
  }
}
```

### 性能监控插件

```typescript
// plugins/performance-monitor.ts
export class PerformanceMonitorPlugin implements StorePlugin {
  name = 'performance-monitor'
  private metrics = new Map<string, PerformanceMetric[]>()
  private options: PerformanceOptions

  constructor(options: PerformanceOptions = {}) {
    this.options = {
      maxMetrics: 1000,
      enableActionTiming: true,
      enableStateDiff: true,
      enableMemoryTracking: true,
      ...options,
    }
  }

  install(store: Store) {
    if (this.options.enableActionTiming) {
      this.setupActionTiming(store)
    }

    if (this.options.enableStateDiff) {
      this.setupStateDiffTracking(store)
    }

    if (this.options.enableMemoryTracking) {
      this.setupMemoryTracking(store)
    }

    // 添加性能报告方法
    ;(store as any).getPerformanceReport = () => this.generateReport(store.$id)
    ;(store as any).clearPerformanceMetrics = () => this.clearMetrics(store.$id)
  }

  private setupActionTiming(store: Store) {
    store.$onAction(({ name, args, after, onError }) => {
      const startTime = performance.now()
      const startMemory = this.getMemoryUsage()

      after(() => {
        const endTime = performance.now()
        const endMemory = this.getMemoryUsage()

        this.addMetric(store.$id, {
          type: 'action',
          name,
          duration: endTime - startTime,
          memoryDelta: endMemory - startMemory,
          timestamp: Date.now(),
          args: this.serializeArgs(args),
        })
      })

      onError(error => {
        const endTime = performance.now()

        this.addMetric(store.$id, {
          type: 'action-error',
          name,
          duration: endTime - startTime,
          error: error.message,
          timestamp: Date.now(),
          args: this.serializeArgs(args),
        })
      })
    })
  }

  private setupStateDiffTracking(store: Store) {
    let previousState = this.deepClone(store.$state.value)

    store.$subscribe((mutation, state) => {
      const diff = this.calculateStateDiff(previousState, state)

      if (Object.keys(diff.changed).length > 0) {
        this.addMetric(store.$id, {
          type: 'state-change',
          name: mutation.type,
          diff,
          timestamp: Date.now(),
          stateSize: this.calculateStateSize(state),
        })
      }

      previousState = this.deepClone(state)
    })
  }

  private setupMemoryTracking(store: Store) {
    setInterval(() => {
      const memoryUsage = this.getMemoryUsage()

      this.addMetric(store.$id, {
        type: 'memory-snapshot',
        name: 'memory-usage',
        memoryUsage,
        timestamp: Date.now(),
      })
    }, 10000) // 每 10 秒记录一次
  }

  private addMetric(storeId: string, metric: PerformanceMetric) {
    if (!this.metrics.has(storeId)) {
      this.metrics.set(storeId, [])
    }

    const storeMetrics = this.metrics.get(storeId)!
    storeMetrics.push(metric)

    // 限制指标数量
    if (storeMetrics.length > this.options.maxMetrics!) {
      storeMetrics.shift()
    }
  }

  private generateReport(storeId: string): PerformanceReport {
    const metrics = this.metrics.get(storeId) || []

    const actionMetrics = metrics.filter(m => m.type === 'action')
    const stateChangeMetrics = metrics.filter(m => m.type === 'state-change')
    const memoryMetrics = metrics.filter(m => m.type === 'memory-snapshot')

    return {
      storeId,
      totalMetrics: metrics.length,
      timeRange: {
        start: Math.min(...metrics.map(m => m.timestamp)),
        end: Math.max(...metrics.map(m => m.timestamp)),
      },
      actions: this.analyzeActionMetrics(actionMetrics),
      stateChanges: this.analyzeStateChangeMetrics(stateChangeMetrics),
      memory: this.analyzeMemoryMetrics(memoryMetrics),
    }
  }

  private analyzeActionMetrics(metrics: PerformanceMetric[]) {
    const actionGroups = metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = []
      }
      acc[metric.name].push(metric)
      return acc
    }, {} as Record<string, PerformanceMetric[]>)

    return Object.entries(actionGroups).map(([name, actionMetrics]) => {
      const durations = actionMetrics.map(m => m.duration!).filter(d => d !== undefined)

      return {
        name,
        count: actionMetrics.length,
        avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        totalDuration: durations.reduce((sum, d) => sum + d, 0),
      }
    })
  }

  private analyzeStateChangeMetrics(metrics: PerformanceMetric[]) {
    return {
      totalChanges: metrics.length,
      avgStateSize: metrics.reduce((sum, m) => sum + (m.stateSize || 0), 0) / metrics.length,
      mostChangedFields: this.getMostChangedFields(metrics),
    }
  }

  private analyzeMemoryMetrics(metrics: PerformanceMetric[]) {
    const memoryUsages = metrics.map(m => m.memoryUsage!).filter(m => m !== undefined)

    return {
      avgMemoryUsage: memoryUsages.reduce((sum, m) => sum + m, 0) / memoryUsages.length,
      minMemoryUsage: Math.min(...memoryUsages),
      maxMemoryUsage: Math.max(...memoryUsages),
      memoryTrend: this.calculateMemoryTrend(memoryUsages),
    }
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize
    }
    return 0
  }

  private calculateStateSize(state: any): number {
    return JSON.stringify(state).length
  }

  private calculateStateDiff(oldState: any, newState: any) {
    const changed = {}
    const added = {}
    const removed = {}

    // 简化的 diff 实现
    for (const key in newState) {
      if (!(key in oldState)) {
        added[key] = newState[key]
      } else if (oldState[key] !== newState[key]) {
        changed[key] = {
          from: oldState[key],
          to: newState[key],
        }
      }
    }

    for (const key in oldState) {
      if (!(key in newState)) {
        removed[key] = oldState[key]
      }
    }

    return { changed, added, removed }
  }

  private deepClone(obj: any): any {
    return JSON.parse(JSON.stringify(obj))
  }

  private serializeArgs(args: any[]): any {
    return args.map(arg => {
      if (typeof arg === 'function') return '[Function]'
      if (arg instanceof Error) return arg.message
      return arg
    })
  }

  private getMostChangedFields(
    metrics: PerformanceMetric[]
  ): Array<{ field: string; count: number }> {
    const fieldCounts = {}

    metrics.forEach(metric => {
      if (metric.diff) {
        Object.keys(metric.diff.changed).forEach(field => {
          fieldCounts[field] = (fieldCounts[field] || 0) + 1
        })
      }
    })

    return Object.entries(fieldCounts)
      .map(([field, count]) => ({ field, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }

  private calculateMemoryTrend(memoryUsages: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (memoryUsages.length < 2) return 'stable'

    const first = memoryUsages[0]
    const last = memoryUsages[memoryUsages.length - 1]
    const threshold = first * 0.1 // 10% 阈值

    if (last > first + threshold) return 'increasing'
    if (last < first - threshold) return 'decreasing'
    return 'stable'
  }

  private clearMetrics(storeId: string) {
    this.metrics.delete(storeId)
  }
}

interface PerformanceOptions {
  maxMetrics?: number
  enableActionTiming?: boolean
  enableStateDiff?: boolean
  enableMemoryTracking?: boolean
}

interface PerformanceMetric {
  type: 'action' | 'action-error' | 'state-change' | 'memory-snapshot'
  name: string
  timestamp: number
  duration?: number
  memoryDelta?: number
  memoryUsage?: number
  error?: string
  args?: any
  diff?: any
  stateSize?: number
}

interface PerformanceReport {
  storeId: string
  totalMetrics: number
  timeRange: { start: number; end: number }
  actions: any[]
  stateChanges: any
  memory: any
}
```

## 自定义装饰器

### 权限控制装饰器

```typescript
// decorators/permission.ts
import { AuthStore } from '@/stores/auth'

export function RequirePermission(permission: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const authStore = new AuthStore('auth')

      if (!authStore.hasPermission(permission)) {
        throw new Error(`权限不足: 需要 ${permission} 权限`)
      }

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

export function RequireRole(role: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const authStore = new AuthStore('auth')

      if (!authStore.hasRole(role)) {
        throw new Error(`权限不足: 需要 ${role} 角色`)
      }

      return originalMethod.apply(this, args)
    }

    return descriptor
  }
}

// 使用示例
class AdminStore extends BaseStore {
  @RequirePermission('user:create')
  @AsyncAction()
  async createUser(userData: any) {
    return await userApi.createUser(userData)
  }

  @RequireRole('admin')
  @AsyncAction()
  async deleteUser(userId: string) {
    return await userApi.deleteUser(userId)
  }
}
```

### 日志装饰器

```typescript
// decorators/logging.ts
export function LogExecution(options: LogOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const className = target.constructor.name

    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now()
      const logContext = {
        class: className,
        method: propertyKey,
        args: options.logArgs ? args : '[hidden]',
        timestamp: new Date().toISOString(),
      }

      if (options.logBefore) {
        console.log(`[${className}] 开始执行 ${propertyKey}:`, logContext)
      }

      try {
        const result = await originalMethod.apply(this, args)
        const duration = performance.now() - startTime

        if (options.logAfter) {
          console.log(`[${className}] ${propertyKey} 执行成功 (${duration.toFixed(2)}ms):`, {
            ...logContext,
            duration,
            result: options.logResult ? result : '[hidden]',
          })
        }

        return result
      } catch (error) {
        const duration = performance.now() - startTime

        if (options.logError) {
          console.error(`[${className}] ${propertyKey} 执行失败 (${duration.toFixed(2)}ms):`, {
            ...logContext,
            duration,
            error: error instanceof Error ? error.message : error,
          })
        }

        throw error
      }
    }

    return descriptor
  }
}

interface LogOptions {
  logBefore?: boolean
  logAfter?: boolean
  logError?: boolean
  logArgs?: boolean
  logResult?: boolean
}

// 使用示例
class UserStore extends BaseStore {
  @LogExecution({
    logBefore: true,
    logAfter: true,
    logError: true,
    logArgs: false,
    logResult: false,
  })
  @AsyncAction()
  async fetchUsers() {
    return await userApi.getUsers()
  }
}
```

### 重试装饰器

```typescript
// decorators/retry.ts
export function Retry(options: RetryOptions = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const {
      maxAttempts = 3,
      delay = 1000,
      backoff = 'exponential',
      retryCondition = error => true,
    } = options

    descriptor.value = async function (...args: any[]) {
      let lastError: Error

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await originalMethod.apply(this, args)
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error))

          if (attempt === maxAttempts || !retryCondition(lastError)) {
            throw lastError
          }

          const waitTime = calculateDelay(delay, attempt, backoff)
          console.warn(
            `[Retry] ${propertyKey} 第 ${attempt} 次尝试失败，${waitTime}ms 后重试:`,
            lastError.message
          )

          await new Promise(resolve => setTimeout(resolve, waitTime))
        }
      }

      throw lastError!
    }

    return descriptor
  }
}

function calculateDelay(
  baseDelay: number,
  attempt: number,
  backoff: 'linear' | 'exponential'
): number {
  switch (backoff) {
    case 'linear':
      return baseDelay * attempt
    case 'exponential':
      return baseDelay * 2 ** (attempt - 1)
    default:
      return baseDelay
  }
}

interface RetryOptions {
  maxAttempts?: number
  delay?: number
  backoff?: 'linear' | 'exponential'
  retryCondition?: (error: Error) => boolean
}

// 使用示例
class ApiStore extends BaseStore {
  @Retry({
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential',
    retryCondition: error => error.message.includes('network'),
  })
  @AsyncAction()
  async fetchData() {
    return await api.getData()
  }
}
```

## 复杂状态管理模式

### 状态机模式

```typescript
// stores/state-machine.ts
export class StateMachineStore extends BaseStore {
  @State({ default: 'idle' })
  currentState: string = 'idle'

  @State({ default: {} })
  context: Record<string, any> = {}

  @State({ default: [] })
  history: StateTransition[] = []

  private stateMachine: StateMachine

  constructor(id: string, config: StateMachineConfig) {
    super(id)
    this.stateMachine = new StateMachine(config)
  }

  @Action()
  transition(event: string, payload?: any) {
    const currentStateConfig = this.stateMachine.getState(this.currentState)
    const transition = currentStateConfig.transitions[event]

    if (!transition) {
      throw new Error(`无效的状态转换: ${this.currentState} -> ${event}`)
    }

    // 检查转换条件
    if (transition.guard && !transition.guard(this.context, payload)) {
      throw new Error(`状态转换条件不满足: ${this.currentState} -> ${event}`)
    }

    const previousState = this.currentState
    const nextState = transition.target

    // 执行退出动作
    if (currentStateConfig.onExit) {
      currentStateConfig.onExit(this.context, payload)
    }

    // 执行转换动作
    if (transition.action) {
      transition.action(this.context, payload)
    }

    // 更新状态
    this.currentState = nextState

    // 执行进入动作
    const nextStateConfig = this.stateMachine.getState(nextState)
    if (nextStateConfig.onEntry) {
      nextStateConfig.onEntry(this.context, payload)
    }

    // 记录历史
    this.history.push({
      from: previousState,
      to: nextState,
      event,
      payload,
      timestamp: Date.now(),
    })

    // 限制历史记录数量
    if (this.history.length > 100) {
      this.history.shift()
    }
  }

  @Getter()
  get availableTransitions() {
    const currentStateConfig = this.stateMachine.getState(this.currentState)
    return Object.keys(currentStateConfig.transitions)
  }

  @Getter()
  get canTransition() {
    return (event: string) => {
      const currentStateConfig = this.stateMachine.getState(this.currentState)
      const transition = currentStateConfig.transitions[event]

      if (!transition) return false
      if (!transition.guard) return true

      return transition.guard(this.context)
    }
  }

  @Action()
  updateContext(updates: Record<string, any>) {
    this.context = { ...this.context, ...updates }
  }

  @Action()
  resetToInitialState() {
    this.currentState = this.stateMachine.initialState
    this.context = {}
    this.history = []
  }
}

class StateMachine {
  public initialState: string
  private states: Record<string, StateConfig>

  constructor(config: StateMachineConfig) {
    this.initialState = config.initialState
    this.states = config.states
  }

  getState(stateName: string): StateConfig {
    const state = this.states[stateName]
    if (!state) {
      throw new Error(`未知状态: ${stateName}`)
    }
    return state
  }
}

interface StateMachineConfig {
  initialState: string
  states: Record<string, StateConfig>
}

interface StateConfig {
  transitions: Record<string, Transition>
  onEntry?: (context: any, payload?: any) => void
  onExit?: (context: any, payload?: any) => void
}

interface Transition {
  target: string
  action?: (context: any, payload?: any) => void
  guard?: (context: any, payload?: any) => boolean
}

interface StateTransition {
  from: string
  to: string
  event: string
  payload?: any
  timestamp: number
}

// 使用示例：订单状态机
const orderStateMachine = {
  initialState: 'pending',
  states: {
    pending: {
      transitions: {
        pay: {
          target: 'paid',
          action: (context, payload) => {
            context.paymentId = payload.paymentId
            context.paidAt = Date.now()
          },
        },
        cancel: {
          target: 'cancelled',
          guard: context => !context.paymentId,
        },
      },
    },
    paid: {
      transitions: {
        ship: {
          target: 'shipped',
          action: (context, payload) => {
            context.trackingNumber = payload.trackingNumber
            context.shippedAt = Date.now()
          },
        },
        refund: {
          target: 'refunded',
          guard: context => Date.now() - context.paidAt < 24 * 60 * 60 * 1000, // 24小时内
        },
      },
    },
    shipped: {
      transitions: {
        deliver: {
          target: 'delivered',
          action: context => {
            context.deliveredAt = Date.now()
          },
        },
      },
    },
    delivered: {
      transitions: {},
    },
    cancelled: {
      transitions: {},
    },
    refunded: {
      transitions: {},
    },
  },
}

class OrderStore extends StateMachineStore {
  constructor() {
    super('order', orderStateMachine)
  }

  @AsyncAction()
  async processPayment(paymentData: any) {
    try {
      const result = await paymentApi.process(paymentData)
      this.transition('pay', { paymentId: result.id })
      return result
    } catch (error) {
      throw new Error('支付失败')
    }
  }

  @AsyncAction()
  async shipOrder(shippingData: any) {
    try {
      const result = await shippingApi.ship(shippingData)
      this.transition('ship', { trackingNumber: result.trackingNumber })
      return result
    } catch (error) {
      throw new Error('发货失败')
    }
  }
}
```

## 事件驱动架构

### 事件总线集成

```typescript
// stores/event-driven.ts
export class EventDrivenStore extends BaseStore {
  private eventBus: EventBus
  private eventHandlers = new Map<string, Function[]>()

  constructor(id: string, eventBus: EventBus) {
    super(id)
    this.eventBus = eventBus
    this.setupEventHandlers()
  }

  protected setupEventHandlers() {
    // 子类重写此方法来设置事件处理器
  }

  protected on<T>(event: string, handler: (data: T) => void) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }

    this.eventHandlers.get(event)!.push(handler)
    return this.eventBus.on(event, handler)
  }

  protected emit<T>(event: string, data?: T) {
    this.eventBus.emit(event, data)
  }

  protected once<T>(event: string, handler: (data: T) => void) {
    return this.eventBus.once(event, handler)
  }

  $dispose() {
    // 清理事件监听器
    this.eventHandlers.clear()
    super.$dispose()
  }
}

// 用户 Store
class UserEventStore extends EventDrivenStore {
  @State({ default: null })
  currentUser: User | null = null

  @State({ default: [] })
  users: User[] = []

  protected setupEventHandlers() {
    this.on('user:created', this.handleUserCreated.bind(this))
    this.on('user:updated', this.handleUserUpdated.bind(this))
    this.on('user:deleted', this.handleUserDeleted.bind(this))
    this.on('user:login', this.handleUserLogin.bind(this))
    this.on('user:logout', this.handleUserLogout.bind(this))
  }

  @AsyncAction()
  async createUser(userData: any) {
    const user = await userApi.createUser(userData)
    this.emit('user:created', user)
    return user
  }

  @AsyncAction()
  async updateUser(id: string, updates: any) {
    const user = await userApi.updateUser(id, updates)
    this.emit('user:updated', { user, updates })
    return user
  }

  @AsyncAction()
  async deleteUser(id: string) {
    await userApi.deleteUser(id)
    this.emit('user:deleted', { id })
  }

  @AsyncAction()
  async login(credentials: any) {
    const user = await authApi.login(credentials)
    this.emit('user:login', user)
    return user
  }

  @Action()
  logout() {
    const user = this.currentUser
    this.currentUser = null
    this.emit('user:logout', user)
  }

  private handleUserCreated(user: User) {
    this.users.push(user)
  }

  private handleUserUpdated({ user, updates }: { user: User; updates: any }) {
    const index = this.users.findIndex(u => u.id === user.id)
    if (index > -1) {
      this.users[index] = user
    }

    if (this.currentUser?.id === user.id) {
      this.currentUser = user
    }
  }

  private handleUserDeleted({ id }: { id: string }) {
    const index = this.users.findIndex(u => u.id === id)
    if (index > -1) {
      this.users.splice(index, 1)
    }

    if (this.currentUser?.id === id) {
      this.currentUser = null
    }
  }

  private handleUserLogin(user: User) {
    this.currentUser = user
  }

  private handleUserLogout(user: User | null) {
    // 可以在这里处理登出后的清理工作
    console.log('用户已登出:', user?.name)
  }
}

// 通知 Store
class NotificationEventStore extends EventDrivenStore {
  @State({ default: [] })
  notifications: Notification[] = []

  protected setupEventHandlers() {
    this.on('user:created', this.handleUserCreated.bind(this))
    this.on('user:login', this.handleUserLogin.bind(this))
    this.on('order:created', this.handleOrderCreated.bind(this))
  }

  private handleUserCreated(user: User) {
    this.addNotification({
      type: 'success',
      title: '用户创建成功',
      message: `用户 ${user.name} 已成功创建`,
      timestamp: Date.now(),
    })
  }

  private handleUserLogin(user: User) {
    this.addNotification({
      type: 'info',
      title: '用户登录',
      message: `欢迎回来，${user.name}！`,
      timestamp: Date.now(),
    })
  }

  private handleOrderCreated(order: any) {
    this.addNotification({
      type: 'success',
      title: '订单创建成功',
      message: `订单 ${order.id} 已创建`,
      timestamp: Date.now(),
    })
  }

  @Action()
  private addNotification(notification: Notification) {
    this.notifications.unshift({
      id: generateId(),
      ...notification,
    })

    // 限制通知数量
    if (this.notifications.length > 50) {
      this.notifications.splice(50)
    }
  }

  @Action()
  removeNotification(id: string) {
    const index = this.notifications.findIndex(n => n.id === id)
    if (index > -1) {
      this.notifications.splice(index, 1)
    }
  }
}
```

## 最佳实践总结

### 1. 插件开发

- 保持插件的单一职责
- 提供丰富的配置选项
- 实现适当的错误处理和恢复机制
- 考虑性能影响和内存管理

### 2. 自定义装饰器

- 确保装饰器的可组合性
- 提供清晰的错误信息
- 考虑异步操作的处理
- 保持装饰器的纯函数特性

### 3. 复杂状态管理

- 使用状态机管理复杂的状态转换
- 实现事件驱动架构提高模块解耦
- 合理使用缓存和性能优化策略
- 保持状态的可预测性和可调试性

### 4. 架构设计

- 分层设计，职责分离
- 使用依赖注入提高可测试性
- 实现适当的错误边界和降级策略
- 考虑扩展性和维护性

## 下一步

- 查看 [实战项目](/examples/real-world/) 了解完整的项目示例
- 学习 [最佳实践](/guide/best-practices) 掌握开发技巧
- 探索 [API 参考](/api/) 了解详细的 API 文档
