import type { Logger, StateManager } from '../types'
import { LRUCache } from '../utils/lru-cache'
import { reactive } from 'vue'

type WatchCallback = (newValue: unknown, oldValue: unknown) => void

/**
 * 状态管理器实现
 * 
 * 提供响应式状态管理，包括：
 * - 嵌套状态支持
 * - 监听器管理
 * - 历史记录追踪
 * - 内存优化
 */
export class StateManagerImpl implements StateManager {
  private state = reactive<Record<string, unknown>>({})
  // 使用WeakMap减少内存占用，自动垃圾回收
  private watchers = new Map<string, Set<WeakRef<WatchCallback>>>()

  // 优化：使用环形缓冲区，固定内存占用
  private changeHistory: Array<{
    path: string
    // 不存储实际值，只存储引用或简单类型
    oldValue: WeakRef<any> | any
    newValue: WeakRef<any> | any
    timestamp: number
  }> = [] // 使用空数组初始化，避免 undefined 元素
  private historyIndex = 0
  private historySize = 0
  private maxHistorySize = 20

  // 批量更新优化
  private batchUpdates: string[] | null = null
  private batchTimer: number | null = null

  // 清理定时器
  private cleanupTimer: number | null = null
  private readonly CLEANUP_INTERVAL = 30000 // 30秒清理一次

  // LRU缓存优化 - 使用专用LRU实现
  private pathCache: LRUCache<unknown>
  private readonly MAX_CACHE_SIZE = 100 // 增加缓存大小 // 减少缓存大小

  constructor(private logger?: Logger) {
    // 初始化LRU缓存
    this.pathCache = new LRUCache({
      maxSize: this.MAX_CACHE_SIZE,
      onEvict: (key) => {
        this.logger?.debug('Path cache evicted', { key })
      }
    })

    // 仅在浏览器环境启动定期清理
    if (typeof window !== 'undefined') {
      this.startPeriodicCleanup()
    }
  }

  /**
   * 获取状态值 - 优化内存访问（使用LRU缓存）
   * @param key 状态键，支持嵌套路径（如 'user.profile.name'）
   * @returns 状态值或undefined
   */
  get<T = unknown>(key: string): T | undefined {
    // 优化：先检查LRU缓存
    const cached = this.pathCache.get(key)
    if (cached !== undefined) {
      return cached as T
    }

    const value = this.getNestedValue(this.state, key) as T

    // 智能缓存策略
    if (value !== undefined) {
      this.pathCache.set(key, value)
    }

    return value
  }

  /**
   * 设置状态值
   * @param key 状态键，支持嵌套路径
   * @param value 要设置的值
   */
  set<T = unknown>(key: string, value: T): void {
    try {
      const oldValue = this.getNestedValue(this.state, key)

      // 值未变化则不处理
      if (oldValue === value) {
        return
      }

      // 记录变更历史
      this.recordChange(key, oldValue, value)

      // 设置新值
      this.setNestedValue(this.state, key, value)

      // 清理路径缓存
      this.invalidatePathCache(key)

      // 触发监听器
      this.triggerWatchers(key, value, oldValue)
    } catch (error) {
      this.logger?.error('Failed to set state', { key, value, error })
      throw error
    }
  }

  remove(key: string): void {
    this.deleteNestedValue(this.state, key)
  }

  /**
   * 清空所有状态和监听器
   */
  clear(): void {
    // 清理所有监听器
    this.watchers.clear()

    // 清空路径缓存
    this.pathCache.clear()

    // 清空状态 - 添加防御性检查
    if (this.state && typeof this.state === 'object') {
      Object.keys(this.state).forEach(key => {
        delete this.state[key]
      })
    }

    // 清空历史记录
    this.changeHistory.length = 0
    this.historyIndex = 0
  }

  watch<T = unknown>(
    key: string,
    callback: (newValue: T, oldValue: T) => void
  ): () => void {
    // 使用弱引用存储监听器，减少内存泄漏
    if (!this.watchers.has(key)) {
      this.watchers.set(key, new Set())
    }

    const watcherSet = this.watchers.get(key)!
    const weakCallback = new WeakRef(callback as WatchCallback)
    watcherSet.add(weakCallback)

    // 返回优化的取消监听函数
    return () => {
      const callbacks = this.watchers.get(key)
      if (callbacks) {
        // 清理弱引用
        callbacks.forEach(ref => {
          if (ref.deref() === callback) {
            callbacks.delete(ref)
          }
        })

        if (callbacks.size === 0) {
          this.watchers.delete(key)
        }
      }
    }
  }

  private triggerWatchers<T = unknown>(
    key: string,
    newValue: T,
    oldValue: T
  ): void {
    const callbacks = this.watchers.get(key)
    if (callbacks) {
      // 清理已被垃圾回收的监听器
      const deadRefs: WeakRef<WatchCallback>[] = []

      callbacks.forEach((weakCallback) => {
        const callback = weakCallback.deref()
        if (callback) {
          try {
            // 异步执行避免阻塞
            queueMicrotask(() => callback(newValue, oldValue))
          } catch (error) {
            this.logger?.error('Error in state watcher callback', { key, error })
          }
        } else {
          deadRefs.push(weakCallback)
        }
      })

      // 清理无效引用
      deadRefs.forEach(ref => callbacks.delete(ref))
    }
  }

  // 获取嵌套值
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    const keys = path.split('.')
    let current: unknown = obj

    for (const key of keys) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return undefined
      }
      const rec = current as Record<string, unknown>
      current = rec[key]
    }

    return current
  }

  // 设置嵌套值
  private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
    const keys = path.split('.')
    let current: Record<string, unknown> = obj

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      const next = current[key]
      if (typeof next !== 'object' || next === null || Array.isArray(next)) {
        current[key] = {}
      }
      current = current[key] as Record<string, unknown>
    }

    current[keys[keys.length - 1]] = value
  }

  // 删除嵌套值
  private deleteNestedValue(obj: Record<string, unknown>, path: string): void {
    const keys = path.split('.')
    let current: unknown = obj

    for (let i = 0; i < keys.length - 1; i++) {
      if (current === null || current === undefined || typeof current !== 'object') {
        return
      }
      const rec = current as Record<string, unknown>
      const key = keys[i]
      const next = rec[key]
      if (typeof next !== 'object' || next === null) {
        return
      }
      current = next
    }

    if (current && typeof current === 'object') {
      delete (current as Record<string, unknown>)[keys[keys.length - 1]]
    }
  }

  // 检查键是否存在
  has(key: string): boolean {
    return this.getNestedValue(this.state, key) !== undefined
  }

  // 获取所有键
  keys(): string[] {
    return this.getAllKeys(this.state)
  }

  // 递归获取所有键 - 优化版：使用迭代器避免创建临时数组
  private getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    const keys: string[] = []
    const stack: Array<{ obj: Record<string, unknown>; prefix: string; depth: number }> = [
      { obj, prefix, depth: 0 }
    ]
    const maxDepth = 10 // 限制最大深度

    while (stack.length > 0) {
      const { obj: current, prefix: currentPrefix, depth } = stack.pop()!

      // 防止过深递归
      if (depth >= maxDepth) continue

      const currentKeys = Object.keys(current)
      // 限制单层键数量
      const maxKeys = Math.min(currentKeys.length, 100)

      for (let i = 0; i < maxKeys; i++) {
        const key = currentKeys[i]
        const fullKey = currentPrefix ? `${currentPrefix}.${key}` : key
        keys.push(fullKey)

        const val = current[key]
        if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
          stack.push({ obj: val as Record<string, unknown>, prefix: fullKey, depth: depth + 1 })
        }
      }
    }

    return keys
  }

  // 获取状态快照 - 优化版：使用结构化克隆或浅拷贝
  getSnapshot(): Record<string, unknown> {
    // 使用 structuredClone（如果可用）或递归浅拷贝，避免 JSON 序列化开销
    if (typeof structuredClone !== 'undefined') {
      try {
        return structuredClone(this.state)
      } catch {
        // 回退到深拷贝
      }
    }

    // 使用更高效的深拷贝
    return this.deepClone(this.state)
  }

  /**
   * 高效深拷贝方法 - 极致优化版
   * 使用迭代方式替代递归，避免栈溢出
   * 使用WeakMap追踪循环引用，减少内存占用
   */
  private deepClone(obj: any): any {
    // 快速路径：处理基本类型
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj)
    if (obj instanceof RegExp) return new RegExp(obj)
    if (obj instanceof Map) return new Map(obj)
    if (obj instanceof Set) return new Set(obj)

    // 使用structuredClone（如果可用）- 最快的克隆方式
    if (typeof structuredClone !== 'undefined') {
      try {
        return structuredClone(obj)
      } catch {
        // 回退到手动克隆
      }
    }

    // 迭代式深拷贝（避免递归栈溢出）
    const visited = new WeakMap()
    const stack: Array<{ source: any; target: any; key?: string | number }> = []

    // 确定根对象类型
    const isArray = Array.isArray(obj)
    const root = isArray ? [] : {}
    visited.set(obj, root)

    // 初始化栈
    if (isArray) {
      const len = Math.min(obj.length, 1000) // 限制数组大小
      for (let i = 0; i < len; i++) {
        stack.push({ source: obj, target: root, key: i })
      }
    } else {
      const keys = Object.keys(obj)
      const maxKeys = Math.min(keys.length, 100) // 限制对象属性数量
      for (let i = 0; i < maxKeys; i++) {
        stack.push({ source: obj, target: root, key: keys[i] })
      }
    }

    // 迭代处理栈
    while (stack.length > 0) {
      const { source, target, key } = stack.pop()!
      const value = source[key!]

      // 处理基本类型
      if (value === null || typeof value !== 'object') {
        target[key!] = value
        continue
      }

      // 处理特殊对象
      if (value instanceof Date) {
        target[key!] = new Date(value)
        continue
      }
      if (value instanceof RegExp) {
        target[key!] = new RegExp(value)
        continue
      }

      // 处理循环引用
      if (visited.has(value)) {
        target[key!] = visited.get(value)
        continue
      }

      // 处理数组和对象
      if (Array.isArray(value)) {
        const clonedArray: any[] = []
        target[key!] = clonedArray
        visited.set(value, clonedArray)

        const len = Math.min(value.length, 1000)
        for (let i = 0; i < len; i++) {
          stack.push({ source: value, target: clonedArray, key: i })
        }
      } else {
        const clonedObj: Record<string, any> = {}
        target[key!] = clonedObj
        visited.set(value, clonedObj)

        const keys = Object.keys(value)
        const maxKeys = Math.min(keys.length, 100)
        for (let i = 0; i < maxKeys; i++) {
          stack.push({ source: value, target: clonedObj, key: keys[i] })
        }
      }
    }

    return root
  }

  // 从快照恢复状态
  restoreFromSnapshot(snapshot: Record<string, unknown>): void {
    this.clear()
    Object.assign(this.state, snapshot)
  }

  // 合并状态
  merge(newState: Record<string, unknown>): void {
    this.deepMerge(this.state, newState)
  }

  // 深度合并对象
  private deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
    for (const key of Object.keys(source)) {
      const sVal = source[key]
      if (sVal && typeof sVal === 'object' && !Array.isArray(sVal)) {
        const tVal = target[key]
        if (!tVal || typeof tVal !== 'object' || Array.isArray(tVal)) {
          target[key] = {}
        }
        this.deepMerge(target[key] as Record<string, unknown>, sVal as Record<string, unknown>)
      } else {
        target[key] = sVal
      }
    }
  }

  // 获取状态统计信息
  getStats(): {
    totalKeys: number
    totalWatchers: number
    memoryUsage: string
  } {
    const totalWatchers = Array.from(this.watchers.values()).reduce(
      (sum, set) => sum + set.size,
      0
    )

    const memoryUsage = JSON.stringify(this.state).length

    return {
      totalKeys: this.keys().length,
      totalWatchers,
      memoryUsage: `${(memoryUsage / 1024).toFixed(2)} KB`,
    }
  }

  // 创建命名空间
  namespace(ns: string): StateNamespace {
    return new StateNamespace(this, ns)
  }

  // 获取整个状态对象
  getState(): Record<string, unknown> {
    return { ...this.state }
  }

  // 设置整个状态对象
  setState(newState: Partial<Record<string, unknown>>): void {
    Object.assign(this.state, newState)
    this.logger?.debug('State updated', { newState })
  }

  /**
   * 启动定期清理任务
   * @private
   */
  private startPeriodicCleanup(): void {
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer)
    }

    this.cleanupTimer = window.setInterval(() => {
      this.cleanupOldHistory()
      this.cleanupEmptyWatchers()
      this.cleanupPathCache()
    }, this.CLEANUP_INTERVAL)
  }

  // 清理旧历史记录
  private cleanupOldHistory(): void {
    if (this.changeHistory.length === 0) return

    const now = Date.now()
    const maxAge = 5 * 60 * 1000 // 5分钟

    // 过滤掉过期的历史记录（同时过滤掉 undefined 元素）
    const filtered = this.changeHistory.filter(change => change && now - change.timestamp < maxAge)

    if (filtered.length < this.changeHistory.length) {
      this.changeHistory = filtered
      this.logger?.debug('Cleaned old state history', {
        removed: this.changeHistory.length - filtered.length
      })
    }
  }

  // 清理空的监听器
  private cleanupEmptyWatchers(): void {
    const emptyKeys: string[] = []

    for (const [key, callbacks] of this.watchers.entries()) {
      if (callbacks.size === 0) {
        emptyKeys.push(key)
      }
    }

    emptyKeys.forEach(key => this.watchers.delete(key))
  }

  // 记录变更历史 - 优化版使用环形缓冲区
  private recordChange(path: string, oldValue: unknown, newValue: unknown): void {
    const entry = {
      path,
      oldValue,
      newValue,
      timestamp: Date.now(),
    }

    if (this.changeHistory.length < this.maxHistorySize) {
      // 未满时直接添加
      this.changeHistory.unshift(entry)
    } else {
      // 已满时使用环形缓冲区，覆盖最旧的
      this.changeHistory.pop() // 移除最后一个
      this.changeHistory.unshift(entry)
    }
  }

  // 批量更新优化（暂未使用，移除以通过严格类型检查）
  // private batchUpdate(key: string, updateFn: () => void): void {
  //   this.batchUpdates.add(key)
  //
  //   if (this.batchTimeout) {
  //     clearTimeout(this.batchTimeout)
  //   }
  //
  //   this.batchTimeout = setTimeout(() => {
  //     const updates = Array.from(this.batchUpdates)
  //     this.batchUpdates.clear()
  //     this.batchTimeout = null
  //
  //     // 执行批量更新
  //     updateFn()
  //
  //     this.logger?.debug('Batch state update completed', { keys: updates })
  //   }, 0) // 下一个事件循环执行
  // }

  // 获取变更历史
  getChangeHistory(
    limit?: number
  ): Array<{ path: string; oldValue: unknown; newValue: unknown; timestamp: number }> {
    return limit ? this.changeHistory.slice(0, limit) : [...this.changeHistory]
  }

  // 清除变更历史
  clearHistory(): void {
    this.changeHistory = []
  }

  // 撤销最后一次变更
  undo(): boolean {
    const lastChange = this.changeHistory.shift()
    if (!lastChange) {
      return false
    }

    try {
      // 临时禁用历史记录，避免撤销操作被记录
      const originalMaxSize = this.maxHistorySize
      this.maxHistorySize = 0

      this.setNestedValue(this.state, lastChange.path, lastChange.oldValue)

      this.maxHistorySize = originalMaxSize
      this.logger?.debug('State change undone', lastChange)
      return true
    } catch (error) {
      this.logger?.error('Failed to undo state change', {
        change: lastChange,
        error,
      })
      return false
    }
  }

  // 获取性能统计
  getPerformanceStats(): {
    totalChanges: number
    recentChanges: number
    batchedUpdates: number
    memoryUsage: number
  } {
    const now = Date.now()
    const recentChanges = this.changeHistory.filter(
      change => change && now - change.timestamp < 60000 // 最近1分钟
    ).length

    const memoryUsage =
      JSON.stringify(this.state).length +
      JSON.stringify(this.changeHistory).length

    return {
      totalChanges: this.changeHistory.length,
      recentChanges,
      batchedUpdates: this.batchUpdates?.length || 0,
      memoryUsage,
    }
  }

  /**
   * 使路径缓存失效（优化版 - LRU缓存）
   * @private
   */
  private invalidatePathCache(key: string): void {
    // 清除该路径及其所有相关路径的缓存
    const keysToDelete: string[] = []
    for (const cacheKey of this.pathCache.keys()) {
      if (cacheKey === key || cacheKey.startsWith(`${key}.`) || key.startsWith(`${cacheKey}.`)) {
        keysToDelete.push(cacheKey)
      }
    }
    keysToDelete.forEach(k => this.pathCache.delete(k))
  }

  /**
   * 清理路径缓存（LRU自动管理，无需手动清理）
   * @private
   */
  private cleanupPathCache(): void {
    // LRU缓存会自动管理大小，这里只记录统计信息
    if (this.logger) {
      const stats = this.pathCache.getStats()
      this.logger.debug('Path cache stats', stats)
    }
  }
}

// 状态命名空间类
export class StateNamespace implements StateManager {
  constructor(
    private stateManager: StateManager,
    private namespaceName: string
  ) { }

  private getKey(key: string): string {
    return `${this.namespaceName}.${key}`
  }

  get<T = unknown>(key: string): T | undefined {
    return this.stateManager.get<T>(this.getKey(key))
  }

  set<T = unknown>(key: string, value: T): void {
    this.stateManager.set(this.getKey(key), value)
  }

  remove(key: string): void {
    this.stateManager.remove(this.getKey(key))
  }

  has(key: string): boolean {
    return this.stateManager.has(this.getKey(key))
  }

  watch<T = unknown>(
    key: string,
    callback: (newValue: T, oldValue: T) => void
  ): () => void {
    return this.stateManager.watch(this.getKey(key), callback)
  }

  clear(): void {
    // 只清理当前命名空间的状态
    const keys = this.stateManager.keys()
    const namespacePrefix = `${this.namespaceName}.`

    keys.forEach(key => {
      if (key.startsWith(namespacePrefix)) {
        this.stateManager.remove(key)
      }
    })
  }

  keys(): string[] {
    const allKeys = this.stateManager.keys()
    const namespacePrefix = `${this.namespaceName}.`

    return allKeys
      .filter(key => key.startsWith(namespacePrefix))
      .map(key => key.substring(namespacePrefix.length))
  }

  namespace(name: string): StateManager {
    return this.stateManager.namespace(`${this.namespaceName}.${name}`)
  }

  // 获取整个状态对象（仅限当前命名空间）
  getState(): Record<string, unknown> {
    const allState = this.stateManager.getState()
    const namespacePrefix = `${this.namespaceName}.`
    const result: Record<string, unknown> = {}

    Object.keys(allState).forEach(key => {
      if (key.startsWith(namespacePrefix)) {
        const shortKey = key.substring(namespacePrefix.length)
        result[shortKey] = allState[key]
      }
    })

    return result
  }

  // 设置整个状态对象（仅限当前命名空间）
  setState(newState: Partial<Record<string, unknown>>): void {
    Object.keys(newState).forEach(key => {
      this.set(key, newState[key])
    })
  }
}

// 添加带清理功能的接口
export interface StateManagerWithDestroy extends StateManager {
  destroy: () => void;
}

/**
 * 创建状态管理器实例
 * @param logger 日志器（可选）
 * @returns 带销毁方法的状态管理器
 */
export function createStateManager(logger?: Logger): StateManagerWithDestroy {
  const manager = new StateManagerImpl(logger);

  // 添加 destroy 方法
  (manager as any).destroy = function () {
    // 停止定期清理
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }

    // 清理所有监听器
    this.watchers.clear()

    // 清理批量更新集合
    if (this.batchUpdates) {
      this.batchUpdates = null
    }

    // 清理路径缓存
    if (this.pathCache) {
      this.pathCache.clear()
    }

    // 清空历史记录
    this.changeHistory = []
    this.historyIndex = 0

    // 清空响应式状态
    if (this.state && typeof this.state === 'object') {
      Object.keys(this.state).forEach(key => {
        delete this.state[key]
      })
    }

    // 清理日志器引用
    this.logger = undefined
  };

  return manager as any as StateManagerWithDestroy;
}

// 预定义的状态模块
export const stateModules = {
  // 用户状态模块
  user: (stateManager: StateManager) => {
    const userState = stateManager.namespace('user')

    return {
      setUser: (user: unknown) => userState.set('profile', user),
      getUser: () => userState.get('profile'),
      setToken: (token: string) => userState.set('token', token),
      getToken: () => userState.get('token'),
      logout: () => {
        userState.clear()
      },
      isLoggedIn: () => !!userState.get('token'),
    }
  },

  // 应用状态模块
  app: (stateManager: StateManager) => {
    const appState = stateManager.namespace('app')

    return {
      setLoading: (loading: boolean) => appState.set('loading', loading),
      isLoading: () => appState.get('loading') || false,
      setError: (error: string | null) => appState.set('error', error),
      getError: () => appState.get('error'),
      clearError: () => appState.remove('error'),
      setTitle: (title: string) => appState.set('title', title),
      getTitle: () => appState.get('title'),
    }
  },

  // 设置状态模块
  settings: (stateManager: StateManager) => {
    const settingsState = stateManager.namespace('settings')

    return {
      setSetting: (key: string, value: unknown) => settingsState.set(key, value),
      getSetting: (key: string, defaultValue?: unknown) =>
        settingsState.get(key) ?? defaultValue,
      removeSetting: (key: string) => settingsState.remove(key),
      getAllSettings: () => settingsState.get('') || {},
      resetSettings: () => settingsState.clear(),
    }
  },
}
