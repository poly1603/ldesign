import type { App, Plugin, InjectionKey } from 'vue'
import { ref, computed } from 'vue'
import { SizeManager, type SizePreset } from '../core/SizeManager'
import { getLocale } from '../locales'
import type { SizeLocale } from '../locales'

export interface SizePluginOptions {
  storageKey?: string
  presets?: SizePreset[]
  locale?: string
  customLocale?: Partial<SizeLocale>
}

export const SIZE_MANAGER_KEY: InjectionKey<SizeManager> = Symbol.for('size-manager')
export const SIZE_LOCALE_KEY: InjectionKey<string> = Symbol('size-locale')
export const SIZE_CUSTOM_LOCALE_KEY: InjectionKey<Partial<SizeLocale>> = Symbol('size-custom-locale')

export const sizePlugin: Plugin = {
  install(app: App, options: SizePluginOptions = {}) {
    const manager = new SizeManager(options)
    
    // Reactive locale support - will be linked to global locale
    let currentLocale = ref(options.locale || 'zh-CN')
    const localeMessages = computed(() => getLocale(currentLocale.value))

    // Provide manager
    app.provide(SIZE_MANAGER_KEY, manager)
    
    // Use existing app-locale if available, otherwise provide our own
    const existingLocale = app._context?.provides?.['app-locale']
    if (existingLocale && typeof existingLocale.value !== 'undefined') {
      // Use the existing reactive locale - this ensures all components share the same ref
      currentLocale = existingLocale
      // Update the global setter to work with the shared ref
      app.config.globalProperties.$setSizeLocale = (locale: string) => {
        currentLocale.value = locale
      }
    } else {
      // Provide our locale if none exists
      app.provide('app-locale', currentLocale)
      app.config.globalProperties.$setSizeLocale = (locale: string) => {
        currentLocale.value = locale
      }
    }
    
    app.provide('size-locale', localeMessages)
    
    // Legacy support
    app.provide(SIZE_LOCALE_KEY, currentLocale.value)
    
    // Provide custom locale
    if (options.customLocale) {
      app.provide(SIZE_CUSTOM_LOCALE_KEY, options.customLocale)
    }

    // Add global property
    app.config.globalProperties.$sizeManager = manager
  }
}
