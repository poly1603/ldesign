/**
 * Locale Module - 多语言管理模块
 * 
 * 提供统一的多语言管理和同步能力
 */

export {
  LocaleManager,
  createLocaleManager,
  type LocaleAwarePlugin,
  type LocaleManagerOptions
} from './locale-manager'

export {
  createLocaleAwarePlugin,
  createSimpleLocaleAwarePlugin,
  type CreateLocaleAwarePluginOptions
} from './create-locale-aware-plugin'
