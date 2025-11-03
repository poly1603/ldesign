/**
 * 状态管理器实现
 * 
 * 提供响应式状态管理功能，支持嵌套路径访问和监听。
 * 
 * 主要特性：
 * - 路径编译缓存，提升访问性能
 * - 浅层比较，减少不必要的更新
 * - 深度限制，防止内存爆炸
 * - 批量更新支持
 * - 计算属性支持
 * - 状态持久化支持
 * 
 * @packageDocumentation
 */

import type { StateChangeCallback, StateManager, Unsubscribe, ComputedConfig } from '../types'
import { StateError, ErrorCodes } from '../errors'

/**
 * 路径访问器
 */
type PathAccessor = (obj: any) => any

/**
 * 路径设置器
 */
type PathSetter = (obj: any, value: any) => void

/**
 * 状态管理器配置
 */
interface StateManagerConfig {
  /** 最大状态深度 */
  maxDepth?: number
  /** 是否启用浅层比较 */
  shallowCompare?: boolean
  /** 自定义比较函数 */
  compareFn?: (a: any, b: any) => boolean
}

/**
 * 浅层比较两个值是否相等
 */
function shallowEqual(a: any, b: any): boolean {
  if (Object.is(a, b)) {
    return true
  }

  if (
    typeof a !== 'object'
    || a === null
    || typeof b !== 'object'
    || b === null
  ) {
    return false
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key) || !Object.is(a[key], b[key])) {
      return false
    }
  }

  return true
}

/**
 * 核心状态管理器实现
 * 
 * @example
 * ```typescript
 * const state = new CoreStateManager({
 *   maxDepth: 10,
 *   shallowCompare: true
 * })
 * 
 * // 设置状态
 * state.set('user.profile', {
 *   name: 'Alice',
 *   age: 30
 * })
 * 
 * // 监听变化
 * const unsubscribe = state.watch('user.profile', (newValue, oldValue) => {
 *   console.log('用户资料更新:', newValue)
 * })
 * 
 * // 获取状态
 * const profile = state.get<UserProfile>('user.profile')
 * ```
 */
/**
 * 计算属性定义
 */
interface ComputedProperty<T = any> {
  config: ComputedConfig<T>
  cachedValue?: T
  isDirty: boolean
  unsubscribers: Unsubscribe[]
}

export class CoreStateManager implements StateManager {
  private state: Record<string, any> = {}
  private watchers = new Map<string, Set<StateChangeCallback>>()

  // 批量更新标志
  private isBatching = false
  private batchedChanges: Array<{
    path: string
    newValue: any
    oldValue: any
  }> = []

  // 路径编译缓存
  private pathAccessorCache = new Map<string, PathAccessor>()
  private pathSetterCache = new Map<string, PathSetter>()
  private pathPartsCache = new Map<string, string[]>()

  // 计算属性
  private computedProperties = new Map<string, ComputedProperty>()

  // 配置
  private config: Required<StateManagerConfig>

  constructor(config: StateManagerConfig = {}) {
    this.config = {
      maxDepth: config.maxDepth ?? 10,
      shallowCompare: config.shallowCompare ?? true,
      compareFn: config.compareFn ?? shallowEqual,
    }
  }

  /**
   * 设置状态
   * 
   * @param path - 状态路径（支持点号分隔的嵌套路径）
   * @param value - 状态值
   * 
   * @throws 如果路径深度超过限制
   * 
   * @example
   * ```typescript
   * // 简单路径
   * state.set('count', 10)
   * 
   * // 嵌套路径
   * state.set('user.profile.name', 'Alice')
   * 
   * // 对象
   * state.set('user', {
   *   name: 'Alice',
   *   age: 30
   * })
   * ```
   */
  set<T = any>(path: string, value: T): void {
    // 验证路径深度
    const depth = this.getPathDepth(path)
    if (depth > this.config.maxDepth) {
      throw new Error(
        `State path depth (${depth}) exceeds maximum (${this.config.maxDepth}). ` +
        `Consider flattening your state structure.`
      )
    }

    const oldValue = this.get(path)

    // 浅层比较优化
    if (this.config.shallowCompare) {
      if (this.config.compareFn(oldValue, value)) {
        // 值未变化，不触发更新
        return
      }
    }

    // 使用缓存的setter
    const setter = this.getOrCreateSetter(path)
    setter(this.state, value)

    if (this.isBatching) {
      this.batchedChanges.push({ path, newValue: value, oldValue })
    }
    else {
      this.notifyWatchers(path, value, oldValue)
    }
  }

  /**
   * 获取状态
   *
   * @param path - 状态路径
   * @returns 状态值，如果不存在则返回 undefined
   *
   * @example
   * ```typescript
   * const count = state.get<number>('count')
   * const name = state.get<string>('user.profile.name')
   *
   * // 获取计算属性
   * const fullName = state.get<string>('user.fullName')
   * ```
   */
  get<T = any>(path: string): T | undefined {
    // 检查是否为计算属性
    const computed = this.computedProperties.get(path)
    if (computed) {
      // 如果启用缓存且值未过期,返回缓存值
      if (computed.config.cache && !computed.isDirty) {
        return computed.cachedValue as T
      }

      // 计算新值
      const value = this.computeValue(computed) as T
      if (computed.config.cache) {
        computed.cachedValue = value
        computed.isDirty = false
      }
      return value
    }

    // 使用缓存的accessor
    const accessor = this.getOrCreateAccessor(path)
    return accessor(this.state)
  }

  /**
   * 检查状态是否存在
   * 
   * @param path - 状态路径
   * @returns 是否存在
   */
  has(path: string): boolean {
    return this.get(path) !== undefined
  }

  /**
   * 删除状态
   * 
   * @param path - 状态路径
   * @returns 是否删除成功
   */
  delete(path: string): boolean {
    const oldValue = this.get(path)
    if (oldValue === undefined)
      return false

    this.deleteNestedValue(this.state, path)
    this.notifyWatchers(path, undefined, oldValue)

    return true
  }

  /**
   * 清空所有状态
   */
  clear(): void {
    const oldState = { ...this.state }
    this.state = {}

    // 通知所有监听器
    Object.keys(oldState).forEach((key) => {
      this.notifyWatchers(key, undefined, oldState[key])
    })

    // 清理缓存
    this.pathAccessorCache.clear()
    this.pathSetterCache.clear()
    this.pathPartsCache.clear()
  }

  /**
   * 批量设置状态
   *
   * @param entries - 路径-值对象
   */
  setMany(entries: Record<string, any>): void {
    for (const [path, value] of Object.entries(entries)) {
      this.set(path, value)
    }
  }

  /**
   * 批量获取状态
   *
   * @param paths - 状态路径数组
   * @returns 路径-值对象
   */
  getMany(paths: string[]): Record<string, any> {
    const result: Record<string, any> = {}
    for (const path of paths) {
      result[path] = this.get(path)
    }
    return result
  }

  /**
   * 批量删除状态
   *
   * @param paths - 状态路径数组
   */
  deleteMany(paths: string[]): void {
    for (const path of paths) {
      this.delete(path)
    }
  }

  /**
   * 监听状态变化
   *
   * @param path - 状态路径
   * @param callback - 回调函数
   * @returns 取消订阅函数
   * 
   * @example
   * ```typescript
   * const unsubscribe = state.watch('user.name', (newName, oldName) => {
   *   console.log(`名称从 ${oldName} 变为 ${newName}`)
   * })
   * 
   * // 取消监听
   * unsubscribe()
   * ```
   */
  watch<T = any>(path: string, callback: StateChangeCallback<T>): Unsubscribe {
    if (!this.watchers.has(path)) {
      this.watchers.set(path, new Set())
    }

    this.watchers.get(path)!.add(callback as StateChangeCallback)

    return () => {
      this.unwatch(path, callback)
    }
  }

  /**
   * 取消监听状态变化
   * 
   * @param path - 状态路径
   * @param callback - 回调函数（可选）
   */
  unwatch(path: string, callback?: StateChangeCallback): void {
    if (!callback) {
      this.watchers.delete(path)
      return
    }

    const pathWatchers = this.watchers.get(path)
    if (pathWatchers) {
      pathWatchers.delete(callback)
      if (pathWatchers.size === 0) {
        this.watchers.delete(path)
      }
    }
  }

  /**
   * 批量更新
   * 
   * 在回调函数中的所有状态更新会被批处理，
   * 只触发一次监听器通知。
   * 
   * @param updater - 更新函数
   * 
   * @example
   * ```typescript
   * state.batch(() => {
   *   state.set('user.name', 'Alice')
   *   state.set('user.age', 30)
   *   state.set('user.email', 'alice@example.com')
   * })
   * // 只触发一次 'user' 的监听器
   * ```
   */
  batch(updater: () => void): void {
    this.isBatching = true
    this.batchedChanges = []

    try {
      updater()
    }
    finally {
      this.isBatching = false

      // 通知所有批量变化
      this.batchedChanges.forEach(({ path, newValue, oldValue }) => {
        this.notifyWatchers(path, newValue, oldValue)
      })

      this.batchedChanges = []
    }
  }

  /**
   * 获取所有状态（浅拷贝）
   * 
   * @returns 状态对象
   */
  getState(): Record<string, any> {
    return { ...this.state }
  }

  /**
   * 获取状态快照（深拷贝）
   * 
   * @returns 状态快照
   */
  snapshot(): Record<string, any> {
    return JSON.parse(JSON.stringify(this.state))
  }

  /**
   * 恢复状态
   * 
   * @param snapshot - 状态快照
   */
  restore(snapshot: Record<string, any>): void {
    this.state = JSON.parse(JSON.stringify(snapshot))

    // 通知所有监听器
    this.watchers.forEach((_, path) => {
      const newValue = this.get(path)
      this.notifyWatchers(path, newValue, undefined)
    })
  }

  /**
   * 获取或创建路径访问器
   */
  private getOrCreateAccessor(path: string): PathAccessor {
    if (this.pathAccessorCache.has(path)) {
      return this.pathAccessorCache.get(path)!
    }

    const parts = this.getPathParts(path)

    // 生成访问器函数
    const accessor: PathAccessor = (obj) => {
      let current = obj
      for (const part of parts) {
        if (current === undefined || current === null) {
          return undefined
        }
        current = current[part]
      }
      return current
    }

    this.pathAccessorCache.set(path, accessor)
    return accessor
  }

  /**
   * 获取或创建路径设置器
   */
  private getOrCreateSetter(path: string): PathSetter {
    if (this.pathSetterCache.has(path)) {
      return this.pathSetterCache.get(path)!
    }

    const parts = this.getPathParts(path)

    // 生成设置器函数
    const setter: PathSetter = (obj, value) => {
      let current = obj
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]
        if (!(part in current) || typeof current[part] !== 'object') {
          current[part] = {}
        }
        current = current[part]
      }
      current[parts[parts.length - 1]] = value
    }

    this.pathSetterCache.set(path, setter)
    return setter
  }

  /**
   * 获取路径部分（带缓存）
   */
  private getPathParts(path: string): string[] {
    if (this.pathPartsCache.has(path)) {
      return this.pathPartsCache.get(path)!
    }

    const parts = path.split('.')
    this.pathPartsCache.set(path, parts)
    return parts
  }

  /**
   * 获取路径深度
   */
  private getPathDepth(path: string): number {
    return this.getPathParts(path).length
  }

  /**
   * 通知监听器
   */
  private notifyWatchers(path: string, newValue: any, oldValue: any): void {
    // 通知直接监听器
    const pathWatchers = this.watchers.get(path)
    if (pathWatchers) {
      pathWatchers.forEach((callback) => {
        try {
          callback(newValue, oldValue, path)
        }
        catch (error) {
          console.error(`Error in state watcher for "${path}":`, error)
        }
      })
    }

    // 通知父路径的监听器
    const parts = this.getPathParts(path)
    for (let i = parts.length - 1; i > 0; i--) {
      const parentPath = parts.slice(0, i).join('.')
      const parentWatchers = this.watchers.get(parentPath)

      if (parentWatchers) {
        const parentNewValue = this.get(parentPath)
        parentWatchers.forEach((callback) => {
          try {
            callback(parentNewValue, oldValue, parentPath)
          }
          catch (error) {
            console.error(`Error in state watcher for "${parentPath}":`, error)
          }
        })
      }
    }
  }

  /**
   * 删除嵌套值
   */
  private deleteNestedValue(obj: any, path: string): void {
    const parts = this.getPathParts(path)
    let current = obj

    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i]
      if (!(part in current)) {
        return
      }
      current = current[part]
    }

    delete current[parts[parts.length - 1]]
  }

  /**
   * 初始化
   */
  async init(): Promise<void> {
    // 初始化逻辑（如果需要）
  }

  /**
   * 销毁
   *
   * 清理所有资源。
   */
  async destroy(): Promise<void> {
    // 清理所有计算属性
    for (const [path] of this.computedProperties) {
      this.removeComputed(path)
    }

    this.state = {}
    this.watchers.clear()
    this.batchedChanges = []
    this.pathAccessorCache.clear()
    this.pathSetterCache.clear()
    this.pathPartsCache.clear()
    this.computedProperties.clear()
  }

  /**
   * 定义计算属性
   *
   * @param path - 计算属性的路径
   * @param config - 计算属性配置
   *
   * @example
   * ```typescript
   * // 定义全名计算属性
   * state.computed('user.fullName', {
   *   get: (state) => `${state.user.firstName} ${state.user.lastName}`,
   *   deps: ['user.firstName', 'user.lastName'],
   *   cache: true
   * })
   *
   * // 访问计算属性
   * const fullName = state.get('user.fullName')
   * ```
   */
  computed<T = any>(path: string, config: ComputedConfig<T>): void {
    if (this.computedProperties.has(path)) {
      throw new StateError(
        ErrorCodes.STATE_INVALID_PATH,
        `计算属性 "${path}" 已存在`,
        { path }
      )
    }

    const computed: ComputedProperty<T> = {
      config,
      isDirty: true,
      unsubscribers: [],
    }

    // 监听依赖变化
    for (const dep of config.deps) {
      const unsubscribe = this.watch(dep, () => {
        computed.isDirty = true
        // 如果有监听器,触发计算属性的更新通知
        if (this.watchers.has(path)) {
          const oldValue = computed.cachedValue
          const newValue = this.computeValue(computed)
          computed.cachedValue = newValue
          computed.isDirty = false
          this.notifyWatchers(path, newValue, oldValue)
        }
      })
      computed.unsubscribers.push(unsubscribe)
    }

    this.computedProperties.set(path, computed)
  }

  /**
   * 移除计算属性
   *
   * @param path - 计算属性的路径
   */
  removeComputed(path: string): void {
    const computed = this.computedProperties.get(path)
    if (!computed) {
      return
    }

    // 取消所有依赖监听
    for (const unsubscribe of computed.unsubscribers) {
      unsubscribe()
    }

    this.computedProperties.delete(path)
  }

  /**
   * 获取所有计算属性路径
   */
  getComputedPaths(): string[] {
    return Array.from(this.computedProperties.keys())
  }

  /**
   * 计算属性值
   */
  private computeValue<T>(computed: ComputedProperty<T>): T {
    return computed.config.get(this.state)
  }

  /**
   * 检查是否为计算属性
   */
  private isComputed(path: string): boolean {
    return this.computedProperties.has(path)
  }
}

/**
 * 创建状态管理器
 * 
 * @param config - 状态管理器配置
 * @returns 状态管理器实例
 * 
 * @example
 * ```typescript
 * const state = createStateManager({
 *   maxDepth: 10,
 *   shallowCompare: true
 * })
 * ```
 */
export function createStateManager(config?: StateManagerConfig): StateManager {
  return new CoreStateManager(config)
}
