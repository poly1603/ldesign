/**
 * 存储管理器
 */

import type { SizeMode } from '../types'

/**
 * 存储选项
 */
export interface StorageOptions {
  /** 存储键前缀 */
  prefix?: string
  /** 存储类型 */
  type?: 'localStorage' | 'sessionStorage' | 'memory'
  /** 是否启用存储 */
  enabled?: boolean
}

/**
 * 默认存储选项
 */
const DEFAULT_STORAGE_OPTIONS: Required<StorageOptions> = {
  prefix: 'ldesign-size',
  type: 'localStorage',
  enabled: true,
}

/**
 * 存储管理器类
 */
export class StorageManager {
  private options: Required<StorageOptions>
  private memoryStorage: Map<string, any> = new Map()

  constructor(options?: StorageOptions) {
    this.options = { ...DEFAULT_STORAGE_OPTIONS, ...options }
  }

  /**
   * 获取存储实例
   */
  private getStorage(): Storage | Map<string, any> {
    if (!this.options.enabled) {
      return this.memoryStorage
    }

    if (typeof window === 'undefined') {
      return this.memoryStorage
    }

    switch (this.options.type) {
      case 'localStorage':
        return window.localStorage
      case 'sessionStorage':
        return window.sessionStorage
      case 'memory':
      default:
        return this.memoryStorage
    }
  }

  /**
   * 生成存储键
   */
  private getKey(key: string): string {
    return `${this.options.prefix}-${key}`
  }

  /**
   * 设置值
   */
  set<T>(key: string, value: T): void {
    try {
      const storage = this.getStorage()
      const storageKey = this.getKey(key)

      if (storage instanceof Map) {
        storage.set(storageKey, value)
      }
      else {
        storage.setItem(storageKey, JSON.stringify(value))
      }
    }
    catch (error) {
      console.warn('Failed to save to storage:', error)
    }
  }

  /**
   * 获取值
   */
  get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const storage = this.getStorage()
      const storageKey = this.getKey(key)

      if (storage instanceof Map) {
        return storage.get(storageKey) ?? defaultValue
      }
      else {
        const item = storage.getItem(storageKey)
        if (item === null) {
          return defaultValue
        }
        return JSON.parse(item)
      }
    }
    catch (error) {
      console.warn('Failed to read from storage:', error)
      return defaultValue
    }
  }

  /**
   * 移除值
   */
  remove(key: string): void {
    try {
      const storage = this.getStorage()
      const storageKey = this.getKey(key)

      if (storage instanceof Map) {
        storage.delete(storageKey)
      }
      else {
        storage.removeItem(storageKey)
      }
    }
    catch (error) {
      console.warn('Failed to remove from storage:', error)
    }
  }

  /**
   * 清空所有值
   */
  clear(): void {
    try {
      const storage = this.getStorage()

      if (storage instanceof Map) {
        // 只清除带有前缀的键
        const keysToDelete = Array.from(storage.keys()).filter(key =>
          key.startsWith(this.options.prefix),
        )
        keysToDelete.forEach(key => storage.delete(key))
      }
      else {
        // 只清除带有前缀的键
        const keysToRemove: string[] = []
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i)
          if (key && key.startsWith(this.options.prefix)) {
            keysToRemove.push(key)
          }
        }
        keysToRemove.forEach(key => storage.removeItem(key))
      }
    }
    catch (error) {
      console.warn('Failed to clear storage:', error)
    }
  }

  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    try {
      const storage = this.getStorage()
      const storageKey = this.getKey(key)

      if (storage instanceof Map) {
        return storage.has(storageKey)
      }
      else {
        return storage.getItem(storageKey) !== null
      }
    }
    catch (error) {
      console.warn('Failed to check storage:', error)
      return false
    }
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    try {
      const storage = this.getStorage()
      const prefix = this.options.prefix

      if (storage instanceof Map) {
        return Array.from(storage.keys())
          .filter(key => key.startsWith(prefix))
          .map(key => key.substring(prefix.length + 1))
      }
      else {
        const keys: string[] = []
        for (let i = 0; i < storage.length; i++) {
          const key = storage.key(i)
          if (key && key.startsWith(prefix)) {
            keys.push(key.substring(prefix.length + 1))
          }
        }
        return keys
      }
    }
    catch (error) {
      console.warn('Failed to get storage keys:', error)
      return []
    }
  }

  /**
   * 更新选项
   */
  updateOptions(options: Partial<StorageOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 获取当前选项
   */
  getOptions(): Required<StorageOptions> {
    return { ...this.options }
  }

  /**
   * 销毁存储管理器
   */
  destroy(): void {
    this.memoryStorage.clear()
  }
}

/**
 * 全局存储管理器实例
 */
export const globalStorageManager = new StorageManager()

/**
 * 创建存储管理器实例
 */
export function createStorageManager(options?: StorageOptions): StorageManager {
  return new StorageManager(options)
}

/**
 * 尺寸存储管理器
 */
export class SizeStorageManager extends StorageManager {
  private static readonly SIZE_MODE_KEY = 'current-mode'
  private static readonly USER_PREFERENCES_KEY = 'user-preferences'

  /**
   * 保存当前尺寸模式
   */
  saveCurrentMode(mode: SizeMode): void {
    this.set(SizeStorageManager.SIZE_MODE_KEY, mode)
  }

  /**
   * 获取保存的尺寸模式
   */
  getSavedMode(): SizeMode | undefined {
    return this.get<SizeMode>(SizeStorageManager.SIZE_MODE_KEY)
  }

  /**
   * 移除保存的尺寸模式
   */
  removeSavedMode(): void {
    this.remove(SizeStorageManager.SIZE_MODE_KEY)
  }

  /**
   * 保存用户偏好设置
   */
  saveUserPreferences(preferences: Record<string, any>): void {
    this.set(SizeStorageManager.USER_PREFERENCES_KEY, preferences)
  }

  /**
   * 获取用户偏好设置
   */
  getUserPreferences(): Record<string, any> {
    return this.get(SizeStorageManager.USER_PREFERENCES_KEY, {}) || {}
  }

  /**
   * 移除用户偏好设置
   */
  removeUserPreferences(): void {
    this.remove(SizeStorageManager.USER_PREFERENCES_KEY)
  }
}

/**
 * 全局尺寸存储管理器实例
 */
export const globalSizeStorageManager = new SizeStorageManager()

/**
 * 创建尺寸存储管理器实例
 */
export function createSizeStorageManager(options?: StorageOptions): SizeStorageManager {
  return new SizeStorageManager(options)
}
