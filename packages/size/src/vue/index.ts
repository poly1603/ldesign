/**
 * @ldesign/size - Vue exports
 */

export { sizePlugin, SIZE_MANAGER_KEY, SIZE_LOCALE_KEY, SIZE_CUSTOM_LOCALE_KEY } from './plugin'
export type { SizePluginOptions } from './plugin'
export { useSize } from './useSize'
export { default as SizeSelector } from './SizeSelector.vue'
export { zhCN, enUS, getLocale } from '../locales'
export type { SizeLocale, LocaleKey } from '../locales'
