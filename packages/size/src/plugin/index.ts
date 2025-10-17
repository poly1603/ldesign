/**
 * @ldesign/size - Plugin System
 * 
 * Size system plugin for Vue 3 applications
 */

import type { App, Ref, ComputedRef } from 'vue'
import { ref, computed } from 'vue'
import { SizeManager, type SizePreset, type SizeConfig } from '../core/SizeManager'
import { getLocale, type SizeLocale } from '../locales'

/**
 * Size plugin configuration options
 */
export interface SizePluginOptions {
  /**
   * 响应式的 locale 参数 (可选)
   * 如果提供，插件会自动监听并响应语言变化
   */
  locale?: Ref<string>
  
  /**
   * Initial size preset
   * @default 'medium'
   */
  defaultSize?: string

  /**
   * Available size presets
   */
  presets?: SizePreset[]

  /**
   * Storage key for persistence
   * @default 'ldesign-size'
   */
  storageKey?: string

  /**
   * Enable size persistence
   * @default true
   */
  persistence?: boolean

  /**
   * Custom storage adapter
   */
  storage?: {
    getItem: (key: string) => string | null | Promise<string | null>
    setItem: (key: string, value: string) => void | Promise<void>
    removeItem: (key: string) => void | Promise<void>
  }

  /**
   * Hooks
   */
  hooks?: {
    beforeChange?: (newSize: string, oldSize: string) => boolean | Promise<boolean>
    afterChange?: (newSize: string) => void | Promise<void>
    onError?: (error: Error) => void
  }

  /**
   * Default locale
   * @default 'zh-CN'
   */
  defaultLocale?: string
}

/**
 * Size plugin instance
 */
export interface SizePlugin {
  /**
   * Size manager instance
   */
  manager: SizeManager

  /**
   * Plugin options
   */
  options: Required<Omit<SizePluginOptions, 'storage' | 'hooks'>> & {
    storage?: SizePluginOptions['storage']
    hooks?: SizePluginOptions['hooks']
  }

  /**
   * Current locale (reactive)
   */
  currentLocale: Ref<string>

  /**
   * Current locale messages (computed)
   */
  localeMessages: ComputedRef<SizeLocale>

  /**
   * Current size (reactive)
   */
  currentSize: Ref<string>

  /**
   * Set size
   */
  setSize: (size: string) => Promise<void>

  /**
   * Get current size
   */
  getSize: () => string


  /**
   * Listen to size changes
   */
  onChange: (listener: (size: string) => void) => () => void

  /**
   * Install the plugin
   */
  install: (app: App) => void
}

/**
 * Symbol for plugin injection
 */
export const SizePluginSymbol = Symbol('SizePlugin')

/**
 * Create size plugin
 */
export function createSizePlugin(options: SizePluginOptions = {}): SizePlugin {
  // 响应式 locale 支持
  // 如果传入了 locale ref，直接使用（单向数据流）
  // 否则创建一个新的 ref
  const currentLocale = options.locale || ref(options.defaultLocale || 'zh-CN')
  const localeMessages = computed(() => getLocale(currentLocale.value))

  // Merge options with defaults
  const mergedOptions = {
    defaultSize: options.defaultSize || 'medium',
    presets: options.presets || [],
    storageKey: options.storageKey || 'ldesign-size',
    persistence: options.persistence !== false,
    storage: options.storage,
    hooks: options.hooks,
    defaultLocale: options.defaultLocale || 'zh-CN'
  }

  // Create size manager
  const manager = new SizeManager({ presets: mergedOptions.presets })

  // Reactive current size
  const currentSize = ref(mergedOptions.defaultSize)

  // Storage wrapper
  const storage = {
    async getItem(key: string): Promise<string | null> {
      try {
        if (mergedOptions.storage) {
          return await mergedOptions.storage.getItem(key)
        }

        if (typeof window === 'undefined') return null
        return localStorage.getItem(key)
      } catch (error) {
        mergedOptions.hooks?.onError?.(error as Error)
        return null
      }
    },

    async setItem(key: string, value: string): Promise<void> {
      try {
        if (mergedOptions.storage) {
          await mergedOptions.storage.setItem(key, value)
          return
        }

        if (typeof window === 'undefined') return
        localStorage.setItem(key, value)
      } catch (error) {
        mergedOptions.hooks?.onError?.(error as Error)
      }
    },

    async removeItem(key: string): Promise<void> {
      try {
        if (mergedOptions.storage) {
          await mergedOptions.storage.removeItem(key)
          return
        }

        if (typeof window === 'undefined') return
        localStorage.removeItem(key)
      } catch (error) {
        mergedOptions.hooks?.onError?.(error as Error)
      }
    }
  }

  // Set size with hooks and persistence
  const setSize = async (size: string): Promise<void> => {
    const oldSize = manager.getCurrentSize()

    try {
      // beforeChange hook
      if (mergedOptions.hooks?.beforeChange) {
        const shouldContinue = await mergedOptions.hooks.beforeChange(size, oldSize)
        if (shouldContinue === false) {
          throw new Error('Size change cancelled by beforeChange hook')
        }
      }

      // Apply size
      manager.setSize(size)
      currentSize.value = size

      // Save to storage if persistence is enabled
      if (mergedOptions.persistence) {
        await storage.setItem(mergedOptions.storageKey, size)
      }

      // afterChange hook
      await mergedOptions.hooks?.afterChange?.(size)
    } catch (error) {
      mergedOptions.hooks?.onError?.(error as Error)
      throw error
    }
  }

  // Get current size
  const getSize = () => manager.getCurrentSize()

  // Load size from storage
  const loadSize = async (): Promise<void> => {
    try {
      const stored = await storage.getItem(mergedOptions.storageKey)
      if (stored && manager.getSizes().includes(stored)) {
        await setSize(stored)
      } else if (mergedOptions.defaultSize) {
        await setSize(mergedOptions.defaultSize)
      }
    } catch (error) {
      mergedOptions.hooks?.onError?.(error as Error)
    }
  }

  // Listen to size changes
  const listeners = new Set<(size: string) => void>()
  
  manager.onChange((size) => {
    currentSize.value = size
    listeners.forEach(listener => listener(size))
  })

  const onChange = (listener: (size: string) => void): (() => void) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  // Create plugin instance
  const plugin: SizePlugin = {
    manager,
    options: mergedOptions,
    currentLocale,
    localeMessages,
    currentSize,
    setSize,
    getSize,
    onChange,

    install(app: App) {
      // Provide plugin instance
      app.provide(SizePluginSymbol, plugin)
      
      // 同时提供 Vue 插件所需的 SIZE_MANAGER_KEY，让 useSize 能正常工作
      const SIZE_MANAGER_KEY = Symbol.for('size-manager')
      app.provide(SIZE_MANAGER_KEY, manager)

      // 如果没有传入 locale，尝试使用应用级的 locale
      if (!options.locale) {
        const existingLocale = app._context?.provides?.['app-locale']
        if (existingLocale && typeof existingLocale.value !== 'undefined') {
          plugin.currentLocale = existingLocale
        }
      }

      // Provide size locale
      app.provide('size-locale', localeMessages)

      // Add global property
      app.config.globalProperties.$size = plugin
      app.config.globalProperties.$sizeManager = manager

      // Load size on initialization
      if (typeof window !== 'undefined') {
        setTimeout(() => {
          loadSize()
        }, 0)
      }
    }
  }

  return plugin
}

/**
 * Default export
 */
export default createSizePlugin