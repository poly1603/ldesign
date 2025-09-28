/**
 * 文件监听器
 * 提供跨平台的文件系统监听功能，支持模板文件的实时变化检测
 */

import type { DeviceType } from '../types/template'

/**
 * 文件变化类型
 */
export type FileChangeType = 'added' | 'changed' | 'removed'

/**
 * 文件变化事件
 */
export interface WatcherFileChangeEvent {
  /** 变化类型 */
  type: FileChangeType
  /** 文件路径 */
  path: string
  /** 文件名 */
  filename: string
  /** 变化时间戳 */
  timestamp: number
  /** 模板信息（如果是模板文件） */
  templateInfo?: {
    category: string
    device: DeviceType
    templateName: string
    fileType: 'config' | 'component' | 'style' | 'preview'
  }
}

/**
 * 文件监听器选项
 */
export interface FileWatcherOptions {
  /** 监听的根目录 */
  rootDir: string
  /** 包含的文件扩展名 */
  includeExtensions: string[]
  /** 排除的模式 */
  excludePatterns: string[]
  /** 防抖延迟（毫秒） */
  debounceDelay: number
  /** 是否启用递归监听 */
  recursive: boolean
  /** 最大监听深度 */
  maxDepth: number
}

/**
 * 文件监听器事件回调
 */
export interface FileWatcherCallbacks {
  /** 文件变化回调 */
  onChange?: (event: WatcherFileChangeEvent) => void
  /** 模板文件变化回调 */
  onTemplateChange?: (event: WatcherFileChangeEvent) => void
  /** 错误回调 */
  onError?: (error: Error) => void
  /** 监听开始回调 */
  onWatchStart?: () => void
  /** 监听停止回调 */
  onWatchStop?: () => void
}

/**
 * 文件监听器类
 */
export class FileWatcher {
  private options: Required<FileWatcherOptions>
  private callbacks: FileWatcherCallbacks
  private watchers: Map<string, { close?: () => Promise<void> | void }> = new Map()
  private debounceTimers: Map<string, any> = new Map()
  private isWatching = false

  constructor(options: FileWatcherOptions, callbacks: FileWatcherCallbacks = {}) {
    this.options = {
      rootDir: options.rootDir,
      includeExtensions: options.includeExtensions || ['.vue', '.js', '.ts', '.css', '.less', '.scss'],
      excludePatterns: options.excludePatterns || ['node_modules', '.git', 'dist'],
      debounceDelay: options.debounceDelay ?? 300,
      recursive: options.recursive ?? true,
      maxDepth: options.maxDepth ?? 10,
    }
    this.callbacks = callbacks
  }

  /**
   * 开始监听
   */
  async startWatching(): Promise<void> {
    if (this.isWatching) {
      console.warn('文件监听器已经在运行中')
      return
    }

    try {
      // 仅浏览器策略（移除 Node 相关实现）
      await this.startBrowserWatching()

      this.isWatching = true
      this.callbacks.onWatchStart?.()
    }
    catch (error) {
      this.callbacks.onError?.(error as Error)
      throw error
    }
  }

  /**
   * 停止监听
   */
  async stopWatching(): Promise<void> {
    if (!this.isWatching) {
      return
    }

    // 清理所有监听器
    for (const [path, watcher] of this.watchers) {
      try {
        if (watcher && typeof watcher.close === 'function') {
          await watcher.close()
        }
      }
      catch (error) {
        console.warn(`关闭监听器失败: ${path}`, error)
      }
    }

    // 清理防抖定时器
    for (const timer of this.debounceTimers.values()) {
      clearTimeout(timer)
    }

    this.watchers.clear()
    this.debounceTimers.clear()
    this.isWatching = false
    this.callbacks.onWatchStop?.()
  }

  /**
   * Node.js 环境实现已移除（Web 端不使用）
   */
  private async startNodeWatching(): Promise<void> {
    // 在浏览器环境中，文件监听不可用
    if (typeof window !== 'undefined') {
      console.warn('[FileWatcher] 文件监听在浏览器环境中不可用，跳过监听功能')
      return
    }

    // 已移除 Node 端实现
  }

  /**
   * 原生 fs.watch 监听（已移除）
   */
  private async startNativeWatching(): Promise<void> {
    // 在浏览器环境中，文件监听不可用
    if (typeof window !== 'undefined') {
      console.warn('[FileWatcher] 原生文件监听在浏览器环境中不可用，跳过监听功能')
      return
    }

    // 已移除 Node 端实现
  }

  /**
   * 浏览器环境下的文件监听（使用轮询或其他策略）
   */
  private async startBrowserWatching(): Promise<void> {
    // 在浏览器环境中，我们可以使用 Vite 的 HMR API
    if (import.meta.hot) {
      import.meta.hot.on('template-file-changed', (data) => {
        this.handleFileChange(data.type, data.path)
      })
    }

    // 或者使用轮询策略（仅在开发环境）
    if (import.meta.env?.DEV) {
      this.startPollingWatcher()
    }
  }

  /**
   * 轮询监听器（浏览器环境回退方案）
   */
  private startPollingWatcher(): void {
    // 浏览器端简化：不做额外轮询，依赖 Vite HMR 即可
  }

  /**
   * 处理文件变化
   */
  private handleFileChange(type: FileChangeType, filePath: string): void {
    // 检查文件是否应该被处理
    if (!this.shouldProcessFile(filePath)) {
      return
    }

    // 防抖处理
    const existingTimer = this.debounceTimers.get(filePath)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    const timer = setTimeout(() => {
      this.processFileChange(type, filePath)
      this.debounceTimers.delete(filePath)
    }, this.options.debounceDelay)

    this.debounceTimers.set(filePath, timer)
  }

  /**
   * 处理文件变化事件
   */
  private processFileChange(type: FileChangeType, filePath: string): void {
    const event: WatcherFileChangeEvent = {
      type,
      path: filePath,
      filename: this.getFilename(filePath),
      timestamp: Date.now(),
      templateInfo: this.extractTemplateInfo(filePath),
    }

    // 触发通用文件变化回调
    this.callbacks.onChange?.(event)

    // 如果是模板文件，触发模板特定回调
    if (event.templateInfo) {
      this.callbacks.onTemplateChange?.(event)
    }
  }

  /**
   * 检查文件是否应该被处理
   */
  private shouldProcessFile(filePath: string): boolean {
    // 检查文件扩展名
    const hasValidExtension = this.options.includeExtensions.some(ext =>
      filePath.toLowerCase().endsWith(ext.toLowerCase()),
    )

    if (!hasValidExtension) {
      return false
    }

    // 检查排除模式
    const isExcluded = this.options.excludePatterns.some(pattern =>
      filePath.includes(pattern),
    )

    return !isExcluded
  }

  /**
   * 提取模板信息
   */
  private extractTemplateInfo(filePath: string): WatcherFileChangeEvent['templateInfo'] | undefined {
    // 解析路径以提取模板信息
    const pathParts = filePath.replace(/\\/g, '/').split('/')
    const templatesIndex = pathParts.findIndex(part => part === 'templates')

    if (templatesIndex === -1 || pathParts.length < templatesIndex + 4) {
      return undefined
    }

    const category = pathParts[templatesIndex + 1]
    const device = pathParts[templatesIndex + 2] as DeviceType
    const templateName = pathParts[templatesIndex + 3]
    const filename: string = (pathParts[pathParts.length - 1] || '') as string

    // 确定文件类型
    let fileType: 'config' | 'component' | 'style' | 'preview'
    if (!filename)
      return undefined
    if (filename.startsWith('config.')) {
      fileType = 'config'
    }
    else if (filename === 'index.vue') {
      fileType = 'component'
    }
    else if (filename.startsWith('style.') || filename.includes('.css') || filename.includes('.less') || filename.includes('.scss')) {
      fileType = 'style'
    }
    else if (filename.startsWith('preview.')) {
      fileType = 'preview'
    }
    else {
      return undefined
    }

    return {
      category: category as string,
      device,
      templateName: templateName as string,
      fileType,
    }
  }

  /**
   * 获取文件名
   */
  private getFilename(filePath: string): string {
    return filePath.split(/[/\\]/).pop() || ''
  }

  /**
   * 获取监听状态
   */
  isActive(): boolean {
    return this.isWatching
  }

  /**
   * 更新选项
   */
  updateOptions(newOptions: Partial<FileWatcherOptions>): void {
    this.options = { ...this.options, ...newOptions }
  }
}

/**
 * 创建文件监听器
 */
export function createFileWatcher(
  options: FileWatcherOptions,
  callbacks?: FileWatcherCallbacks,
): FileWatcher {
  return new FileWatcher(options, callbacks)
}
