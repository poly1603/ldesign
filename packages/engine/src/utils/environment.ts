/**
 * 环境检测和兼容性工具
 * 提供跨平台API支持，避免直接使用Node.js特有API
 */

// 环境类型枚举
export enum EnvironmentType {
  BROWSER = 'browser',
  NODE = 'node',
  WEBWORKER = 'webworker',
  REACT_NATIVE = 'react-native',
  UNKNOWN = 'unknown'
}

// 环境检测结果接口
export interface EnvironmentInfo {
  type: EnvironmentType
  isServer: boolean
  isClient: boolean
  isMobile: boolean
  supportsLocalStorage: boolean
  supportsSessionStorage: boolean
  supportsWebWorkers: boolean
  supportsServiceWorkers: boolean
  userAgent?: string
  platform?: string
}

/**
 * 环境检测工具类
 */
export class Environment {
  private static _info: EnvironmentInfo | null = null

  /**
   * 获取当前环境信息
   */
  static getInfo(): EnvironmentInfo {
    if (!this._info) {
      this._info = this.detectEnvironment()
    }
    return this._info
  }

  /**
   * 检测当前运行环境
   */
  private static detectEnvironment(): EnvironmentInfo {
    const info: EnvironmentInfo = {
      type: EnvironmentType.UNKNOWN,
      isServer: false,
      isClient: false,
      isMobile: false,
      supportsLocalStorage: false,
      supportsSessionStorage: false,
      supportsWebWorkers: false,
      supportsServiceWorkers: false
    }

    // 检测浏览器环境
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      info.type = EnvironmentType.BROWSER
      info.isClient = true
      info.userAgent = navigator?.userAgent
      info.platform = navigator?.platform

      // 检测移动设备
      if (navigator?.userAgent) {
        info.isMobile = /Mobile|Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent)
      }

      // 检测存储支持
      try {
        info.supportsLocalStorage = typeof localStorage !== 'undefined'
        // 测试是否真正可用（某些隐私模式下会抛出异常）
        if (info.supportsLocalStorage) {
          localStorage.setItem('__test__', '1')
          localStorage.removeItem('__test__')
        }
      } catch {
        info.supportsLocalStorage = false
      }

      try {
        info.supportsSessionStorage = typeof sessionStorage !== 'undefined'
        if (info.supportsSessionStorage) {
          sessionStorage.setItem('__test__', '1')
          sessionStorage.removeItem('__test__')
        }
      } catch {
        info.supportsSessionStorage = false
      }

      // 检测Web Workers支持
      info.supportsWebWorkers = typeof Worker !== 'undefined'
      info.supportsServiceWorkers = 'serviceWorker' in navigator
    }
    // 检测Web Worker环境
    else if (typeof (globalThis as any).importScripts === 'function' && typeof postMessage === 'function') {
      info.type = EnvironmentType.WEBWORKER
      info.isClient = true
    }
    // 检测Node.js环境
    else if ((() => {
      try {
        const g = globalThis as any
        const processKey = 'process'
        return typeof g.global !== 'undefined' &&
               typeof g[processKey] !== 'undefined' &&
               g[processKey].versions?.node
      } catch {
        return false
      }
    })()) {
      info.type = EnvironmentType.NODE
      info.isServer = true
    }
    // 检测React Native环境
    else if (typeof navigator !== 'undefined' && navigator.product === 'ReactNative') {
      info.type = EnvironmentType.REACT_NATIVE
      info.isClient = true
      info.isMobile = true
    }

    return info
  }

  /**
   * 是否为浏览器环境
   */
  static isBrowser(): boolean {
    return this.getInfo().type === EnvironmentType.BROWSER
  }

  /**
   * 是否为Node.js环境
   */
  static isNode(): boolean {
    return this.getInfo().type === EnvironmentType.NODE
  }

  /**
   * 是否为Web Worker环境
   */
  static isWebWorker(): boolean {
    return this.getInfo().type === EnvironmentType.WEBWORKER
  }

  /**
   * 是否为服务端环境
   */
  static isServer(): boolean {
    return this.getInfo().isServer
  }

  /**
   * 是否为客户端环境
   */
  static isClient(): boolean {
    return this.getInfo().isClient
  }

  /**
   * 是否为移动设备
   */
  static isMobile(): boolean {
    return this.getInfo().isMobile
  }
}

/**
 * 跨平台API兼容层
 */
export class CrossPlatformAPI {
  /**
   * 获取环境变量（支持浏览器和Node.js）
   */
  static getEnvVar(key: string, defaultValue?: string): string | undefined {
    const env = Environment.getInfo()

    if (env.type === EnvironmentType.NODE) {
      // Node.js 环境
      try {
        const processKey = 'process'
        const processEnv = (globalThis as any)?.[processKey]?.env
        return processEnv?.[key] || defaultValue
      } catch {
        return defaultValue
      }
    } else if (env.type === EnvironmentType.BROWSER) {
      // 浏览器环境 - 从window对象或import.meta.env获取
      try {
        // Vite/Modern bundlers
        if (typeof import.meta !== 'undefined' && import.meta && (import.meta as any).env) {
          return ((import.meta as any).env as any)[key] || defaultValue
        }
        // Webpack DefinePlugin注入的环境变量
        try {
          const processKey = 'process'
          const processEnv = (globalThis as any)?.[processKey]?.env
          if (processEnv) {
            return processEnv[key] || defaultValue
          }
        } catch {
          // process 不可用
        }
        // 从window全局对象获取
        if (typeof window !== 'undefined' && (window as any).__ENV__) {
          return (window as any).__ENV__[key] || defaultValue
        }
      } catch {
        return defaultValue
      }
    }

    return defaultValue
  }

  /**
   * 获取当前时间戳（高精度）
   */
  static now(): number {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now()
    }
    return Date.now()
  }

  /**
   * 生成UUID（跨平台兼容）
   */
  static generateUUID(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }

    // 回退到传统方法
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  /**
   * 生成随机字节（替代Node.js的Buffer）
   */
  static randomBytes(length: number): Uint8Array {
    const bytes = new Uint8Array(length)

    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(bytes)
    } else {
      // 回退到Math.random（不安全，仅用于开发）
      for (let i = 0; i < length; i++) {
        bytes[i] = Math.floor(Math.random() * 256)
      }
    }

    return bytes
  }

  /**
   * 字符串编码（替代Buffer.from）
   */
  static encodeString(str: string, encoding: 'utf-8' | 'base64' = 'utf-8'): Uint8Array {
    if (encoding === 'base64') {
      const binaryString = atob(str)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      return bytes
    } else {
      // UTF-8编码
      return new TextEncoder().encode(str)
    }
  }

  /**
   * 字节解码（替代Buffer.toString）
   */
  static decodeBytes(bytes: Uint8Array, encoding: 'utf-8' | 'base64' = 'utf-8'): string {
    if (encoding === 'base64') {
      const binaryString = Array.from(bytes, byte => String.fromCharCode(byte)).join('')
      return btoa(binaryString)
    } else {
      // UTF-8解码
      return new TextDecoder().decode(bytes)
    }
  }

  /**
   * 获取内存使用信息（跨平台兼容）
   */
  static getMemoryInfo(): { used: number; total?: number; limit?: number } {
    const env = Environment.getInfo()

    if (env.type === EnvironmentType.BROWSER) {
      // 浏览器环境
      if (typeof performance !== 'undefined' && (performance as any).memory) {
        const memory = (performance as any).memory
        return {
          used: memory.usedJSHeapSize || 0,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        }
      }
    } else if (env.type === EnvironmentType.NODE) {
      // Node.js环境
      try {
        const processKey = 'process'
        const memoryUsage = (globalThis as any)?.[processKey]?.memoryUsage
        const usage = typeof memoryUsage === 'function' ? memoryUsage() : null
        if (usage) {
          return {
            used: usage.heapUsed,
            total: usage.heapTotal,
            limit: usage.external + usage.heapTotal
          }
        }
      } catch {
        // 忽略错误
      }
    }

    return { used: 0 }
  }

  /**
   * 安全的setTimeout（自动管理）
   */
  static setTimeout(callback: () => void, delay: number): string {
    const id = setTimeout(callback, delay)
    return String(id)
  }

  /**
   * 安全的setInterval（自动管理）
   */
  static setInterval(callback: () => void, delay: number): string {
    const id = setInterval(callback, delay)
    return String(id)
  }

  /**
   * 清除定时器
   */
  static clearTimeout(id: string): void {
    clearTimeout(Number(id))
  }

  /**
   * 清除间隔器
   */
  static clearInterval(id: string): void {
    clearInterval(Number(id))
  }

  /**
   * requestAnimationFrame支持
   */
  static requestAnimationFrame(callback: FrameRequestCallback): string {
    if (typeof requestAnimationFrame !== 'undefined') {
      return String(requestAnimationFrame(callback))
    }
    // 回退到setTimeout
    return this.setTimeout(() => callback(this.now()), 16) // ~60fps
  }

  /**
   * cancelAnimationFrame支持
   */
  static cancelAnimationFrame(id: string): void {
    if (typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(Number(id))
    } else {
      this.clearTimeout(id)
    }
  }

  /**
   * 获取用户代理字符串
   */
  static getUserAgent(): string {
    if (Environment.isBrowser() && typeof navigator !== 'undefined') {
      return navigator.userAgent || ''
    }
    return ''
  }

  /**
   * 获取当前URL（如果可用）
   */
  static getCurrentURL(): string {
    if (Environment.isBrowser() && typeof window !== 'undefined' && window.location) {
      return window.location.href
    }
    return ''
  }

  /**
   * 检查是否支持本地存储
   */
  static supportsLocalStorage(): boolean {
    return Environment.getInfo().supportsLocalStorage
  }

  /**
   * 安全的localStorage操作
   */
  static localStorage = {
    getItem(key: string): string | null {
      if (CrossPlatformAPI.supportsLocalStorage()) {
        try {
          return localStorage.getItem(key)
        } catch {
          return null
        }
      }
      return null
    },

    setItem(key: string, value: string): boolean {
      if (CrossPlatformAPI.supportsLocalStorage()) {
        try {
          localStorage.setItem(key, value)
          return true
        } catch {
          return false
        }
      }
      return false
    },

    removeItem(key: string): boolean {
      if (CrossPlatformAPI.supportsLocalStorage()) {
        try {
          localStorage.removeItem(key)
          return true
        } catch {
          return false
        }
      }
      return false
    },

    clear(): boolean {
      if (CrossPlatformAPI.supportsLocalStorage()) {
        try {
          localStorage.clear()
          return true
        } catch {
          return false
        }
      }
      return false
    }
  }
}

// 导出便捷函数
export const isServer = () => Environment.isServer()
export const isClient = () => Environment.isClient()
export const isBrowser = () => Environment.isBrowser()
export const isNode = () => Environment.isNode()
export const isMobile = () => Environment.isMobile()
export const getEnvVar = (key: string, defaultValue?: string) => CrossPlatformAPI.getEnvVar(key, defaultValue)
export const generateUUID = () => CrossPlatformAPI.generateUUID()
export const getMemoryInfo = () => CrossPlatformAPI.getMemoryInfo()
