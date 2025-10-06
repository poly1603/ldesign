/**
 * @ldesign/i18n - 通用多语言国际化库
 *
 * 一个现代化的、类型安全的国际化解决方案
 * 专注于核心多语言功能
 *
 * @author LDesign Team
 * @version 2.0.0
 */

// ==================== 核心功能导出 ====================

// 核心类和接口
export { I18n } from './core/i18n'
export {
  DefaultLoader,
  StaticLoader,
  HttpLoader,
  EnhancedLoader,
  type LoaderOptions,
  type LoaderStats,
  type LoadingState,
  type LoadPriority,
  type LazyLoadConfig,
  type OnDemandConfig,
  type LoaderCacheConfig,
} from './core/loader'
export { createDetector } from './core/detector'
export { createStorage } from './core/storage'

// 内置翻译加载器
export { BuiltInLoader, createBuiltInLoader } from './core/built-in-loader'
export type { BuiltInLoaderOptions } from './core/built-in-loader'

// 翻译合并工具
export {
  deepMerge,
  mergeTranslations,
  mergeLanguagePackages,
  MergeStrategy,
  flattenTranslations,
  unflattenTranslations,
  validateCompleteness,
  getTranslationStats,
  extractDifferences,
  mergeMultiple
} from './core/merger'
export type { MergeOptions } from './core/merger'

// 内置翻译
export {
  builtInTranslations,
  getBuiltInTranslation,
  hasBuiltInTranslation,
  getBuiltInLocales,
  getBuiltInLanguageInfos,
  zhCN,
  en,
  ja,
  ko,
  es,
  fr,
  de,
  ru
} from './locales'
export type {
  BuiltInTranslations,
  BuiltInLanguagePackage,
  CommonTranslations,
  ValidationTranslations,
  DateTimeTranslations,
  ErrorTranslations,
  NotificationTranslations,
  UITranslations,
  BusinessTranslations
} from './locales/types'

// 核心类型定义
export type {
  // 基础类型
  I18nInstance,
  I18nOptions,
  LanguageInfo,
  LanguagePackage,
  TranslationParams,
  TranslationOptions,

  // 加载器相关
  Loader,

  // 存储相关
  Storage,
  StorageType,

  // 检测器相关
  Detector,

  // 缓存相关
  LRUCache,
  CacheStats,

  // 事件相关
  I18nEventType,
  LanguageChangedEventArgs,
  LoadedEventArgs,
  LoadErrorEventArgs,
  TranslationMissingEventArgs,

  // 性能相关
  PerformanceMetrics,
  OptimizationSuggestion,

  // 批量翻译
  BatchTranslationResult,

  // 嵌套对象
  NestedObject,
} from './core/types'

// 便捷创建函数
export {
  createI18n,
  createGlobalI18n,
  getGlobalI18n,
  hasGlobalI18n,
  destroyGlobalI18n,
  createScopedI18n,
  type CreateI18nOptions
} from './core/createI18n'

// 新增：选择性和可扩展 I18n 创建函数
export {
  createSelectiveI18n,
  createExtensibleI18n,
  createConfigurableI18n,
  type ConfigurableI18nOptions
} from './core/selective-i18n'

// 新增：语言配置功能
export {
  LanguageRegistry,
  createLanguageRegistry,
  type LanguageConfig,
  type LanguageFilter,
  type LanguageFilterConfig,
  type SelectiveI18nOptions
} from './core/language-config'

// 新增：扩展加载器功能
export {
  ExtensionLoader,
  createExtensionLoader,
  ExtensionStrategy,
  type TranslationExtension,
  type ExtensionLoaderOptions
} from './core/extension-loader'

// ==================== 工具函数导出 ====================

// 插值工具
export {
  interpolate,
  hasInterpolation,
  // escapeHtml, // 暂时注释，函数不存在
  // unescapeHtml, // 暂时注释，函数不存在
} from './utils/interpolation'

// 路径工具
export {
  getNestedValue,
  setNestedValue,
  // hasNestedKey, // 暂时注释，函数不存在
  flattenObject,
  unflattenObject,
} from './utils/path'

// 复数工具
export {
  processPluralization,
  hasPluralExpression,
  getPluralRule,
  // createPluralRule, // 暂时注释，函数不存在
} from './utils/pluralization'

// 验证工具
export {
  validateLanguageCode,
  validateTranslationKey,
  validateTranslationParams,
  isValidLocale,
} from './utils/validation'

// 格式化工具
export {
  formatNumber,
  formatDate,
  formatCurrency,
  formatRelativeTime,
} from './utils/formatters'

// 通用工具
export {
  TypeGuards,
  ArrayUtils,
  ObjectUtils,
  StringUtils,
  TimeUtils,
  ErrorUtils,
  CacheKeyUtils
} from './utils/common'

// 缓存操作工具
export {
  CacheOperations,
  createTranslationCache,
  createPackageCache
} from './utils/cache-operations'
export type {
  CacheItem,
  CacheOperationConfig,
  CacheStats
} from './utils/cache-operations'

// 错误处理工具
export {
  UnifiedErrorHandler,
  ErrorHandlingStrategy,
  withErrorHandling,
  withAsyncErrorHandling,
  createDefaultErrorHandler
} from './utils/error-handling'
export type {
  ErrorContext,
  ErrorHandlingResult,
  RetryConfig
} from './utils/error-handling'

// 验证工具增强
export {
  ValidationUtils
} from './utils/validation'

// 性能和内存管理
export {
  EnhancedPerformanceManager,
  createEnhancedPerformanceManager
} from './core/performance-manager'
export type {
  PerformanceMetrics,
  PerformanceConfig
} from './core/performance-manager'

export {
  MemoryManager,
  createMemoryManager
} from './core/memory-manager'
export type {
  MemoryStats,
  MemoryConfig
} from './core/memory-manager'

export {
  PreloadManager,
  createPreloadManager
} from './core/preload-manager'
export type {
  PreloadConfig
} from './core/preload-manager'

export {
  BatchManager,
  createBatchManager
} from './core/batch-manager'
export type {
  BatchConfig
} from './core/batch-manager'

// 核心组件导出
export { TranslationEngine } from './core/translation-engine'
export { CacheManager } from './core/cache-manager'
export { ErrorHandler } from './core/error-handler'

// ==================== 新增功能导出 ====================

// 命名空间支持
export {
  NamespaceManager,
  createNamespacedTranslator,
  type NamespaceConfig,
  type NamespaceMetadata,
  type NamespaceTree,
  type NamespaceStatistics,
  type NamespaceExport
} from './core/namespace'

// 性能优化工具
export {
  memoize,
  debounce,
  throttle,
  BatchProcessor,
  LazyLoader,
  OptimizedInterpolator,
  VirtualScroller,
  ResourcePreloader,
  MemoryMonitor,
  WorkerTranslator,
  createOptimizedTranslator
} from './utils/performance-optimizations'

// 对象池工具
export {
  ObjectPool,
  GenericObjectPool,
  ArrayPool,
  ObjectLiteralPool,
  StringBuilderPool,
  GlobalPoolManager,
  globalPools,
  withPooledArray,
  withPooledObject,
  buildString
} from './utils/object-pool'

// 快速缓存键生成器
export {
  FastCacheKeyGenerator,
  HashCacheKeyGenerator,
  CacheKeyFactory,
  defaultCacheKeyGenerator,
  generateCacheKey,
  generatePackageCacheKey
} from './core/fast-cache-key'
export type {
  CacheKeyConfig
} from './core/fast-cache-key'

// ==================== 便捷创建函数 ====================
// 注意：createI18n 已经从 './core/createI18n' 导出，这里不需要重复定义

// ==================== 默认导出 ====================
// 注意：默认导出在文件末尾统一处理

// ==================== 版本信息 ====================

/**
 * 库版本信息
 */
export const VERSION = '2.0.0'

/**
 * 库名称
 */
export const LIBRARY_NAME = '@ldesign/i18n'

/**
 * 构建信息
 */
export const BUILD_INFO = {
  version: VERSION,
  name: LIBRARY_NAME,
  buildDate: new Date().toISOString(),
  features: [
    'Framework Agnostic Core',
    'TypeScript Support',
    'Async Loading',
    'Caching System',
    'Pluralization Support',
    'Interpolation',
    'Language Detection',
    'Vue 3 Integration',
  ],
} as const

// ==================== Vue 集成导出 ====================

/**
 * Vue 3 集成支持
 *
 * @example
 * ```typescript
 * // 在 Vue 项目中使用
 * import { createApp } from 'vue'
 * import { createI18nPlugin } from '@ldesign/i18n/vue'
 *
 * const app = createApp(App)
 * app.use(createI18nPlugin({
 *   locale: 'zh-CN',
 *   messages: { ... }
 * }))
 * ```
 */
export type {
  VueI18n
} from './vue/plugin'

export {
  createVueI18n,
  createI18nPlugin,
  useI18n,
  I18nInjectionKey
} from './vue/plugin'

// Vue 组件导出
export {
  I18nT,
  I18nN,
  I18nD
} from './vue/components'

export {
  vT,
  vTHtml,
  vTTitle
} from './vue/directives'

export {
  installI18n
} from './vue'

// ==================== Engine 插件导出 ====================

/**
 * Engine 插件支持
 *
 * @example
 * ```typescript
 * // 在 Engine 项目中使用
 * import { createI18nEnginePlugin } from '@ldesign/i18n'
 *
 * const i18nPlugin = createI18nEnginePlugin({
 *   locale: 'zh-CN',
 *   messages: { ... }
 * })
 *
 * await engine.use(i18nPlugin)
 * ```
 */
export {
  createI18nEnginePlugin
} from './vue/engine-plugin'


// ==================== 默认导出 ====================

/**
 * 默认导出核心 I18n 类
 */
export { I18n as default } from './core/i18n'
