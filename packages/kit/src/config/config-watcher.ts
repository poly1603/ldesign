/**
 * 配置文件监听器
 * 监听配置文件变化并触发重新加载
 */

import type { FSWatcher } from 'node:fs'
import { EventEmitter } from 'node:events'
import { watch } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { FileSystem } from '../filesystem'

/**
 * 配置监听器选项
 */
export interface ConfigWatcherOptions {
  configFile: string
  configDir?: string
  debounceMs?: number
  recursive?: boolean
  watchDirs?: string[]
  ignorePatterns?: RegExp[]
}

/**
 * 配置文件监听器类
 */
export class ConfigWatcher extends EventEmitter {
  private options: Required<ConfigWatcherOptions>
  private watchers: FSWatcher[] = []
  private debounceTimer?: NodeJS.Timeout
  private isWatching = false
  private lastModified = new Map<string, number>()

  constructor(options: ConfigWatcherOptions) {
    super()

    this.options = {
      configFile: options.configFile,
      configDir: options.configDir || process.cwd(),
      debounceMs: options.debounceMs || 300,
      recursive: options.recursive !== false,
      watchDirs: options.watchDirs || [],
      ignorePatterns: options.ignorePatterns || [
        /node_modules/,
        /\.git/,
        /\.DS_Store/,
        /Thumbs\.db/,
      ],
    }
  }

  /**
   * 开始监听
   */
  async start(): Promise<void> {
    if (this.isWatching) {
      return
    }

    try {
      // 监听主配置文件
      await this.watchConfigFile()

      // 监听额外目录
      await this.watchDirectories()

      this.isWatching = true
      this.emit('started')
    }
    catch (error) {
      this.emit('error', error)
      throw error
    }
  }

  /**
   * 停止监听
   */
  async stop(): Promise<void> {
    if (!this.isWatching) {
      return
    }

    // 清除防抖定时器
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = undefined
    }

    // 关闭所有监听器
    for (const watcher of this.watchers) {
      watcher.close()
    }
    this.watchers = []

    this.isWatching = false
    this.lastModified.clear()
    this.emit('stopped')
  }

  /**
   * 监听配置文件
   */
  private async watchConfigFile(): Promise<void> {
    const configPath = resolve(this.options.configDir, this.options.configFile)

    // 检查文件是否存在
    if (!(await FileSystem.exists(configPath))) {
      this.emit('warning', `Configuration file not found: ${configPath}`)
      return
    }

    // 记录初始修改时间
    const stats = await FileSystem.stat(configPath)
    this.lastModified.set(configPath, stats.mtime.getTime())

    // 创建文件监听器
    const watcher = watch(configPath, (eventType, filename) => {
      if (filename) {
        this.handleFileChange(configPath, eventType)
      }
    })

    watcher.on('error', (error) => {
      this.emit('error', error)
    })

    this.watchers.push(watcher)
    this.emit('watchingFile', configPath)
  }

  /**
   * 监听目录
   */
  private async watchDirectories(): Promise<void> {
    const dirsToWatch = [
      dirname(resolve(this.options.configDir, this.options.configFile)),
      ...this.options.watchDirs.map(dir => resolve(this.options.configDir, dir)),
    ]

    for (const dir of dirsToWatch) {
      if (await FileSystem.exists(dir)) {
        await this.watchDirectory(dir)
      }
    }
  }

  /**
   * 监听单个目录
   */
  private async watchDirectory(dirPath: string): Promise<void> {
    const watcher = watch(dirPath, { recursive: this.options.recursive }, (eventType, filename) => {
      if (filename) {
        const fullPath = resolve(dirPath, filename)

        // 检查是否应该忽略
        if (this.shouldIgnore(fullPath)) {
          return
        }

        this.handleFileChange(fullPath, eventType)
      }
    })

    watcher.on('error', (error) => {
      this.emit('error', error)
    })

    this.watchers.push(watcher)
    this.emit('watchingDirectory', dirPath)
  }

  /**
   * 处理文件变化
   */
  private handleFileChange(filePath: string, eventType: string): void {
    // 防抖处理
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer)
    }

    this.debounceTimer = setTimeout(async () => {
      try {
        // 检查文件是否真的发生了变化
        if (await this.hasFileChanged(filePath)) {
          this.emit('changed', { filePath, eventType })
          this.emit('fileChanged', filePath)
        }
      }
      catch (error) {
        this.emit('error', error)
      }
    }, this.options.debounceMs)
  }

  /**
   * 检查文件是否真的发生了变化
   */
  private async hasFileChanged(filePath: string): Promise<boolean> {
    try {
      if (!(await FileSystem.exists(filePath))) {
        // 文件被删除
        this.lastModified.delete(filePath)
        return true
      }

      const stats = await FileSystem.stat(filePath)
      const currentMtime = stats.mtime.getTime()
      const lastMtime = this.lastModified.get(filePath) || 0

      if (currentMtime > lastMtime) {
        this.lastModified.set(filePath, currentMtime)
        return true
      }

      return false
    }
    catch {
      return false
    }
  }

  /**
   * 检查是否应该忽略文件
   */
  private shouldIgnore(filePath: string): boolean {
    return this.options.ignorePatterns.some(pattern => pattern.test(filePath))
  }

  /**
   * 添加忽略模式
   */
  addIgnorePattern(pattern: RegExp): void {
    this.options.ignorePatterns.push(pattern)
    this.emit('ignorePatternAdded', pattern)
  }

  /**
   * 移除忽略模式
   */
  removeIgnorePattern(pattern: RegExp): boolean {
    const index = this.options.ignorePatterns.indexOf(pattern)
    if (index !== -1) {
      this.options.ignorePatterns.splice(index, 1)
      this.emit('ignorePatternRemoved', pattern)
      return true
    }
    return false
  }

  /**
   * 添加监听目录
   */
  async addWatchDirectory(dirPath: string): Promise<void> {
    const fullPath = resolve(this.options.configDir, dirPath)

    if (!(await FileSystem.exists(fullPath))) {
      throw new Error(`Directory not found: ${fullPath}`)
    }

    this.options.watchDirs.push(dirPath)

    if (this.isWatching) {
      await this.watchDirectory(fullPath)
    }
  }

  /**
   * 移除监听目录
   */
  removeWatchDirectory(dirPath: string): boolean {
    const index = this.options.watchDirs.indexOf(dirPath)
    if (index !== -1) {
      this.options.watchDirs.splice(index, 1)
      this.emit('watchDirectoryRemoved', dirPath)
      return true
    }
    return false
  }

  /**
   * 获取监听状态
   */
  isActive(): boolean {
    return this.isWatching
  }

  /**
   * 获取监听的文件数量
   */
  getWatcherCount(): number {
    return this.watchers.length
  }

  /**
   * 获取配置选项
   */
  getOptions(): Required<ConfigWatcherOptions> {
    return { ...this.options }
  }

  /**
   * 更新配置选项
   */
  updateOptions(options: Partial<ConfigWatcherOptions>): void {
    this.options = { ...this.options, ...options } as Required<ConfigWatcherOptions>
    this.emit('optionsUpdated', this.options)
  }

  /**
   * 手动触发变化检查
   */
  async checkForChanges(): Promise<void> {
    const configPath = resolve(this.options.configDir, this.options.configFile)

    if (await this.hasFileChanged(configPath)) {
      this.emit('changed', { filePath: configPath, eventType: 'manual' })
    }
  }

  /**
   * 获取监听统计信息
   */
  getStats(): WatcherStats {
    return {
      isWatching: this.isWatching,
      watcherCount: this.watchers.length,
      watchedFiles: Array.from(this.lastModified.keys()),
      watchedDirectories: this.options.watchDirs,
      ignorePatterns: this.options.ignorePatterns.map(p => p.source),
      debounceMs: this.options.debounceMs,
    }
  }

  /**
   * 重启监听器
   */
  async restart(): Promise<void> {
    await this.stop()
    await this.start()
    this.emit('restarted')
  }

  /**
   * 创建配置监听器实例
   */
  static create(options: ConfigWatcherOptions): ConfigWatcher {
    return new ConfigWatcher(options)
  }

  /**
   * 创建简单的文件监听器
   */
  static createSimple(configFile: string, configDir?: string): ConfigWatcher {
    return new ConfigWatcher({
      configFile,
      configDir,
      debounceMs: 300,
      recursive: false,
      watchDirs: [],
      ignorePatterns: [/node_modules/, /\.git/],
    })
  }
}

/**
 * 监听器统计信息
 */
export interface WatcherStats {
  isWatching: boolean
  watcherCount: number
  watchedFiles: string[]
  watchedDirectories: string[]
  ignorePatterns: string[]
  debounceMs: number
}
