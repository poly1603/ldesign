/**
 * Vue 3 I18n 集成
 * 
 * 这个模块提供了与 Vue 3 的完整集成，包括：
 * - Vue 插件
 * - 组合式 API
 * - 指令支持
 * - TypeScript 类型定义
 */

// 导出插件相关
export {
  createI18n,
  createI18nWithOptions,
  createI18nPlugin,
  installI18n,
  getGlobalI18n,
  vueI18n
} from './plugin'

// 导出组合式 API
export {
  useI18n,
  useI18nWithInstance,
  useLocale,
  useAvailableLanguages,
  useLanguageSwitcher,
  useTranslation,
  useBatchTranslation,
  useConditionalTranslation,
  I18N_INJECTION_KEY
} from './composables'

// 导出类型定义
export type {
  VueI18nOptions,
  VueI18nPlugin,
  UseI18nReturn,
  I18nContext,
  I18nDirectiveOptions,
  I18nDirectiveBinding
} from './types'

// 重新导出核心类型，方便使用
export type {
  I18nInstance,
  I18nOptions,
  TranslationFunction,
  TranslationParams,
  TranslationOptions,
  LanguageInfo,
  LanguagePackage
} from '@/core/types'
