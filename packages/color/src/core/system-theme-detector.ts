/**
 * 系统主题检测器
 * 支持 prefers-color-scheme 媒体查询和自动切换功能
 */

import type { ColorMode, SystemThemeDetector } from './types'

/**
 * 系统主题检测器选项
 */
export interface SystemThemeDetectorOptions {
  /** 默认主题模式 */
  defaultMode?: ColorMode
  /** 是否启用自动检测 */
  autoDetect?: boolean
  /** 检测变化时的回调 */
  onChange?: (mode: ColorMode) => void
}

/**
 * 默认选项
 */
const DEFAULT_OPTIONS: Required<SystemThemeDetectorOptions> = {
  defaultMode: 'light',
  autoDetect: true,
  onChange: () => {},
}

/**
 * 浏览器系统主题检测器实现
 */
export class BrowserSystemThemeDetector implements SystemThemeDetector {
  private options: Required<SystemThemeDetectorOptions>
  private mediaQuery: MediaQueryList | null = null
  private listeners: Set<(mode: ColorMode) => void> = new Set()
  private currentMode: ColorMode

  constructor(options?: SystemThemeDetectorOptions) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
    this.currentMode = this.options.defaultMode

    if (this.isSupported() && this.options.autoDetect) {
      this.init()
    }
  }

  /**
   * 获取系统主题
   */
  getSystemTheme(): ColorMode {
    if (!this.isSupported()) {
      return this.options.defaultMode
    }

    if (!this.mediaQuery) {
      this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    }

    return this.mediaQuery.matches ? 'dark' : 'light'
  }

  /**
   * 监听系统主题变化
   */
  watchSystemTheme(callback: (mode: ColorMode) => void): () => void {
    this.listeners.add(callback)

    // 立即调用一次回调，传递当前主题
    callback(this.getSystemTheme())

    // 返回取消监听的函数
    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * 检查是否支持系统主题检测
   */
  isSupported(): boolean {
    return (
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    )
  }

  /**
   * 获取当前检测到的主题模式
   */
  getCurrentMode(): ColorMode {
    return this.currentMode
  }

  /**
   * 手动更新主题模式
   */
  updateMode(mode: ColorMode): void {
    if (mode !== this.currentMode) {
      this.currentMode = mode
      this.notifyListeners(mode)
    }
  }

  /**
   * 销毁检测器
   */
  destroy(): void {
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', this.handleMediaQueryChange)
      this.mediaQuery = null
    }
    this.listeners.clear()
  }

  /**
   * 初始化检测器
   */
  private init(): void {
    if (!this.isSupported()) {
      return
    }

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    this.currentMode = this.mediaQuery.matches ? 'dark' : 'light'

    // 监听媒体查询变化
    this.mediaQuery.addEventListener('change', this.handleMediaQueryChange)
  }

  /**
   * 处理媒体查询变化
   */
  private handleMediaQueryChange = (event: MediaQueryListEvent): void => {
    const newMode: ColorMode = event.matches ? 'dark' : 'light'

    if (newMode !== this.currentMode) {
      this.currentMode = newMode
      this.notifyListeners(newMode)
      this.options.onChange(newMode)
    }
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(mode: ColorMode): void {
    this.listeners.forEach((listener) => {
      try {
        listener(mode)
      }
      catch (error) {
        console.error('Error in system theme change listener:', error)
      }
    })
  }
}

/**
 * 手动系统主题检测器（用于测试或不支持媒体查询的环境）
 */
export class ManualSystemThemeDetector implements SystemThemeDetector {
  private currentMode: ColorMode
  private listeners: Set<(mode: ColorMode) => void> = new Set()

  constructor(initialMode: ColorMode = 'light') {
    this.currentMode = initialMode
  }

  getSystemTheme(): ColorMode {
    return this.currentMode
  }

  watchSystemTheme(callback: (mode: ColorMode) => void): () => void {
    this.listeners.add(callback)

    // 立即调用一次回调
    callback(this.currentMode)

    return () => {
      this.listeners.delete(callback)
    }
  }

  /**
   * 手动设置系统主题
   */
  setSystemTheme(mode: ColorMode): void {
    if (mode !== this.currentMode) {
      this.currentMode = mode
      this.notifyListeners(mode)
    }
  }

  /**
   * 获取当前主题模式
   */
  getCurrentMode(): ColorMode {
    return this.currentMode
  }

  /**
   * 销毁检测器
   */
  destroy(): void {
    this.listeners.clear()
  }

  /**
   * 通知所有监听器
   */
  private notifyListeners(mode: ColorMode): void {
    this.listeners.forEach((listener) => {
      try {
        listener(mode)
      }
      catch (error) {
        console.error('Error in manual theme change listener:', error)
      }
    })
  }
}

/**
 * 创建系统主题检测器
 */
export function createSystemThemeDetector(
  type: 'browser' | 'manual' = 'browser',
  options?: SystemThemeDetectorOptions,
): SystemThemeDetector {
  switch (type) {
    case 'browser':
      return new BrowserSystemThemeDetector(options)
    case 'manual':
      return new ManualSystemThemeDetector(options?.defaultMode)
    default:
      return new BrowserSystemThemeDetector(options)
  }
}

/**
 * 默认浏览器系统主题检测器实例
 */
export const browserDetector = new BrowserSystemThemeDetector()

/**
 * 便捷函数：获取系统主题
 */
export function getSystemTheme(): ColorMode {
  return browserDetector.getSystemTheme()
}

/**
 * 便捷函数：监听系统主题变化
 */
export function watchSystemTheme(
  callback: (mode: ColorMode) => void,
): () => void {
  return browserDetector.watchSystemTheme(callback)
}

/**
 * 便捷函数：检查是否支持系统主题检测
 */
export function isSystemThemeSupported(): boolean {
  return browserDetector.isSupported()
}

/**
 * 便捷函数：创建主题媒体查询监听器
 */
export function createThemeMediaQuery(): {
  matches: boolean
  addListener: (callback: (mode: ColorMode) => void) => () => void
  removeAllListeners: () => void
} {
  const listeners = new Set<(mode: ColorMode) => void>()
  let mediaQuery: MediaQueryList | null = null

  if (typeof window !== 'undefined' && window.matchMedia) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  }

  const handleChange = (event: MediaQueryListEvent) => {
    const mode: ColorMode = event.matches ? 'dark' : 'light'
    listeners.forEach((listener) => {
      try {
        listener(mode)
      }
      catch (error) {
        console.error('Error in theme media query listener:', error)
      }
    })
  }

  return {
    matches: mediaQuery?.matches || false,
    addListener: (callback: (mode: ColorMode) => void) => {
      listeners.add(callback)

      if (mediaQuery && listeners.size === 1) {
        mediaQuery.addEventListener('change', handleChange)
      }

      return () => {
        listeners.delete(callback)
        if (mediaQuery && listeners.size === 0) {
          mediaQuery.removeEventListener('change', handleChange)
        }
      }
    },
    removeAllListeners: () => {
      if (mediaQuery) {
        mediaQuery.removeEventListener('change', handleChange)
      }
      listeners.clear()
    },
  }
}
