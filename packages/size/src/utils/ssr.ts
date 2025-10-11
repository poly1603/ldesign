/**
 * SSR (Server-Side Rendering) 工具函数
 * 提供服务端渲染支持和 hydration 优化
 */

import type { SizeMode } from '../types'

/**
 * 检查是否在服务端环境
 */
export function isServer(): boolean {
  return typeof window === 'undefined'
}

/**
 * 检查是否在客户端环境
 */
export function isClient(): boolean {
  return typeof window !== 'undefined'
}

/**
 * 检查是否在浏览器环境
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * 安全地访问 window 对象
 */
export function safeWindow<T>(callback: (window: Window) => T, fallback?: T): T | undefined {
  if (isClient()) {
    return callback(window)
  }
  return fallback
}

/**
 * 安全地访问 document 对象
 */
export function safeDocument<T>(callback: (document: Document) => T, fallback?: T): T | undefined {
  if (isBrowser()) {
    return callback(document)
  }
  return fallback
}

/**
 * SSR 安全的 localStorage 访问
 */
export const safeLocalStorage = {
  getItem(key: string): string | null {
    if (!isBrowser()) return null
    try {
      return localStorage.getItem(key)
    }
    catch (error) {
      console.warn('[SSR] localStorage.getItem failed:', error)
      return null
    }
  },

  setItem(key: string, value: string): void {
    if (!isBrowser()) return
    try {
      localStorage.setItem(key, value)
    }
    catch (error) {
      console.warn('[SSR] localStorage.setItem failed:', error)
    }
  },

  removeItem(key: string): void {
    if (!isBrowser()) return
    try {
      localStorage.removeItem(key)
    }
    catch (error) {
      console.warn('[SSR] localStorage.removeItem failed:', error)
    }
  },

  clear(): void {
    if (!isBrowser()) return
    try {
      localStorage.clear()
    }
    catch (error) {
      console.warn('[SSR] localStorage.clear failed:', error)
    }
  },
}

/**
 * SSR 安全的 sessionStorage 访问
 */
export const safeSessionStorage = {
  getItem(key: string): string | null {
    if (!isBrowser()) return null
    try {
      return sessionStorage.getItem(key)
    }
    catch (error) {
      console.warn('[SSR] sessionStorage.getItem failed:', error)
      return null
    }
  },

  setItem(key: string, value: string): void {
    if (!isBrowser()) return
    try {
      sessionStorage.setItem(key, value)
    }
    catch (error) {
      console.warn('[SSR] sessionStorage.setItem failed:', error)
    }
  },

  removeItem(key: string): void {
    if (!isBrowser()) return
    try {
      sessionStorage.removeItem(key)
    }
    catch (error) {
      console.warn('[SSR] sessionStorage.removeItem failed:', error)
    }
  },

  clear(): void {
    if (!isBrowser()) return
    try {
      sessionStorage.clear()
    }
    catch (error) {
      console.warn('[SSR] sessionStorage.clear failed:', error)
    }
  },
}

/**
 * SSR 配置
 */
export interface SSRConfig {
  /** 默认尺寸模式 */
  defaultMode?: SizeMode
  /** 是否自动注入 CSS */
  autoInject?: boolean
  /** 是否在客户端 hydration 时恢复状态 */
  restoreOnHydration?: boolean
  /** 自定义 CSS 生成函数 */
  generateCSS?: (mode: SizeMode) => string
}

/**
 * SSR 上下文
 */
export interface SSRContext {
  /** 当前尺寸模式 */
  mode: SizeMode
  /** 生成的 CSS 字符串 */
  css: string
  /** 是否已初始化 */
  initialized: boolean
}

/**
 * 创建 SSR 上下文
 */
export function createSSRContext(config: SSRConfig = {}): SSRContext {
  const mode = config.defaultMode || 'medium'
  const css = config.generateCSS ? config.generateCSS(mode) : ''

  return {
    mode,
    css,
    initialized: false,
  }
}

/**
 * SSR 安全的初始化函数
 */
export function ssrSafeInit(
  clientInit: () => void,
  serverInit?: () => void,
): void {
  if (isServer()) {
    serverInit?.()
  }
  else if (isBrowser()) {
    // 在客户端，等待 DOM 加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', clientInit)
    }
    else {
      clientInit()
    }
  }
}

/**
 * 生成 SSR 内联样式
 */
export function generateSSRInlineStyle(
  mode: SizeMode,
  variables: Record<string, string>,
  options: {
    selector?: string
    important?: boolean
  } = {},
): string {
  const { selector = ':root', important = false } = options
  const suffix = important ? ' !important' : ''

  const cssRules = Object.entries(variables)
    .map(([name, value]) => `  ${name}: ${value}${suffix};`)
    .join('\n')

  return `<style id="ldesign-size-ssr">${selector} {\n${cssRules}\n}</style>`
}

/**
 * 从服务端注入的样式中提取模式
 */
export function extractSSRMode(): SizeMode | null {
  if (!isBrowser()) return null

  const ssrStyle = document.getElementById('ldesign-size-ssr')
  if (!ssrStyle) return null

  // 尝试从 data 属性获取
  const modeAttr = ssrStyle.getAttribute('data-mode')
  if (modeAttr) {
    return modeAttr as SizeMode
  }

  return null
}

/**
 * 清理 SSR 注入的样式
 */
export function cleanupSSRStyles(): void {
  if (!isBrowser()) return

  const ssrStyle = document.getElementById('ldesign-size-ssr')
  if (ssrStyle) {
    ssrStyle.remove()
  }
}

/**
 * Hydration 辅助工具
 */
export const hydration = {
  /**
   * 检查是否正在进行 hydration
   */
  isHydrating(): boolean {
    if (!isBrowser()) return false
    // 检查是否有 SSR 标记
    return document.body.hasAttribute('data-ssr') || !!document.getElementById('ldesign-size-ssr')
  },

  /**
   * 标记 hydration 完成
   */
  markComplete(): void {
    if (!isBrowser()) return
    document.body.removeAttribute('data-ssr')
  },

  /**
   * 在 hydration 完成后执行回调
   */
  onComplete(callback: () => void): void {
    if (!isBrowser()) return

    if (!this.isHydrating()) {
      callback()
    }
    else {
      // 等待下一个 tick
      setTimeout(callback, 0)
    }
  },
}

/**
 * 创建 SSR 安全的状态管理
 */
export function createSSRSafeState<T>(
  initialValue: T,
  key?: string,
): {
    get: () => T
    set: (value: T) => void
    reset: () => void
  } {
  let state = initialValue

  // 尝试从服务端注入的数据恢复状态
  if (isBrowser() && key) {
    const ssrData = safeWindow((w) => (w as any).__SSR_DATA__)
    if (ssrData && key in ssrData) {
      state = ssrData[key]
    }
  }

  return {
    get: () => state,
    set: (value: T) => {
      state = value
    },
    reset: () => {
      state = initialValue
    },
  }
}

/**
 * 预加载资源（SSR 优化）
 */
export function preloadResources(urls: string[]): void {
  if (!isBrowser()) return

  urls.forEach((url) => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = url
    link.as = 'style'
    document.head.appendChild(link)
  })
}

/**
 * 获取服务端传递的初始状态
 */
export function getServerInitialState<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback

  try {
    const ssrData = safeWindow((w) => (w as any).__SSR_DATA__)
    if (ssrData && key in ssrData) {
      return ssrData[key] as T
    }
  }
  catch (error) {
    console.warn('[SSR] Failed to get server initial state:', error)
  }

  return fallback
}

/**
 * 设置服务端初始状态（在服务端使用）
 */
export function setServerInitialState(key: string, value: unknown): void {
  if (!isServer()) return

  // 在服务端，可以将状态存储到全局对象中
  // 具体实现取决于 SSR 框架
  ;(globalThis as any).__SSR_DATA__ = {
    ...(globalThis as any).__SSR_DATA__,
    [key]: value,
  }
}
