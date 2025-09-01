/**
 * 热更新管理器
 * 提供模板系统的热更新功能，支持开发环境下的实时更新
 */

import type { DeviceType } from '../types/template'

/**
 * 热更新事件类型
 */
export type HotReloadEventType =
  | 'template-added'
  | 'template-updated'
  | 'template-removed'
  | 'config-updated'
  | 'style-updated'
  | 'component-updated'

/**
 * 热更新事件
 */
export interface HotReloadEvent {
  /** 事件类型 */
  type: HotReloadEventType
  /** 模板信息 */
  template: {
    category: string
    device: DeviceType
    name: string
  }
  /** 变化的文件路径 */
  filePath: string
  /** 事件时间戳 */
  timestamp: number
  /** 额外数据 */
  data?: Record<string, unknown>
}

/**
 * 热更新监听器
 */
export type HotReloadListener = (event: HotReloadEvent) => void

/**
 * 热更新管理器选项
 */
export interface HotReloadManagerOptions {
  /** 是否启用热更新 */
  enabled: boolean
  /** 是否启用调试日志 */
  debug: boolean
  /** 更新延迟（毫秒） */
  updateDelay: number
  /** 是否自动刷新页面 */
  autoRefresh: boolean
  /** 是否保持组件状态 */
  preserveState: boolean
}

/**
 * 热更新管理器
 */
export class HotReloadManager {
  private options: HotReloadManagerOptions
  private listeners: Set<HotReloadListener> = new Set()
  private updateQueue: Map<string, HotReloadEvent> = new Map()
  private updateTimer: NodeJS.Timeout | null = null
  private isEnabled = false

  constructor(options: Partial<HotReloadManagerOptions> = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      debug: options.debug ?? false,
      updateDelay: options.updateDelay ?? 100,
      autoRefresh: options.autoRefresh ?? false,
      preserveState: options.preserveState ?? true,
    }

    this.isEnabled = this.options.enabled && this.isHMRSupported()

    if (this.isEnabled) {
      this.setupHMRHandlers()
    }
  }

  /**
   * 检查是否支持 HMR
   */
  private isHMRSupported(): boolean {
    return typeof import.meta !== 'undefined'
      && import.meta.hot !== undefined
      && import.meta.env?.DEV === true
  }

  /**
   * 设置 HMR 处理器
   */
  private setupHMRHandlers(): void {
    if (!import.meta.hot)
      return

    // 监听模板文件变化
    import.meta.hot.on('template-file-changed', (data) => {
      this.handleTemplateFileChange(data)
    })

    // 监听配置文件变化
    import.meta.hot.on('template-config-changed', (data) => {
      this.handleConfigChange(data)
    })

    // 监听样式文件变化
    import.meta.hot.on('template-style-changed', (data) => {
      this.handleStyleChange(data)
    })

    // 监听组件文件变化
    import.meta.hot.on('template-component-changed', (data) => {
      this.handleComponentChange(data)
    })

    if (this.options.debug) {
      console.log('🔥 热更新管理器已启动')
    }
  }

  /**
   * 处理模板文件变化
   */
  private handleTemplateFileChange(data: Record<string, unknown>): void {
    const event: HotReloadEvent = {
      type: this.determineEventType(data),
      template: {
        category: data.category,
        device: data.device,
        name: data.templateName,
      },
      filePath: data.filePath,
      timestamp: Date.now(),
      data,
    }

    this.queueUpdate(event)
  }

  /**
   * 处理配置变化
   */
  private handleConfigChange(data: Record<string, unknown>): void {
    const event: HotReloadEvent = {
      type: 'config-updated',
      template: {
        category: data.category,
        device: data.device,
        name: data.templateName,
      },
      filePath: data.filePath,
      timestamp: Date.now(),
      data,
    }

    this.queueUpdate(event)
  }

  /**
   * 处理样式变化
   */
  private handleStyleChange(data: Record<string, unknown>): void {
    const event: HotReloadEvent = {
      type: 'style-updated',
      template: {
        category: data.category,
        device: data.device,
        name: data.templateName,
      },
      filePath: data.filePath,
      timestamp: Date.now(),
      data,
    }

    this.queueUpdate(event)
  }

  /**
   * 处理组件变化
   */
  private handleComponentChange(data: Record<string, unknown>): void {
    const event: HotReloadEvent = {
      type: 'component-updated',
      template: {
        category: data.category,
        device: data.device,
        name: data.templateName,
      },
      filePath: data.filePath,
      timestamp: Date.now(),
      data,
    }

    this.queueUpdate(event)
  }

  /**
   * 确定事件类型
   */
  private determineEventType(data: Record<string, unknown>): HotReloadEventType {
    switch (data.changeType) {
      case 'added':
        return 'template-added'
      case 'removed':
        return 'template-removed'
      case 'changed':
      default:
        return 'template-updated'
    }
  }

  /**
   * 队列更新
   */
  private queueUpdate(event: HotReloadEvent): void {
    const key = `${event.template.category}-${event.template.device}-${event.template.name}`
    this.updateQueue.set(key, event)

    // 清除现有定时器
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
    }

    // 设置新的定时器
    this.updateTimer = setTimeout(() => {
      this.processUpdateQueue()
    }, this.options.updateDelay)
  }

  /**
   * 处理更新队列
   */
  private processUpdateQueue(): void {
    const events = Array.from(this.updateQueue.values())
    this.updateQueue.clear()

    for (const event of events) {
      this.notifyListeners(event)
    }

    if (this.options.debug && events.length > 0) {
      console.log(`🔥 处理了 ${events.length} 个热更新事件`)
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(event: HotReloadEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event)
      }
      catch (error) {
        console.error('热更新监听器执行错误:', error)
      }
    })
  }

  /**
   * 添加监听器
   */
  addListener(listener: HotReloadListener): () => void {
    this.listeners.add(listener)

    // 返回移除监听器的函数
    return () => {
      this.listeners.delete(listener)
    }
  }

  /**
   * 移除监听器
   */
  removeListener(listener: HotReloadListener): void {
    this.listeners.delete(listener)
  }

  /**
   * 手动触发热更新事件
   */
  triggerUpdate(event: HotReloadEvent): void {
    if (!this.isEnabled)
      return

    this.queueUpdate(event)
  }

  /**
   * 启用热更新
   */
  enable(): void {
    if (this.isHMRSupported()) {
      this.isEnabled = true
      this.options.enabled = true

      if (this.options.debug) {
        console.log('🔥 热更新已启用')
      }
    }
  }

  /**
   * 禁用热更新
   */
  disable(): void {
    this.isEnabled = false
    this.options.enabled = false

    // 清除队列和定时器
    this.updateQueue.clear()
    if (this.updateTimer) {
      clearTimeout(this.updateTimer)
      this.updateTimer = null
    }

    if (this.options.debug) {
      console.log('🔥 热更新已禁用')
    }
  }

  /**
   * 获取启用状态
   */
  isActive(): boolean {
    return this.isEnabled
  }

  /**
   * 更新选项
   */
  updateOptions(newOptions: Partial<HotReloadManagerOptions>): void {
    this.options = { ...this.options, ...newOptions }

    if (newOptions.enabled !== undefined) {
      if (newOptions.enabled) {
        this.enable()
      }
      else {
        this.disable()
      }
    }
  }

  /**
   * 获取当前选项
   */
  getOptions(): HotReloadManagerOptions {
    return { ...this.options }
  }

  /**
   * 销毁热更新管理器
   */
  destroy(): void {
    this.disable()
    this.listeners.clear()

    if (this.options.debug) {
      console.log('🔥 热更新管理器已销毁')
    }
  }
}

/**
 * 创建热更新管理器
 */
export function createHotReloadManager(
  options?: Partial<HotReloadManagerOptions>,
): HotReloadManager {
  return new HotReloadManager(options)
}

/**
 * 全局热更新管理器实例
 */
let globalHotReloadManager: HotReloadManager | null = null

/**
 * 获取全局热更新管理器
 */
export function getHotReloadManager(
  options?: Partial<HotReloadManagerOptions>,
): HotReloadManager {
  if (!globalHotReloadManager) {
    globalHotReloadManager = createHotReloadManager(options)
  }
  return globalHotReloadManager
}

/**
 * 重置全局热更新管理器
 */
export function resetHotReloadManager(): void {
  if (globalHotReloadManager) {
    globalHotReloadManager.destroy()
    globalHotReloadManager = null
  }
}
