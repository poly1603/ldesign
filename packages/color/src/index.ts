/**
 * @ldesign/color - 框架无关的主题色管理系统
 *
 * 这是一个功能完整的主题色管理库，提供：
 * - 框架无关的核心功能
 * - TypeScript 类型安全
 * - 高性能缓存和闲时处理
 * - 灵活的颜色生成算法
 * - 完整的主题预设和自定义支持
 * - 多框架适配器支持（Vue、React等）
 *
 * @version 0.1.0
 * @author ldesign
 */

import type { ThemeManagerInstance, ThemeManagerOptions } from './core/types'
// 导入核心类
import { ThemeManager } from './core/theme-manager'

// 导出存储实现
export {
  CookieStorage,
  createLRUCache,
  createStorage,
  defaultCache,
  defaultStorage,
  LocalStorage,
  LRUCacheImpl,
  MemoryStorage,
  NoStorage,
  SessionStorage,
} from './core/storage'

// 导出系统主题检测器
export {
  browserDetector,
  BrowserSystemThemeDetector,
  createSystemThemeDetector,
  createThemeMediaQuery,
  getSystemTheme,
  isSystemThemeSupported,
  ManualSystemThemeDetector,
  watchSystemTheme,
} from './core/system-theme-detector'

// 导出核心类和接口
export { ThemeManager } from './core/theme-manager'

// 导出核心类型定义
export type {
  CacheItem,
  CacheOptions,
  ColorCategory,
  ColorConfig,
  ColorGenerator,
  ColorMode,
  ColorScale,
  // 颜色相关
  ColorValue,
  CSSInjector,
  EventEmitter,
  GeneratedTheme,
  IdleProcessor,
  LRUCache,
  // 中性色相关
  NeutralColorCategory,
  NeutralColors,
  // 组件接口
  Storage,
  SystemThemeDetector,
  ThemeConfig,
  ThemeEventListener,
  // 事件相关
  ThemeEventType,
  // 主要接口
  ThemeManagerInstance,
  ThemeManagerOptions,
  ThemeType,
} from './core/types'

// 导出预设主题
export {
  createCustomTheme,
  cyanTheme,
  darkTheme,
  defaultTheme,
  getPresetTheme,
  getPresetThemeNames,
  getRandomPresetTheme,
  getThemesByCategory,
  getThemesByTag,
  greenTheme,
  isPresetTheme,
  minimalTheme,
  orangeTheme,
  pinkTheme,
  presetThemes,
  purpleTheme,
  recommendThemes,
  redTheme,
  themeCategories,
  themeTags,
  yellowTheme,
} from './themes/presets'

// 导出颜色转换工具
export {
  clamp,
  hexToHsl,
  hexToRgb,
  hslToHex,
  hslToRgb,
  isValidHex,
  normalizeHex,
  normalizeHue,
  rgbToHex,
  rgbToHsl,
} from './utils/color-converter'

export type { HSL, RGB } from './utils/color-converter'

// 导出颜色生成器
export {
  COLOR_GENERATION_PRESETS,
  ColorGeneratorImpl,
  createColorGenerator,
  createNeutralGrayGenerator,
  createTintedGrayGenerator,
  defaultColorGenerator,
  generateColorConfig,
  safeGenerateColorConfig,
} from './utils/color-generator'

// 导出色阶生成器
export {
  ColorScaleGenerator,
  colorScaleGenerator,
  generateColorScale,
  generateColorScales,
} from './utils/color-scale'

// 导出 CSS 注入器
export {
  createCSSInjector,
  createCSSVariableGenerator,
  CSSInjectorImpl,
  CSSVariableGenerator,
  defaultCSSInjector,
  defaultCSSVariableGenerator,
  injectScaleVariables,
  removeAllColorVariables,
} from './utils/css-injector'

export type { CSSInjectionOptions } from './utils/css-injector'

// 导出CSS变量工具
export {
  CSSVariableInjector,
  getCSSVariableValue,
  globalCSSInjector,
  injectThemeVariables,
  setCSSVariableValue,
  toggleThemeMode,
} from './utils/css-variables'

// 导出事件发射器
export { createEventEmitter, EventEmitterImpl } from './utils/event-emitter'

// 导出闲时处理器
export {
  addIdleTask,
  addIdleTasks,
  createConditionalIdleTask,
  createDelayedIdleTask,
  createIdleProcessor,
  defaultIdleProcessor,
  getDefaultProcessorStatus,
  IdleProcessorImpl,
  supportsIdleCallback,
} from './utils/idle-processor'

export type { IdleProcessorOptions } from './utils/idle-processor'

// 导出通知工具
export { useNotification } from './utils/notification'

export type { NotificationItem } from './utils/notification'

// 便捷的创建函数
export function createThemeManager(
  options?: ThemeManagerOptions
): ThemeManagerInstance {
  return new ThemeManager(options)
}

/**
 * 创建带有预设主题的主题管理器实例
 * @param options 主题管理器配置选项
 * @returns 主题管理器实例
 */
export async function createThemeManagerWithPresets(
  options?: ThemeManagerOptions
): Promise<ThemeManagerInstance> {
  const { presetThemes } = await import('./themes/presets')

  const manager = new ThemeManager({
    themes: presetThemes,
    ...options,
  })

  await manager.init()
  return manager
}

/**
 * 创建简单的主题管理器实例（仅默认主题）
 * @param options 主题管理器配置选项
 * @returns 主题管理器实例
 */
export async function createSimpleThemeManager(
  options?: ThemeManagerOptions
): Promise<ThemeManagerInstance> {
  const { defaultTheme } = await import('./themes/presets')

  const manager = new ThemeManager({
    themes: [defaultTheme],
    defaultTheme: 'default',
    ...options,
  })

  await manager.init()
  return manager
}

/**
 * 创建自定义主题管理器
 * @param primaryColor 主色调
 * @param options 主题管理器配置选项
 * @returns 主题管理器实例
 */
export async function createCustomThemeManager(
  primaryColor: string,
  options?: ThemeManagerOptions & {
    themeName?: string
    darkPrimaryColor?: string
  }
): Promise<ThemeManagerInstance> {
  const { createCustomTheme } = await import('./themes/presets')

  const customTheme = createCustomTheme(
    options?.themeName || 'custom',
    primaryColor,
    {
      darkPrimaryColor: options?.darkPrimaryColor,
    }
  )

  const manager = new ThemeManager({
    themes: [customTheme],
    defaultTheme: customTheme.name,
    ...options,
  })

  await manager.init()
  return manager
}

/**
 * 版本信息
 */
export const version = '0.1.0'

/**
 * 默认导出（主要的 ThemeManager 类）
 */
export default ThemeManager
