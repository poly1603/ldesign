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

// 导出组件 (暂时注释掉，等修复JSX问题后再启用)
// export { LanguageSwitcher } from './components'

// 导出组合式 API
export {
  I18N_INJECTION_KEY,
  useAvailableLanguages,
  useBatchTranslation,
  useConditionalTranslation,
  useI18n,
  useI18nWithInstance,
  useLanguageSwitcher,
  useLocale,
  useTranslation,
} from './composables'

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

// 导出类型定义
export type {
  I18nContext,
  I18nDirectiveBinding,
  I18nDirectiveOptions,
  UseI18nReturn,
  VueI18nOptions,
  VueI18nPlugin,
} from './types'
