/**
 * 数据持久化层 - localStorage 和 IndexedDB 支持
 */

import type { CalendarEvent } from '../types'
import { CalendarError, ErrorCode, ErrorSeverity } from './errors'

/**
 * 存储类型
 */
export enum StorageType {
  LOCAL = 'localStorage',
  SESSION = 'sessionStorage',
  INDEXED_DB = 'indexedDB'
}

/**
 * 存储配置
 */
export interface StorageConfig {
  type?: StorageType
  dbName?: string
  dbVersion?: number
  storeName?: string
  keyPath?: string
  enableVersioning?: boolean
  enableSync?: boolean
  syncInterval?: number
  encryptData?: boolean
}

/**
 * 数据版本信息
 */
export interface DataVersion {
  version: number
  timestamp: number
  checksum?: string
}

/**
 * 同步状态
 */
export interface SyncStatus {
  lastSync?: Date
  pending: number
  failed: number
  syncing: boolean
}

/**
 * 基础存储接口
 */
export interface IStorage {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T): Promise<void>
  delete(key: string): Promise<boolean>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
  keys(): Promise<string[]>
  size(): Promise<number>
}

/**
 * LocalStorage 适配器
 */
export class LocalStorageAdapter implements IStorage {
  private prefix: string

  constructor(prefix = 'ldesign-calendar-') {
    this.prefix = prefix
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = localStorage.getItem(this.prefix + key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('LocalStorage get error:', error)
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value))
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        throw new CalendarError(
          'Storage quota exceeded',
          ErrorCode.OPERATION_FAILED,
          ErrorSeverity.HIGH
        )
      }
      throw error
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(this.prefix + key)
      return true
    } catch {
      return false
    }
  }

  async clear(): Promise<void> {
    const keys = await this.keys()
    keys.forEach(key => localStorage.removeItem(this.prefix + key))
  }

  async has(key: string): Promise<boolean> {
    return localStorage.getItem(this.prefix + key) !== null
  }

  async keys(): Promise<string[]> {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length))
      }
    }
    return keys
  }

  async size(): Promise<number> {
    let size = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(this.prefix)) {
        const value = localStorage.getItem(key)
        if (value) {
          size += key.length + value.length
        }
      }
    }
    return size
  }
}

/**
 * IndexedDB 适配器
 */
export class IndexedDBAdapter implements IStorage {
  private dbName: string
  private storeName: string
  private version: number
  private db?: IDBDatabase

  constructor(dbName = 'LDesignCalendar', storeName = 'events', version = 1) {
    this.dbName = dbName
    this.storeName = storeName
    this.version = version
  }

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(request.result)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' })
        }
      }
    })
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const data = { id: key, value, timestamp: Date.now() }
      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async delete(key: string): Promise<boolean> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)

      request.onsuccess = () => resolve(true)
      request.onerror = () => {
        console.error('Delete error:', request.error)
        resolve(false)
      }
    })
  }

  async clear(): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key)
    return value !== null
  }

  async keys(): Promise<string[]> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAllKeys()

      request.onsuccess = () => resolve(request.result as string[])
      request.onerror = () => reject(request.error)
    })
  }

  async size(): Promise<number> {
    const keys = await this.keys()
    return keys.length
  }

  close(): void {
    if (this.db) {
      this.db.close()
      this.db = undefined
    }
  }
}

/**
 * 数据持久化管理器
 */
export class PersistenceManager {
  private storage: IStorage
  private config: StorageConfig
  private syncQueue: Map<string, any> = new Map()
  private syncTimer?: NodeJS.Timeout
  private version: DataVersion = {
    version: 1,
    timestamp: Date.now()
  }

  constructor(config: StorageConfig = {}) {
    this.config = {
      type: StorageType.LOCAL,
      enableVersioning: true,
      enableSync: false,
      syncInterval: 30000, // 30 seconds
      ...config
    }

    // 初始化存储适配器
    this.storage = this.createStorage()

    // 启动同步
    if (this.config.enableSync) {
      this.startSync()
    }
  }

  private createStorage(): IStorage {
    switch (this.config.type) {
      case StorageType.INDEXED_DB:
        return new IndexedDBAdapter(
          this.config.dbName,
          this.config.storeName,
          this.config.dbVersion
        )
      case StorageType.SESSION:
        return new SessionStorageAdapter()
      default:
        return new LocalStorageAdapter()
    }
  }

  /**
   * 保存事件
   */
  async saveEvent(event: CalendarEvent): Promise<void> {
    const key = `event-${event.id}`
    const data = this.config.enableVersioning
      ? { ...event, _version: this.version }
      : event

    await this.storage.set(key, data)

    if (this.config.enableSync) {
      this.syncQueue.set(key, { action: 'save', data })
    }
  }

  /**
   * 获取事件
   */
  async getEvent(eventId: string): Promise<CalendarEvent | null> {
    const key = `event-${eventId}`
    const data = await this.storage.get<any>(key)
    
    if (data && this.config.enableVersioning) {
      const { _version, ...event } = data
      return event as CalendarEvent
    }
    
    return data as CalendarEvent | null
  }

  /**
   * 删除事件
   */
  async deleteEvent(eventId: string): Promise<boolean> {
    const key = `event-${eventId}`
    const result = await this.storage.delete(key)

    if (this.config.enableSync && result) {
      this.syncQueue.set(key, { action: 'delete' })
    }

    return result
  }

  /**
   * 获取所有事件
   */
  async getAllEvents(): Promise<CalendarEvent[]> {
    const keys = await this.storage.keys()
    const eventKeys = keys.filter(key => key.startsWith('event-'))
    
    const events: CalendarEvent[] = []
    for (const key of eventKeys) {
      const event = await this.storage.get<any>(key)
      if (event) {
        if (this.config.enableVersioning) {
          const { _version, ...eventData } = event
          events.push(eventData as CalendarEvent)
        } else {
          events.push(event as CalendarEvent)
        }
      }
    }
    
    return events
  }

  /**
   * 批量保存事件
   */
  async saveEvents(events: CalendarEvent[]): Promise<void> {
    for (const event of events) {
      await this.saveEvent(event)
    }
  }

  /**
   * 保存设置
   */
  async saveSettings(settings: Record<string, any>): Promise<void> {
    await this.storage.set('settings', settings)
  }

  /**
   * 获取设置
   */
  async getSettings(): Promise<Record<string, any> | null> {
    return await this.storage.get('settings')
  }

  /**
   * 保存用户偏好
   */
  async savePreferences(preferences: Record<string, any>): Promise<void> {
    await this.storage.set('preferences', preferences)
  }

  /**
   * 获取用户偏好
   */
  async getPreferences(): Promise<Record<string, any> | null> {
    return await this.storage.get('preferences')
  }

  /**
   * 清空所有数据
   */
  async clearAll(): Promise<void> {
    await this.storage.clear()
    this.syncQueue.clear()
  }

  /**
   * 导出数据
   */
  async exportData(): Promise<string> {
    const events = await this.getAllEvents()
    const settings = await this.getSettings()
    const preferences = await this.getPreferences()
    
    const data = {
      version: this.version,
      exportDate: new Date().toISOString(),
      events,
      settings,
      preferences
    }
    
    return JSON.stringify(data, null, 2)
  }

  /**
   * 导入数据
   */
  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData)
      
      // 导入事件
      if (data.events && Array.isArray(data.events)) {
        await this.saveEvents(data.events)
      }
      
      // 导入设置
      if (data.settings) {
        await this.saveSettings(data.settings)
      }
      
      // 导入偏好
      if (data.preferences) {
        await this.savePreferences(data.preferences)
      }
      
      // 更新版本
      if (data.version) {
        this.version = data.version
      }
    } catch (error) {
      throw new CalendarError(
        'Failed to import data',
        ErrorCode.OPERATION_FAILED,
        ErrorSeverity.HIGH,
        { error }
      )
    }
  }

  /**
   * 启动同步
   */
  private startSync(): void {
    if (this.syncTimer) return

    this.syncTimer = setInterval(() => {
      this.sync()
    }, this.config.syncInterval)
  }

  /**
   * 停止同步
   */
  stopSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = undefined
    }
  }

  /**
   * 执行同步
   */
  async sync(): Promise<void> {
    if (this.syncQueue.size === 0) return

    const items = Array.from(this.syncQueue.entries())
    this.syncQueue.clear()

    try {
      // 这里实现与后端的同步逻辑
      await this.syncWithBackend(items)
    } catch (error) {
      // 同步失败，重新加入队列
      items.forEach(([key, value]) => {
        this.syncQueue.set(key, value)
      })
      throw error
    }
  }

  /**
   * 与后端同步
   */
  private async syncWithBackend(items: [string, any][]): Promise<void> {
    // 实现与后端API的同步
    // 这里是示例实现
    const syncData = {
      version: this.version,
      timestamp: Date.now(),
      items
    }

    // 发送到后端
    // const response = await fetch('/api/calendar/sync', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(syncData)
    // })

    // if (!response.ok) {
    //   throw new Error('Sync failed')
    // }

    console.log('Sync data:', syncData)
  }

  /**
   * 获取存储大小
   */
  async getStorageSize(): Promise<number> {
    return await this.storage.size()
  }

  /**
   * 获取同步状态
   */
  getSyncStatus(): SyncStatus {
    return {
      lastSync: undefined,
      pending: this.syncQueue.size,
      failed: 0,
      syncing: false
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.stopSync()
    if (this.storage instanceof IndexedDBAdapter) {
      this.storage.close()
    }
  }
}

/**
 * SessionStorage 适配器
 */
class SessionStorageAdapter extends LocalStorageAdapter {
  constructor(prefix = 'ldesign-calendar-') {
    super(prefix)
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const item = sessionStorage.getItem(this['prefix'] + key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error('SessionStorage get error:', error)
      return null
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      sessionStorage.setItem(this['prefix'] + key, JSON.stringify(value))
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        throw new CalendarError(
          'Storage quota exceeded',
          ErrorCode.OPERATION_FAILED,
          ErrorSeverity.HIGH
        )
      }
      throw error
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      sessionStorage.removeItem(this['prefix'] + key)
      return true
    } catch {
      return false
    }
  }

  async clear(): Promise<void> {
    const keys = await this.keys()
    keys.forEach(key => sessionStorage.removeItem(this['prefix'] + key))
  }

  async has(key: string): Promise<boolean> {
    return sessionStorage.getItem(this['prefix'] + key) !== null
  }

  async keys(): Promise<string[]> {
    const keys: string[] = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key?.startsWith(this['prefix'])) {
        keys.push(key.slice(this['prefix'].length))
      }
    }
    return keys
  }

  async size(): Promise<number> {
    let size = 0
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key?.startsWith(this['prefix'])) {
        const value = sessionStorage.getItem(key)
        if (value) {
          size += key.length + value.length
        }
      }
    }
    return size
  }
}

/**
 * 缓存策略
 */
export enum CacheStrategy {
  NETWORK_FIRST = 'network-first',
  CACHE_FIRST = 'cache-first',
  NETWORK_ONLY = 'network-only',
  CACHE_ONLY = 'cache-only',
  STALE_WHILE_REVALIDATE = 'stale-while-revalidate'
}

/**
 * 离线管理器
 */
export class OfflineManager {
  private storage: PersistenceManager
  private online = navigator.onLine
  private listeners: Set<(online: boolean) => void> = new Set()

  constructor(storage: PersistenceManager) {
    this.storage = storage

    // 监听网络状态
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))
  }

  private handleOnline(): void {
    this.online = true
    this.notifyListeners(true)
    
    // 触发同步
    this.storage.sync().catch(console.error)
  }

  private handleOffline(): void {
    this.online = false
    this.notifyListeners(false)
  }

  private notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => listener(online))
  }

  /**
   * 监听在线状态变化
   */
  onStatusChange(listener: (online: boolean) => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  /**
   * 获取在线状态
   */
  isOnline(): boolean {
    return this.online
  }

  /**
   * 销毁
   */
  destroy(): void {
    window.removeEventListener('online', this.handleOnline.bind(this))
    window.removeEventListener('offline', this.handleOffline.bind(this))
    this.listeners.clear()
  }
}

export default {
  StorageType,
  LocalStorageAdapter,
  IndexedDBAdapter,
  PersistenceManager,
  OfflineManager,
  CacheStrategy
}