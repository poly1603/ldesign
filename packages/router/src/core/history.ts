/**
 * @ldesign/router 历史管理器
 *
 * 提供多种历史模式的实现：HTML5 History、Hash、Memory
 */

import type {
  HistoryLocation,
  HistoryState,
  NavigationCallback,
  NavigationDirection,
  NavigationInformation,
  NavigationType,
  RouterHistory,
} from '../types'
import { SUPPORTS_HISTORY } from './constants'

// ==================== 基础历史管理器 ====================

/**
 * 基础历史管理器抽象类
 */
abstract class BaseHistory implements RouterHistory {
  protected listeners: NavigationCallback[] = []
  protected _base: string
  protected _location: HistoryLocation
  protected _state: HistoryState

  constructor(base: string = '') {
    this._base = this.normalizeBase(base)
    this._location = this.getCurrentLocation()
    this._state = this.getCurrentState()
  }

  get base(): string {
    return this._base
  }

  get location(): HistoryLocation {
    return this._location
  }

  get state(): HistoryState {
    return this._state
  }

  abstract push(to: HistoryLocation, data?: HistoryState): void
  abstract replace(to: HistoryLocation, data?: HistoryState): void
  abstract go(delta: number, triggerListeners?: boolean): void

  back(): void {
    this.go(-1)
  }

  forward(): void {
    this.go(1)
  }

  listen(callback: NavigationCallback): () => void {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index >= 0) {
        this.listeners.splice(index, 1)
      }
    }
  }

  destroy(): void {
    this.listeners = []
  }

  protected normalizeBase(base: string): string {
    if (!base)
      return ''
    base = base.replace(/^\/+/, '/').replace(/\/+$/, '')
    return base === '/' ? '' : base
  }

  protected abstract getCurrentLocation(): HistoryLocation
  protected abstract getCurrentState(): HistoryState

  protected triggerListeners(
    to: HistoryLocation,
    from: HistoryLocation,
    info: NavigationInformation,
  ): void {
    for (const listener of this.listeners) {
      listener(to, from, info)
    }
  }

  protected createNavigationInfo(
    type: NavigationType,
    delta: number = 0,
  ): NavigationInformation {
    return {
      type,
      direction: this.getNavigationDirection(delta),
      delta,
    }
  }

  protected getNavigationDirection(delta: number): NavigationDirection {
    if (delta > 0)
      return 'forward'
    if (delta < 0)
      return 'backward'
    return 'unknown'
  }

  /**
   * 清理状态数据，确保只包含可序列化的内容（优化版）
   */
  protected sanitizeStateData(data: HistoryState): HistoryState {
    // 优化：对于空对象或基本类型直接返回
    if (!data || typeof data !== 'object') {
      return data || {}
    }
    
    // 优化：使用缓存避免重复处理
    const cache = new WeakSet()
    
    const sanitize = (obj: any, depth = 0): any => {
      // 限制递归深度，避免栈溢出
      if (depth > 10) return undefined
      
      if (obj === null || obj === undefined) return obj
      
      const type = typeof obj
      if (type === 'string' || type === 'number' || type === 'boolean') {
        return obj
      }
      
      if (type === 'object') {
        // 避免循环引用
        if (cache.has(obj)) return undefined
        cache.add(obj)
        
        if (Array.isArray(obj)) {
          return obj
            .map(item => sanitize(item, depth + 1))
            .filter(item => item !== undefined)
        }
        
        if (obj.constructor === Object) {
          const result: any = {}
          for (const [key, value] of Object.entries(obj)) {
            const sanitized = sanitize(value, depth + 1)
            if (sanitized !== undefined) {
              result[key] = sanitized
            }
          }
          return result
        }
      }
      
      return undefined
    }
    
    return sanitize(data) || {}
  }
}

// ==================== HTML5 History 实现 ====================

/**
 * HTML5 History 模式
 */
class HTML5History extends BaseHistory {
  private popstateListener?: (event: PopStateEvent) => void
  private lastNavTime = 0
  private readonly NAV_THROTTLE = 50 // 防抖时间

  constructor(base?: string) {
    super(base)
    this.setupPopstateListener()
  }

  push(to: HistoryLocation, data?: HistoryState): void {
    // 优化：防抖处理
    const now = Date.now()
    if (now - this.lastNavTime < this.NAV_THROTTLE) {
      return
    }
    this.lastNavTime = now
    
    const from = this._location
    const url = this.buildURL(to)

    // 确保只传递可序列化的数据到 History API
    const serializableData = this.sanitizeStateData(data || {})
    history.pushState(serializableData, '', url)

    this._location = to
    this._state = data || {}

    this.triggerListeners(to, from, this.createNavigationInfo('push'))
  }

  replace(to: HistoryLocation, data?: HistoryState): void {
    const from = this._location
    const url = this.buildURL(to)

    // 确保只传递可序列化的数据到 History API
    const serializableData = this.sanitizeStateData(data || {})
    history.replaceState(serializableData, '', url)

    this._location = to
    this._state = data || {}

    this.triggerListeners(to, from, this.createNavigationInfo('replace'))
  }

  go(delta: number, _triggerListeners: boolean = true): void {
    history.go(delta)
    // popstate 事件会触发监听器
  }

  override destroy(): void {
    super.destroy()
    if (this.popstateListener) {
      window.removeEventListener('popstate', this.popstateListener)
    }
  }

  protected getCurrentLocation(): HistoryLocation {
    const { pathname, search, hash } = window.location
    return {
      pathname: this.stripBase(pathname),
      search,
      hash,
    }
  }

  protected getCurrentState(): HistoryState {
    return history.state || {}
  }

  private setupPopstateListener(): void {
    let isProcessing = false
    
    this.popstateListener = (event: PopStateEvent) => {
      // 防止重复处理
      if (isProcessing) return
      isProcessing = true
      
      const from = this._location
      const to = this.getCurrentLocation()

      this._location = to
      this._state = event.state || {}

      this.triggerListeners(to, from, this.createNavigationInfo('pop'))
      
      // 使用 requestAnimationFrame 确保在下一帧重置标志
      requestAnimationFrame(() => {
        isProcessing = false
      })
    }

    window.addEventListener('popstate', this.popstateListener, { passive: true })
  }

  private buildURL(location: HistoryLocation): string {
    const { pathname, search, hash } = location
    return this._base + pathname + search + hash
  }

  private stripBase(pathname: string): string {
    if (!this._base)
      return pathname
    if (pathname.startsWith(this._base)) {
      return pathname.slice(this._base.length) || '/'
    }
    return pathname
  }
}

// ==================== Hash History 实现 ====================

/**
 * Hash History 模式
 */
class HashHistory extends BaseHistory {
  private hashchangeListener?: (event: HashChangeEvent) => void

  constructor(base?: string) {
    super(base)
    this.setupHashchangeListener()
  }

  push(to: HistoryLocation, data?: HistoryState): void {
    const from = { ...this._location }
    const url = this.buildHashURL(to)

    // 使用 pushState 存储状态（如果支持）
    if (SUPPORTS_HISTORY) {
      const serializableData = this.sanitizeStateData(data || {})
      history.pushState(serializableData, '', url)
    }
    else {
      window.location.hash = this.buildHash(to)
    }

    this._location = to
    this._state = data || {}

    this.triggerListeners(to, from, this.createNavigationInfo('push'))
  }

  replace(to: HistoryLocation, data?: HistoryState): void {
    const from = { ...this._location }
    const url = this.buildHashURL(to)

    if (SUPPORTS_HISTORY) {
      const serializableData = this.sanitizeStateData(data || {})
      history.replaceState(serializableData, '', url)
    }
    else {
      window.location.replace(url)
    }

    this._location = to
    this._state = data || {}

    this.triggerListeners(to, from, this.createNavigationInfo('replace'))
  }

  go(delta: number, _triggerListeners: boolean = true): void {
    history.go(delta)
  }

  override destroy(): void {
    super.destroy()
    if (this.hashchangeListener) {
      window.removeEventListener('hashchange', this.hashchangeListener)
    }
  }

  protected getCurrentLocation(): HistoryLocation {
    const hash = window.location.hash.slice(1)
    const [pathname, search] = hash.split('?')

    return {
      pathname: pathname || '/',
      search: search ? `?${search}` : '',
      hash: '',
    }
  }

  protected getCurrentState(): HistoryState {
    return SUPPORTS_HISTORY ? history.state || {} : {}
  }

  private setupHashchangeListener(): void {
    this.hashchangeListener = () => {
      const from = { ...this._location }
      const to = this.getCurrentLocation()

      this._location = to
      this._state = this.getCurrentState()

      this.triggerListeners(to, from, this.createNavigationInfo('pop'))
    }

    window.addEventListener('hashchange', this.hashchangeListener)
  }

  private buildHashURL(location: HistoryLocation): string {
    const hash = this.buildHash(location)
    return `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}#${hash}`
  }

  private buildHash(location: HistoryLocation): string {
    const { pathname, search } = location
    return pathname + search
  }
}

// ==================== Memory History 实现 ====================

/**
 * Memory History 模式（用于 SSR 或测试）
 */
class MemoryHistory extends BaseHistory {
  private stack: Array<{ location: HistoryLocation, state: HistoryState }> = []
  private index: number = -1
  private readonly MAX_STACK_SIZE = 100 // 限制历史栈大小

  constructor(base?: string, initialLocation?: HistoryLocation) {
    super(base)

    const location = initialLocation || { pathname: '/', search: '', hash: '' }
    this.stack.push({ location, state: {} })
    this.index = 0
    this._location = location
  }

  push(to: HistoryLocation, data?: HistoryState): void {
    const from = this._location

    // 移除当前位置之后的所有历史记录
    this.stack = this.stack.slice(0, this.index + 1)

    // 限制栈大小
    if (this.stack.length >= this.MAX_STACK_SIZE) {
      this.stack.shift() // 移除最旧的记录
      this.index--
    }

    // 添加新记录
    this.stack.push({ location: to, state: data || {} })
    this.index++

    this._location = to
    this._state = data || {}

    this.triggerListeners(to, from, this.createNavigationInfo('push'))
  }

  replace(to: HistoryLocation, data?: HistoryState): void {
    const from = { ...this._location }

    // 替换当前记录
    this.stack[this.index] = { location: to, state: data || {} }

    this._location = to
    this._state = data || {}

    this.triggerListeners(to, from, this.createNavigationInfo('replace'))
  }

  go(delta: number, triggerListeners: boolean = true): void {
    const newIndex = this.index + delta

    if (newIndex < 0 || newIndex >= this.stack.length) {
      return // 无法导航
    }

    const from = { ...this._location }
    const stackEntry = this.stack[newIndex]
    if (!stackEntry) {
      return // 无法导航，堆栈条目不存在
    }
    const { location, state } = stackEntry

    this.index = newIndex
    this._location = location
    this._state = state

    if (triggerListeners) {
      this.triggerListeners(
        location,
        from,
        this.createNavigationInfo('pop', delta),
      )
    }
  }

  protected getCurrentLocation(): HistoryLocation {
    return this._location
  }

  protected getCurrentState(): HistoryState {
    return this._state
  }
}

// ==================== 工厂函数 ====================

/**
 * 创建 HTML5 History
 */
export function createWebHistory(base?: string): RouterHistory {
  if (typeof window === 'undefined') {
    throw new TypeError(
      'createWebHistory() can only be used in browser environment',
    )
  }

  if (!SUPPORTS_HISTORY) {
    console.warn(
      'HTML5 History API is not supported, falling back to hash mode',
    )
    return createWebHashHistory(base)
  }

  return new HTML5History(base)
}

/**
 * 创建 Hash History
 */
export function createWebHashHistory(base?: string): RouterHistory {
  if (typeof window === 'undefined') {
    throw new TypeError(
      'createWebHashHistory() can only be used in browser environment',
    )
  }

  return new HashHistory(base)
}

/**
 * 创建 Memory History
 */
export function createMemoryHistory(
  base?: string,
  initialLocation?: HistoryLocation,
): RouterHistory {
  return new MemoryHistory(base, initialLocation)
}
