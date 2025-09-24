import type { Logger, StateManager } from '../types'
import { reactive } from 'vue'

type WatchCallback = (newValue: unknown, oldValue: unknown) => void

export class StateManagerImpl implements StateManager {
  private state = reactive<Record<string, unknown>>({})
  private watchers = new Map<string, WatchCallback[]>()
  private changeHistory: Array<{
    path: string
    oldValue: unknown
    newValue: unknown
    timestamp: number
  }> = []

  private maxHistorySize = 100
  private batchUpdates = new Set<string>()

  constructor(private logger?: Logger) {
    // logger参数保留用于未来扩展
  }

  get<T = unknown>(key: string): T | undefined {
    return this.getNestedValue(this.state, key) as T
  }

  set<T = unknown>(key: string, value: T): void {
    try {
      const oldValue = this.getNestedValue(this.state, key)

      // 记录变更历史
      this.recordChange(key, oldValue, value)

      // 直接设置值，不使用批量更新（简化实现）
      this.setNestedValue(this.state, key, value)

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

  clear(): void {
    // 清理所有监听器
    this.watchers.clear()

    // 清空状态 - 添加防御性检查
    if (this.state && typeof this.state === 'object') {
      Object.keys(this.state).forEach(key => {
        delete this.state[key]
      })
    }
  }

  watch<T = unknown>(
    key: string,
    callback: (newValue: T, oldValue: T) => void
  ): () => void {
    // 存储监听器
    if (!this.watchers.has(key)) {
      this.watchers.set(key, [])
    }
    this.watchers.get(key)!.push(callback as WatchCallback)

    // 返回取消监听函数
    return () => {
      const callbacks = this.watchers.get(key)
      if (callbacks) {
        const index = callbacks.indexOf(callback as unknown as WatchCallback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
        if (callbacks.length === 0) {
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
      callbacks.forEach((callback: WatchCallback) => {
        try {
          callback(newValue, oldValue)
        } catch (error) {
          this.logger?.error('Error in state watcher callback', { key, error })
        }
      })
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

  // 递归获取所有键
  private getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
    const keys: string[] = []

    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key
      keys.push(fullKey)

      const val = obj[key]
      if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        keys.push(...this.getAllKeys(val as Record<string, unknown>, fullKey))
      }
    }

    return keys
  }

  // 获取状态快照
  getSnapshot(): Record<string, unknown> {
    return JSON.parse(JSON.stringify(this.state))
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
      (sum, array) => sum + array.length,
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

  // 记录变更历史
  private recordChange(path: string, oldValue: unknown, newValue: unknown): void {
    this.changeHistory.unshift({
      path,
      oldValue,
      newValue,
      timestamp: Date.now(),
    })

    // 限制历史记录大小
    if (this.changeHistory.length > this.maxHistorySize) {
      this.changeHistory = this.changeHistory.slice(0, this.maxHistorySize)
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
      change => now - change.timestamp < 60000 // 最近1分钟
    ).length

    const memoryUsage =
      JSON.stringify(this.state).length +
      JSON.stringify(this.changeHistory).length

    return {
      totalChanges: this.changeHistory.length,
      recentChanges,
      batchedUpdates: this.batchUpdates.size,
      memoryUsage,
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
}

export function createStateManager(logger?: Logger): StateManager {
  return new StateManagerImpl(logger)
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
