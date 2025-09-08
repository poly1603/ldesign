import type { CacheEvent, StorageEngine } from '../types'
import { CacheManager } from './cache-manager'
import { EventEmitter } from '../utils'

/**
 * 同步配置
 */
export interface SyncOptions {
  /** 是否启用同步 */
  enabled?: boolean
  /** 同步通道名称 */
  channel?: string
  /** 同步延迟（毫秒） */
  debounce?: number
  /** 同步的存储引擎 */
  engines?: StorageEngine[]
  /** 同步事件类型 */
  events?: Array<'set' | 'remove' | 'clear'>
}

/**
 * 同步消息
 */
interface SyncMessage {
  type: 'set' | 'remove' | 'clear' | 'sync' | 'ping'
  key?: string
  value?: any
  options?: any
  timestamp: number
  source: string
}

/**
 * 跨标签页同步管理器
 * 
 * 使用 BroadcastChannel API 或 storage 事件实现跨标签页缓存同步
 */
export class SyncManager {
  private channel?: BroadcastChannel
  private storageHandler?: (e: StorageEvent) => void
  private readonly sourceId: string
  private readonly emitter = new EventEmitter<SyncMessage>()
  private syncTimer?: number

  constructor(
    private manager: CacheManager,
    private options: SyncOptions = {}
  ) {
    this.sourceId = this.generateSourceId()
    
    if (options.enabled !== false) {
      this.initialize()
    }
  }

  /**
   * 生成唯一源ID
   */
  private generateSourceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 初始化同步
   */
  private initialize(): void {
    if (this.supportsBroadcastChannel()) {
      this.initBroadcastChannel()
    } else if (this.supportsStorageEvent()) {
      this.initStorageEvent()
    }

    // 监听本地缓存事件
    this.setupLocalListeners()
  }

  /**
   * 检查是否支持 BroadcastChannel
   */
  private supportsBroadcastChannel(): boolean {
    return typeof BroadcastChannel !== 'undefined'
  }

  /**
   * 检查是否支持 storage 事件
   */
  private supportsStorageEvent(): boolean {
    return typeof window !== 'undefined' && 'storage' in window
  }

  /**
   * 初始化 BroadcastChannel
   */
  private initBroadcastChannel(): void {
    const channelName = this.options.channel || 'ldesign-cache-sync'
    this.channel = new BroadcastChannel(channelName)

    this.channel.onmessage = (event) => {
      this.handleSyncMessage(event.data)
    }
  }

  /**
   * 初始化 storage 事件监听
   */
  private initStorageEvent(): void {
    if (typeof window === 'undefined') return

    this.storageHandler = (e: StorageEvent) => {
      if (!e.key?.startsWith('__sync__')) return
      
      try {
        const message: SyncMessage = JSON.parse(e.newValue || '{}')
        this.handleSyncMessage(message)
      } catch (error) {
        console.warn('Failed to parse sync message:', error)
      }
    }

    window.addEventListener('storage', this.storageHandler)
  }

  /**
   * 设置本地缓存事件监听
   */
  private setupLocalListeners(): void {
    const events = this.options.events || ['set', 'remove', 'clear']

    events.forEach(event => {
      this.manager.on(event, (e: CacheEvent) => {
        if (this.shouldSync(e.engine)) {
          this.broadcastMessage({
            type: event as any,
            key: e.key,
            value: e.value,
            timestamp: e.timestamp,
            source: this.sourceId,
          })
        }
      })
    })
  }

  /**
   * 判断是否需要同步
   */
  private shouldSync(engine: StorageEngine): boolean {
    if (!this.options.engines) {
      // 默认同步 localStorage 和 sessionStorage
      return engine === 'localStorage' || engine === 'sessionStorage'
    }
    return this.options.engines.includes(engine)
  }

  /**
   * 广播同步消息
   */
  private broadcastMessage(message: SyncMessage): void {
    // 防抖处理
    if (this.options.debounce) {
      if (this.syncTimer) {
        clearTimeout(this.syncTimer)
      }
      this.syncTimer = window.setTimeout(() => {
        this.sendMessage(message)
      }, this.options.debounce)
    } else {
      this.sendMessage(message)
    }
  }

  /**
   * 发送消息
   */
  private sendMessage(message: SyncMessage): void {
    if (this.channel) {
      this.channel.postMessage(message)
    } else if (typeof window !== 'undefined' && window.localStorage) {
      // 使用 localStorage 作为后备方案
      const key = `__sync__${Date.now()}`
      try {
        window.localStorage.setItem(key, JSON.stringify(message))
        // 立即删除，仅触发 storage 事件
        window.localStorage.removeItem(key)
      } catch (error) {
        console.warn('Failed to send sync message:', error)
      }
    }

    // 触发本地事件
    this.emitter.emit('sync', message)
  }

  /**
   * 处理同步消息
   */
  private async handleSyncMessage(message: SyncMessage): Promise<void> {
    // 忽略自己发送的消息
    if (message.source === this.sourceId) return

    try {
      switch (message.type) {
        case 'set':
          if (message.key && message.value !== undefined) {
            await this.manager.set(message.key, message.value, message.options)
          }
          break

        case 'remove':
          if (message.key) {
            await this.manager.remove(message.key)
          }
          break

        case 'clear':
          await this.manager.clear()
          break

        case 'sync':
          // 全量同步请求
          await this.handleSyncRequest()
          break

        case 'ping':
          // 心跳消息
          this.sendMessage({
            type: 'ping',
            timestamp: Date.now(),
            source: this.sourceId,
          })
          break
      }
    } catch (error) {
      console.error('Failed to handle sync message:', error)
    }
  }

  /**
   * 处理同步请求
   */
  private async handleSyncRequest(): Promise<void> {
    // 获取所有数据并广播
    const keys = await this.manager.keys()
    for (const key of keys) {
      const value = await this.manager.get(key)
      if (value !== null) {
        this.broadcastMessage({
          type: 'set',
          key,
          value,
          timestamp: Date.now(),
          source: this.sourceId,
        })
      }
    }
  }

  /**
   * 请求全量同步
   */
  async requestSync(): Promise<void> {
    this.sendMessage({
      type: 'sync',
      timestamp: Date.now(),
      source: this.sourceId,
    })
  }

  /**
   * 发送心跳
   */
  ping(): void {
    this.sendMessage({
      type: 'ping',
      timestamp: Date.now(),
      source: this.sourceId,
    })
  }

  /**
   * 监听同步事件
   */
  on(event: 'sync', listener: (message: SyncMessage) => void): void {
    this.emitter.on(event, listener)
  }

  /**
   * 移除监听器
   */
  off(event: 'sync', listener: (message: SyncMessage) => void): void {
    this.emitter.off(event, listener)
  }

  /**
   * 销毁同步管理器
   */
  destroy(): void {
    if (this.channel) {
      this.channel.close()
      this.channel = undefined
    }

    if (this.storageHandler && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageHandler)
      this.storageHandler = undefined
    }

    if (this.syncTimer) {
      clearTimeout(this.syncTimer)
      this.syncTimer = undefined
    }

    this.emitter.removeAllListeners()
  }
}

/**
 * 缓存预热管理器
 * 
 * 支持缓存数据的导入导出和预热
 */
export class WarmupManager {
  constructor(private manager: CacheManager) {}

  /**
   * 导出缓存数据
   * 
   * @param filter - 过滤函数
   * @returns 导出的数据
   */
  async export(filter?: (key: string) => boolean): Promise<{
    version: string
    timestamp: number
    data: Array<{ key: string, value: any, metadata?: any }>
  }> {
    const keys = await this.manager.keys()
    const data: Array<{ key: string, value: any, metadata?: any }> = []

    for (const key of keys) {
      if (filter && !filter(key)) continue

      const value = await this.manager.get(key)
      const metadata = await this.manager.getMetadata(key)

      if (value !== null) {
        data.push({ key, value, metadata })
      }
    }

    return {
      version: '1.0.0',
      timestamp: Date.now(),
      data,
    }
  }

  /**
   * 导入缓存数据
   * 
   * @param data - 要导入的数据
   * @param options - 导入选项
   */
  async import(
    data: {
      version?: string
      timestamp?: number
      data: Array<{ key: string, value: any, options?: any }>
    },
    options?: {
      overwrite?: boolean
      prefix?: string
      transform?: (item: any) => any
    }
  ): Promise<{
    imported: number
    skipped: number
    failed: number
  }> {
    let imported = 0
    let skipped = 0
    let failed = 0

    for (const item of data.data) {
      try {
        const key = options?.prefix ? `${options.prefix}:${item.key}` : item.key
        
        // 检查是否需要覆盖
        if (!options?.overwrite) {
          const existing = await this.manager.has(key)
          if (existing) {
            skipped++
            continue
          }
        }

        // 应用转换函数
        const value = options?.transform ? options.transform(item.value) : item.value

        await this.manager.set(key, value, item.options)
        imported++
      } catch (error) {
        console.error(`Failed to import cache item ${item.key}:`, error)
        failed++
      }
    }

    return { imported, skipped, failed }
  }

  /**
   * 预热缓存
   * 
   * @param items - 要预热的缓存项
   */
  async warmup(
    items: Array<{
      key: string
      fetcher: () => Promise<any> | any
      options?: any
    }>
  ): Promise<{
    warmed: number
    failed: number
  }> {
    let warmed = 0
    let failed = 0

    const results = await Promise.allSettled(
      items.map(async item => {
        const value = await Promise.resolve(item.fetcher())
        await this.manager.set(item.key, value, item.options)
      })
    )

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        warmed++
      } else {
        failed++
      }
    })

    return { warmed, failed }
  }

  /**
   * 从 URL 预热缓存
   */
  async warmupFromUrl(
    url: string,
    options?: {
      headers?: HeadersInit
      transform?: (data: any) => any
    }
  ): Promise<void> {
    try {
      const response = await fetch(url, { headers: options?.headers })
      const data = await response.json()
      
      const transformed = options?.transform ? options.transform(data) : data
      await this.import(transformed)
    } catch (error) {
      throw new Error(`Failed to warmup cache from URL: ${error}`)
    }
  }
}
