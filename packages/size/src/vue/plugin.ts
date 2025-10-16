import type { App, Plugin, InjectionKey } from 'vue'
import { SizeManager, type SizePreset } from '../core/SizeManager'
import type { SizeLocale } from '../locales'

export interface SizePluginOptions {
  storageKey?: string
  presets?: SizePreset[]
  locale?: string
  customLocale?: Partial<SizeLocale>
}

export const SIZE_MANAGER_KEY: InjectionKey<SizeManager> = Symbol('size-manager')
export const SIZE_LOCALE_KEY: InjectionKey<string> = Symbol('size-locale')
export const SIZE_CUSTOM_LOCALE_KEY: InjectionKey<Partial<SizeLocale>> = Symbol('size-custom-locale')

export const sizePlugin: Plugin = {
  install(app: App, options: SizePluginOptions = {}) {
    const manager = new SizeManager(options)

    // Provide manager
    app.provide(SIZE_MANAGER_KEY, manager)
    
    // Provide locale
    app.provide(SIZE_LOCALE_KEY, options.locale || 'zh-CN')
    
    // Provide custom locale
    if (options.customLocale) {
      app.provide(SIZE_CUSTOM_LOCALE_KEY, options.customLocale)
    }

    // Add global property
    app.config.globalProperties.$sizeManager = manager
  }
}
