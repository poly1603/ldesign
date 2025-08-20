/**
 * @ldesign/i18n - 框架无关的多语言管理系统
 *
 * 这是一个功能完整的国际化库，提供：
 * - 框架无关的核心功能
 * - Vue 3 集成支持
 * - TypeScript 类型安全
 * - 高性能缓存
 * - 灵活的加载策略
 * - 完整的插值和复数支持
 *
 * @version 0.1.0
 * @author ldesign
 */

import type { I18nInstance, I18nOptions } from './core/types'
// 导入核心类
import { I18n } from './core/i18n'

// 导出检测器
export {
  BrowserDetector,
  browserDetector,
  createDetector,
  ManualDetector,
} from './core/detector'

// 导出错误处理系统
export {
  CacheError,
  ConfigurationError,
  DefaultErrorHandler,
  DevelopmentErrorHandler,
  ErrorManager,
  globalErrorManager,
  handleErrors,
  I18nError,
  InitializationError,
  InterpolationError,
  LanguageLoadError,
  PluralRuleError,
  SilentErrorHandler,
  TranslationKeyError,
} from './core/errors'

export type { ErrorHandler } from './core/errors'

// 导出核心类和接口
export { I18n } from './core/i18n'

// 导出加载器
export { DefaultLoader, HttpLoader, StaticLoader } from './core/loader'

// 导出性能管理器
export {
  globalPerformanceManager,
  PerformanceManager,
  performanceMonitor,
} from './core/performance'

export type { PerformanceConfig, PerformanceMetrics } from './core/performance'
// 导出管理器注册表
export {
  globalRegistry,
  I18nCoreManager,
  inject,
  ManagerRegistry,
  registerManager,
} from './core/registry'

export type { Manager, ManagerFactory } from './core/registry'
// 导出存储实现
export {
  CookieStorage,
  createStorage,
  LocalStorage,
  LRUCacheImpl,
  MemoryStorage,
  NoStorage,
  SessionStorage,
} from './core/storage'

// 导出核心类型定义
export type {
  BatchTranslationResult,
  CacheItem,
  CacheOptions,
  Detector,
  EventEmitter,
  I18nEventListener,
  // 事件相关
  I18nEventType,
  // 主要接口
  I18nInstance,
  I18nOptions,
  InterpolationOptions,
  LanguageInfo,
  LanguagePackage,
  // 组件接口
  Loader,
  LRUCache,

  // 工具类型
  NestedObject,
  PluralRule,
  PluralRules,
  Storage,

  // 翻译相关
  TranslationFunction,
  TranslationOptions,
  TranslationParams,
} from './core/types'
// 导出 Engine 插件
export * from './engine/plugin'

// 导出内置语言包
export { default as enLanguagePackage } from './locales/en'

export { default as jaLanguagePackage } from './locales/ja'

export { default as zhCNLanguagePackage } from './locales/zh-CN'
// 导出插件系统
export * from './plugins'
export {
  batchInterpolate,
  extractInterpolationKeys,
  hasInterpolation,
  // 插值工具
  interpolate,
  validateInterpolationParams,
} from './utils/interpolation'

// 导出工具函数
export {
  deepMerge,
  flattenObject,
  getAllPaths,
  // 路径工具
  getNestedValue,
  hasNestedPath,
  setNestedValue,
  unflattenObject,
} from './utils/path'

// 便捷的创建函数
export function createI18n(options?: I18nOptions): I18nInstance {
  return new I18n(options)
}

/**
 * 创建简单的 I18n 实例（仅英语）
 * @param options I18n 配置选项
 * @returns I18n 实例
 */
export async function createSimpleI18n(
  options?: I18nOptions,
): Promise<I18nInstance> {
  const { StaticLoader } = await import('./core/loader')
  const enPkg = await import('./locales/en')

  const loader = new StaticLoader()
  loader.registerPackage('en', enPkg.default)

  const i18n = new I18n({ defaultLocale: 'en', ...options })
  i18n.setLoader(loader)

  await i18n.init()
  return i18n
}

/**
 * 创建带有内置语言包的 I18n 实例
 * @param options I18n 配置选项
 * @returns I18n 实例
 */
export async function createI18nWithBuiltinLocales(
  options?: I18nOptions,
): Promise<I18nInstance> {
  const { StaticLoader } = await import('./core/loader')
  const enPkg = await import('./locales/en')
  const zhCNPkg = await import('./locales/zh-CN')
  const jaPkg = await import('./locales/ja')

  const loader = new StaticLoader()
  loader.registerPackage('en', enPkg.default)
  loader.registerPackage('zh-CN', zhCNPkg.default)
  loader.registerPackage('ja', jaPkg.default)

  const i18n = new I18n({ defaultLocale: 'zh-CN', ...options })
  i18n.setLoader(loader)

  await i18n.init()
  return i18n
}

/**
 * 版本信息
 */
export const version = '0.1.0'

export {
  extractPluralKeys,
  // 复数工具
  getPluralRule,
  getSupportedPluralLocales,
  hasPluralExpression,
  parsePluralExpression,
  processPluralization,
  registerPluralRule,
} from './utils/pluralization'

// 导出 Vue 集成（可选，需要单独导入）
export * as vue from './vue'

/**
 * 默认导出（主要的 I18n 类）
 */
export default I18n
