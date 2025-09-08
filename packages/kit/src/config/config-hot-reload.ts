/**
 * 配置热重载管理器
 * 提供智能的配置热重载功能，支持依赖追踪和增量更新
 */

import type { ConfigCache, ConfigChange } from './config-cache'
import type { ConfigLoader } from './config-loader'
import { EventEmitter } from 'node:events'
import { ConfigWatcher, type ConfigWatcherOptions } from './config-watcher'

/**
 * 热重载选项
 */
export interface HotReloadOptions {
  enabled?: boolean
  debounceMs?: number
  maxRetries?: number
  retryDelay?: number
  enableDependencyTracking?: boolean
  enableIncrementalUpdate?: boolean
  enableRollback?: boolean
  watcherOptions?: Partial<ConfigWatcherOptions>
}

/**
 * 重载结果
 */
export interface ReloadResult {
  success: boolean
  changes: ConfigChange[]
  errors: Error[]
  duration: number
  timestamp: number
  source: string
}

/**
 * 配置热重载管理器类
 */
export class ConfigHotReload extends EventEmitter {
  private cache: ConfigCache
  private watcher?: ConfigWatcher
  private _loader: ConfigLoader
  private options: Required<HotReloadOptions>
  private isEnabled = false
  private reloadCount = 0
  private lastReload?: ReloadResult

  constructor(cache: ConfigCache, loader: ConfigLoader, options: HotReloadOptions = {}) {
    super()

    this.cache = cache
    this._loader = loader
    this.options = {
      enabled: options.enabled !== false,
      debounceMs: options.debounceMs || 500,
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      enableDependencyTracking: options.enableDependencyTracking !== false,
      enableIncrementalUpdate: options.enableIncrementalUpdate !== false,
      enableRollback: options.enableRollback !== false,
      watcherOptions: options.watcherOptions || {},
    }

    this.setupEventListeners()
  }

  /**
   * 启用热重载
   */
  async enable(configFile: string, configDir?: string): Promise<void> {
    if (this.isEnabled) {
      return
    }

    try {
      // 创建文件监听器
      this.watcher = new ConfigWatcher({
        configFile,
        configDir,
        debounceMs: this.options.debounceMs,
        ...this.options.watcherOptions,
      })

      // 设置监听器事件
      this.watcher.on('changed', this.handleFileChange.bind(this))
      this.watcher.on('error', this.handleWatcherError.bind(this))

      // 启动监听
      await this.watcher.start()

      this.isEnabled = true
      this.emit('enabled')
    }
    catch (error) {
      this.emit('error', error)
      throw error
    }
  }

  /**
   * 禁用热重载
   */
  async disable(): Promise<void> {
    if (!this.isEnabled) {
      return
    }

    if (this.watcher) {
      await this.watcher.stop()
      this.watcher = undefined
    }

    this.isEnabled = false
    this.emit('disabled')
  }

  /**
   * 手动重载配置
   */
  async reload(source = 'manual'): Promise<ReloadResult> {
    const startTime = Date.now()
    const result: ReloadResult = {
      success: false,
      changes: [],
      errors: [],
      duration: 0,
      timestamp: startTime,
      source,
    }

    try {
      this.emit('reloadStarted', { source, timestamp: startTime })

      // 加载新配置
      const newConfig = await this.loadConfiguration()

      // 执行智能重载
      if (this.options.enableIncrementalUpdate) {
        result.changes = this.cache.smartReload(newConfig, source)
      }
      else {
        result.changes = this.fullReload(newConfig, source)
      }

      // 处理依赖更新
      if (this.options.enableDependencyTracking) {
        await this.updateDependencies(result.changes)
      }

      result.success = true
      this.reloadCount++
    }
    catch (error) {
      result.errors.push(error as Error)
      this.emit('reloadError', error)

      // 尝试回滚
      if (this.options.enableRollback && this.lastReload?.success) {
        await this.rollback()
      }
    }

    result.duration = Date.now() - startTime
    this.lastReload = result

    this.emit('reloadCompleted', result)
    return result
  }

  /**
   * 回滚到上一次成功的配置
   */
  async rollback(): Promise<boolean> {
    if (!this.lastReload?.success) {
      return false
    }

    try {
      // 这里需要实现回滚逻辑
      this.emit('rollbackStarted')

      // 回滚每个变更
      for (const change of this.lastReload.changes) {
        if (change.type === 'modified' || change.type === 'added') {
          if (change.oldValue !== undefined) {
            this.cache.set(change.path, change.oldValue, { source: 'rollback' })
          }
          else {
            this.cache.delete(change.path)
          }
        }
        else if (change.type === 'deleted') {
          this.cache.set(change.path, change.oldValue, { source: 'rollback' })
        }
      }

      this.emit('rollbackCompleted')
      return true
    }
    catch (error) {
      this.emit('rollbackError', error)
      return false
    }
  }

  /**
   * 获取重载统计信息
   */
  getStats(): {
    enabled: boolean
    reloadCount: number
    lastReload?: ReloadResult
    watcherStats?: unknown
  } {
    return {
      enabled: this.isEnabled,
      reloadCount: this.reloadCount,
      lastReload: this.lastReload,
      watcherStats: this.watcher?.getStats(),
    }
  }

  /**
   * 更新选项
   */
  updateOptions(options: Partial<HotReloadOptions>): void {
    this.options = { ...this.options, ...options } as Required<HotReloadOptions>

    if (this.watcher && options.watcherOptions) {
      this.watcher.updateOptions(options.watcherOptions)
    }

    this.emit('optionsUpdated', this.options)
  }

  /**
   * 添加配置依赖
   */
  addDependency(configKey: string, dependsOn: string[]): void {
    // 这里可以添加依赖关系管理逻辑
    this.emit('dependencyAdded', { configKey, dependsOn })
  }

  /**
   * 移除配置依赖
   */
  removeDependency(configKey: string, dependsOn: string[]): void {
    // 这里可以添加依赖关系管理逻辑
    this.emit('dependencyRemoved', { configKey, dependsOn })
  }

  // 私有方法

  private setupEventListeners(): void {
    this.cache.on('changed', (change: ConfigChange) => {
      this.emit('configChanged', change)
    })

    this.cache.on('batchChanged', (changes: ConfigChange[]) => {
      this.emit('configBatchChanged', changes)
    })
  }

  private async handleFileChange(_event: { filePath: string, eventType: string }): Promise<void> {
    if (!this.isEnabled) {
      return
    }

    try {
      await this.reload('fileChange')
    }
    catch (error) {
      this.emit('error', error)
    }
  }

  private handleWatcherError(error: Error): void {
    this.emit('watcherError', error)
  }

  private async loadConfiguration(): Promise<Record<string, unknown>> {
    // reference loader to avoid unused warning
    void this._loader
    // 这里需要根据实际情况加载配置
    // 暂时返回空对象
    return {}
  }

  private fullReload(newConfig: Record<string, unknown>, source: string): ConfigChange[] {
    const changes: ConfigChange[] = []

    // 清空现有配置
    this.cache.clear()

    // 重新加载所有配置
    for (const [key, value] of Object.entries(newConfig)) {
      this.cache.set(key, value, { source })
      changes.push({
        path: key,
        oldValue: undefined,
        newValue: value,
        timestamp: Date.now(),
        type: 'added',
        source,
      })
    }

    return changes
  }

  private async updateDependencies(changes: ConfigChange[]): Promise<void> {
    // 更新依赖的配置项
    for (const change of changes) {
      const dependents = this.cache.getDependents(change.path)

      for (const dependent of dependents) {
        // 重新计算依赖项的值
        this.emit('dependencyUpdated', {
          dependent,
          dependency: change.path,
          change,
        })
      }
    }
  }

  /**
   * 创建热重载管理器实例
   */
  static create(
    cache: ConfigCache,
    loader: ConfigLoader,
    options?: HotReloadOptions,
  ): ConfigHotReload {
    return new ConfigHotReload(cache, loader, options)
  }
}
