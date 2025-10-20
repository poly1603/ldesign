/**
 * Enhanced Reactive State Management System
 * 
 * Provides advanced state management features including:
 * - Computed states with dependency tracking
 * - State transactions with rollback support
 * - Deep reactivity with Vue 3 integration
 * - State persistence with versioning
 */

import type { Logger } from '../types'
import { computed, type ComputedRef, reactive, ref, type Ref, shallowRef, watch, type WatchCallback, type WatchOptions } from 'vue'

// State value types
export type StateValue = unknown
export type StateGetter<T = StateValue> = () => T
export type StateSetter<T = StateValue> = (value: T) => void
export type StateUpdater<T = StateValue> = (oldValue: T) => T

// Computed state definition
export interface ComputedStateDefinition<T = StateValue> {
  get: StateGetter<T>
  set?: StateSetter<T>
  cache?: boolean
}

// Transaction operations
export interface StateTransaction {
  id: string
  timestamp: number
  operations: Array<{
    type: 'set' | 'remove' | 'clear'
    path: string
    oldValue?: unknown
    newValue?: unknown
  }>
  status: 'pending' | 'committed' | 'rolled-back'
}

// State persistence options
export interface StatePersistenceOptions {
  key: string
  storage?: Storage
  serialize?: (value: unknown) => string
  deserialize?: (value: string) => unknown
  version?: number
  migrate?: (oldState: unknown, oldVersion: number) => unknown
}

// Reactive collection types
export interface ReactiveCollection<T = unknown> {
  items: Ref<T[]>
  add: (item: T) => void
  remove: (index: number) => void
  update: (index: number, item: T) => void
  clear: () => void
  find: (predicate: (item: T) => boolean) => T | undefined
  filter: (predicate: (item: T) => boolean) => T[]
  map: <U>(mapper: (item: T) => U) => U[]
  forEach: (callback: (item: T, index: number) => void) => void
  size: ComputedRef<number>
  isEmpty: ComputedRef<boolean>
}

/**
 * Enhanced Reactive State Manager
 * 
 * Extends the basic state manager with advanced reactive features
 * Now with SSR support and state hydration
 */
/**
 * 增强的响应式状态管理器
 * 
 * 提供高级状态管理特性：
 * - 计算属性与依赖追踪
 * - 事务支持与回滚
 * - SSR支持与状态hydration
 * - 持久化与版本迁移
 * - 内存优化与资源管理
 */
export class ReactiveStateManager {
  private state = reactive<Record<string, unknown>>({})
  private computedStates = new Map<string, ComputedRef<unknown>>()
  private watchers = new Map<string, Array<() => void>>()
  private transactions = new Map<string, StateTransaction>()
  private currentTransaction: StateTransaction | null = null
  private persistenceOptions = new Map<string, StatePersistenceOptions>()
  private collections = new Map<string, ReactiveCollection>()
  private isSSR = typeof window === 'undefined'
  private hydrationPromise: Promise<void> | null = null
  private stateSnapshots: Array<{ timestamp: number; state: string }> = []
  private maxSnapshots = 10 // 优化：减少到10，降低内存占用

  // 内存优化：限制数据结构大小
  private readonly MAX_COMPUTED = 100      // 减少到100
  private readonly MAX_COLLECTIONS = 50    // 减少到50
  private readonly MAX_TRANSACTIONS = 30   // 减少到30
  private readonly MAX_PERSISTENCE = 30    // 减少到30
  private readonly MAX_WATCHERS = 200      // 新增：限制监听器数量

  // 事件监听器引用（用于清理）
  private storageEventHandler: ((e: StorageEvent) => void) | null = null
  
  // 性能优化：缓存常用路径
  private pathValueCache = new WeakMap<object, Map<string, unknown>>()

  constructor(private logger?: Logger, private ssrContext?: { initialState?: Record<string, unknown> }) {
    if (this.isSSR && ssrContext?.initialState) {
      // SSR: 使用服务器提供的初始状态
      Object.assign(this.state, ssrContext.initialState)
    } else if (!this.isSSR && typeof window !== 'undefined' && (window as any).__SSR_STATE__) {
      // 客户端: 水合服务器状态
      this.hydrate((window as any).__SSR_STATE__)
    }

    if (!this.isSSR) {
      this.setupPersistence()
    }
  }

  /**
   * Get a reactive reference to a state value
   */
  getRef<T = unknown>(key: string): Ref<T | undefined> {
    return computed(() => this.getNestedValue(this.state, key) as T)
  }

  /**
   * Get a shallow reactive reference (better performance for large objects)
   */
  getShallowRef<T = unknown>(key: string): Ref<T | undefined> {
    const value = this.getNestedValue(this.state, key)
    return shallowRef(value as T)
  }

  /**
   * Define a computed state that derives from other states - 优化版：限制数量
   */
  defineComputed<T = unknown>(
    key: string,
    definition: ComputedStateDefinition<T> | StateGetter<T>
  ): ComputedRef<T> {
    // 检查computed数量限制
    if (this.computedStates.size >= this.MAX_COMPUTED && !this.computedStates.has(key)) {
      this.logger?.warn(`Maximum computed states limit (${this.MAX_COMPUTED}) reached`)
      // 移除最旧的computed（Map保持插入顺序）
      const firstKey = this.computedStates.keys().next().value
      if (firstKey) {
        this.computedStates.delete(firstKey)
      }
    }

    const def = typeof definition === 'function'
      ? { get: definition }
      : definition

    const computedState = def.set
      ? computed<T>({
        get: def.get,
        set: def.set
      })
      : computed<T>(def.get)

    this.computedStates.set(key, computedState as ComputedRef<unknown>)
    return computedState
  }

  /**
   * Get a computed state value
   */
  getComputed<T = unknown>(key: string): ComputedRef<T> | undefined {
    return this.computedStates.get(key) as ComputedRef<T> | undefined
  }

  /**
   * Create a reactive collection with helper methods - 优化版：限制数量
   */
  createCollection<T = unknown>(key: string, initialItems: T[] = []): ReactiveCollection<T> {
    // 检查集合数量限制
    if (this.collections.size >= this.MAX_COLLECTIONS && !this.collections.has(key)) {
      this.logger?.warn(`Maximum collections limit (${this.MAX_COLLECTIONS}) reached`)
      // 移除最旧的collection
      const firstKey = this.collections.keys().next().value
      if (firstKey) {
        const oldCollection = this.collections.get(firstKey)
        if (oldCollection) {
          oldCollection.clear() // 清理数据
        }
        this.collections.delete(firstKey)
      }
    }

    const items = ref<T[]>(initialItems)

    const collection: ReactiveCollection<T> = {
      items: items as Ref<T[]>,
      add: (item: T) => {
        const arr = items.value as T[]
        arr.push(item)
      },
      remove: (index: number) => {
        const arr = items.value as T[]
        arr.splice(index, 1)
      },
      update: (index: number, item: T) => {
        const arr = items.value as T[]
        if (index >= 0 && index < arr.length) {
          arr[index] = item
        }
      },
      clear: () => { (items.value as T[]).length = 0 }, // 更高效的清空
      find: (predicate) => {
        const arr = items.value as T[]
        return arr.find(predicate)
      },
      filter: (predicate) => {
        const arr = items.value as T[]
        return arr.filter(predicate)
      },
      map: (mapper) => {
        const arr = items.value as T[]
        return arr.map(mapper)
      },
      forEach: (callback) => {
        const arr = items.value as T[]
        arr.forEach(callback)
      },
      size: computed(() => items.value.length),
      isEmpty: computed(() => items.value.length === 0)
    }

    this.collections.set(key, collection as ReactiveCollection<unknown>)
    return collection
  }

  /**
   * Get a reactive collection
   */
  getCollection<T = unknown>(key: string): ReactiveCollection<T> | undefined {
    return this.collections.get(key) as ReactiveCollection<T> | undefined
  }

  /**
   * Start a new transaction - 优化版：限制事务数量
   */
  beginTransaction(id?: string): string {
    const transactionId = id || this.generateTransactionId()

    if (this.currentTransaction) {
      this.logger?.warn('Transaction already in progress', {
        current: this.currentTransaction.id
      })
    }

    // 检查事务数量限制并清理旧事务
    if (this.transactions.size >= this.MAX_TRANSACTIONS) {
      // 移除最旧的已完成/回滚事务
      const toRemove: string[] = []
      for (const [txId, tx] of this.transactions.entries()) {
        if (tx.status !== 'pending' && toRemove.length < 10) {
          toRemove.push(txId)
        }
      }
      toRemove.forEach(id => this.transactions.delete(id))
    }

    this.currentTransaction = {
      id: transactionId,
      timestamp: Date.now(),
      operations: [],
      status: 'pending'
    }

    this.transactions.set(transactionId, this.currentTransaction)
    return transactionId
  }

  /**
   * Commit the current transaction
   */
  async commitTransaction(): Promise<void> {
    if (!this.currentTransaction) {
      throw new Error('No transaction in progress')
    }

    try {
      // Execute any pending async operations
      this.currentTransaction.status = 'committed'
      this.logger?.debug('Transaction committed', {
        id: this.currentTransaction.id,
        operations: this.currentTransaction.operations.length
      })
    } catch (error) {
      await this.rollbackTransaction()
      throw error
    } finally {
      this.currentTransaction = null
    }
  }

  /**
   * Rollback the current transaction
   */
  async rollbackTransaction(): Promise<void> {
    if (!this.currentTransaction) {
      throw new Error('No transaction in progress')
    }

    // Reverse all operations
    for (const op of this.currentTransaction.operations.reverse()) {
      switch (op.type) {
        case 'set': {
          if (op.oldValue !== undefined) {
            this.setNestedValue(this.state, op.path, op.oldValue)
          } else {
            this.deleteNestedValue(this.state, op.path)
          }
          break
        }
        case 'remove': {
          if (op.oldValue !== undefined) {
            this.setNestedValue(this.state, op.path, op.oldValue)
          }
          break
        }
        case 'clear': {
          // Restore all cleared values
          if (op.oldValue && typeof op.oldValue === 'object') {
            Object.assign(this.state, op.oldValue)
          }
          break
        }
      }
    }

    this.currentTransaction.status = 'rolled-back'
    this.logger?.debug('Transaction rolled back', {
      id: this.currentTransaction.id
    })
    this.currentTransaction = null
  }

  /**
   * Execute a function within a transaction
   */
  async transaction<T>(
    fn: () => T | Promise<T>,
    options?: { id?: string; retries?: number }
  ): Promise<T> {
    const { id, retries = 0 } = options || {}
    let lastError: Error | undefined

    for (let attempt = 0; attempt <= retries; attempt++) {
      this.beginTransaction(id)

      try {
        const result = await fn()
        await this.commitTransaction()
        return result
      } catch (error) {
        lastError = error as Error
        await this.rollbackTransaction()

        if (attempt < retries) {
          this.logger?.debug('Transaction failed, retrying', {
            attempt: attempt + 1,
            retries,
            error
          })
          await this.delay(2 ** attempt * 100) // Exponential backoff
        }
      }
    }

    throw lastError
  }

  /**
   * Set a value with transaction support
   */
  set<T = unknown>(key: string, value: T): void {
    const oldValue = this.getNestedValue(this.state, key)

    if (this.currentTransaction) {
      this.currentTransaction.operations.push({
        type: 'set',
        path: key,
        oldValue,
        newValue: value
      })
    }

    this.setNestedValue(this.state, key, value)
    this.saveToPersistence(key)
  }

  /**
   * Update a value using an updater function
   */
  update<T = unknown>(key: string, updater: StateUpdater<T>): void {
    const oldValue = this.getNestedValue(this.state, key) as T
    const newValue = updater(oldValue)
    this.set(key, newValue)
  }

  /**
   * Setup persistence for a state key - 优化版：限制持久化键数量
   */
  persist(key: string, options: StatePersistenceOptions): void {
    // 检查持久化选项数量限制
    if (this.persistenceOptions.size >= this.MAX_PERSISTENCE && !this.persistenceOptions.has(key)) {
      this.logger?.warn(`Maximum persistence keys limit (${this.MAX_PERSISTENCE}) reached`)
      // 移除最旧的持久化配置
      const firstKey = this.persistenceOptions.keys().next().value
      if (firstKey) {
        this.persistenceOptions.delete(firstKey)
      }
    }

    this.persistenceOptions.set(key, options)

    // Load initial value from storage
    this.loadFromPersistence(key)

    // Watch for changes and persist
    this.watch(key, () => {
      this.saveToPersistence(key)
    })
  }

  /**
   * 监听状态变化 - 使用Vue的watch API
   * @param key 要监听的键或键数组
   * @param callback 回调函数
   * @param options 监听选项
   * @returns 取消监听的函数
   */
  watch<T = unknown>(
    key: string | string[],
    callback: WatchCallback<T, T>,
    options?: WatchOptions
  ): () => void {
    // 检查监听器数量限制
    const totalWatchers = Array.from(this.watchers.values())
      .reduce((sum, arr) => sum + arr.length, 0)
    
    if (totalWatchers >= this.MAX_WATCHERS) {
      this.logger?.warn(`Maximum watchers limit (${this.MAX_WATCHERS}) reached`)
      // 清理一些旧的监听器
      this.cleanupOldWatchers()
    }
    
    const keys = Array.isArray(key) ? key : [key]
    const sources = keys.map(k => () => this.getNestedValue(this.state, k))

    const stopWatcher = watch(
      sources.length === 1 ? sources[0] : sources,
      callback as WatchCallback,
      options
    )

    // 存储监听器以便清理
    keys.forEach(k => {
      if (!this.watchers.has(k)) {
        this.watchers.set(k, [])
      }
      const watcherArray = this.watchers.get(k)!
      watcherArray.push(stopWatcher)
    })

    return stopWatcher
  }

  /**
   * Create a derived state using a selector function
   */
  select<T = unknown>(selector: (state: Record<string, unknown>) => T): ComputedRef<T> {
    return computed(() => selector(this.state))
  }

  /**
   * Batch multiple state updates
   */
  batch(updates: Array<{ key: string; value: unknown }>): void {
    this.beginTransaction()

    try {
      for (const { key, value } of updates) {
        this.set(key, value)
      }
      this.commitTransaction()
    } catch (error) {
      this.rollbackTransaction()
      throw error
    }
  }

  /**
   * Subscribe to state changes with pattern matching
   */
  subscribe(pattern: string | RegExp, callback: (key: string, value: unknown) => void): () => void {
    const regex = typeof pattern === 'string'
      ? new RegExp(`^${pattern.replace(/\*/g, '.*')}$`)
      : pattern

    const unsubscribes: Array<() => void> = []

    // Watch all keys matching the pattern
    for (const key of Object.keys(this.state)) {
      if (regex.test(key)) {
        const unsubscribe = this.watch(key, (newValue) => {
          callback(key, newValue)
        })
        unsubscribes.push(unsubscribe)
      }
    }

    return () => {
      unsubscribes.forEach(fn => fn())
    }
  }

  // Helper methods
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.')
    let current: unknown = obj

    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined
      }
      current = (current as Record<string, unknown>)[key]
    }

    return current
  }

  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.')
    let current = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key] as Record<string, unknown>
    }

    current[keys[keys.length - 1]] = value
  }

  private deleteNestedValue(obj: Record<string, unknown>, path: string): void {
    const keys = path.split('.')
    let current: unknown = obj

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current || typeof current !== 'object') return
      current = (current as Record<string, unknown>)[keys[i]]
    }

    if (current && typeof current === 'object') {
      delete (current as Record<string, unknown>)[keys[keys.length - 1]]
    }
  }

  private setupPersistence(): void {
    if (typeof window === 'undefined') return

    // 保存事件处理器引用以便清理
    this.storageEventHandler = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return

      for (const [key, options] of this.persistenceOptions) {
        if (e.key === options.key) {
          const value = options.deserialize
            ? options.deserialize(e.newValue)
            : JSON.parse(e.newValue)
          this.set(key, value)
        }
      }
    }

    // Listen for storage events (cross-tab sync)
    window.addEventListener('storage', this.storageEventHandler)
  }

  private loadFromPersistence(key: string): void {
    const options = this.persistenceOptions.get(key)
    if (!options) return

    const storage = options.storage || localStorage
    const stored = storage.getItem(options.key)
    if (!stored) return

    try {
      let value = options.deserialize
        ? options.deserialize(stored)
        : JSON.parse(stored)

      // Handle version migration
      if (options.version && options.migrate) {
        const storedVersion = storage.getItem(`${options.key}:version`)
        const oldVersion = storedVersion ? Number.parseInt(storedVersion) : 0

        if (oldVersion < options.version) {
          value = options.migrate(value, oldVersion)
          storage.setItem(`${options.key}:version`, options.version.toString())
        }
      }

      this.set(key, value)
    } catch (error) {
      this.logger?.error('Failed to load from persistence', { key, error })
    }
  }

  private saveToPersistence(key: string): void {
    const options = this.persistenceOptions.get(key)
    if (!options) return

    const value = this.getNestedValue(this.state, key)
    const storage = options.storage || localStorage

    try {
      const serialized = options.serialize
        ? options.serialize(value)
        : JSON.stringify(value)

      storage.setItem(options.key, serialized)

      if (options.version) {
        storage.setItem(`${options.key}:version`, options.version.toString())
      }
    } catch (error) {
      this.logger?.error('Failed to save to persistence', { key, error })
    }
  }

  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * SSR: Serialize state for server-side rendering
   */
  serialize(options?: {
    include?: string[]
    exclude?: string[]
    compress?: boolean
  }): string {
    const { include, exclude, compress = false } = options || {}

    let stateToSerialize = { ...this.state }

    // Filter state based on include/exclude
    if (include) {
      stateToSerialize = Object.keys(stateToSerialize)
        .filter(key => include.some(pattern => key.match(pattern)))
        .reduce((acc, key) => ({ ...acc, [key]: stateToSerialize[key] }), {})
    }

    if (exclude) {
      stateToSerialize = Object.keys(stateToSerialize)
        .filter(key => !exclude.some(pattern => key.match(pattern)))
        .reduce((acc, key) => ({ ...acc, [key]: stateToSerialize[key] }), {})
    }

    const serialized = JSON.stringify(stateToSerialize)

    if (compress && typeof btoa !== 'undefined') {
      // Simple compression using base64
      return btoa(serialized)
    }

    return serialized
  }

  /**
   * SSR: Hydrate state on client side
   */
  async hydrate(serializedState: string | Record<string, unknown>): Promise<void> {
    if (this.hydrationPromise) {
      return this.hydrationPromise
    }

    this.hydrationPromise = new Promise((resolve) => {
      try {
        const stateToHydrate = typeof serializedState === 'string'
          ? JSON.parse(serializedState)
          : serializedState

        // Merge with existing state
        Object.assign(this.state, stateToHydrate)

        this.logger?.info('State hydrated successfully', {
          keys: Object.keys(stateToHydrate).length
        })

        // Emit hydration event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('state:hydrated', {
            detail: { state: stateToHydrate }
          }))
        }

        resolve()
      } catch (error) {
        this.logger?.error('Failed to hydrate state', error)
        resolve() // Don't block app initialization
      }
    })

    return this.hydrationPromise
  }

  /**
   * Generate SSR script tag for state injection
   */
  generateSSRScript(): string {
    const serialized = this.serialize()
    return `<script>window.__SSR_STATE__ = ${JSON.stringify(serialized)};</script>`
  }

  /**
   * Time Travel: Create a state snapshot - 优化版：使用环形缓冲区
   */
  createSnapshot(label?: string): string {
    const snapshot = {
      timestamp: Date.now(),
      label,
      state: this.serialize()
    }

    // 使用环形缓冲区优化
    if (this.stateSnapshots.length >= this.maxSnapshots) {
      this.stateSnapshots.shift() // 移除最旧的
    }

    this.stateSnapshots.push({
      timestamp: snapshot.timestamp,
      state: snapshot.state
    })

    this.logger?.debug('State snapshot created', { label, timestamp: snapshot.timestamp })

    return snapshot.state
  }

  /**
   * Time Travel: Restore from snapshot
   */
  restoreSnapshot(snapshotId: string | number): boolean {
    let snapshot: { timestamp: number; state: string } | undefined

    if (typeof snapshotId === 'number') {
      snapshot = this.stateSnapshots[snapshotId]
    } else {
      snapshot = this.stateSnapshots.find(s => s.state === snapshotId)
    }

    if (!snapshot) {
      this.logger?.warn('Snapshot not found', { snapshotId })
      return false
    }

    try {
      const stateToRestore = JSON.parse(snapshot.state)
      this.clear()
      Object.assign(this.state, stateToRestore)

      this.logger?.info('State restored from snapshot', {
        timestamp: snapshot.timestamp
      })

      return true
    } catch (error) {
      this.logger?.error('Failed to restore snapshot', error)
      return false
    }
  }

  /**
   * Time Travel: Get snapshot history
   */
  getSnapshotHistory(): Array<{
    index: number
    timestamp: number
    size: number
  }> {
    return this.stateSnapshots.map((snapshot, index) => ({
      index,
      timestamp: snapshot.timestamp,
      size: snapshot.state.length
    }))
  }

  /**
   * Time Travel: Clear snapshot history - 优化版
   */
  clearSnapshots(): void {
    this.stateSnapshots.length = 0 // 更高效的数组清空
    this.logger?.debug('Snapshot history cleared')
  }

  /**
   * Export state for debugging
   */
  exportState(format: 'json' | 'csv' | 'yaml' = 'json'): string {
    const stateData = JSON.parse(JSON.stringify(this.state))

    switch (format) {
      case 'csv': {
        // Simple CSV export for flat structures
        const rows = Object.entries(stateData).map(([key, value]) =>
          `"${key}","${JSON.stringify(value)}"`
        )
        return `key,value\n${rows.join('\n')}`
      }
      case 'yaml': {
        // Simple YAML-like export
        return Object.entries(stateData)
          .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
          .join('\n')
      }
      default:
        return JSON.stringify(stateData, null, 2)
    }
  }

  /**
   * Import state from external source
   */
  importState(data: string, format: 'json' | 'csv' | 'yaml' = 'json'): boolean {
    try {
      let parsedData: Record<string, unknown> = {}

      switch (format) {
        case 'csv': {
          // Simple CSV parsing
          const lines = data.split('\n')
          const headers = lines[0]?.split(',') || []

          if (headers[0] === 'key' && headers[1] === 'value') {
            for (let i = 1; i < lines.length; i++) {
              const match = lines[i].match(/"([^"]+)","([^"]+)"/)
              if (match) {
                parsedData[match[1]] = JSON.parse(match[2])
              }
            }
          }
          break
        }
        case 'yaml': {
          // Simple YAML-like parsing
          data.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(': ')
            if (key && valueParts.length > 0) {
              parsedData[key] = JSON.parse(valueParts.join(': '))
            }
          })
          break
        }

        default:
          parsedData = JSON.parse(data)
      }

      Object.assign(this.state, parsedData)
      this.logger?.info('State imported successfully', { format })
      return true
    } catch (error) {
      this.logger?.error('Failed to import state', { format, error })
      return false
    }
  }

  /**
   * 清理旧的监听器 - 新增方法
   * @private
   */
  private cleanupOldWatchers(): void {
    // 清理一些没有监听器的键
    const keysToDelete: string[] = []
    for (const [key, watchers] of this.watchers.entries()) {
      if (watchers.length === 0) {
        keysToDelete.push(key)
      }
    }
    keysToDelete.forEach(key => this.watchers.delete(key))
    
    // 如果监听器太多，清理一些较早的
    if (this.watchers.size > this.MAX_WATCHERS * 0.8) {
      const entries = Array.from(this.watchers.entries())
      const toRemove = Math.floor(entries.length * 0.2) // 移除20%
      
      for (let i = 0; i < toRemove; i++) {
        const [key, watchers] = entries[i]
        // 停止这些监听器
        watchers.forEach(stop => {
          try {
            stop()
          } catch {
            // 忽略错误
          }
        })
        this.watchers.delete(key)
      }
      
      this.logger?.debug('Cleaned old watchers', {
        removed: toRemove,
        remaining: this.watchers.size
      })
    }
  }

  /**
   * 清理所有状态和资源 - 完全增强版
   * 
   * 按照正确的顺序清理所有资源，确保没有内存泄漏
   */
  dispose(): void {
    try {
      // 1. 移除storage事件监听器
      if (this.storageEventHandler && typeof window !== 'undefined') {
        window.removeEventListener('storage', this.storageEventHandler)
        this.storageEventHandler = null
      }

      // 2. 停止所有监听器
      for (const watchers of this.watchers.values()) {
        watchers.forEach(stop => {
          try {
            stop()
        } catch {
          // 忽略单个监听器停止错误
        }
        })
      }
      this.watchers.clear()

      // 3. 清理计算属性
      this.computedStates.clear()

      // 4. 清理集合（先清理每个集合的数据）
      for (const collection of this.collections.values()) {
        try {
          collection.clear()
        } catch {
          // 忽略清理错误
        }
      }
      this.collections.clear()

      // 5. 清理事务
      this.transactions.clear()
      this.currentTransaction = null

      // 6. 清理快照（更高效的清空）
      this.stateSnapshots.length = 0

      // 7. 清理持久化选项
      this.persistenceOptions.clear()

      // 8. 清理hydration promise
      this.hydrationPromise = null

      // 9. 清理状态对象
      if (this.state && typeof this.state === 'object') {
        Object.keys(this.state).forEach(key => {
          try {
            delete this.state[key]
          } catch {
            // 忽略删除错误
          }
        })
      }

      // 10. 清理日志器引用
      this.logger = undefined
      
      // 11. 清理SSR上下文
      this.ssrContext = undefined
    } catch (error) {
      console.error('Error during ReactiveStateManager disposal:', error)
    }
  }

  /**
   * 别名方法 - 用于统一接口
   */
  destroy(): void {
    this.dispose()
  }

  /**
   * Clear state (helper method)
   */
  private clear(): void {
    Object.keys(this.state).forEach(key => delete this.state[key])
  }
}

/**
 * Create a reactive state manager instance
 */
export function createReactiveStateManager(
  logger?: Logger,
  ssrContext?: { initialState?: Record<string, unknown> }
): ReactiveStateManager {
  return new ReactiveStateManager(logger, ssrContext)
}

/**
 * SSR helper: Create state manager for server
 */
export function createSSRStateManager(
  initialState?: Record<string, unknown>,
  logger?: Logger
): ReactiveStateManager {
  return new ReactiveStateManager(logger, { initialState })
}
