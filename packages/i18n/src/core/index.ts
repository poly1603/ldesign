/**
 * 核心模块导出
 * 
 * 统一导出所有核心功能模块
 * 
 * @author LDesign Team
 * @version 3.0.0
 */

// 统一缓存系统
export {
  UnifiedCache,
  TranslationCache,
  createUnifiedCache,
  createTranslationCache,
  type CacheEntry,
  type CacheConfig,
  type CacheStatistics,
  type CacheEventType,
  type CacheEventListener,
} from './unified-cache'

// 统一性能监控系统
export {
  UnifiedPerformanceMonitor,
  globalPerformanceMonitor,
  performanceMonitor,
  type PerformanceMetrics,
  type PerformanceConfig,
} from './unified-performance'

// 高级功能
export {
  SmartPreloader,
  TranslationSynchronizer,
  TranslationValidator,
  TranslationDiffDetector,
  TranslationQualityAnalyzer,
  advancedFeatures,
} from './advanced-features'

// 开发者工具
export {
  I18nDevTools,
  I18nDashboard,
  globalDevTools,
  enableDevTools,
  createDashboard,
  type DevToolsConfig,
  type I18nDebugInfo,
} from './dev-tools'

// 类型生成器
export {
  TypeScriptGenerator,
  TypeGeneratorCLI,
  createTypeGenerator,
  type TypeGeneratorConfig,
  type TranslationPath,
  type TranslationValue,
} from './type-generator'

// 渐进式加载
export {
  ProgressiveLoader,
  LoadStatus,
  createProgressiveLoader,
  type ProgressiveLoaderConfig,
  type ResourceInfo,
} from './progressive-loader'

// Locale模板系统
export {
  createLocalePackage,
  LocaleTemplateGenerator,
  defaultValues as localeDefaults,
  type BaseTranslations,
  type CommonTranslations,
  type UITranslations,
  type ValidationTranslations,
  type ErrorTranslations,
  type NotificationTranslations,
  type DateTimeTranslations,
  type BusinessTranslations,
} from '../locales/base-template'

// 原有核心功能（保持向后兼容）
export * from './i18n'
export * from './types'
export * from './createI18n'
export * from './loader'
export * from './detector'
export * from './storage'
export * from './formatters'
export * from './pluralization'
export * from './namespace'
export * from './merger'
export * from './errors'
export * from './error-handler'
export * from './registry'
export * from './translation-engine'
export * from './language-config'
export * from './selective-i18n'
export * from './extension-loader'
export * from './built-in-loader'
export * from './batch-manager'
export * from './preload-manager'
export * from './fast-cache-key'

// 内存管理器（使用统一版本）
export { MemoryManager, createMemoryManager } from './memory-manager'

// 为了向后兼容，创建别名
import { TranslationCache as LegacyTranslationCache } from './cache'
import { PerformanceManager as LegacyPerformanceManager } from './performance'
import { EnhancedPerformanceManager as LegacyEnhancedPerformanceManager } from './performance-manager'
import { CacheManager as LegacyCacheManager } from './cache-manager'

/**
 * @deprecated 使用 TranslationCache from './unified-cache'
 */
export const PerformanceCache = LegacyTranslationCache

/**
 * @deprecated 使用 UnifiedPerformanceMonitor
 */
export const PerformanceManager = LegacyPerformanceManager

/**
 * @deprecated 使用 UnifiedPerformanceMonitor
 */
export const EnhancedPerformanceManager = LegacyEnhancedPerformanceManager

/**
 * @deprecated 使用 TranslationCache from './unified-cache'
 */
export const CacheManager = LegacyCacheManager

// AI翻译助手
export {
  AITranslator,
  MockAIProvider,
  createAITranslator,
  getGlobalAITranslator,
  setGlobalAITranslator,
  type AIProvider,
  type AITranslatorConfig,
  type TranslationSuggestion,
  type QualityReport,
  type QualityIssue,
  type OpenAIConfig,
  type GoogleTranslateConfig,
} from './ai-translator'

// 内存优化器
export {
  MemoryOptimizer,
  createMemoryOptimizer,
  getGlobalMemoryOptimizer,
  memoryOptimized,
  type MemoryUsage,
  type MemoryOptimizerConfig,
} from './memory-optimizer'

// 插件系统
export {
  PluginManager,
  PluginStatus,
  PerformancePlugin,
  CachePlugin,
  ValidationPlugin,
  createPluginManager,
  createPlugin,
  getGlobalPluginManager,
  type I18nPlugin,
  type PluginHooks,
  type PluginMetadata,
  type PluginLoadOptions,
} from './plugin-system'

// 实时协作
export {
  CollaborationManager,
  CollaborationEventType,
  ConflictResolution,
  ConnectionState,
  createCollaborationManager,
  type CollaborationUser,
  type CollaborationEvent,
  type TranslationChange,
  type CollaborationConfig,
} from './collaboration'
