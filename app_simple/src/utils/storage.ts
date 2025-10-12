/**
 * 本地存储工具
 * 提供统一的存储接口
 */

import { appConfig } from '@/config/app.config'

const { prefix, expire } = appConfig.storage

interface StorageData<T = any> {
  value: T
  expire?: number
  timestamp: number
}

class Storage {
  private prefix: string

  constructor(prefix: string) {
    this.prefix = prefix
  }

  /**
   * 获取完整的键名
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  /**
   * 设置存储项
   */
  set<T = any>(key: string, value: T, ttl?: number): void {
    const data: StorageData<T> = {
      value,
      timestamp: Date.now(),
      expire: ttl ? Date.now() + ttl : undefined
    }
    
    try {
      localStorage.setItem(this.getKey(key), JSON.stringify(data))
    } catch (error) {
      console.error('Storage set error:', error)
    }
  }

  /**
   * 获取存储项
   */
  get<T = any>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(this.getKey(key))
      
      if (!item) {
        return defaultValue
      }
      
      const data: StorageData<T> = JSON.parse(item)
      
      // 检查是否过期
      if (data.expire && data.expire < Date.now()) {
        this.remove(key)
        return defaultValue
      }
      
      return data.value
    } catch (error) {
      console.error('Storage get error:', error)
      return defaultValue
    }
  }

  /**
   * 移除存储项
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(this.getKey(key))
    } catch (error) {
      console.error('Storage remove error:', error)
    }
  }

  /**
   * 清空所有存储项
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Storage clear error:', error)
    }
  }

  /**
   * 检查存储项是否存在
   */
  has(key: string): boolean {
    return localStorage.getItem(this.getKey(key)) !== null
  }

  /**
   * 获取所有存储项的键
   */
  keys(): string[] {
    const keys: string[] = []
    const prefixLength = this.prefix.length
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        keys.push(key.substring(prefixLength))
      }
    })
    
    return keys
  }
}

// 创建默认实例
export const storage = new Storage(prefix)

// 创建会话存储实例
class SessionStorage extends Storage {
  set<T = any>(key: string, value: T, ttl?: number): void {
    const data: StorageData<T> = {
      value,
      timestamp: Date.now(),
      expire: ttl ? Date.now() + ttl : undefined
    }
    
    try {
      sessionStorage.setItem(this.getKey(key), JSON.stringify(data))
    } catch (error) {
      console.error('SessionStorage set error:', error)
    }
  }

  get<T = any>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = sessionStorage.getItem(this.getKey(key))
      
      if (!item) {
        return defaultValue
      }
      
      const data: StorageData<T> = JSON.parse(item)
      
      if (data.expire && data.expire < Date.now()) {
        this.remove(key)
        return defaultValue
      }
      
      return data.value
    } catch (error) {
      console.error('SessionStorage get error:', error)
      return defaultValue
    }
  }

  remove(key: string): void {
    try {
      sessionStorage.removeItem(this.getKey(key))
    } catch (error) {
      console.error('SessionStorage remove error:', error)
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(sessionStorage)
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('SessionStorage clear error:', error)
    }
  }

  has(key: string): boolean {
    return sessionStorage.getItem(this.getKey(key)) !== null
  }

  keys(): string[] {
    const keys: string[] = []
    const prefixLength = this.prefix.length
    
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        keys.push(key.substring(prefixLength))
      }
    })
    
    return keys
  }
  
  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }
}

export const sessionStorage = new SessionStorage(prefix)