import type { App, Plugin, InjectionKey } from 'vue'
import { SizeManager, type SizePreset } from '../core/SizeManagerSimple'

export interface SizePluginOptions {
  storageKey?: string
  presets?: SizePreset[]
}

export const SIZE_MANAGER_KEY: InjectionKey<SizeManager> = Symbol('size-manager')

export const sizePlugin: Plugin = {
  install(app: App, options: SizePluginOptions = {}) {
    const manager = new SizeManager(options)

    // Provide manager
    app.provide(SIZE_MANAGER_KEY, manager)

    // Add global property
    app.config.globalProperties.$sizeManager = manager
  }
}