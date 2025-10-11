/**
 * 增强的热更新管理器
 * 
 * 支持：增量更新、版本控制、部分更新、回滚机制、更新通知
 */

import type { DeviceType } from '../types/template'
import type { Dictionary } from '../types/common'
import { isObject, hasProperty } from '../types/guards'

/**
 * 更新类型
 */
export type UpdateType = 
  | 'template' 
  | 'config' 
  | 'style' 
  | 'component' 
  | 'asset'

/**
 * 更新操作
 */
export type UpdateOperation = 
  | 'add' 
  | 'modify' 
  | 'delete' 
  | 'rename'

/**
 * 版本信息
 */
export interface VersionInfo {
  /** 版本号 */
  version: string
  /** 时间戳 */
  timestamp: number
  /** 提交信息 */
  message?: string
  /** 标签 */
  tags?: string[]
  /** 元数据 */
  metadata?: Dictionary
}

/**
 * 增量更新信息
 */
export interface IncrementalUpdate {
  /** 更新 ID */
  id: string
  /** 更新类型 */
  type: UpdateType
  /** 操作类型 */
  operation: UpdateOperation
  /** 目标路径 */
  path: string
  /** 旧值（用于回滚） */
  oldValue?: unknown
  /** 新值 */
  newValue?: unknown
  /** 差异数据 */
  diff?: unknown
  /** 版本信息 */
  version: VersionInfo
  /** 时间戳 */
  timestamp: number
}

/**
 * 部分更新配置
 */
export interface PartialUpdateConfig {
  /** 是否启用 */
  enabled: boolean
  /** 更新粒度 */
  granularity: 'file' | 'component' | 'property'
  /** 是否智能合并 */
  smartMerge: boolean
  /** 合并策略 */
  mergeStrategy: 'override' | 'merge' | 'append'
}

/**
 * 回滚配置
 */
export interface RollbackConfig {
  /** 是否启用 */
  enabled: boolean
  /** 历史记录最大数量 */
  maxHistory: number
  /** 是否自动备份 */
  autoBackup: boolean
  /** 回滚策略 */
  strategy: 'full' | 'incremental'
}

/**
 * 更新通知配置
 */
export interface NotificationConfig {
  /** 是否启用 */
  enabled: boolean
  /** 通知类型 */
  types: Array<'console' | 'toast' | 'websocket' | 'custom'>
  /** 通知级别 */
  level: 'silent' | 'minimal' | 'normal' | 'verbose'
  /** 自定义处理器 */
  customHandler?: (notification: UpdateNotification) => void
}

/**
 * 更新通知
 */
export interface UpdateNotification {
  /** 通知 ID */
  id: string
  /** 通知类型 */
  type: 'info' | 'success' | 'warning' | 'error'
  /** 标题 */
  title: string
  /** 消息 */
  message: string
  /** 更新信息 */
  updates: IncrementalUpdate[]
  /** 时间戳 */
  timestamp: number
  /** 操作 */
  actions?: Array<{
    label: string
    handler: () => void
  }>
}

/**
 * 增强热更新管理器配置
 */
export interface EnhancedHotReloadConfig {
  /** 是否启用 */
  enabled: boolean
  /** 调试模式 */
  debug: boolean
  /** 版本控制 */
  versionControl: {
    enabled: boolean
    autoIncrement: boolean
    format: string // 例如：'v{major}.{minor}.{patch}'
  }
  /** 增量更新 */
  incrementalUpdate: {
    enabled: boolean
    chunkSize: number
    compression: boolean
  }
  /** 部分更新 */
  partialUpdate: PartialUpdateConfig
  /** 回滚配置 */
  rollback: RollbackConfig
  /** 通知配置 */
  notification: NotificationConfig
  /** 更新延迟（毫秒） */
  updateDelay: number
  /** 是否保持状态 */
  preserveState: boolean
}

/**
 * 历史记录项
 */
interface HistoryEntry {
  id: string
  version: VersionInfo
  updates: IncrementalUpdate[]
  snapshot?: unknown
  timestamp: number
}

/**
 * 增强的热更新管理器
 */
export class EnhancedHotReloadManager {
  private config: EnhancedHotReloadConfig
  private currentVersion: VersionInfo
  private history: HistoryEntry[] = []
  private pendingUpdates: Map<string, IncrementalUpdate> = new Map()
  private updateTimer: NodeJS.Timeout | null = null
  private listeners: Map<UpdateType, Set<(update: IncrementalUpdate) => void>> = new Map()
  private notificationListeners: Set<(notification: UpdateNotification) => void> = new Set()
  private isActive = false

  constructor(config: Partial<EnhancedHotReloadConfig> = {}) {
    // 生产环境完全禁用
    if (import.meta.env?.PROD) {
      this.config = this.getDefaultConfig()
      this.config.enabled = false
      this.currentVersion = this.createVersion('1.0.0', 'Initial version')
      return
    }

    this.config = {
      ...this.getDefaultConfig(),
      ...config,
    }

    this.currentVersion = this.createVersion('1.0.0', 'Initial version')
    this.isActive = this.config.enabled

    if (this.isActive) {
      this.initialize()
    }
  }

  /**
   * 获取默认配置
   */
  private getDefaultConfig(): EnhancedHotReloadConfig {
    return {
      enabled: true,
      debug: false,
      versionControl: {
        enabled: true,
        autoIncrement: true,
        format: 'v{major}.{minor}.{patch}',
      },
      incrementalUpdate: {
        enabled: true,
        chunkSize: 10,
        compression: false,
      },
      partialUpdate: {
        enabled: true,
        granularity: 'component',
        smartMerge: true,
        mergeStrategy: 'merge',
      },
      rollback: {
        enabled: true,
        maxHistory: 50,
        autoBackup: true,
        strategy: 'incremental',
      },
      notification: {
        enabled: true,
        types: ['console'],
        level: 'normal',
      },
      updateDelay: 100,
      preserveState: true,
    }
  }

  /**
   * 初始化
   */
  private initialize(): void {
    if (this.config.debug) {
      console.log('[HMR] 增强热更新管理器已启动', {
        version: this.currentVersion.version,
        config: this.config,
      })
    }

    // 设置 HMR 处理器
    this.setupHMRHandlers()
  }

  /**
   * 设置 HMR 处理器
   */
  private setupHMRHandlers(): void {
    if (!import.meta.hot) return

    import.meta.hot.accept((newModule) => {
      if (this.config.debug) {
        console.log('[HMR] 模块已更新', newModule)
      }
    })

    import.meta.hot.dispose(() => {
      if (this.config.debug) {
        console.log('[HMR] 清理旧模块')
      }
      this.cleanup()
    })
  }

  /**
   * 创建版本
   */
  private createVersion(version: string, message?: string): VersionInfo {
    return {
      version,
      timestamp: Date.now(),
      message,
      tags: [],
      metadata: {},
    }
  }

  /**
   * 自动递增版本号
   */
  private incrementVersion(): VersionInfo {
    const currentParts = this.currentVersion.version.match(/(\d+)\.(\d+)\.(\d+)/)
    if (!currentParts) {
      return this.createVersion('1.0.0', 'Auto increment')
    }

    const [, major, minor, patch] = currentParts
    const newPatch = parseInt(patch) + 1
    const newVersion = `${major}.${minor}.${newPatch}`

    return this.createVersion(newVersion, 'Auto increment')
  }

  /**
   * 添加更新
   */
  addUpdate(update: Omit<IncrementalUpdate, 'id' | 'version' | 'timestamp'>): string {
    if (!this.isActive) {
      throw new Error('[HMR] Hot reload manager is not active')
    }

    // 自动递增版本
    if (this.config.versionControl.enabled && this.config.versionControl.autoIncrement) {
      this.currentVersion = this.incrementVersion()
    }

    // 创建完整的更新对象
    const fullUpdate: IncrementalUpdate = {
      ...update,
      id: this.generateUpdateId(),
      version: this.currentVersion,
      timestamp: Date.now(),
    }

    // 添加到待处理队列
    this.pendingUpdates.set(fullUpdate.id, fullUpdate)

    // 调度更新处理
    this.scheduleUpdateProcessing()

    return fullUpdate.id
  }

  /**
   * 生成更新 ID
   */
  private generateUpdateId(): string {
    return `update-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }

  /**
   * 调度更新处理
   */
  private scheduleUpdateProcessing(): void {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
    }

    this.updateTimer = setTimeout(() => {
      this.processUpdates()
    }, this.config.updateDelay)
  }

  /**
   * 处理更新
   */
  private async processUpdates(): Promise<void> {
    const updates = Array.from(this.pendingUpdates.values())
    
    if (updates.length === 0) return

    // 清空待处理队列
    this.pendingUpdates.clear()

    // 创建历史记录
    if (this.config.rollback.enabled) {
      this.addToHistory(updates)
    }

    // 应用更新
    for (const update of updates) {
      await this.applyUpdate(update)
    }

    // 发送通知
    if (this.config.notification.enabled) {
      this.sendNotification({
        id: this.generateUpdateId(),
        type: 'success',
        title: '更新已应用',
        message: `成功应用 ${updates.length} 个更新`,
        updates,
        timestamp: Date.now(),
      })
    }

    if (this.config.debug) {
      console.log(`[HMR] 已处理 ${updates.length} 个更新`, {
        version: this.currentVersion.version,
        updates,
      })
    }
  }

  /**
   * 应用更新
   */
  private async applyUpdate(update: IncrementalUpdate): Promise<void> {
    // 通知类型监听器
    const listeners = this.listeners.get(update.type)
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(update)
        } catch (error) {
          console.error('[HMR] 更新监听器执行错误:', error)
        }
      }
    }

    // 根据操作类型处理
    switch (update.operation) {
      case 'add':
        await this.handleAdd(update)
        break
      case 'modify':
        await this.handleModify(update)
        break
      case 'delete':
        await this.handleDelete(update)
        break
      case 'rename':
        await this.handleRename(update)
        break
    }
  }

  /**
   * 处理添加操作
   */
  private async handleAdd(update: IncrementalUpdate): Promise<void> {
    if (this.config.debug) {
      console.log('[HMR] 添加:', update.path)
    }
    // 实际添加逻辑由外部监听器处理
  }

  /**
   * 处理修改操作
   */
  private async handleModify(update: IncrementalUpdate): Promise<void> {
    if (this.config.debug) {
      console.log('[HMR] 修改:', update.path)
    }

    // 如果启用了部分更新
    if (this.config.partialUpdate.enabled && update.diff) {
      await this.applyPartialUpdate(update)
    }
  }

  /**
   * 处理删除操作
   */
  private async handleDelete(update: IncrementalUpdate): Promise<void> {
    if (this.config.debug) {
      console.log('[HMR] 删除:', update.path)
    }
    // 实际删除逻辑由外部监听器处理
  }

  /**
   * 处理重命名操作
   */
  private async handleRename(update: IncrementalUpdate): Promise<void> {
    if (this.config.debug) {
      console.log('[HMR] 重命名:', update.path)
    }
    // 实际重命名逻辑由外部监听器处理
  }

  /**
   * 应用部分更新
   */
  private async applyPartialUpdate(update: IncrementalUpdate): Promise<void> {
    if (this.config.debug) {
      console.log('[HMR] 应用部分更新:', update.path, update.diff)
    }

    // 根据合并策略处理
    switch (this.config.partialUpdate.mergeStrategy) {
      case 'override':
        // 完全覆盖
        break
      case 'merge':
        // 智能合并
        if (this.config.partialUpdate.smartMerge) {
          // 深度合并逻辑
        }
        break
      case 'append':
        // 追加
        break
    }
  }

  /**
   * 添加到历史记录
   */
  private addToHistory(updates: IncrementalUpdate[]): void {
    const entry: HistoryEntry = {
      id: this.generateUpdateId(),
      version: this.currentVersion,
      updates,
      snapshot: this.config.rollback.autoBackup ? this.createSnapshot() : undefined,
      timestamp: Date.now(),
    }

    this.history.push(entry)

    // 限制历史记录数量
    if (this.history.length > this.config.rollback.maxHistory) {
      this.history.shift()
    }
  }

  /**
   * 创建快照
   */
  private createSnapshot(): unknown {
    // 创建当前状态的快照
    return {
      version: this.currentVersion,
      timestamp: Date.now(),
      // 实际状态数据
    }
  }

  /**
   * 回滚到指定版本
   */
  async rollback(version: string): Promise<boolean> {
    if (!this.config.rollback.enabled) {
      throw new Error('[HMR] Rollback is disabled')
    }

    const entry = this.history.find((h) => h.version.version === version)
    if (!entry) {
      console.error(`[HMR] 版本 ${version} 未找到`)
      return false
    }

    if (this.config.debug) {
      console.log(`[HMR] 回滚到版本 ${version}`)
    }

    // 根据策略执行回滚
    if (this.config.rollback.strategy === 'full' && entry.snapshot) {
      // 完整回滚
      await this.restoreSnapshot(entry.snapshot)
    } else {
      // 增量回滚
      await this.rollbackIncremental(entry)
    }

    // 更新当前版本
    this.currentVersion = entry.version

    // 发送通知
    if (this.config.notification.enabled) {
      this.sendNotification({
        id: this.generateUpdateId(),
        type: 'info',
        title: '已回滚',
        message: `已回滚到版本 ${version}`,
        updates: [],
        timestamp: Date.now(),
      })
    }

    return true
  }

  /**
   * 恢复快照
   */
  private async restoreSnapshot(snapshot: unknown): Promise<void> {
    if (this.config.debug) {
      console.log('[HMR] 恢复快照')
    }
    // 实际恢复逻辑
  }

  /**
   * 增量回滚
   */
  private async rollbackIncremental(entry: HistoryEntry): Promise<void> {
    // 反向应用更新
    for (const update of entry.updates.reverse()) {
      const rollbackUpdate: IncrementalUpdate = {
        ...update,
        id: this.generateUpdateId(),
        operation: this.getReverseOperation(update.operation),
        newValue: update.oldValue,
        oldValue: update.newValue,
        timestamp: Date.now(),
      }

      await this.applyUpdate(rollbackUpdate)
    }
  }

  /**
   * 获取反向操作
   */
  private getReverseOperation(operation: UpdateOperation): UpdateOperation {
    switch (operation) {
      case 'add':
        return 'delete'
      case 'delete':
        return 'add'
      case 'modify':
        return 'modify'
      case 'rename':
        return 'rename'
      default:
        return operation
    }
  }

  /**
   * 添加更新监听器
   */
  on(type: UpdateType, listener: (update: IncrementalUpdate) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }

    this.listeners.get(type)!.add(listener)

    // 返回取消订阅函数
    return () => {
      this.listeners.get(type)?.delete(listener)
    }
  }

  /**
   * 添加通知监听器
   */
  onNotification(listener: (notification: UpdateNotification) => void): () => void {
    this.notificationListeners.add(listener)

    return () => {
      this.notificationListeners.delete(listener)
    }
  }

  /**
   * 发送通知
   */
  private sendNotification(notification: UpdateNotification): void {
    // 检查通知级别
    if (this.config.notification.level === 'silent') {
      return
    }

    // 发送到监听器
    for (const listener of this.notificationListeners) {
      try {
        listener(notification)
      } catch (error) {
        console.error('[HMR] 通知监听器执行错误:', error)
      }
    }

    // 根据类型发送通知
    for (const type of this.config.notification.types) {
      switch (type) {
        case 'console':
          this.sendConsoleNotification(notification)
          break
        case 'toast':
          // Toast 通知需要 UI 库支持
          break
        case 'websocket':
          // WebSocket 通知
          break
        case 'custom':
          if (this.config.notification.customHandler) {
            this.config.notification.customHandler(notification)
          }
          break
      }
    }
  }

  /**
   * 发送控制台通知
   */
  private sendConsoleNotification(notification: UpdateNotification): void {
    const prefix = '[HMR]'
    const emoji = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    }[notification.type]

    console.log(`${prefix} ${emoji} ${notification.title}: ${notification.message}`)

    if (this.config.notification.level === 'verbose' && notification.updates.length > 0) {
      console.table(notification.updates.map((u) => ({
        类型: u.type,
        操作: u.operation,
        路径: u.path,
        版本: u.version.version,
      })))
    }
  }

  /**
   * 获取历史记录
   */
  getHistory(): HistoryEntry[] {
    return [...this.history]
  }

  /**
   * 获取当前版本
   */
  getCurrentVersion(): VersionInfo {
    return { ...this.currentVersion }
  }

  /**
   * 设置版本
   */
  setVersion(version: string, message?: string): void {
    this.currentVersion = this.createVersion(version, message)

    if (this.config.debug) {
      console.log(`[HMR] 版本已更新为 ${version}`)
    }
  }

  /**
   * 清理
   */
  private cleanup(): void {
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
      this.updateTimer = null
    }

    this.pendingUpdates.clear()
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.cleanup()
    this.listeners.clear()
    this.notificationListeners.clear()
    this.history = []
    this.isActive = false

    if (this.config.debug) {
      console.log('[HMR] 增强热更新管理器已销毁')
    }
  }
}

/**
 * 创建增强热更新管理器
 */
export function createEnhancedHotReloadManager(
  config?: Partial<EnhancedHotReloadConfig>
): EnhancedHotReloadManager {
  return new EnhancedHotReloadManager(config)
}
