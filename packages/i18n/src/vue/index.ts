/**
 * Vue 3 I18n 集成
 *
 * 这个模块提供了与 Vue 3 的完整集成，包括：
 * - Vue 插件
 * - 组合式 API
 * - 指令支持
 * - TypeScript 类型定义
 */

// 重新导出核心类型，方便使用
export type {
  I18nInstance,
  I18nOptions,
  LanguageInfo,
  LanguagePackage,
  TranslationFunction,
  TranslationOptions,
  TranslationParams,
} from '../core/types'

// 重新导出插件
export {
  cachePlugin,
  performancePlugin,
} from '../plugins'

// 导出组件
export {
  LanguageSwitcher,
  TranslationProvider,
  TranslationText,
  TranslationForm,
  LanguageButton,
  LanguageDetector,
} from './components'

// 导出组合式 API
export {
  I18N_INJECTION_KEY,
  // 新增的增强 API
  useAsyncTranslation,
  useAvailableLanguages,
  useBatchReactiveTranslation,
  useBatchTranslation,
  useComputedTranslation,
  useConditionalTranslation,
  // 响应式系统增强 API
  useDeepReactiveTranslation,
  useEnhancedLocale,
  useFormattedTranslation,
  useI18n,
  useI18nDebugger,
  useI18nDevTools,
  // 性能监控和调试 API
  useI18nPerformanceMonitor,
  useI18nWithInstance,
  useLanguageSwitcher,
  useLocale,
  useReactiveTranslation,
  useTranslation,
  useTranslationCache,
  useTranslationCacheManager,
  useTranslationDebug,
  useTranslationFormValidation,
  useTranslationHistory,
  useTranslationPerformance,
  useTranslationTheme,
  useTranslationValidation,
} from './composables'

export {
  createDebugger,
  DebugLevel,
  I18nDebugger,
} from './debug'

export type {
  DebuggerConfig,
  DebuggerOptions,
  DebugMessage,
  TranslationCoverage,
} from './debug'

// 导出指令
export {
  createModifiableVTDirective,
  createVTDirective,
  vT,
  vTAttr,
  vTHtml,
  vTPlural,
} from './directives'

// 导出指令类型
export type {
  DirectiveModifiers,
  VTDirectiveValue,
} from './directives'

// 导出性能监控和调试系统
export {
  createPerformanceMonitor,
  I18nPerformanceMonitor,
} from './performance'

// 导出性能监控和调试类型
export type {
  DebugInfo,
  PerformanceMetrics,
  PerformanceMonitorOptions,
} from './performance'

// 导出插件相关
export {
  createI18n,
  createI18nPlugin,
  createI18nWithOptions,
  getGlobalI18n,
  installI18n,
  installI18nPlugin,
  vueI18n,
} from './plugin'

// 导出插件管理器
export {
  createVueI18nPluginManager,
  VueI18nPluginManagerImpl,
} from '../plugins/vue/plugin-manager'

// 导出内置插件
export {
  createDebugPlugin,
  debugPlugin,
  devDebugPlugin,
  prodDebugPlugin,
} from '../plugins/vue'

// 导出响应式系统
export {
  createReactiveTranslationManager,
  ReactiveTranslationManager,
} from './reactivity'

// 导出响应式系统类型
export type {
  BatchTranslationOptions,
  ReactiveTranslationOptions,
} from './reactivity'

// 导出SSR支持
export {
  createSSRManager,
  createSSRPlugin,
  hydrateI18n,
  LocaleDetector,
  SEOOptimizer,
  SSRManager,
} from './ssr'

// 导出SSR类型
export type {
  SSRConfig,
  SSRContext,
} from './ssr'

// 导出类型定义
export type {
  I18nContext,
  I18nDirectiveBinding,
  I18nDirectiveOptions,
  UseI18nReturn,
  VueI18nOptions,
  VueI18nPlugin,
  VueI18nPluginInterface,
  VueI18nPluginContext,
  VueI18nPluginManager,
} from './types'
