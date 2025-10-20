/**
 * 状态持久化增强模块
 * 提供更强大的持久化功能，包括版本管理、迁移、压缩、加密等
 * 
 * @module PersistenceEnhancement
 */

import type { StateDefinition } from '../types'

/**
 * 持久化策略
 */
export enum PersistenceStrategy {
  /** 立即持久化 */
  IMMEDIATE = 'immediate',
  /** 防抖持久化 */
  DEBOUNCED = 'debounced',
  /** 节流持久化 */
  THROTTLED = 'throttled',
  /** 手动持久化 */
  MANUAL = 'manual'
}

/**
 * 存储引擎接口
 */
export interface StorageEngine {
  getItem: (key: string) => Promise<string | null> | string | null
  setItem: (key: string, value: string) => Promise<void> | void
  removeItem: (key: string) => Promise<void> | void
  clear?: () => Promise<void> | void
}

/**
 * 状态迁移函数
 */
export type StateMigration<T = any> = (oldState: any) => T

/**
 * 持久化配置
 */
export interface EnhancedPersistOptions<T extends StateDefinition = StateDefinition> {
  /** 存储键名 */
  key: string
  /** 存储引擎 */
  storage?: StorageEngine
  /** 持久化策略 */
  strategy?: PersistenceStrategy
  /** 防抖/节流延迟（毫秒） */
  delay?: number
  /** 需要持久化的路径 */
  paths?: Array<keyof T | string>
  /** 版本号 */
  version?: number
  /** 状态迁移映射 */
  migrations?: Record<number, StateMigration<T>>
  /** 是否压缩 */
  compress?: boolean
  /** 是否加密 */
  encrypt?: boolean
  /** 加密密钥 */
  encryptionKey?: string
  /** 序列化函数 */
  serializer?: (state: T) => string
  /** 反序列化函数 */
  deserializer?: (data: string) => T
  /** 错误处理 */
  onError?: (error: Error) => void
}

/**
 * 增强的持久化管理器
 */
export class EnhancedPersistenceManager<T extends StateDefinition = StateDefinition> {
  private options: Required<Omit<EnhancedPersistOptions<T>, 'migrations' | 'encryptionKey'>> & {
    migrations?: Record<number, StateMigration<T>>
    encryptionKey?: string
  }
  private saveTimer: number | null = null
  private lastSaveTime = 0

  constructor(options: EnhancedPersistOptions<T>) {
    this.options = {
      storage: typeof window !== 'undefined' ? window.localStorage : this.createMemoryStorage(),
      strategy: PersistenceStrategy.DEBOUNCED,
      delay: 1000,
      paths: [],
      version: 1,
      compress: false,
      encrypt: false,
      serializer: JSON.stringify,
      deserializer: JSON.parse,
      onError: console.error,
      ...options
    }
  }

  /**
   * 保存状态
   */
  async save(state: T): Promise<void> {
    try {
      const { strategy, delay } = this.options

      switch (strategy) {
        case PersistenceStrategy.IMMEDIATE:
          await this.doSave(state)
          break

        case PersistenceStrategy.DEBOUNCED:
          if (this.saveTimer) {
            clearTimeout(this.saveTimer)
          }
          this.saveTimer = window.setTimeout(() => this.doSave(state), delay)
          break

        case PersistenceStrategy.THROTTLED: {
          const now = Date.now()
          if (now - this.lastSaveTime >= delay) {
            await this.doSave(state)
            this.lastSaveTime = now
          }
          break
        }

        case PersistenceStrategy.MANUAL:
          // 手动模式不自动保存
          break
      }
    } catch (error) {
      this.options.onError(error as Error)
    }
  }

  /**
   * 执行保存
   */
  private async doSave(state: T): Promise<void> {
    const { key, storage, paths, version, compress, encrypt, encryptionKey, serializer } = this.options

    // 提取需要持久化的字段
    let dataToSave: any = state
    if (paths.length > 0) {
      dataToSave = {}
      paths.forEach(path => {
        const keys = String(path).split('.')
        let value: any = state
        for (const k of keys) {
          value = value?.[k]
        }
        this.setNestedValue(dataToSave, String(path), value)
      })
    }

    // 包装版本信息
    const wrapped = {
      version,
      data: dataToSave,
      timestamp: Date.now()
    }

    // 序列化
    let serialized = serializer(wrapped as any)

    // 压缩
    if (compress) {
      serialized = await this.compress(serialized)
    }

    // 加密
    if (encrypt && encryptionKey) {
      serialized = await this.encrypt(serialized, encryptionKey)
    }

    // 保存
    await storage.setItem(key, serialized)
  }

  /**
   * 加载状态
   */
  async load(): Promise<T | null> {
    try {
      const { key, storage, version, migrations, compress, encrypt, encryptionKey, deserializer } = this.options

      let data = await storage.getItem(key)
      if (!data) return null

      // 解密
      if (encrypt && encryptionKey) {
        data = await this.decrypt(data, encryptionKey)
      }

      // 解压
      if (compress) {
        data = await this.decompress(data)
      }

      // 反序列化
      const wrapped = deserializer(data)

      // 版本迁移
      let state = wrapped.data
      if (migrations && wrapped.version < version) {
        for (let v = wrapped.version + 1; v <= version; v++) {
          if (migrations[v]) {
            state = migrations[v](state)
          }
        }
      }

      return state
    } catch (error) {
      this.options.onError(error as Error)
      return null
    }
  }

  /**
   * 清除持久化数据
   */
  async clear(): Promise<void> {
    const { key, storage } = this.options
    await storage.removeItem(key)
  }

  /**
   * 手动触发保存（用于 MANUAL 策略）
   */
  async flush(state: T): Promise<void> {
    await this.doSave(state)
  }

  /**
   * 压缩数据
   */
  private async compress(data: string): Promise<string> {
    // 简单的 LZ 压缩实现
    // 生产环境建议使用 pako 或 lz-string
    return data // 占位符
  }

  /**
   * 解压数据
   */
  private async decompress(data: string): Promise<string> {
    return data // 占位符
  }

  /**
   * 加密数据
   */
  private async encrypt(data: string, key: string): Promise<string> {
    // 简单的 XOR 加密（仅用于演示）
    // 生产环境建议使用 crypto-js 或 Web Crypto API
    return btoa(data.split('').map((c, i) => 
      String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join(''))
  }

  /**
   * 解密数据
   */
  private async decrypt(data: string, key: string): Promise<string> {
    const decoded = atob(data)
    return decoded.split('').map((c, i) => 
      String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    ).join('')
  }

  /**
   * 设置嵌套值
   */
  private setNestedValue(obj: any, path: string, value: any): void {
    const keys = path.split('.')
    let current = obj
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i]
      if (!(key in current)) {
        current[key] = {}
      }
      current = current[key]
    }
    current[keys[keys.length - 1]] = value
  }

  /**
   * 创建内存存储引擎
   */
  private createMemoryStorage(): StorageEngine {
    const storage = new Map<string, string>()
    return {
      getItem: (key: string) => storage.get(key) || null,
      setItem: (key: string, value: string) => { storage.set(key, value) },
      removeItem: (key: string) => { storage.delete(key) },
      clear: () => { storage.clear() }
    }
  }
}

/**
 * 创建增强的持久化管理器
 */
export function createEnhancedPersistence<T extends StateDefinition = StateDefinition>(
  options: EnhancedPersistOptions<T>
): EnhancedPersistenceManager<T> {
  return new EnhancedPersistenceManager(options)
}

/**
 * IndexedDB 存储引擎
 */
export class IndexedDBStorage implements StorageEngine {
  private dbName: string
  private storeName: string
  private db: IDBDatabase | null = null

  constructor(dbName = 'ldesign-store', storeName = 'state') {
    this.dbName = dbName
    this.storeName = storeName
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve(this.db)
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName)
        }
      }
    })
  }

  async getItem(key: string): Promise<string | null> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.get(key)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result || null)
    })
  }

  async setItem(key: string, value: string): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.put(value, key)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async removeItem(key: string): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(key)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clear(): Promise<void> {
    const db = await this.getDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.clear()
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

