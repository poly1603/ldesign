/**
 * 尺寸存储管理器
 */

import type { SizeMode } from '../types'

/**
 * 存储管理器选项
 */
export interface SizeStorageManagerOptions {
  /** 是否启用存储 */
  enabled?: boolean
  /** 存储类型 */
  type?: 'localStorage' | 'sessionStorage'
  /** 存储键名 */
  key?: string
}

/**
 * 默认存储选项
 */
const DEFAULT_STORAGE_OPTIONS: Required<SizeStorageManagerOptions> = {
  enabled: true,
  type: 'localStorage',
  key: 'ldesign-size-mode',
}

/**
 * 尺寸存储管理器实现
 */
export class SizeStorageManager {
  private options: Required<SizeStorageManagerOptions>
  private storage: Storage | null = null

  constructor(options?: SizeStorageManagerOptions) {
    this.options = { ...DEFAULT_STORAGE_OPTIONS, ...options }
    
    if (this.options.enabled && typeof window !== 'undefined') {
      this.storage = this.options.type === 'localStorage' 
        ? window.localStorage 
        : window.sessionStorage
    }
  }

  /**
   * 保存当前尺寸模式
   */
  saveCurrentMode(mode: SizeMode): void {
    if (!this.storage) return

    try {
      this.storage.setItem(this.options.key, mode)
    } catch (error) {
      console.warn('[SizeStorageManager] Failed to save size mode:', error)
    }
  }

  /**
   * 获取保存的尺寸模式
   */
  getSavedMode(): SizeMode | null {
    if (!this.storage) return null

    try {
      const saved = this.storage.getItem(this.options.key)
      if (saved && ['small', 'medium', 'large', 'extra-large'].includes(saved)) {
        return saved as SizeMode
      }
    } catch (error) {
      console.warn('[SizeStorageManager] Failed to get saved size mode:', error)
    }

    return null
  }

  /**
   * 清除保存的尺寸模式
   */
  clearSavedMode(): void {
    if (!this.storage) return

    try {
      this.storage.removeItem(this.options.key)
    } catch (error) {
      console.warn('[SizeStorageManager] Failed to clear saved size mode:', error)
    }
  }

  /**
   * 检查是否启用存储
   */
  isEnabled(): boolean {
    return this.options.enabled && this.storage !== null
  }
}
