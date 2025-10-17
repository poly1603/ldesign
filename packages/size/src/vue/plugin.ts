/**
 * @deprecated 请使用 '../plugin' 中的 createSizePlugin
 * This file is kept for backward compatibility only.
 * Please use createSizePlugin from '../plugin' instead.
 */
import type { App, Plugin } from 'vue'
import type { SizePluginOptions as NewSizePluginOptions } from '../plugin'
import { createSizePlugin } from '../plugin'

// Re-export with backward compatibility
export type SizePluginOptions = NewSizePluginOptions
export const SIZE_MANAGER_KEY = Symbol.for('size-manager')
export const SIZE_LOCALE_KEY = Symbol('size-locale')
export const SIZE_CUSTOM_LOCALE_KEY = Symbol('size-custom-locale')

export const sizePlugin: Plugin = {
  install(app: App, options: SizePluginOptions = {}) {
    // Use the new plugin system
    const plugin = createSizePlugin(options)
    plugin.install(app)
  }
}
