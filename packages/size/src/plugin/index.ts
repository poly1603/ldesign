/**
 * @ldesign/size - Plugin System
 * 
 * Size system plugin for Vue 3 applications
 */

import type { App, ComputedRef, Ref } from 'vue'
import { inject, ref } from 'vue'
import { SizeManager, type SizePreset } from '../core/SizeManager'
import { getLocale, type SizeLocale } from '../locales'

/**
 * Size plugin configuration options
 */
export interface SizePluginOptions {
  /**
   * 语言设置 - 支持 string 或 Ref<string>
   * 如果传入 Ref，将直接使用（共享模式）
   * 如果传入 string 或不传，将创建新的 Ref（独立模式）
   */
  locale?: string | Ref<string>

  /**
   * Initial size preset
   * @default 'default'
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

  /**
   * Enable automatic detection based on device
   * @default false
   */
  autoDetect?: boolean

  /**
   * Enable CSS variable generation
   * @default true
   */
  cssVariables?: boolean
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
 * 判断是否为 Ref
 */
const isRef = <T>(v: any): v is Ref<T> => {
  return v && typeof v === 'object' && 'value' in v && '_rawValue' in v
}

/**
 * 智能获取locale
 * 支持多种方式：传入值、inject、全局事件
 */
function useSmartLocale(options: SizePluginOptions): Ref<string> {
  // 优先级1：使用传入的locale
  if (options.locale) {
    return isRef(options.locale) ? options.locale : ref(options.locale)
  }

  // 优先级2：从Vue上下文inject（如果在组件内）
  try {
    const injected = inject<Ref<string> | null>('app-locale', null)
    if (injected && injected.value) {
      return injected
    }
  } catch { }

  // 优先级3：创建独立的locale并监听全局事件
  const locale = ref(options.defaultLocale || 'zh-CN')

  // 从localStorage恢复
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('app-locale')
    if (stored) {
      locale.value = stored
    }

    // 监听全局语言变化事件
    window.addEventListener('app:locale-changed', (e: Event) => {
      const customEvent = e as CustomEvent<{ locale: string }>
      if (customEvent.detail?.locale) {
        locale.value = customEvent.detail.locale
      }
    })
  }

  return locale
}

/**
 * Create size plugin
 */
export function createSizePlugin(options: SizePluginOptions = {}): SizePlugin {
  // 使用智能locale获取
  let currentLocale = useSmartLocale(options)

  // 懒加载 locale 数据（性能优化）
  let localeCache: { key: string; data: any } | null = null
  const getLocaleData = () => {
    if (!localeCache || localeCache.key !== currentLocale.value) {
      localeCache = { key: currentLocale.value, data: getLocale(currentLocale.value) }
    }
    return localeCache.data
  }

  // 兼容旧的 computed 接口
  const localeMessages = {
    get value() { return getLocaleData() }
  } as ComputedRef<SizeLocale>

  // Merge options with defaults
  const mergedOptions = {
    defaultSize: options.defaultSize || 'default',
    presets: options.presets || [],
    storageKey: options.storageKey || 'ldesign-size',
    persistence: options.persistence !== false,
    storage: options.storage,
    hooks: options.hooks,
    defaultLocale: options.defaultLocale || 'zh-CN',
    autoDetect: options.autoDetect || false,
    cssVariables: options.cssVariables !== false,
    locale: options.locale || currentLocale.value
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

  manager.onChange((config) => {
    const newSize = manager.getCurrentSize()
    currentSize.value = newSize
    listeners.forEach(listener => listener(newSize))
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
      // 智能共享：如果没有传入 Ref，尝试自动共享
      if (!isRef(options.locale)) {
        // 尝试从 app context 获取共享的 locale
        const sharedLocale = app._context?.provides?.locale as Ref<string> | undefined

        if (sharedLocale && sharedLocale.value !== undefined) {
          // 发现共享的 locale，使用它
          currentLocale = sharedLocale
          plugin.currentLocale = sharedLocale

          // 清除缓存以触发重新计算
          localeCache = null
        } else {
          // 没有共享的 locale，提供自己的
          app.provide('locale', currentLocale)
        }
      }

      // Provide plugin instance
      app.provide(SizePluginSymbol, plugin)
      app.provide('size', plugin)

      // 同时提供 Vue 插件所需的 SIZE_MANAGER_KEY，让 useSize 能正常工作
      const SIZE_MANAGER_KEY = Symbol.for('size-manager')
      // 提供一个包装对象，确保方法绑定正确
      app.provide(SIZE_MANAGER_KEY, {
        manager,
        getConfig: () => manager.getConfig(),
        getCurrentPreset: () => manager.getCurrentPreset(),
        setBaseSize: (baseSize: number) => manager.setBaseSize(baseSize),
        applyPreset: (presetName: string) => manager.applyPreset(presetName),
        getPresets: () => manager.getPresets(),
        subscribe: (listener: any) => {
          // 确保 this 绑定正确
          return manager.subscribe(listener)
        }
      })

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