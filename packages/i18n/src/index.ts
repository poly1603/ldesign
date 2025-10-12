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

// AI 翻译器
export {
  AITranslator,
  createAITranslator,
} from './core/ai-translator'
export type {
  AIConfig,
  AITranslatorOptions,
} from './core/ai-translator'

export {
  BatchManager,
  createBatchManager,
} from './core/batch-manager'
export type {
  BatchConfig,
} from './core/batch-manager'
// 内置翻译加载器
export { BuiltInLoader, createBuiltInLoader } from './core/built-in-loader'
export type { BuiltInLoaderOptions } from './core/built-in-loader'

export { CacheManager } from './core/cache-manager'
// 便捷创建函数
export {
  createGlobalI18n,
  createI18n,
  type CreateI18nOptions,
  createScopedI18n,
  destroyGlobalI18n,
  getGlobalI18n,
  hasGlobalI18n,
} from './core/createI18n'

export { createDetector } from './core/detector'
export { ErrorHandler } from './core/error-handler'

// 新增：扩展加载器功能
export {
  createExtensionLoader,
  ExtensionLoader,
  type ExtensionLoaderOptions,
  ExtensionStrategy,
  type TranslationExtension,
} from './core/extension-loader'
// 快速缓存键生成器
export {
  CacheKeyFactory,
  defaultCacheKeyGenerator,
  FastCacheKeyGenerator,
  generateCacheKey,
  generatePackageCacheKey,
  HashCacheKeyGenerator,
} from './core/fast-cache-key'

export type {
  CacheKeyConfig,
} from './core/fast-cache-key'

// 核心类和接口
export { I18n } from './core/i18n'

/**
 * 默认导出核心 I18n 类
 */
export { I18n as default } from './core/i18n'

// 新增：语言配置功能
export {
  createLanguageRegistry,
  type LanguageConfig,
  type LanguageFilter,
  type LanguageFilterConfig,
  LanguageRegistry,
  type SelectiveI18nOptions,
} from './core/language-config'

export {
  DefaultLoader,
  EnhancedLoader,
  HttpLoader,
  type LazyLoadConfig,
  type LoaderCacheConfig,
  type LoaderOptions,
  type LoaderStats,
  type LoadingState,
  type LoadPriority,
  type OnDemandConfig,
  StaticLoader,
} from './core/loader'

// ==================== 工具函数导出 ====================

export {
  createMemoryManager,
  MemoryManager,
} from './core/memory-manager'

export type {
  MemoryConfig,
  MemoryStats,
} from './core/memory-manager'

// 内存优化器
export {
  MemoryOptimizer,
  createMemoryOptimizer,
  getGlobalMemoryOptimizer,
} from './core/memory-optimizer'
export type {
  MemoryOptimizerConfig,
} from './core/memory-optimizer'

// 翻译合并工具
export {
  deepMerge,
  extractDifferences,
  flattenTranslations,
  getTranslationStats,
  mergeLanguagePackages,
  mergeMultiple,
  MergeStrategy,
  mergeTranslations,
  unflattenTranslations,
  validateCompleteness,
} from './core/merger'

export type { MergeOptions } from './core/merger'

// 命名空间支持
export {
  createNamespacedTranslator,
  type NamespaceConfig,
  type NamespaceExport,
  NamespaceManager,
  type NamespaceMetadata,
  type NamespaceStatistics,
  type NamespaceTree,
} from './core/namespace'

// 性能和内存管理
export {
  createEnhancedPerformanceManager,
  EnhancedPerformanceManager,
} from './core/performance-manager'

export type {
  PerformanceConfig,
} from './core/performance-manager'
export {
  createPreloadManager,
  PreloadManager,
} from './core/preload-manager'

export type {
  PreloadConfig,
} from './core/preload-manager'

// 插件系统
export {
  PluginManager,
  createPluginManager,
  getGlobalPluginManager,
  CachePlugin,
  PerformancePlugin,
  ValidationPlugin,
} from './core/plugin-system'
export type {
  I18nPlugin,
  PluginConfig,
  PluginMetadata,
  PluginHooks,
  PluginManagerOptions,
} from './core/plugin-system'
// 新增：选择性和可扩展 I18n 创建函数
export {
  type ConfigurableI18nOptions,
  createConfigurableI18n,
  createExtensibleI18n,
  createSelectiveI18n,
} from './core/selective-i18n'

export { createStorage } from './core/storage'

// 核心组件导出
export { TranslationEngine } from './core/translation-engine'
// 核心类型定义
export type {
  // 批量翻译
  BatchTranslationResult,
  CacheOptions,
  CacheStats,
  // 检测器相关
  Detector,
  // 事件相关
  I18nEventType,
  // 基础类型
  I18nInstance,

  I18nOptions,

  LanguageChangedEventArgs,
  LanguageInfo,

  LanguagePackage,

  LoadedEventArgs,
  // 加载器相关
  Loader,
  LoadErrorEventArgs,

  // 缓存相关
  LRUCache,
  // 嵌套对象
  NestedObject,
  OptimizationSuggestion,
  // 性能相关
  PerformanceMetrics,
  // 存储相关
  Storage,

  StorageType,
  TranslationMissingEventArgs,

  TranslationOptions,

  TranslationParams,
} from './core/types'

// 内置翻译
export {
  builtInTranslations,
  de,
  en,
  es,
  fr,
  getBuiltInLanguageInfos,
  getBuiltInLocales,
  getBuiltInTranslation,
  hasBuiltInTranslation,
  ja,
  ko,
  ru,
  zhCN,
} from './locales'
export type {
  BuiltInLanguagePackage,
  BuiltInTranslations,
  BusinessTranslations,
  CommonTranslations,
  DateTimeTranslations,
  ErrorTranslations,
  NotificationTranslations,
  UITranslations,
  ValidationTranslations,
} from './locales/types'

// 缓存操作工具
export {
  CacheOperations,
  createPackageCache,
  createTranslationCache,
} from './utils/cache-operations'
export type {
  CacheItem,
  CacheOperationConfig,
} from './utils/cache-operations'

// 通用工具
export {
  ArrayUtils,
  CacheKeyUtils,
  ErrorUtils,
  ObjectUtils,
  StringUtils,
  TimeUtils,
  TypeGuards,
} from './utils/common'
// 错误处理工具
export {
  createDefaultErrorHandler,
  ErrorHandlingStrategy,
  UnifiedErrorHandler,
  withAsyncErrorHandling,
  withErrorHandling,
} from './utils/error-handling'

export type {
  ErrorContext,
  ErrorHandlingResult,
  RetryConfig,
} from './utils/error-handling'
// 格式化工具
export {
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeTime,
} from './utils/formatters'
// 插值工具
export {
  escapeHtmlString as escapeHtml,
  hasInterpolation,
  interpolate,
  unescapeHtmlString as unescapeHtml,
} from './utils/interpolation'

// ==================== 新增功能导出 ====================

// 对象池工具
export {
  ArrayPool,
  buildString,
  GenericObjectPool,
  GlobalPoolManager,
  globalPools,
  ObjectLiteralPool,
  StringBuilderPool,
  withPooledArray,
  withPooledObject,
} from './utils/object-pool'

export type {
  ObjectPool,
} from './utils/object-pool'

// 路径工具
export {
  flattenObject,
  getNestedValue,
  hasNestedPath as hasNestedKey,
  setNestedValue,
  unflattenObject,
} from './utils/path'
// 性能优化工具
export {
  BatchProcessor,
  createOptimizedTranslator,
  debounce,
  LazyLoader,
  memoize,
  MemoryMonitor,
  OptimizedInterpolator,
  ResourcePreloader,
  throttle,
  VirtualScroller,
  WorkerTranslator,
} from './utils/performance-optimizations'

// 复数工具
export {
  createPluralRule,
  getPluralRule,
  hasPluralExpression,
  processPluralization,
} from './utils/pluralization'
// 验证工具
export {
  isValidLocale,
  validateLanguageCode,
  validateTranslationKey,
  validateTranslationParams,
} from './utils/validation'

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

// 验证工具增强
export {
  ValidationUtils,
} from './utils/validation'

// 统一工具库导出
export {
  UnifiedUtils,
  utils,
  // TimeUtils 已经从 './utils/common' 导出，避免重复
} from './utils'

export {
  installI18n,
} from './vue'

// Vue 组件导出
export {
  I18nD,
  I18nN,
  I18nT,
} from './vue/components'

export {
  vT,
  vTHtml,
  vTTitle,
} from './vue/directives'

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
  createI18nEnginePlugin,
} from './vue/engine-plugin'

// ==================== Engine 插件导出 ====================

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
  VueI18n,
} from './vue/plugin'

// ==================== 默认导出 ====================

export {
  createI18nPlugin,
  createVueI18n,
  I18nInjectionKey,
  useI18n,
} from './vue/plugin'
