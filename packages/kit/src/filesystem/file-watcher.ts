/**
 * 文件监听器
 * 提供文件和目录变更监听功能
 */

import type { FSWatcher } from 'node:fs'
import { EventEmitter } from 'node:events'
import { watch } from 'node:fs'
import { join } from 'node:path'
import { glob } from 'glob'
import { FileSystemError } from '../types'
import { PathUtils } from '../utils'
import { FileSystem } from './file-system'

/**
 * 文件监听器类
 */
export class FileWatcher extends EventEmitter {
  private watchers: Map<string, FSWatcher> = new Map()
  private watchedPaths: Set<string> = new Set()
  private options: WatcherOptions
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()

  constructor(options: WatcherOptions = {}) {
    super()
    this.options = {
      recursive: true,
      persistent: true,
      encoding: 'utf8',
      debounceDelay: 100,
      ignoreInitial: true,
      followSymlinks: false,
      ...options,
    }
  }

  /**
   * 监听文件或目录
   * @param path 要监听的路径
   * @param patterns 文件模式（可选）
   */
  async watch(path: string, patterns?: string[]): Promise<void> {
    try {
      const resolvedPath = PathUtils.resolve(path)

      if (this.watchedPaths.has(resolvedPath)) {
        return // 已经在监听
      }

      const exists = await FileSystem.exists(resolvedPath)
      if (!exists) {
        throw new FileSystemError(`Path does not exist: ${resolvedPath}`, resolvedPath)
      }

      const isDirectory = await FileSystem.isDirectory(resolvedPath)

      if (patterns && patterns.length > 0) {
        // 使用模式匹配监听
        await this.watchWithPatterns(resolvedPath, patterns)
      }
      else {
        // 直接监听路径
        await this.watchPath(resolvedPath, isDirectory)
      }

      this.watchedPaths.add(resolvedPath)
      this.emit('ready', resolvedPath)
    }
    catch (error) {
      throw new FileSystemError(`Failed to watch path: ${path}`, path, error as Error)
    }
  }

  /**
   * 使用模式匹配监听
   */
  private async watchWithPatterns(basePath: string, patterns: string[]): Promise<void> {
    const matchedFiles = new Set<string>()

    // 找到所有匹配的文件
    for (const pattern of patterns) {
      const fullPattern = PathUtils.join(basePath, pattern)
      const files = await glob(fullPattern, {
        nodir: true,
        follow: this.options.followSymlinks,
      })

      for (const file of files) {
        matchedFiles.add(file)
      }
    }

    // 监听匹配的文件
    for (const file of matchedFiles) {
      await this.watchPath(file, false)
    }

    // 如果是递归模式，还需要监听目录以捕获新文件
    if (this.options.recursive) {
      await this.watchPath(basePath, true)
    }
  }

  /**
   * 监听单个路径
   */
  private async watchPath(path: string, isDirectory: boolean): Promise<void> {
    const watcher = watch(
      path,
      {
        recursive: this.options.recursive && isDirectory,
        persistent: this.options.persistent,
        encoding: this.options.encoding,
      },
      (eventType, filename) => {
        this.handleFileChange(path, eventType, filename, isDirectory)
      },
    )

    watcher.on('error', (error) => {
      this.emit('error', new FileSystemError(`Watcher error for ${path}`, path, error))
    })

    this.watchers.set(path, watcher)
  }

  /**
   * 处理文件变更事件
   */
  private handleFileChange(
    watchedPath: string,
    eventType: string,
    filename: string | null,
    isDirectory: boolean,
  ): void {
    if (!filename)
      return

    const fullPath = isDirectory ? join(watchedPath, filename) : watchedPath
    const normalizedPath = PathUtils.normalize(fullPath)

    // 防抖处理
    if (this.options.debounceDelay && this.options.debounceDelay > 0) {
      const existingTimer = this.debounceTimers.get(normalizedPath)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      const timer = setTimeout(() => {
        this.processFileChange(normalizedPath, eventType)
        this.debounceTimers.delete(normalizedPath)
      }, this.options.debounceDelay)

      this.debounceTimers.set(normalizedPath, timer)
    }
    else {
      this.processFileChange(normalizedPath, eventType)
    }
  }

  /**
   * 处理文件变更
   */
  private async processFileChange(filePath: string, eventType: string): Promise<void> {
    try {
      const exists = await FileSystem.exists(filePath)

      if (exists) {
        const isDirectory = await FileSystem.isDirectory(filePath)
        const stats = await FileSystem.getInfo(filePath)

        const changeEvent: FileChangeEvent = {
          type: eventType === 'rename' ? (exists ? 'add' : 'unlink') : 'change',
          path: filePath,
          stats,
          isDirectory,
        }

        this.emit('change', changeEvent)
        this.emit(changeEvent.type, filePath, stats)
      }
      else {
        // 文件被删除
        const changeEvent: FileChangeEvent = {
          type: 'unlink',
          path: filePath,
          stats: null,
          isDirectory: false,
        }

        this.emit('change', changeEvent)
        this.emit('unlink', filePath)
      }
    }
    catch (error) {
      this.emit(
        'error',
        new FileSystemError(`Error processing change for ${filePath}`, filePath, error as Error),
      )
    }
  }

  /**
   * 停止监听指定路径
   * @param path 路径
   */
  async unwatch(path: string): Promise<void> {
    const resolvedPath = PathUtils.resolve(path)
    const watcher = this.watchers.get(resolvedPath)

    if (watcher) {
      watcher.close()
      this.watchers.delete(resolvedPath)
      this.watchedPaths.delete(resolvedPath)

      // 清理防抖定时器
      const timer = this.debounceTimers.get(resolvedPath)
      if (timer) {
        clearTimeout(timer)
        this.debounceTimers.delete(resolvedPath)
      }

      this.emit('unwatch', resolvedPath)
    }
  }

  /**
   * 停止所有监听
   */
  async unwatchAll(): Promise<void> {
    const paths = Array.from(this.watchedPaths)
    await Promise.all(paths.map(path => this.unwatch(path)))
  }

  /**
   * 获取正在监听的路径
   */
  getWatchedPaths(): string[] {
    return Array.from(this.watchedPaths)
  }

  /**
   * 检查是否正在监听指定路径
   * @param path 路径
   */
  isWatching(path: string): boolean {
    const resolvedPath = PathUtils.resolve(path)
    return this.watchedPaths.has(resolvedPath)
  }

  /**
   * 添加忽略模式
   * @param patterns 忽略模式
   */
  addIgnorePatterns(patterns: string[]): void {
    if (!this.options.ignored) {
      this.options.ignored = []
    }
    this.options.ignored.push(...patterns)
  }

  /**
   * 创建文件监听器实例
   * @param options 选项
   */
  static create(options: WatcherOptions = {}): FileWatcher {
    return new FileWatcher(options)
  }

  /**
   * 监听单个文件
   * @param filePath 文件路径
   * @param callback 回调函数
   * @param options 选项
   */
  static async watchFile(
    filePath: string,
    callback: (event: FileChangeEvent) => void,
    options: WatcherOptions = {},
  ): Promise<FileWatcher> {
    const watcher = new FileWatcher(options)
    watcher.on('change', callback)
    await watcher.watch(filePath)
    return watcher
  }

  /**
   * 监听目录
   * @param dirPath 目录路径
   * @param callback 回调函数
   * @param options 选项
   */
  static async watchDirectory(
    dirPath: string,
    callback: (event: FileChangeEvent) => void,
    options: WatcherOptions = {},
  ): Promise<FileWatcher> {
    const watcher = new FileWatcher({ recursive: true, ...options })
    watcher.on('change', callback)
    await watcher.watch(dirPath)
    return watcher
  }

  /**
   * 监听多个路径
   * @param paths 路径数组
   * @param callback 回调函数
   * @param options 选项
   */
  static async watchMultiple(
    paths: string[],
    callback: (event: FileChangeEvent) => void,
    options: WatcherOptions = {},
  ): Promise<FileWatcher> {
    const watcher = new FileWatcher(options)
    watcher.on('change', callback)

    for (const path of paths) {
      await watcher.watch(path)
    }

    return watcher
  }

  /**
   * 等待文件变更
   * @param filePath 文件路径
   * @param timeout 超时时间（毫秒）
   */
  static async waitForChange(filePath: string, timeout = 30000): Promise<FileChangeEvent> {
    return new Promise((resolve, reject) => {
      const watcher = new FileWatcher()
      let timeoutId: NodeJS.Timeout

      const cleanup = () => {
        watcher.unwatchAll()
        if (timeoutId)
          clearTimeout(timeoutId)
      }

      watcher.on('change', (event) => {
        cleanup()
        resolve(event)
      })

      watcher.on('error', (error) => {
        cleanup()
        reject(error)
      })

      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          cleanup()
          reject(new Error(`Timeout waiting for file change: ${filePath}`))
        }, timeout)
      }

      watcher.watch(filePath).catch(reject)
    })
  }
}

// 类型定义
interface WatcherOptions {
  recursive?: boolean
  persistent?: boolean
  encoding?: BufferEncoding
  debounceDelay?: number
  ignoreInitial?: boolean
  followSymlinks?: boolean
  ignored?: Array<string | RegExp>
}

interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink'
  path: string
  stats: any
  isDirectory: boolean
}
