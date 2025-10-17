/**
 * 增强的全局响应式状态系统
 * 支持深度响应式、持久化、时间旅行、状态快照等功能
 */

import type { Engine, Logger } from '../types'
import { computed, type ComputedRef, reactive, readonly, ref, shallowRef, toRefs, watch } from 'vue'

// ==================== 类型定义 ====================

export interface StateOptions {
  persist?: boolean | PersistOptions
  deep?: boolean
  immediate?: boolean
  validator?: (value: unknown) => boolean
  transformer?: StateTransformer
  history?: boolean | HistoryOptions
}

export interface PersistOptions {
  key: string
  storage?: Storage
  serializer?: Serializer
  debounce?: number
  excludePaths?: string[]
}

export interface Serializer {
  serialize: (value: unknown) => string
  deserialize: (value: string) => unknown
}

export interface StateTransformer {
  in?: (value: unknown) => unknown
  out?: (value: unknown) => unknown
}

export interface HistoryOptions {
  maxSize?: number
  debounce?: number
  excludePaths?: string[]
}

export interface StateSnapshot {
  id: string
  timestamp: number
  state: Record<string, unknown>
  metadata?: Record<string, unknown>
}

export interface StateWatcher {
  path: string
  callback: (value: unknown, oldValue: unknown) => void
  options?: WatchOptions
  unwatch?: () => void
}

export interface WatchOptions {
  deep?: boolean
  immediate?: boolean
  flush?: 'pre' | 'post' | 'sync'
}

export interface StateModule {
  namespace: string
  state: Record<string, unknown>
  getters?: Record<string, (state: any) => unknown>
  actions?: Record<string, Function>
  mutations?: Record<string, Function>
  modules?: Record<string, StateModule>
}

// ==================== 实现 ====================

export class EnhancedStateSystem {
  private state = reactive<Record<string, any>>({})
  private modules = new Map<string, StateModule>()
  private watchers = new Map<string, Set<StateWatcher>>()
  private history: StateSnapshot[] = []
  private historyIndex = -1
  private computedCache = new Map<string, ReturnType<typeof computed>>()
  private persistConfigs = new Map<string, PersistOptions>()
  private stateOptions = new Map<string, StateOptions>()
  private engine?: Engine
  private logger?: Logger
  private isDirty = false
  private saveTimer?: number

  constructor(engine?: Engine) {
    this.engine = engine
    this.logger = engine?.logger
    this.initialize()
  }

  private initialize(): void {
    // 初始化持久化
    this.loadPersistedState()
    
    // 设置全局状态监听
    this.setupGlobalWatcher()
    
    // 初始化历史记录
    if (this.engine?.config?.get('state.history')) {
      this.enableHistory()
    }
  }

  // ==================== 核心状态管理 ====================

  /**
   * 设置状态值
   */
  setState<T = unknown>(path: string, value: T, options?: StateOptions): void {
    // 验证值
    if (options?.validator && !options.validator(value)) {
      throw new Error(`Validation failed for path: ${path}`)
    }

    // 应用转换器
    let transformedValue = value
    if (options?.transformer?.in) {
      transformedValue = options.transformer.in(value) as T
    }

    // 保存旧值
    const oldValue = this.getState(path)
    
    // 设置新值
    this.setNestedValue(this.state, path, transformedValue)
    
    // 保存选项
    if (options) {
      this.stateOptions.set(path, options)
    }

    // 触发监听器
    this.triggerWatchers(path, transformedValue, oldValue)
    
    // 记录历史
    if (options?.history !== false) {
      this.recordHistory(path, transformedValue, oldValue)
    }

    // 持久化
    if (options?.persist) {
      this.persistState(path, transformedValue, options.persist)
    }

    this.logger?.debug(`State updated: ${path}`, { oldValue, newValue: transformedValue })
  }

  /**
   * 获取状态值
   */
  getState<T = unknown>(path: string): T | undefined {
    const value = this.getNestedValue(this.state, path)
    
    // 应用输出转换器
    const options = this.stateOptions.get(path)
    if (options?.transformer?.out) {
      return options.transformer.out(value) as T
    }
    
    return value as T
  }

  /**
   * 删除状态
   */
  deleteState(path: string): void {
    const oldValue = this.getState(path)
    this.deleteNestedValue(this.state, path)
    this.triggerWatchers(path, undefined, oldValue)
    this.recordHistory(path, undefined, oldValue)
  }

  /**
   * 批量更新状态
   */
  batchUpdate(updates: Record<string, unknown>): void {
    Object.entries(updates).forEach(([path, value]) => {
      this.setState(path, value)
    })
  }

  // ==================== 响应式 API ====================

  /**
   * 创建计算属性
   */
  createComputed<T>(key: string, getter: () => T): ComputedRef<T> {
    if (this.computedCache.has(key)) {
      return this.computedCache.get(key)! as ComputedRef<T>
    }
    
    const computedRef = computed(getter)
    this.computedCache.set(key, computedRef as any)
    
    return computedRef
  }

  /**
   * 创建响应式引用
   */
  createRef<T>(value: T, shallow = false): ReturnType<typeof ref> {
    return shallow ? shallowRef(value) : ref(value)
  }

  /**
   * 监听状态变化
   */
  watch<T = unknown>(
    path: string | (() => T),
    callback: (value: T, oldValue: T) => void,
    options?: WatchOptions
  ): () => void {
    if (typeof path === 'string') {
      const watcher: StateWatcher = {
        path,
        callback: callback as any,
        options
      }
      
      // 创建 Vue watch
      const unwatch = watch(
        () => this.getState(path),
        (newVal, oldVal) => {
          callback(newVal as T, oldVal as T)
        },
        options as any
      )
      
      watcher.unwatch = unwatch
      
      // 保存监听器
      if (!this.watchers.has(path)) {
        this.watchers.set(path, new Set())
      }
      this.watchers.get(path)!.add(watcher)
      
      return () => {
        unwatch()
        this.watchers.get(path)?.delete(watcher)
      }
    } else {
      // 函数式监听
      return watch(path, callback as any, options as any)
    }
  }

  /**
   * 监听多个路径
   */
  watchMultiple(
    paths: string[],
    callback: (values: unknown[], oldValues: unknown[]) => void,
    options?: WatchOptions
  ): () => void {
    return watch(
      paths.map(path => () => this.getState(path)),
      callback,
      options
    )
  }

  /**
   * 获取响应式状态引用
   */
  toRefs<T extends Record<string, unknown>>(path?: string): T {
    const target = path ? this.getState(path) : this.state
    return toRefs(target || {}) as T
  }

  /**
   * 获取只读状态
   */
  getReadonlyState<T = unknown>(path?: string): T {
    const target = path ? this.getState(path) : this.state
    if (target && typeof target === 'object') {
      return readonly(target as object) as T
    }
    return target as T
  }

  // ==================== 模块化状态 ====================

  /**
   * 注册状态模块
   */
  registerModule(module: StateModule): void {
    if (this.modules.has(module.namespace)) {
      throw new Error(`Module "${module.namespace}" already exists`)
    }
    
    // 初始化模块状态
    this.state[module.namespace] = reactive(module.state)
    
    // 注册 getters
    if (module.getters) {
      Object.entries(module.getters).forEach(([key, getter]) => {
        const computedKey = `${module.namespace}.${key}`
        this.createComputed(computedKey, () => getter(this.state[module.namespace]))
      })
    }
    
    // 注册 actions
    if (module.actions) {
      Object.entries(module.actions).forEach(([key, action]) => {
        const actionKey = `${module.namespace}/${key}`
        this.state[actionKey] = action.bind(this.state[module.namespace])
      })
    }
    
    // 保存模块
    this.modules.set(module.namespace, module)
    
    // 递归注册子模块
    if (module.modules) {
      Object.entries(module.modules).forEach(([key, subModule]) => {
        this.registerModule({
          ...subModule,
          namespace: `${module.namespace}.${key}`
        })
      })
    }
    
    this.logger?.info(`State module registered: ${module.namespace}`)
  }

  /**
   * 注销模块
   */
  unregisterModule(namespace: string): void {
    const module = this.modules.get(namespace)
    if (!module) {
      throw new Error(`Module "${namespace}" not found`)
    }
    
    // 删除模块状态
    delete this.state[namespace]
    
    // 清理计算属性
    this.computedCache.forEach((_, key) => {
      if (key.startsWith(`${namespace}.`)) {
        this.computedCache.delete(key)
      }
    })
    
    // 清理监听器
    this.watchers.forEach((_, key) => {
      if (key.startsWith(`${namespace}.`)) {
        this.watchers.get(key)?.forEach(w => w.unwatch?.())
        this.watchers.delete(key)
      }
    })
    
    // 删除模块
    this.modules.delete(namespace)
    
    this.logger?.info(`State module unregistered: ${namespace}`)
  }

  /**
   * 获取模块
   */
  getModule(namespace: string): StateModule | undefined {
    return this.modules.get(namespace)
  }

  // ==================== 持久化 ====================

  /**
   * 配置持久化
   */
  configurePersistence(path: string, options: PersistOptions): void {
    this.persistConfigs.set(path, options)
    
    // 立即保存当前值
    const value = this.getState(path)
    if (value !== undefined) {
      this.persistState(path, value, options)
    }
  }

  /**
   * 持久化状态
   */
  private persistState(path: string, value: unknown, options: boolean | PersistOptions): void {
    const config = typeof options === 'boolean' 
      ? { key: path, storage: localStorage }
      : options
    
    const storage = config.storage || localStorage
    const serializer = config.serializer || {
      serialize: JSON.stringify,
      deserialize: JSON.parse
    }
    
    try {
      const serialized = serializer.serialize(value)
      storage.setItem(config.key, serialized)
    } catch (error) {
      this.logger?.error(`Failed to persist state: ${path}`, error)
    }
  }

  /**
   * 加载持久化状态
   */
  private loadPersistedState(): void {
    this.persistConfigs.forEach((config, path) => {
      const storage = config.storage || localStorage
      const serializer = config.serializer || {
        serialize: JSON.stringify,
        deserialize: JSON.parse
      }
      
      try {
        const item = storage.getItem(config.key)
        if (item) {
          const value = serializer.deserialize(item)
          this.setState(path, value, { persist: config })
        }
      } catch (error) {
        this.logger?.error(`Failed to load persisted state: ${path}`, error)
      }
    })
  }

  // ==================== 时间旅行 ====================

  /**
   * 启用历史记录
   */
  enableHistory(options?: HistoryOptions): void {
    const maxSize = options?.maxSize || 50
    
    // 初始快照
    this.saveSnapshot()
    
    // 监听状态变化
    watch(this.state, () => {
      if (this.isDirty) return
      
      this.isDirty = true
      clearTimeout(this.saveTimer)
      
      this.saveTimer = window.setTimeout(() => {
        this.saveSnapshot()
        this.isDirty = false
        
        // 限制历史大小
        if (this.history.length > maxSize) {
          this.history = this.history.slice(-maxSize)
        }
      }, options?.debounce || 500)
    }, { deep: true })
  }

  /**
   * 保存快照
   */
  saveSnapshot(metadata?: Record<string, unknown>): string {
    const snapshot: StateSnapshot = {
      id: this.generateSnapshotId(),
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(this.state)),
      metadata
    }
    
    // 如果在历史中间，删除后续历史
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1)
    }
    
    this.history.push(snapshot)
    this.historyIndex = this.history.length - 1
    
    return snapshot.id
  }

  /**
   * 恢复快照
   */
  restoreSnapshot(id: string): void {
    const index = this.history.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error(`Snapshot not found: ${id}`)
    }
    
    const snapshot = this.history[index]
    this.state = reactive(JSON.parse(JSON.stringify(snapshot.state)))
    this.historyIndex = index
    
    this.logger?.info(`State restored from snapshot: ${id}`)
  }

  /**
   * 撤销
   */
  undo(): boolean {
    if (!this.canUndo()) return false
    
    this.historyIndex--
    const snapshot = this.history[this.historyIndex]
    this.state = reactive(JSON.parse(JSON.stringify(snapshot.state)))
    
    return true
  }

  /**
   * 重做
   */
  redo(): boolean {
    if (!this.canRedo()) return false
    
    this.historyIndex++
    const snapshot = this.history[this.historyIndex]
    this.state = reactive(JSON.parse(JSON.stringify(snapshot.state)))
    
    return true
  }

  canUndo(): boolean {
    return this.historyIndex > 0
  }

  canRedo(): boolean {
    return this.historyIndex < this.history.length - 1
  }

  getHistory(): StateSnapshot[] {
    return [...this.history]
  }

  // ==================== 工具方法 ====================

  private setNestedValue(obj: any, path: string, value: unknown): void {
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

  private getNestedValue(obj: any, path: string): unknown {
    const keys = path.split('.')
    let current = obj
    
    for (const key of keys) {
      if (current === null || current === undefined) {
        return undefined
      }
      current = current[key]
    }
    
    return current
  }

  private deleteNestedValue(obj: any, path: string): void {
    const keys = path.split('.')
    let current = obj
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current || typeof current !== 'object') return
      current = current[keys[i]]
    }
    
    if (current && typeof current === 'object') {
      delete current[keys[keys.length - 1]]
    }
  }

  private triggerWatchers(path: string, newValue: unknown, oldValue: unknown): void {
    // 触发精确匹配的监听器
    const exactWatchers = this.watchers.get(path)
    if (exactWatchers) {
      exactWatchers.forEach(watcher => {
        try {
          watcher.callback(newValue, oldValue)
        } catch (error) {
          this.logger?.error(`Error in state watcher: ${path}`, error)
        }
      })
    }
    
    // 触发父路径的深度监听器
    const pathParts = path.split('.')
    for (let i = pathParts.length - 1; i > 0; i--) {
      const parentPath = pathParts.slice(0, i).join('.')
      const parentWatchers = this.watchers.get(parentPath)
      
      if (parentWatchers) {
        parentWatchers.forEach(watcher => {
          if (watcher.options?.deep) {
            try {
              watcher.callback(this.getState(parentPath), undefined)
            } catch (error) {
              this.logger?.error(`Error in state watcher: ${parentPath}`, error)
            }
          }
        })
      }
    }
  }

  private recordHistory(path: string, newValue: unknown, oldValue: unknown): void {
    // 历史记录由全局监听器处理
  }

  private setupGlobalWatcher(): void {
    // 全局状态变化监听
    watch(this.state, (newState, oldState) => {
      this.logger?.debug('Global state changed', { newState, oldState })
    }, { deep: true })
  }

  private generateSnapshotId(): string {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // ==================== 公共 API ====================

  /**
   * 获取完整状态
   */
  getFullState(): Record<string, unknown> {
    return JSON.parse(JSON.stringify(this.state))
  }

  /**
   * 重置状态
   */
  reset(path?: string): void {
    if (path) {
      const module = this.modules.get(path)
      if (module) {
        this.state[path] = reactive(JSON.parse(JSON.stringify(module.state)))
      } else {
        this.deleteState(path)
      }
    } else {
      // 重置所有模块
      this.modules.forEach((module, namespace) => {
        this.state[namespace] = reactive(JSON.parse(JSON.stringify(module.state)))
      })
    }
  }

  /**
   * 清空状态
   */
  clear(): void {
    // 清理监听器
    this.watchers.forEach(watchers => {
      watchers.forEach(w => w.unwatch?.())
    })
    this.watchers.clear()
    
    // 清理计算属性
    this.computedCache.clear()
    
    // 清空状态
    Object.keys(this.state).forEach(key => {
      delete this.state[key]
    })
    
    // 清空历史
    this.history = []
    this.historyIndex = -1
  }

  /**
   * 销毁系统
   */
  destroy(): void {
    this.clear()
    this.modules.clear()
    this.persistConfigs.clear()
    this.stateOptions.clear()
    clearTimeout(this.saveTimer)
  }
}

// 导出工厂函数
export function createEnhancedStateSystem(engine?: Engine): EnhancedStateSystem {
  return new EnhancedStateSystem(engine)
}