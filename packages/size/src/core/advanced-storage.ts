/**
 * 高级存储管理模块
 * 提供 IndexedDB 支持、多标签页同步、云同步接口
 */

import type { SizeMode } from '../types'

/**
 * 存储适配器接口
 */
export interface StorageAdapter {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}

/**
 * 云同步配置
 */
export interface CloudSyncConfig {
  /** API 端点 */
  endpoint: string
  /** 认证令牌 */
  authToken?: string
  /** 同步间隔（毫秒） */
  syncInterval?: number
  /** 是否自动同步 */
  autoSync?: boolean
}

/**
 * IndexedDB 存储适配器
 */
export class IndexedDBAdapter implements StorageAdapter {
  private dbName: string
  private storeName: string
  private db: IDBDatabase | null = null
  private initPromise: Promise<void> | null = null

  constructor(dbName = 'ldesign-size-db', storeName = 'settings') {
    this.dbName = dbName
    this.storeName = storeName
  }

  private async init(): Promise<void> {
    if (this.db) return
    if (this.initPromise) return this.initPromise

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not supported'))
        return
      }

      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName)
        }
      }
    })

    return this.initPromise
  }

  async get(key: string): Promise<string | null> {
    await this.init()
    if (!this.db) return null

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async set(key: string, value: string): Promise<void> {
    await this.init()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(value, key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async remove(key: string): Promise<void> {
    await this.init()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clear(): Promise<void> {
    await this.init()
    if (!this.db) return

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(this.storeName, 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  close(): void {
    if (this.db) {
      this.db.close()
      this.db = null
    }
  }
}

/**
 * 多标签页同步管理器
 */
export class MultiTabSyncManager {
  private storageKey: string
  private listeners: Array<(mode: SizeMode) => void> = []
  private channel: BroadcastChannel | null = null

  constructor(storageKey = 'ldesign-size-mode') {
    this.storageKey = storageKey

    // 尝试使用 BroadcastChannel API（更高效）
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('ldesign-size-sync')
        this.setupBroadcastChannel()
      }
      catch (error) {
        console.warn('[MultiTabSync] BroadcastChannel not available, falling back to storage events')
        this.setupStorageListener()
      }
    }
    else {
      this.setupStorageListener()
    }
  }

  private setupBroadcastChannel(): void {
    if (!this.channel) return

    this.channel.onmessage = (event) => {
      if (event.data?.type === 'size-mode-change' && event.data?.mode) {
        this.notifyListeners(event.data.mode)
      }
    }
  }

  private setupStorageListener(): void {
    if (typeof window === 'undefined') return

    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey && event.newValue) {
        try {
          const mode = event.newValue as SizeMode
          this.notifyListeners(mode)
        }
        catch (error) {
          console.error('[MultiTabSync] Failed to parse storage value:', error)
        }
      }
    })
  }

  private notifyListeners(mode: SizeMode): void {
    this.listeners.forEach((listener) => {
      try {
        listener(mode)
      }
      catch (error) {
        console.error('[MultiTabSync] Listener error:', error)
      }
    })
  }

  /**
   * 广播尺寸模式变化
   */
  broadcast(mode: SizeMode): void {
    if (this.channel) {
      try {
        this.channel.postMessage({
          type: 'size-mode-change',
          mode,
          timestamp: Date.now(),
        })
      }
      catch (error) {
        console.error('[MultiTabSync] Failed to broadcast:', error)
      }
    }
    else {
      // 回退到 localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(this.storageKey, mode)
      }
    }
  }

  /**
   * 监听其他标签页的变化
   */
  onSync(callback: (mode: SizeMode) => void): () => void {
    this.listeners.push(callback)
    return () => {
      const index = this.listeners.indexOf(callback)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  /**
   * 销毁同步管理器
   */
  destroy(): void {
    if (this.channel) {
      this.channel.close()
      this.channel = null
    }
    this.listeners = []
  }
}

/**
 * 云同步管理器
 */
export class CloudSyncManager {
  private config: Required<CloudSyncConfig>
  private syncTimer: NodeJS.Timeout | null = null
  private lastSyncTime = 0

  constructor(config: CloudSyncConfig) {
    this.config = {
      endpoint: config.endpoint,
      authToken: config.authToken || '',
      syncInterval: config.syncInterval || 300000, // 5分钟
      autoSync: config.autoSync ?? false,
    }

    if (this.config.autoSync) {
      this.startAutoSync()
    }
  }

  /**
   * 上传设置到云端
   */
  async upload(mode: SizeMode, metadata?: Record<string, unknown>): Promise<void> {
    try {
      const response = await fetch(`${this.config.endpoint}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.authToken && { Authorization: `Bearer ${this.config.authToken}` }),
        },
        body: JSON.stringify({
          mode,
          metadata,
          timestamp: Date.now(),
        }),
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      this.lastSyncTime = Date.now()
    }
    catch (error) {
      console.error('[CloudSync] Upload failed:', error)
      throw error
    }
  }

  /**
   * 从云端下载设置
   */
  async download(): Promise<{ mode: SizeMode, metadata?: Record<string, unknown> } | null> {
    try {
      const response = await fetch(`${this.config.endpoint}/download`, {
        method: 'GET',
        headers: {
          ...(this.config.authToken && { Authorization: `Bearer ${this.config.authToken}` }),
        },
      })

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`)
      }

      const data = await response.json()
      this.lastSyncTime = Date.now()
      return data
    }
    catch (error) {
      console.error('[CloudSync] Download failed:', error)
      throw error
    }
  }

  /**
   * 同步设置
   */
  async sync(currentMode: SizeMode): Promise<SizeMode> {
    try {
      // 先上传当前设置
      await this.upload(currentMode)

      // 再下载最新设置
      const data = await this.download()
      return data?.mode || currentMode
    }
    catch (error) {
      console.error('[CloudSync] Sync failed:', error)
      return currentMode
    }
  }

  /**
   * 启动自动同步
   */
  private startAutoSync(): void {
    this.syncTimer = setInterval(() => {
      // 由外部调用者触发同步
      // 这里只是触发定时器，实际同步逻辑在外部
    }, this.config.syncInterval)
  }

  /**
   * 停止自动同步
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
  }

  /**
   * 获取上次同步时间
   */
  getLastSyncTime(): number {
    return this.lastSyncTime
  }

  /**
   * 销毁云同步管理器
   */
  destroy(): void {
    this.stopAutoSync()
  }
}

/**
 * 统一的高级存储管理器
 */
export class AdvancedStorageManager {
  private adapter: StorageAdapter
  private multiTabSync?: MultiTabSyncManager
  private cloudSync?: CloudSyncManager
  private storageKey: string

  constructor(
    adapter?: StorageAdapter,
    options: {
      enableMultiTabSync?: boolean
      cloudSyncConfig?: CloudSyncConfig
      storageKey?: string
    } = {},
  ) {
    this.adapter = adapter || new IndexedDBAdapter()
    this.storageKey = options.storageKey || 'ldesign-size-mode'

    if (options.enableMultiTabSync) {
      this.multiTabSync = new MultiTabSyncManager(this.storageKey)
    }

    if (options.cloudSyncConfig) {
      this.cloudSync = new CloudSyncManager(options.cloudSyncConfig)
    }
  }

  /**
   * 保存尺寸模式
   */
  async saveMode(mode: SizeMode): Promise<void> {
    try {
      await this.adapter.set(this.storageKey, mode)

      // 广播到其他标签页
      if (this.multiTabSync) {
        this.multiTabSync.broadcast(mode)
      }

      // 同步到云端
      if (this.cloudSync) {
        await this.cloudSync.upload(mode)
      }
    }
    catch (error) {
      console.error('[AdvancedStorage] Save failed:', error)
    }
  }

  /**
   * 读取尺寸模式
   */
  async loadMode(): Promise<SizeMode | null> {
    try {
      const mode = await this.adapter.get(this.storageKey)
      return mode as SizeMode | null
    }
    catch (error) {
      console.error('[AdvancedStorage] Load failed:', error)
      return null
    }
  }

  /**
   * 监听多标签页同步
   */
  onMultiTabSync(callback: (mode: SizeMode) => void): (() => void) | undefined {
    return this.multiTabSync?.onSync(callback)
  }

  /**
   * 从云端同步
   */
  async syncFromCloud(currentMode: SizeMode): Promise<SizeMode> {
    if (!this.cloudSync) {
      return currentMode
    }

    try {
      return await this.cloudSync.sync(currentMode)
    }
    catch (error) {
      console.error('[AdvancedStorage] Cloud sync failed:', error)
      return currentMode
    }
  }

  /**
   * 销毁存储管理器
   */
  destroy(): void {
    if (this.multiTabSync) {
      this.multiTabSync.destroy()
    }
    if (this.cloudSync) {
      this.cloudSync.destroy()
    }
  }
}

/**
 * 创建高级存储管理器
 */
export function createAdvancedStorage(options?: {
  adapter?: StorageAdapter
  enableMultiTabSync?: boolean
  cloudSyncConfig?: CloudSyncConfig
  storageKey?: string
}): AdvancedStorageManager {
  return new AdvancedStorageManager(options?.adapter, options)
}
