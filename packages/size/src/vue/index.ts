/**
 * @ldesign/size - Vue exports
 */

export { enUS, getLocale, zhCN } from '../locales'
export type { LocaleKey, SizeLocale } from '../locales'
export { SIZE_CUSTOM_LOCALE_KEY, SIZE_LOCALE_KEY, SIZE_MANAGER_KEY, sizePlugin } from './plugin'
export type { SizePluginOptions } from './plugin'
export { default as SizeSelector } from './SizeSelector.vue'
export { useSize } from './useSize'
