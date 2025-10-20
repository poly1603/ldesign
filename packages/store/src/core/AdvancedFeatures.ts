/**
 * 高级功能模块
 * 提供批量操作、事务支持、状态快照、时间旅行调试、中间件系统、状态同步等高级功能
 *
 * @module AdvancedFeatures
 * @description 统一的高级功能模块，整合了所有高级特性
 */

import type { Store } from 'pinia'
import type { ActionDefinition, GetterDefinition, StateDefinition } from '../types'
import { toRaw } from 'vue'

/**
 * 批量操作管理器
 * 支持批量执行多个操作，提供原子性保障
 */
export class BatchOperationManager {
  private operations: Array<() => void | Promise<void>> = []
  private isExecuting = false
  private rollbackStack: Array<() => void> = []

  /**
   * 添加操作到批量队列
   */
  add(operation: () => void | Promise<void>, rollback?: () => void): this {
    if (this.isExecuting) {
      throw new Error('Cannot add operations while batch is executing')
    }
    this.operations.push(operation)
    if (rollback) {
      this.rollbackStack.push(rollback)
    }
    return this
  }

  /**
   * 执行所有批量操作
   */
  async execute(): Promise<void> {
    if (this.isExecuting) {
      throw new Error('Batch is already executing')
    }

    this.isExecuting = true
    const executedOperations: number[] = []

    try {
      for (let i = 0; i < this.operations.length; i++) {
        await this.operations[i]()
        executedOperations.push(i)
      }
    } catch (error) {
      // 回滚已执行的操作
      for (let i = executedOperations.length - 1; i >= 0; i--) {
        const rollback = this.rollbackStack[executedOperations[i]]
        if (rollback) {
          try {
            rollback()
          } catch (rollbackError) {
            console.error('Rollback failed:', rollbackError)
          }
        }
      }
      throw error
    } finally {
      this.clear()
      this.isExecuting = false
    }
  }

  /**
   * 清空批量操作队列
   */
  clear(): void {
    this.operations = []
    this.rollbackStack = []
  }

  /**
   * 获取待执行操作数量
   */
  get size(): number {
    return this.operations.length
  }
}

/**
 * 事务管理器
 * 提供事务性操作支持，确保数据一致性
 */
export class TransactionManager<TState extends StateDefinition = StateDefinition> {
  private store: Store<string, TState, any, any>
  private snapshot: TState | null = null
  private inTransaction = false
  private transactionLog: Array<{ type: string; payload: any; timestamp: number }> = []

  constructor(store: Store<string, TState, any, any>) {
    this.store = store
  }

  /**
   * 开始事务
   */
  begin(): void {
    if (this.inTransaction) {
      throw new Error('Transaction already in progress')
    }
    this.snapshot = JSON.parse(JSON.stringify(this.store.$state))
    this.inTransaction = true
    this.transactionLog = []
  }

  /**
   * 提交事务
   */
  commit(): void {
    if (!this.inTransaction) {
      throw new Error('No transaction in progress')
    }
    this.snapshot = null
    this.inTransaction = false
    this.transactionLog = []
  }

  /**
   * 回滚事务
   */
  rollback(): void {
    if (!this.inTransaction) {
      throw new Error('No transaction in progress')
    }
    if (this.snapshot) {
      this.store.$patch(this.snapshot)
    }
    this.snapshot = null
    this.inTransaction = false
    this.transactionLog = []
  }

  /**
   * 在事务中执行操作
   */
  async run<T>(operation: () => T | Promise<T>): Promise<T> {
    this.begin()
    try {
      const result = await operation()
      this.commit()
      return result
    } catch (error) {
      this.rollback()
      throw error
    }
  }

  /**
   * 记录事务操作
   */
  log(type: string, payload: any): void {
    if (this.inTransaction) {
      this.transactionLog.push({
        type,
        payload,
        timestamp: Date.now()
      })
    }
  }

  /**
   * 获取事务日志
   */
  getLog(): Array<{ type: string; payload: any; timestamp: number }> {
    return [...this.transactionLog]
  }
}

/**
 * 状态快照管理器
 * 支持创建、保存、恢复状态快照，支持标签和比较功能
 */
export class SnapshotManager<TState extends StateDefinition = StateDefinition> {
  private snapshots: Map<string, {
    id: string
    name: string
    state: TState
    metadata: any
    timestamp: number
    tags?: string[]
  }> = new Map()
  private tags = new Map<string, Set<string>>() // tag -> snapshot ids
  private maxSnapshots = 50
  private autoSnapshot = false
  private autoSnapshotInterval: number | null = null

  constructor(private store: Store<string, TState, any, any>, options?: {
    maxSnapshots?: number
    autoSnapshot?: boolean
    autoSnapshotInterval?: number
  }) {
    if (options?.maxSnapshots) {
      this.maxSnapshots = options.maxSnapshots
    }
    if (options?.autoSnapshot) {
      this.enableAutoSnapshot(options.autoSnapshotInterval || 60000)
    }
  }

  /**
   * 创建快照
   */
  create(name: string, metadata?: any, tags?: string[]): string {
    const id = this.generateId()
    const snapshot = {
      id,
      name,
      state: JSON.parse(JSON.stringify(toRaw(this.store.$state))),
      metadata: metadata || {},
      timestamp: Date.now(),
      tags
    }
    this.snapshots.set(id, snapshot)

    // 添加标签索引
    if (tags) {
      tags.forEach(tag => {
        if (!this.tags.has(tag)) {
          this.tags.set(tag, new Set())
        }
        this.tags.get(tag)!.add(id)
      })
    }

    // 限制快照数量
    if (this.snapshots.size > this.maxSnapshots) {
      const oldestKey = Array.from(this.snapshots.keys())[0]
      this.snapshots.delete(oldestKey)
    }

    return id
  }

  /**
   * 恢复快照
   */
  restore(name: string): void {
    const snapshot = this.snapshots.get(name)
    if (!snapshot) {
      throw new Error(`Snapshot "${name}" not found`)
    }
    this.store.$patch(snapshot.state)
  }

  /**
   * 删除快照
   */
  delete(name: string): boolean {
    return this.snapshots.delete(name)
  }

  /**
   * 清空所有快照
   */
  clear(): void {
    this.snapshots.clear()
  }

  /**
   * 获取所有快照信息
   */
  list(): Array<{ name: string; metadata: any; timestamp: number }> {
    return Array.from(this.snapshots.entries()).map(([name, snapshot]) => ({
      name,
      metadata: snapshot.metadata,
      timestamp: snapshot.timestamp
    }))
  }

  /**
   * 启用自动快照
   */
  enableAutoSnapshot(interval: number): void {
    this.autoSnapshot = true
    if (this.autoSnapshotInterval) {
      clearInterval(this.autoSnapshotInterval)
    }
    this.autoSnapshotInterval = window.setInterval(() => {
      this.create(`auto_${Date.now()}`, { auto: true })
    }, interval)
  }

  /**
   * 禁用自动快照
   */
  disableAutoSnapshot(): void {
    this.autoSnapshot = false
    if (this.autoSnapshotInterval) {
      clearInterval(this.autoSnapshotInterval)
      this.autoSnapshotInterval = null
    }
  }

  /**
   * 导出快照
   */
  export(name: string): string {
    const snapshot = this.snapshots.get(name)
    if (!snapshot) {
      throw new Error(`Snapshot "${name}" not found`)
    }
    return JSON.stringify(snapshot)
  }

  /**
   * 导入快照
   */
  import(name: string, data: string): void {
    try {
      const snapshot = JSON.parse(data)
      this.snapshots.set(name, snapshot)
    } catch {
      throw new Error('Invalid snapshot data')
    }
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * 时间旅行调试器
 * 支持状态的时间旅行调试功能
 */
export class TimeTravelDebugger<TState extends StateDefinition = StateDefinition> {
  private history: Array<{
    state: TState
    action?: string
    timestamp: number
    metadata?: any
  }> = []
  private currentIndex = -1
  private maxHistory = 100
  private isTimeTravel = false
  private store: Store<string, TState, any, any>

  constructor(store: Store<string, TState, any, any>, options?: {
    maxHistory?: number
  }) {
    this.store = store
    if (options?.maxHistory) {
      this.maxHistory = options.maxHistory
    }
    this.init()
  }

  /**
   * 初始化时间旅行
   */
  private init(): void {
    // 记录初始状态
    this.record('INIT')

    // 监听状态变更
    this.store.$subscribe((mutation) => {
      if (!this.isTimeTravel) {
        this.record(mutation.type, (mutation as any).payload || mutation)
      }
    })
  }

  /**
   * 记录状态
   */
  private record(action: string, metadata?: any): void {
    // 如果当前不在最新状态，删除后续历史
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }

    // 添加新状态
    this.history.push({
      state: JSON.parse(JSON.stringify(this.store.$state)),
      action,
      timestamp: Date.now(),
      metadata
    })

    // 限制历史记录数量
    if (this.history.length > this.maxHistory) {
      this.history.shift()
    } else {
      this.currentIndex++
    }
  }

  /**
   * 后退到上一个状态
   */
  backward(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--
      this.isTimeTravel = true
      this.store.$patch(this.history[this.currentIndex].state)
      this.isTimeTravel = false
    }
  }

  /**
   * 前进到下一个状态
   */
  forward(): void {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++
      this.isTimeTravel = true
      this.store.$patch(this.history[this.currentIndex].state)
      this.isTimeTravel = false
    }
  }

  /**
   * 跳转到指定状态
   */
  goto(index: number): void {
    if (index >= 0 && index < this.history.length) {
      this.currentIndex = index
      this.isTimeTravel = true
      this.store.$patch(this.history[index].state)
      this.isTimeTravel = false
    }
  }

  /**
   * 重置到初始状态
   */
  reset(): void {
    this.goto(0)
  }

  /**
   * 获取历史记录
   */
  getHistory(): Array<{
    state: TState
    action?: string
    timestamp: number
    metadata?: any
    index: number
    isCurrent: boolean
  }> {
    return this.history.map((item, index) => ({
      ...item,
      index,
      isCurrent: index === this.currentIndex
    }))
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    const currentState = this.history[this.currentIndex]
    this.history = [currentState]
    this.currentIndex = 0
  }

  /**
   * 获取当前索引
   */
  getCurrentIndex(): number {
    return this.currentIndex
  }

  /**
   * 获取历史长度
   */
  getHistoryLength(): number {
    return this.history.length
  }

  /**
   * 导出历史记录
   */
  exportHistory(): string {
    return JSON.stringify({
      history: this.history,
      currentIndex: this.currentIndex
    })
  }

  /**
   * 导入历史记录
   */
  importHistory(data: string): void {
    try {
      const { history, currentIndex } = JSON.parse(data)
      this.history = history
      this.currentIndex = currentIndex
      this.goto(currentIndex)
    } catch {
      throw new Error('Invalid history data')
    }
  }
}

/**
 * 状态比较器
 * 用于比较两个状态之间的差异
 */
export class StateDiffer<TState extends StateDefinition = StateDefinition> {
  /**
   * 比较两个状态的差异
   */
  diff(oldState: TState, newState: TState): Array<{
    path: string
    oldValue: any
    newValue: any
    type: 'added' | 'deleted' | 'modified'
  }> {
    const differences: Array<{
      path: string
      oldValue: any
      newValue: any
      type: 'added' | 'deleted' | 'modified'
    }> = []

    const compare = (obj1: any, obj2: any, path = '') => {
      // 获取所有键
      const keys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})])

      for (const key of keys) {
        const currentPath = path ? `${path}.${key}` : key
        const value1 = obj1?.[key]
        const value2 = obj2?.[key]

        if (!(key in (obj1 || {}))) {
          // 新增
          differences.push({
            path: currentPath,
            oldValue: undefined,
            newValue: value2,
            type: 'added'
          })
        } else if (!(key in (obj2 || {}))) {
          // 删除
          differences.push({
            path: currentPath,
            oldValue: value1,
            newValue: undefined,
            type: 'deleted'
          })
        } else if (typeof value1 === 'object' && typeof value2 === 'object' &&
          value1 !== null && value2 !== null &&
          !Array.isArray(value1) && !Array.isArray(value2)) {
          // 递归比较对象
          compare(value1, value2, currentPath)
        } else if (JSON.stringify(value1) !== JSON.stringify(value2)) {
          // 修改
          differences.push({
            path: currentPath,
            oldValue: value1,
            newValue: value2,
            type: 'modified'
          })
        }
      }
    }

    compare(oldState, newState)
    return differences
  }

  /**
   * 应用差异到状态
   */
  applyDiff(state: TState, differences: Array<{
    path: string
    newValue: any
    type: 'added' | 'deleted' | 'modified'
  }>): TState {
    const newState = JSON.parse(JSON.stringify(state))

    for (const diff of differences) {
      const paths = diff.path.split('.')
      let current = newState

      for (let i = 0; i < paths.length - 1; i++) {
        if (!current[paths[i]]) {
          current[paths[i]] = {}
        }
        current = current[paths[i]]
      }

      const lastKey = paths[paths.length - 1]

      if (diff.type === 'deleted') {
        delete current[lastKey]
      } else {
        current[lastKey] = diff.newValue
      }
    }

    return newState
  }
}

/**
 * 状态验证器
 * 用于验证状态的合法性
 */
export class StateValidator<TState extends StateDefinition = StateDefinition> {
  private rules: Map<string, (value: any) => boolean | string> = new Map()

  /**
   * 添加验证规则
   */
  addRule(path: string, validator: (value: any) => boolean | string): void {
    this.rules.set(path, validator)
  }

  /**
   * 删除验证规则
   */
  removeRule(path: string): boolean {
    return this.rules.delete(path)
  }

  /**
   * 验证状态
   */
  validate(state: TState): {
    valid: boolean
    errors: Array<{ path: string; message: string }>
  } {
    const errors: Array<{ path: string; message: string }> = []

    for (const [path, validator] of this.rules) {
      const value = this.getValueByPath(state, path)
      const result = validator(value)

      if (result !== true) {
        errors.push({
          path,
          message: typeof result === 'string' ? result : 'Validation failed'
        })
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * 根据路径获取值
   */
  private getValueByPath(obj: any, path: string): any {
    const paths = path.split('.')
    let current = obj

    for (const p of paths) {
      if (current === null || current === undefined) {
        return undefined
      }
      current = current[p]
    }

    return current
  }
}

/**
 * 创建高级功能增强的 Store
 */
export function createAdvancedStore<
  TState extends StateDefinition = StateDefinition,
  TActions extends ActionDefinition = ActionDefinition,
  TGetters extends GetterDefinition = GetterDefinition
>(store: Store<string, TState, TGetters, TActions>) {
  const batchManager = new BatchOperationManager()
  const transactionManager = new TransactionManager(store)
  const snapshotManager = new SnapshotManager(store)
  const timeTravelDebugger = new TimeTravelDebugger(store)
  const stateDiffer = new StateDiffer<TState>()
  const stateValidator = new StateValidator<TState>()

  return {
    store,
    batch: batchManager,
    transaction: transactionManager,
    snapshot: snapshotManager,
    timeTravel: timeTravelDebugger,
    differ: stateDiffer,
    validator: stateValidator,

    // 便捷方法
    async runInBatch(operations: Array<() => void | Promise<void>>): Promise<void> {
      operations.forEach(op => batchManager.add(op))
      return batchManager.execute()
    },

    async runInTransaction<T>(operation: () => T | Promise<T>): Promise<T> {
      return transactionManager.run(operation)
    },

    createSnapshot(name: string): void {
      snapshotManager.create(name)
    },

    restoreSnapshot(name: string): void {
      snapshotManager.restore(name)
    },

    undo(): void {
      timeTravelDebugger.backward()
    },

    redo(): void {
      timeTravelDebugger.forward()
    },

    getDiff(oldState: TState, newState: TState) {
      return stateDiffer.diff(oldState, newState)
    },

    validateState(state?: TState) {
      return stateValidator.validate(state || (store.$state as TState))
    }
  }
}

/**
 * 中间件系统
 * 提供灵活的中间件机制，支持 action 和 state 拦截
 */
export class MiddlewareSystem<S = any> {
  private middlewares: Middleware<S>[] = []

  /**
   * 注册中间件
   */
  use(middleware: Middleware<S>): void {
    this.middlewares.push(middleware)
  }

  /**
   * 执行中间件链
   */
  async execute(context: MiddlewareContext<S>): Promise<void> {
    let index = 0

    const next = async (): Promise<void> => {
      if (index >= this.middlewares.length) return

      const middleware = this.middlewares[index++]
      await middleware(context, next)
    }

    await next()
  }

  /**
   * 创建 action 中间件
   */
  static createActionMiddleware<S>(
    handler: (action: ActionInfo, state: S) => void | Promise<void>
  ): Middleware<S> {
    return async (context, next) => {
      if (context.type === 'action') {
        await handler(context.action!, context.state)
      }
      await next()
    }
  }

  /**
   * 创建 state 中间件
   */
  static createStateMiddleware<S>(
    handler: (oldState: S, newState: S) => void | Promise<void>
  ): Middleware<S> {
    return async (context, next) => {
      if (context.type === 'state') {
        await handler(context.oldState!, context.state)
      }
      await next()
    }
  }

  /**
   * 创建日志中间件
   */
  static createLogger<S>(options?: LoggerOptions): Middleware<S> {
    const { collapsed = false, duration = true, diff = false } = options || {}

    return async (context, next) => {
      const startTime = performance.now()

      if (collapsed) {
        console.groupCollapsed(
          `[${context.type}] ${context.action?.type || 'state change'}`
        )
      } else {
        console.group(
          `[${context.type}] ${context.action?.type || 'state change'}`
        )
      }

      if (context.action) {
        console.log('Action:', context.action)
      }

      if (context.oldState) {
        console.log('Old State:', context.oldState)
      }

      await next()

      console.log('New State:', context.state)

      if (duration) {
        const endTime = performance.now()
        console.log(`Duration: ${(endTime - startTime).toFixed(2)}ms`)
      }

      if (diff && context.oldState) {
        const stateDiff = this.computeDiff(context.oldState, context.state)
        console.log('Diff:', stateDiff)
      }

      console.groupEnd()
    }
  }

  /**
   * 创建性能监控中间件
   */
  static createPerformanceMonitor<S>(
    threshold = 16 // 默认16ms（60fps）
  ): Middleware<S> {
    return async (context, next) => {
      const startTime = performance.now()

      await next()

      const duration = performance.now() - startTime

      if (duration > threshold) {
        console.warn(
          `Slow ${context.type}: ${duration.toFixed(2)}ms`,
          context.action || context.state
        )
      }
    }
  }

  private static computeDiff(oldObj: any, newObj: any): any {
    const diff: any = {}

    for (const key in newObj) {
      if (oldObj[key] !== newObj[key]) {
        diff[key] = {
          old: oldObj[key],
          new: newObj[key]
        }
      }
    }

    return diff
  }
}

// 类型定义
export interface ActionInfo {
  type: string
  payload?: any
  meta?: any
}

export interface Middleware<S = any> {
  (context: MiddlewareContext<S>, next: () => Promise<void>): Promise<void>
}

export interface MiddlewareContext<S = any> {
  type: 'action' | 'state'
  state: S
  oldState?: S
  action?: ActionInfo
  [key: string]: any
}

export interface LoggerOptions {
  collapsed?: boolean
  duration?: boolean
  diff?: boolean
}

// 便捷函数
export function createMiddlewareSystem<S>() {
  return new MiddlewareSystem<S>()
}
