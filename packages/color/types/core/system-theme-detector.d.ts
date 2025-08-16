import { SystemThemeDetector, ColorMode } from './types.js'

/**
 * 系统主题检测器
 * 支持 prefers-color-scheme 媒体查询和自动切换功能
 */

/**
 * 系统主题检测器选项
 */
interface SystemThemeDetectorOptions {
  /** 默认主题模式 */
  defaultMode?: ColorMode
  /** 是否启用自动检测 */
  autoDetect?: boolean
  /** 检测变化时的回调 */
  onChange?: (mode: ColorMode) => void
}
/**
 * 浏览器系统主题检测器实现
 */
declare class BrowserSystemThemeDetector implements SystemThemeDetector {
  private options
  private mediaQuery
  private listeners
  private currentMode
  constructor(options?: SystemThemeDetectorOptions)
  /**
   * 获取系统主题
   */
  getSystemTheme(): ColorMode
  /**
   * 监听系统主题变化
   */
  watchSystemTheme(callback: (mode: ColorMode) => void): () => void
  /**
   * 检查是否支持系统主题检测
   */
  isSupported(): boolean
  /**
   * 获取当前检测到的主题模式
   */
  getCurrentMode(): ColorMode
  /**
   * 手动更新主题模式
   */
  updateMode(mode: ColorMode): void
  /**
   * 销毁检测器
   */
  destroy(): void
  /**
   * 初始化检测器
   */
  private init
  /**
   * 处理媒体查询变化
   */
  private handleMediaQueryChange
  /**
   * 通知所有监听器
   */
  private notifyListeners
}
/**
 * 手动系统主题检测器（用于测试或不支持媒体查询的环境）
 */
declare class ManualSystemThemeDetector implements SystemThemeDetector {
  private currentMode
  private listeners
  constructor(initialMode?: ColorMode)
  getSystemTheme(): ColorMode
  watchSystemTheme(callback: (mode: ColorMode) => void): () => void
  /**
   * 手动设置系统主题
   */
  setSystemTheme(mode: ColorMode): void
  /**
   * 获取当前主题模式
   */
  getCurrentMode(): ColorMode
  /**
   * 销毁检测器
   */
  destroy(): void
  /**
   * 通知所有监听器
   */
  private notifyListeners
}
/**
 * 创建系统主题检测器
 */
declare function createSystemThemeDetector(
  type?: 'browser' | 'manual',
  options?: SystemThemeDetectorOptions
): SystemThemeDetector
/**
 * 默认浏览器系统主题检测器实例
 */
declare const browserDetector: BrowserSystemThemeDetector
/**
 * 便捷函数：获取系统主题
 */
declare function getSystemTheme(): ColorMode
/**
 * 便捷函数：监听系统主题变化
 */
declare function watchSystemTheme(
  callback: (mode: ColorMode) => void
): () => void
/**
 * 便捷函数：检查是否支持系统主题检测
 */
declare function isSystemThemeSupported(): boolean
/**
 * 便捷函数：创建主题媒体查询监听器
 */
declare function createThemeMediaQuery(): {
  matches: boolean
  addListener: (callback: (mode: ColorMode) => void) => () => void
  removeAllListeners: () => void
}

export {
  BrowserSystemThemeDetector,
  ManualSystemThemeDetector,
  browserDetector,
  createSystemThemeDetector,
  createThemeMediaQuery,
  getSystemTheme,
  isSystemThemeSupported,
  watchSystemTheme,
}
export type { SystemThemeDetectorOptions }
