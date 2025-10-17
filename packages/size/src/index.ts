/**
 * @ldesign/size - A powerful size management system for web applications
 */

// Core exports
export { 
  SizeManager, 
  sizeManager, 
  type SizeConfig, 
  type SizePreset, 
  type SizeChangeListener 
} from './core/SizeManager'

// Plugin exports
export { createSizePlugin, SizePluginSymbol } from './plugin'
export type { SizePlugin, SizePluginOptions } from './plugin'

// Engine plugin integration
export { createSizeEnginePlugin, useSizeFromEngine } from './plugin/engine'
export type { SizeEnginePluginOptions } from './plugin/engine'

// Locale exports
export { 
  zhCN, 
  enUS, 
  jaJP, 
  koKR, 
  deDE, 
  frFR, 
  esES, 
  itIT, 
  ptBR, 
  ruRU, 
  getLocale,
  locales
} from './locales'
export type { SizeLocale, LocaleKey } from './locales'

// Version
export const version = '1.0.0'
