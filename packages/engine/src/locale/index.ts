/**
 * Locale Module - 多语言管理模块
 * 
 * 提供统一的多语言管理和同步能力
 */

export {
  createLocaleAwarePlugin,
  type CreateLocaleAwarePluginOptions,
  createSimpleLocaleAwarePlugin
} from './create-locale-aware-plugin'

export {
  createLocaleManager,
  type LocaleAwarePlugin,
  LocaleManager,
  type LocaleManagerOptions
} from './locale-manager'
