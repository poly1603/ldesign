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

// 导入核心类
import { I18n } from './core/i18n'
import type { I18nOptions, I18nInstance } from './core/types'

// 导出核心类和接口
export { I18n } from './core/i18n'

// 导出核心类型定义
export type {
  // 主要接口
  I18nInstance,
  I18nOptions,
  LanguageInfo,
  LanguagePackage,
  
  // 翻译相关
  TranslationFunction,
  TranslationParams,
  TranslationOptions,
  BatchTranslationResult,
  
  // 组件接口
  Loader,
  Storage,
  Detector,
  LRUCache,
  CacheItem,
  CacheOptions,
  
  // 工具类型
  NestedObject,
  PluralRule,
  PluralRules,
  InterpolationOptions,
  
  // 事件相关
  I18nEventType,
  I18nEventListener,
  EventEmitter
} from './core/types'

// 导出加载器
export {
  DefaultLoader,
  StaticLoader,
  HttpLoader
} from './core/loader'

// 导出存储实现
export {
  LocalStorage,
  SessionStorage,
  MemoryStorage,
  NoStorage,
  CookieStorage,
  createStorage,
  LRUCacheImpl
} from './core/storage'

// 导出检测器
export {
  BrowserDetector,
  ManualDetector,
  browserDetector,
  createDetector
} from './core/detector'

// 导出工具函数
export {
  // 路径工具
  getNestedValue,
  setNestedValue,
  hasNestedPath,
  getAllPaths,
  deepMerge,
  flattenObject,
  unflattenObject
} from './utils/path'

export {
  // 插值工具
  interpolate,
  hasInterpolation,
  extractInterpolationKeys,
  validateInterpolationParams,
  batchInterpolate
} from './utils/interpolation'

export {
  // 复数工具
  getPluralRule,
  parsePluralExpression,
  hasPluralExpression,
  extractPluralKeys,
  registerPluralRule,
  getSupportedPluralLocales,
  processPluralization
} from './utils/pluralization'

// 导出内置语言包
export { default as enLanguagePackage } from './locales/en'
export { default as zhCNLanguagePackage } from './locales/zh-CN'
export { default as jaLanguagePackage } from './locales/ja'

// 便捷的创建函数
export function createI18n(options?: I18nOptions): I18nInstance {
  return new I18n(options)
}

/**
 * 创建带有内置语言包的 I18n 实例
 * @param options I18n 配置选项
 * @returns I18n 实例
 */
export async function createI18nWithBuiltinLocales(options?: I18nOptions): Promise<I18nInstance> {
  const { StaticLoader } = await import('./core/loader')
  const enPkg = await import('./locales/en')
  const zhCNPkg = await import('./locales/zh-CN')
  const jaPkg = await import('./locales/ja')
  
  const loader = new StaticLoader()
  loader.registerPackages({
    'en': enPkg.default,
    'zh-CN': zhCNPkg.default,
    'ja': jaPkg.default
  })
  
  const i18n = new I18n(options)
  i18n.setLoader(loader)
  
  await i18n.init()
  return i18n
}

/**
 * 创建简单的 I18n 实例（仅英语）
 * @param options I18n 配置选项
 * @returns I18n 实例
 */
export async function createSimpleI18n(options?: I18nOptions): Promise<I18nInstance> {
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
 * 版本信息
 */
export const version = '0.1.0'

/**
 * 默认导出（主要的 I18n 类）
 */
export default I18n
