/**
 * 模板快照与时间旅行系统
 */

import type { Template } from '../types'

/**
 * 快照类型
 */
export interface Snapshot {
  /**
   * 快照ID
   */
  id: string
  
  /**
   * 快照名称
   */
  name?: string
  
  /**
   * 快照描述
   */
  description?: string
  
  /**
   * 创建时间
   */
  timestamp: Date
  
  /**
   * 模板状态
   */
  state: TemplateState
  
  /**
   * 快照元数据
   */
  metadata?: Record<string, any>
  
  /**
   * 快照标签
   */
  tags?: string[]
  
  /**
   * 是否为自动快照
   */
  auto?: boolean
}

/**
 * 模板状态
 */
export interface TemplateState {
  /**
   * 模板数据
   */
  template: Template
  
  /**
   * 表单数据
   */
  formData?: Record<string, any>
  
  /**
   * 用户偏好
   */
  preferences?: Record<string, any>
  
  /**
   * 运行时状态
   */
  runtime?: Record<string, any>
  
  /**
   * DOM快照
   */
  domSnapshot?: string
}

/**
 * 快照配置
 */
export interface SnapshotConfig {
  /**
   * 最大快照数量
   */
  maxSnapshots?: number
  
  /**
   * 自动快照间隔（毫秒）
   */
  autoSnapshotInterval?: number
  
  /**
   * 是否压缩存储
   */
  compress?: boolean
  
  /**
   * 是否持久化存储
   */
  persist?: boolean
  
  /**
   * 存储键名
   */
  storageKey?: string
  
  /**
   * 快照前钩子
   */
  beforeSnapshot?: (state: TemplateState) => TemplateState | false
  
  /**
   * 快照后钩子
   */
  afterSnapshot?: (snapshot: Snapshot) => void
  
  /**
   * 恢复前钩子
   */
  beforeRestore?: (snapshot: Snapshot) => boolean
  
  /**
   * 恢复后钩子
   */
  afterRestore?: (snapshot: Snapshot) => void
}

/**
 * 时间旅行配置
 */
export interface TimeTravelConfig {
  /**
   * 是否启用
   */
  enabled?: boolean
  
  /**
   * 最大历史记录
   */
  maxHistory?: number
  
  /**
   * 是否记录DOM变化
   */
  recordDOM?: boolean
  
  /**
   * 忽略的属性
   */
  ignoreProperties?: string[]
  
  /**
   * 差异算法
   */
  diffAlgorithm?: 'deep' | 'shallow' | 'custom'
  
  /**
   * 自定义差异函数
   */
  customDiff?: (prev: any, next: any) => any
}

/**
 * 快照管理器
 */
export class SnapshotManager {
  private snapshots: Map<string, Snapshot> = new Map()
  private history: string[] = []
  private currentIndex: number = -1
  private config: SnapshotConfig
  private autoSnapshotTimer: ReturnType<typeof setInterval> | null = null
  
  constructor(config: SnapshotConfig = {}) {
    this.config = {
      maxSnapshots: 50,
      autoSnapshotInterval: 0,
      compress: false,
      persist: true,
      storageKey: 'template-snapshots',
      ...config
    }
    
    if (this.config.persist) {
      this.loadFromStorage()
    }
    
    if (this.config.autoSnapshotInterval && this.config.autoSnapshotInterval > 0) {
      this.startAutoSnapshot()
    }
  }
  
  /**
   * 创建快照
   */
  createSnapshot(
    state: TemplateState,
    options: Partial<Snapshot> = {}
  ): Snapshot | null {
    // 执行前置钩子
    if (this.config.beforeSnapshot) {
      const processed = this.config.beforeSnapshot(state)
      if (processed === false) return null
      if (processed) state = processed
    }
    
    const snapshot: Snapshot = {
      id: this.generateId(),
      timestamp: new Date(),
      state: this.cloneState(state),
      ...options
    }
    
    // 添加到快照集合
    this.snapshots.set(snapshot.id, snapshot)
    this.history.push(snapshot.id)
    this.currentIndex = this.history.length - 1
    
    // 限制快照数量
    if (this.config.maxSnapshots && this.history.length > this.config.maxSnapshots) {
      const removed = this.history.shift()
      if (removed) {
        this.snapshots.delete(removed)
        this.currentIndex--
      }
    }
    
    // 持久化存储
    if (this.config.persist) {
      this.saveToStorage()
    }
    
    // 执行后置钩子
    if (this.config.afterSnapshot) {
      this.config.afterSnapshot(snapshot)
    }
    
    return snapshot
  }
  
  /**
   * 恢复快照
   */
  restoreSnapshot(snapshotId: string): TemplateState | null {
    const snapshot = this.snapshots.get(snapshotId)
    if (!snapshot) return null
    
    // 执行前置钩子
    if (this.config.beforeRestore) {
      const shouldRestore = this.config.beforeRestore(snapshot)
      if (!shouldRestore) return null
    }
    
    // 更新当前索引
    const index = this.history.indexOf(snapshotId)
    if (index !== -1) {
      this.currentIndex = index
    }
    
    // 执行后置钩子
    if (this.config.afterRestore) {
      this.config.afterRestore(snapshot)
    }
    
    return this.cloneState(snapshot.state)
  }
  
  /**
   * 获取快照
   */
  getSnapshot(snapshotId: string): Snapshot | undefined {
    return this.snapshots.get(snapshotId)
  }
  
  /**
   * 获取所有快照
   */
  getAllSnapshots(): Snapshot[] {
    return this.history.map(id => this.snapshots.get(id)!).filter(Boolean)
  }
  
  /**
   * 删除快照
   */
  deleteSnapshot(snapshotId: string): boolean {
    const deleted = this.snapshots.delete(snapshotId)
    if (deleted) {
      const index = this.history.indexOf(snapshotId)
      if (index !== -1) {
        this.history.splice(index, 1)
        if (this.currentIndex >= index) {
          this.currentIndex--
        }
      }
      
      if (this.config.persist) {
        this.saveToStorage()
      }
    }
    
    return deleted
  }
  
  /**
   * 清空快照
   */
  clearSnapshots() {
    this.snapshots.clear()
    this.history = []
    this.currentIndex = -1
    
    if (this.config.persist) {
      this.clearStorage()
    }
  }
  
  /**
   * 撤销
   */
  undo(): TemplateState | null {
    if (this.currentIndex > 0) {
      this.currentIndex--
      const snapshotId = this.history[this.currentIndex]
      return this.restoreSnapshot(snapshotId)
    }
    return null
  }
  
  /**
   * 重做
   */
  redo(): TemplateState | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++
      const snapshotId = this.history[this.currentIndex]
      return this.restoreSnapshot(snapshotId)
    }
    return null
  }
  
  /**
   * 是否可以撤销
   */
  canUndo(): boolean {
    return this.currentIndex > 0
  }
  
  /**
   * 是否可以重做
   */
  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1
  }
  
  /**
   * 开始自动快照
   */
  private startAutoSnapshot() {
    if (this.autoSnapshotTimer) {
      this.stopAutoSnapshot()
    }
    
    this.autoSnapshotTimer = setInterval(() => {
      // 这里需要外部传入当前状态
      // 通过事件或回调获取
    }, this.config.autoSnapshotInterval!)
  }
  
  /**
   * 停止自动快照
   */
  private stopAutoSnapshot() {
    if (this.autoSnapshotTimer) {
      clearInterval(this.autoSnapshotTimer)
      this.autoSnapshotTimer = null
    }
  }
  
  /**
   * 生成ID
   */
  private generateId(): string {
    return `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
  
  /**
   * 克隆状态
   */
  private cloneState(state: TemplateState): TemplateState {
    if (this.config.compress) {
      // 实现压缩逻辑
      return JSON.parse(JSON.stringify(state))
    }
    return JSON.parse(JSON.stringify(state))
  }
  
  /**
   * 保存到存储
   */
  private saveToStorage() {
    if (!this.config.persist || !this.config.storageKey) return
    
    try {
      const data = {
        snapshots: Array.from(this.snapshots.entries()),
        history: this.history,
        currentIndex: this.currentIndex
      }
      
      localStorage.setItem(this.config.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save snapshots:', error)
    }
  }
  
  /**
   * 从存储加载
   */
  private loadFromStorage() {
    if (!this.config.persist || !this.config.storageKey) return
    
    try {
      const stored = localStorage.getItem(this.config.storageKey)
      if (stored) {
        const data = JSON.parse(stored)
        this.snapshots = new Map(data.snapshots)
        this.history = data.history || []
        this.currentIndex = data.currentIndex ?? -1
      }
    } catch (error) {
      console.error('Failed to load snapshots:', error)
    }
  }
  
  /**
   * 清空存储
   */
  private clearStorage() {
    if (!this.config.persist || !this.config.storageKey) return
    
    try {
      localStorage.removeItem(this.config.storageKey)
    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }
  
  /**
   * 销毁
   */
  destroy() {
    this.stopAutoSnapshot()
    this.clearSnapshots()
  }
}

/**
 * 时间旅行控制器
 */
export class TimeTravelController {
  private history: TemplateState[] = []
  private currentIndex: number = -1
  private config: TimeTravelConfig
  private observers: MutationObserver[] = []
  
  constructor(config: TimeTravelConfig = {}) {
    this.config = {
      enabled: true,
      maxHistory: 100,
      recordDOM: false,
      ignoreProperties: [],
      diffAlgorithm: 'deep',
      ...config
    }
  }
  
  /**
   * 记录状态
   */
  record(state: TemplateState) {
    if (!this.config.enabled) return
    
    // 如果不是在最新状态，删除后面的历史
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1)
    }
    
    // 添加新状态
    this.history.push(this.cloneState(state))
    this.currentIndex++
    
    // 限制历史记录数量
    if (this.config.maxHistory && this.history.length > this.config.maxHistory) {
      this.history.shift()
      this.currentIndex--
    }
  }
  
  /**
   * 后退
   */
  backward(): TemplateState | null {
    if (this.currentIndex > 0) {
      this.currentIndex--
      return this.cloneState(this.history[this.currentIndex])
    }
    return null
  }
  
  /**
   * 前进
   */
  forward(): TemplateState | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++
      return this.cloneState(this.history[this.currentIndex])
    }
    return null
  }
  
  /**
   * 跳转到指定位置
   */
  goto(index: number): TemplateState | null {
    if (index >= 0 && index < this.history.length) {
      this.currentIndex = index
      return this.cloneState(this.history[this.currentIndex])
    }
    return null
  }
  
  /**
   * 获取历史记录
   */
  getHistory(): TemplateState[] {
    return this.history.map(state => this.cloneState(state))
  }
  
  /**
   * 获取当前索引
   */
  getCurrentIndex(): number {
    return this.currentIndex
  }
  
  /**
   * 是否可以后退
   */
  canBackward(): boolean {
    return this.currentIndex > 0
  }
  
  /**
   * 是否可以前进
   */
  canForward(): boolean {
    return this.currentIndex < this.history.length - 1
  }
  
  /**
   * 清空历史
   */
  clear() {
    this.history = []
    this.currentIndex = -1
  }
  
  /**
   * 开始观察DOM变化
   */
  observeDOM(element: HTMLElement, callback?: (mutation: MutationRecord) => void) {
    if (!this.config.recordDOM) return
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (callback) {
          callback(mutation)
        }
        
        // 记录DOM快照
        this.recordDOMSnapshot(element)
      })
    })
    
    observer.observe(element, {
      attributes: true,
      childList: true,
      subtree: true,
      characterData: true
    })
    
    this.observers.push(observer)
  }
  
  /**
   * 停止观察
   */
  disconnect() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
  }
  
  /**
   * 记录DOM快照
   */
private recordDOMSnapshot(_element: HTMLElement) {
    // const snapshot = element.innerHTML // Not used currently
    // 可以将DOM快照添加到当前状态
  }
  
  /**
   * 克隆状态
   */
  private cloneState(state: TemplateState): TemplateState {
    return JSON.parse(JSON.stringify(state))
  }
  
  /**
   * 计算差异
   */
  diff(prev: TemplateState, next: TemplateState): any {
    if (this.config.customDiff) {
      return this.config.customDiff(prev, next)
    }
    
    switch (this.config.diffAlgorithm) {
      case 'shallow':
        return this.shallowDiff(prev, next)
      case 'deep':
      default:
        return this.deepDiff(prev, next)
    }
  }
  
  /**
   * 浅比较
   */
  private shallowDiff(prev: any, next: any): any {
    const diff: any = {}
    
    // 优化：使用 Object.keys() 代替 for...in，性能更好
    const prevKeys = Object.keys(prev)
    const nextKeys = Object.keys(next)
    
    // 检查删除的属性
    for (let i = 0; i < prevKeys.length; i++) {
      const key = prevKeys[i]
      if (!(key in next)) {
        diff[key] = { type: 'deleted', value: prev[key] }
      }
    }
    
    // 检查新增或修改的属性
    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i]
      if (!(key in prev)) {
        diff[key] = { type: 'added', value: next[key] }
      } else if (prev[key] !== next[key]) {
        diff[key] = { type: 'modified', prev: prev[key], next: next[key] }
      }
    }
    
    return diff
  }
  
  /**
   * 深比较
   */
  private deepDiff(prev: any, next: any, path: string = ''): any {
    const diff: any = {}
    
    if (this.isPrimitive(prev) || this.isPrimitive(next)) {
      if (prev !== next) {
        return { type: 'modified', prev, next }
      }
      return null
    }
    
    // 递归比较对象属性
    const allKeys = new Set([...Object.keys(prev || {}), ...Object.keys(next || {})])
    
    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key
      
      if (this.config.ignoreProperties?.includes(currentPath)) {
        continue
      }
      
      if (!(key in next)) {
        diff[key] = { type: 'deleted', value: prev[key] }
      } else if (!(key in prev)) {
        diff[key] = { type: 'added', value: next[key] }
      } else {
        const childDiff = this.deepDiff(prev[key], next[key], currentPath)
        if (childDiff) {
          diff[key] = childDiff
        }
      }
    }
    
    return Object.keys(diff).length > 0 ? diff : null
  }
  
  /**
   * 判断是否为原始类型
   */
  private isPrimitive(value: any): boolean {
    return value === null || 
           value === undefined ||
           typeof value === 'string' ||
           typeof value === 'number' ||
           typeof value === 'boolean'
  }
  
  /**
   * 销毁
   */
  destroy() {
    this.disconnect()
    this.clear()
  }
}

// 导出单例
export const snapshotManager = new SnapshotManager()
export const timeTravelController = new TimeTravelController()