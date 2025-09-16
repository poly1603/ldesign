/**
 * 高级功能模块
 * 时间旅行调试、状态快照、模块联邦、中间件系统、状态同步
 */

import { reactive, readonly, toRaw } from 'vue'
import type { UnwrapRef } from 'vue'

/**
 * 时间旅行调试器
 */
export class TimeTravelDebugger<S = any> {
  private history: StateSnapshot<S>[] = []
  private currentIndex = -1
  private maxHistorySize = 50
  private isReplaying = false
  private listeners = new Set<(snapshot: StateSnapshot<S>) => void>()
  
  constructor(options?: { maxHistorySize?: number }) {
    if (options?.maxHistorySize) {
      this.maxHistorySize = options.maxHistorySize
    }
  }
  
  /**
   * 记录状态快照
   */
  record(state: S, action?: ActionInfo): void {
    if (this.isReplaying) return
    
    // 如果不在最新位置，删除后续历史
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }
    
    // 创建快照
    const snapshot: StateSnapshot<S> = {
      state: this.cloneState(state),
      timestamp: Date.now(),
      action,
      id: this.generateId()
    }
    
    // 添加到历史
    this.history.push(snapshot)
    this.currentIndex++
    
    // 限制历史大小
    if (this.history.length > this.maxHistorySize) {
      this.history.shift()
      this.currentIndex--
    }
    
    // 通知监听器
    this.notifyListeners(snapshot)
  }
  
  /**
   * 时间旅行到指定位置
   */
  travel(index: number): S | null {
    if (index < 0 || index >= this.history.length) {
      return null
    }
    
    this.isReplaying = true
    this.currentIndex = index
    const snapshot = this.history[index]
    
    setTimeout(() => {
      this.isReplaying = false
    }, 0)
    
    return this.cloneState(snapshot.state)
  }
  
  /**
   * 后退
   */
  undo(): S | null {
    if (this.canUndo()) {
      return this.travel(this.currentIndex - 1)
    }
    return null
  }
  
  /**
   * 前进
   */
  redo(): S | null {
    if (this.canRedo()) {
      return this.travel(this.currentIndex + 1)
    }
    return null
  }
  
  /**
   * 跳转到开始
   */
  goToStart(): S | null {
    return this.travel(0)
  }
  
  /**
   * 跳转到最新
   */
  goToEnd(): S | null {
    return this.travel(this.history.length - 1)
  }
  
  /**
   * 是否可以后退
   */
  canUndo(): boolean {
    return this.currentIndex > 0
  }
  
  /**
   * 是否可以前进
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }
  
  /**
   * 获取历史记录
   */
  getHistory(): ReadonlyArray<StateSnapshot<S>> {
    return readonly(this.history) as ReadonlyArray<StateSnapshot<S>>
  }
  
  /**
   * 获取当前索引
   */
  getCurrentIndex(): number {
    return this.currentIndex
  }
  
  /**
   * 清空历史
   */
  clear(): void {
    this.history = []
    this.currentIndex = -1
  }
  
  /**
   * 监听快照变化
   */
  subscribe(listener: (snapshot: StateSnapshot<S>) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  
  /**
   * 导出历史
   */
  export(): string {
    return JSON.stringify({
      history: this.history,
      currentIndex: this.currentIndex
    })
  }
  
  /**
   * 导入历史
   */
  import(data: string): void {
    const { history, currentIndex } = JSON.parse(data)
    this.history = history
    this.currentIndex = currentIndex
  }
  
  /**
   * 克隆状态
   */
  private cloneState(state: S): S {
    return JSON.parse(JSON.stringify(toRaw(state)))
  }
  
  /**
   * 生成ID
   */
  private generateId(): string {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * 通知监听器
   */
  private notifyListeners(snapshot: StateSnapshot<S>): void {
    this.listeners.forEach(listener => listener(snapshot))
  }
}

/**
 * 状态快照管理器
 */
export class SnapshotManager<S = any> {
  private snapshots = new Map<string, StateSnapshot<S>>()
  private tags = new Map<string, Set<string>>() // tag -> snapshot ids
  
  /**
   * 创建快照
   */
  create(state: S, name?: string, tags?: string[]): string {
    const id = this.generateId()
    const snapshot: StateSnapshot<S> = {
      id,
      name: name || `Snapshot ${id}`,
      state: this.cloneState(state),
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
    
    return id
  }
  
  /**
   * 恢复快照
   */
  restore(id: string): S | null {
    const snapshot = this.snapshots.get(id)
    return snapshot ? this.cloneState(snapshot.state) : null
  }
  
  /**
   * 删除快照
   */
  delete(id: string): boolean {
    const snapshot = this.snapshots.get(id)
    if (!snapshot) return false
    
    // 清理标签索引
    if (snapshot.tags) {
      snapshot.tags.forEach(tag => {
        const ids = this.tags.get(tag)
        if (ids) {
          ids.delete(id)
          if (ids.size === 0) {
            this.tags.delete(tag)
          }
        }
      })
    }
    
    return this.snapshots.delete(id)
  }
  
  /**
   * 获取快照列表
   */
  list(): StateSnapshot<S>[] {
    return Array.from(this.snapshots.values())
  }
  
  /**
   * 按标签查找快照
   */
  findByTag(tag: string): StateSnapshot<S>[] {
    const ids = this.tags.get(tag)
    if (!ids) return []
    
    return Array.from(ids)
      .map(id => this.snapshots.get(id))
      .filter(Boolean) as StateSnapshot<S>[]
  }
  
  /**
   * 比较两个快照
   */
  compare(id1: string, id2: string): StateDiff | null {
    const snapshot1 = this.snapshots.get(id1)
    const snapshot2 = this.snapshots.get(id2)
    
    if (!snapshot1 || !snapshot2) return null
    
    return this.diff(snapshot1.state, snapshot2.state)
  }
  
  /**
   * 导出快照
   */
  export(id: string): string | null {
    const snapshot = this.snapshots.get(id)
    return snapshot ? JSON.stringify(snapshot) : null
  }
  
  /**
   * 导入快照
   */
  import(data: string): string {
    const snapshot = JSON.parse(data)
    snapshot.id = this.generateId() // 生成新ID避免冲突
    this.snapshots.set(snapshot.id, snapshot)
    return snapshot.id
  }
  
  /**
   * 清空所有快照
   */
  clear(): void {
    this.snapshots.clear()
    this.tags.clear()
  }
  
  private cloneState(state: S): S {
    return JSON.parse(JSON.stringify(toRaw(state)))
  }
  
  private generateId(): string {
    return `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  private diff(obj1: any, obj2: any, path = ''): StateDiff {
    const diff: StateDiff = {
      added: [],
      removed: [],
      modified: []
    }
    
    // 比较obj1到obj2的变化
    for (const key in obj1) {
      const fullPath = path ? `${path}.${key}` : key
      
      if (!(key in obj2)) {
        diff.removed.push({ path: fullPath, value: obj1[key] })
      } else if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
        const subDiff = this.diff(obj1[key], obj2[key], fullPath)
        diff.added.push(...subDiff.added)
        diff.removed.push(...subDiff.removed)
        diff.modified.push(...subDiff.modified)
      } else if (obj1[key] !== obj2[key]) {
        diff.modified.push({
          path: fullPath,
          oldValue: obj1[key],
          newValue: obj2[key]
        })
      }
    }
    
    // 找出新增的键
    for (const key in obj2) {
      if (!(key in obj1)) {
        const fullPath = path ? `${path}.${key}` : key
        diff.added.push({ path: fullPath, value: obj2[key] })
      }
    }
    
    return diff
  }
}

/**
 * 中间件系统
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
   * 创建action中间件
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
   * 创建状态中间件
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
        console.log('Previous State:', context.oldState)
      }
      
      await next()
      
      console.log('Next State:', context.state)
      
      if (duration) {
        const endTime = performance.now()
        console.log(`Duration: ${(endTime - startTime).toFixed(2)}ms`)
      }
      
      if (diff && context.oldState) {
        console.log('Diff:', this.computeDiff(context.oldState, context.state))
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
    // 简化的diff实现
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

/**
 * 状态同步器
 */
export class StateSynchronizer<S = any> {
  private peers = new Set<SyncPeer>()
  private syncId: string
  private version = 0
  private conflicts: ConflictResolution<S>
  private isSyncing = false
  
  constructor(syncId: string, conflictResolution?: ConflictResolution<S>) {
    this.syncId = syncId
    this.conflicts = conflictResolution || this.defaultConflictResolution
  }
  
  /**
   * 添加同步端点
   */
  addPeer(peer: SyncPeer): void {
    this.peers.add(peer)
    
    // 监听远程更新
    peer.on('update', (update: SyncUpdate<S>) => {
      if (!this.isSyncing) {
        this.handleRemoteUpdate(update)
      }
    })
  }
  
  /**
   * 移除同步端点
   */
  removePeer(peer: SyncPeer): void {
    peer.off('update')
    this.peers.delete(peer)
  }
  
  /**
   * 同步本地状态
   */
  async sync(state: S, action?: ActionInfo): Promise<void> {
    this.isSyncing = true
    this.version++
    
    const update: SyncUpdate<S> = {
      syncId: this.syncId,
      version: this.version,
      state: this.cloneState(state),
      action,
      timestamp: Date.now()
    }
    
    // 广播到所有端点
    const promises = Array.from(this.peers).map(peer => 
      peer.send(update).catch(error => {
        console.error(`Failed to sync with peer:`, error)
      })
    )
    
    await Promise.all(promises)
    
    this.isSyncing = false
  }
  
  /**
   * 处理远程更新
   */
  private async handleRemoteUpdate(update: SyncUpdate<S>): Promise<void> {
    // 版本冲突检测
    if (update.version <= this.version) {
      // 处理冲突
      const resolved = await this.conflicts(
        update.state,
        this.getCurrentState(),
        update.action
      )
      
      if (resolved) {
        this.applyState(resolved)
      }
    } else {
      // 接受远程状态
      this.version = update.version
      this.applyState(update.state)
    }
  }
  
  /**
   * 默认冲突解决策略
   */
  private defaultConflictResolution: ConflictResolution<S> = async (
    remote,
    local,
    action
  ) => {
    // 简单的last-write-wins策略
    console.warn('State conflict detected, using remote state', { remote, local, action })
    return remote
  }
  
  /**
   * 获取当前状态（需要由子类实现）
   */
  protected getCurrentState(): S {
    throw new Error('getCurrentState must be implemented')
  }
  
  /**
   * 应用状态（需要由子类实现）
   */
  protected applyState(state: S): void {
    throw new Error('applyState must be implemented')
  }
  
  private cloneState(state: S): S {
    return JSON.parse(JSON.stringify(toRaw(state)))
  }
}

/**
 * 模块联邦支持
 */
export class ModuleFederation {
  private remotes = new Map<string, RemoteModule>()
  private exposes = new Map<string, ExposedModule>()
  private shared = new Map<string, SharedModule>()
  
  /**
   * 注册远程模块
   */
  registerRemote(name: string, url: string): void {
    this.remotes.set(name, {
      name,
      url,
      loaded: false,
      module: null
    })
  }
  
  /**
   * 暴露本地模块
   */
  expose(name: string, module: any): void {
    this.exposes.set(name, {
      name,
      module
    })
  }
  
  /**
   * 注册共享模块
   */
  share(name: string, module: any, options?: ShareOptions): void {
    this.shared.set(name, {
      name,
      module,
      singleton: options?.singleton ?? false,
      version: options?.version,
      requiredVersion: options?.requiredVersion
    })
  }
  
  /**
   * 加载远程模块
   */
  async loadRemote<T = any>(remoteName: string, moduleName: string): Promise<T> {
    const remote = this.remotes.get(remoteName)
    
    if (!remote) {
      throw new Error(`Remote "${remoteName}" not found`)
    }
    
    if (!remote.loaded) {
      // 动态加载远程脚本
      await this.loadScript(remote.url)
      remote.loaded = true
      remote.module = (window as any)[remoteName]
    }
    
    if (!remote.module) {
      throw new Error(`Failed to load remote "${remoteName}"`)
    }
    
    // 获取模块
    const factory = await remote.module.get(moduleName)
    const module = factory()
    
    return module
  }
  
  /**
   * 获取暴露的模块
   */
  getExposed(name: string): any {
    const exposed = this.exposes.get(name)
    return exposed?.module
  }
  
  /**
   * 获取共享模块
   */
  getShared(name: string): any {
    const shared = this.shared.get(name)
    return shared?.module
  }
  
  /**
   * 动态加载脚本
   */
  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = url
      script.async = true
      
      script.onload = () => resolve()
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`))
      
      document.head.appendChild(script)
    })
  }
}

// 类型定义
export interface StateSnapshot<S = any> {
  id: string
  name?: string
  state: S
  timestamp: number
  action?: ActionInfo
  tags?: string[]
}

export interface ActionInfo {
  type: string
  payload?: any
  meta?: any
}

export interface StateDiff {
  added: { path: string; value: any }[]
  removed: { path: string; value: any }[]
  modified: { path: string; oldValue: any; newValue: any }[]
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

export interface SyncPeer {
  send(update: SyncUpdate<any>): Promise<void>
  on(event: 'update', handler: (update: SyncUpdate<any>) => void): void
  off(event: 'update'): void
}

export interface SyncUpdate<S = any> {
  syncId: string
  version: number
  state: S
  action?: ActionInfo
  timestamp: number
}

export interface ConflictResolution<S = any> {
  (remote: S, local: S, action?: ActionInfo): Promise<S | null>
}

export interface RemoteModule {
  name: string
  url: string
  loaded: boolean
  module: any
}

export interface ExposedModule {
  name: string
  module: any
}

export interface SharedModule {
  name: string
  module: any
  singleton: boolean
  version?: string
  requiredVersion?: string
}

export interface ShareOptions {
  singleton?: boolean
  version?: string
  requiredVersion?: string
}

// 导出便捷函数
export function createTimeTravelDebugger<S>(options?: { maxHistorySize?: number }) {
  return new TimeTravelDebugger<S>(options)
}

export function createSnapshotManager<S>() {
  return new SnapshotManager<S>()
}

export function createMiddlewareSystem<S>() {
  return new MiddlewareSystem<S>()
}

export function createStateSynchronizer<S>(
  syncId: string,
  conflictResolution?: ConflictResolution<S>
) {
  return new StateSynchronizer<S>(syncId, conflictResolution)
}

export function createModuleFederation() {
  return new ModuleFederation()
}