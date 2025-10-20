/**
 * @ldesign/color - Plugin System
 * 
 * Color theme plugin for Vue 3 applications
 */

import type { App, ComputedRef, Ref } from 'vue'
import type { ColorLocale } from '../locales'
import { inject, ref } from 'vue'
import { getLocale } from '../locales'
import { type PresetTheme, presetThemes } from '../themes/presets'
import { ThemeManager, type ThemeOptions, type ThemeState } from '../themes/themeManager'

/**
 * Color plugin configuration options
 */
export interface ColorPluginOptions {
  /**
   * 语言设置 - 支持 string �?Ref<string>
   * 如果传入 Ref，将直接使用（共享模式）
   * 如果传入 string 或不传，将创建新�?Ref（独立模式）
   */
  locale?: string | Ref<string>

  /**
   * CSS variable prefix
   * @default 'ld'
   */
  prefix?: string

  /**
   * Storage key for theme persistence
   * @default 'ldesign-theme'
   */
  storageKey?: string

  /**
   * Enable theme persistence
   * @default true
   */
  persistence?: boolean

  /**
   * Storage type
   * @default 'localStorage'
   */
  storageType?: 'localStorage' | 'sessionStorage' | 'custom'

  /**
   * Custom storage adapter
   */
  storage?: {
    getItem: (key: string) => string | null | Promise<string | null>
    setItem: (key: string, value: string) => void | Promise<void>
    removeItem: (key: string) => void | Promise<void>
  }

  /**
   * Preset themes
   * Pass an array to customize available themes
   * Pass 'all' to use all built-in themes
   * @default 'all'
   */
  presets?: PresetTheme[] | 'all'

  /**
   * Disabled preset theme names
   * Only works when presets is 'all'
   */
  disabledPresets?: string[]

  /**
   * Custom themes to add
   */
  customThemes?: PresetTheme[]

  /**
   * Auto-apply theme on initialization
   * @default true
   */
  autoApply?: boolean

  /**
   * Default theme to apply
   * Can be a theme name or color hex
   */
  defaultTheme?: string

  /**
   * Include semantic color variables
   * @default true
   */
  includeSemantics?: boolean

  /**
   * Include gray scale
   * @default true
   */
  includeGrays?: boolean

  /**
   * Hooks
   */
  hooks?: {
    /**
     * Called before theme change
     * Return false to cancel the change
     */
    beforeChange?: (newTheme: ThemeState, oldTheme: ThemeState | null) => boolean | Promise<boolean>

    /**
     * Called after theme change
     */
    afterChange?: (theme: ThemeState) => void | Promise<void>

    /**
     * Called when theme is loaded from storage
     */
    onLoad?: (theme: ThemeState) => void | Promise<void>

    /**
     * Called when theme is saved to storage
     */
    onSave?: (theme: ThemeState) => void | Promise<void>

    /**
     * Called on error
     */
    onError?: (error: Error) => void
  }

  /**
   * Custom color name mappings
   */
  nameMap?: Record<string, string>
}

/**
 * Color plugin instance
 */
export interface ColorPlugin {
  /**
   * Theme manager instance
   */
  manager: ThemeManager

  /**
   * Available preset themes
   */
  presets: PresetTheme[]

  /**
   * Plugin options
   */
  options: Required<Omit<ColorPluginOptions, 'storage' | 'hooks' | 'nameMap'>> & {
    storage?: ColorPluginOptions['storage']
    hooks?: ColorPluginOptions['hooks']
    nameMap?: ColorPluginOptions['nameMap']
  }

  /**
   * Current locale (reactive)
   */
  currentLocale: Ref<string>

  /**
   * Current locale messages (computed)
   */
  localeMessages: ComputedRef<ColorLocale>

  /**
   * Apply a theme
   */
  applyTheme: (colorOrName: string, options?: ThemeOptions) => Promise<ThemeState>

  /**
   * Apply a preset theme
   */
  applyPresetTheme: (name: string, options?: ThemeOptions) => Promise<ThemeState>

  /**
   * Get current theme
   */
  getCurrentTheme: () => ThemeState | null

  /**
   * Listen to theme changes
   */
  onChange: (listener: (theme: ThemeState) => void) => () => void

  /**
   * Add a custom theme
   */
  addCustomTheme: (theme: PresetTheme) => void

  /**
   * Remove a custom theme
   */
  removeCustomTheme: (name: string) => void

  /**
   * Get sorted presets (by order field)
   */
  getSortedPresets: () => PresetTheme[]

  /**
   * Cleanup resources
   */
  destroy?: () => void

  /**
   * Install the plugin
   */
  install: (app: App) => void

}

/**
 * Symbol for plugin injection
 */
export const ColorPluginSymbol = Symbol('ColorPlugin')

/**
 * 判断是否�?Ref
 */
const isRef = <T>(v: any): v is Ref<T> => {
  return v && typeof v === 'object' && 'value' in v && '_rawValue' in v
}

/**
 * 智能获取locale
 * 支持多种方式：传入值、inject、全局事件
 */
function useSmartLocale(options: ColorPluginOptions): Ref<string> {
  // 优先�?：使用传入的locale
  if (options.locale) {
    return isRef(options.locale) ? options.locale : ref(options.locale)
  }

  // 优先�?：从Vue上下文inject（如果在组件内）
  try {
    const injected = inject<Ref<string> | null>('app-locale', null)
    if (injected && injected.value) {
      return injected
    }
  } catch { }

  // 优先�?：创建独立的locale并监听全局事件
  const locale = ref('zh-CN')

  // 从localStorage恢复
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('app-locale')
    if (stored) {
      locale.value = stored
    }

    // 监听全局语言变化事件
    const localeChangeHandler = (e: Event) => {
      const customEvent = e as CustomEvent<{ locale: string }>
      if (customEvent.detail?.locale) {
        locale.value = customEvent.detail.locale
      }
    }
    window.addEventListener('app:locale-changed', localeChangeHandler)

    // Cleanup on page unload
    window.addEventListener('unload', () => {
      window.removeEventListener('app:locale-changed', localeChangeHandler)
    }, { once: true })
  }

  return locale
}

/**
 * Create color plugin
 */
export function createColorPlugin(options: ColorPluginOptions = {}): ColorPlugin {
  // 使用智能locale获取
  const currentLocale = useSmartLocale(options)
  // 懒加载 locale 数据（性能优化）
  // Use WeakMap for better memory management
  const localeCache = new WeakMap<{ value: string }, any>()
  const getLocaleData = () => {
    const cacheKey = { value: currentLocale.value }
    let cached = localeCache.get(cacheKey)
    if (!cached) {
      cached = getLocale(currentLocale.value)
      localeCache.set(cacheKey, cached)
    }
    return cached
  }

  // 兼容旧的 computed 接口
  const localeMessages = {
    get value() { return getLocaleData() }
  } as ComputedRef<ColorLocale>

  // Merge options with defaults
  const mergedOptions = {
    prefix: options.prefix || 'ld',
    storageKey: options.storageKey || 'ldesign-theme',
    persistence: options.persistence !== false,
    storageType: options.storageType || 'localStorage' as const,
    storage: options.storage,
    autoApply: options.autoApply !== false,
    defaultTheme: options.defaultTheme || 'blue',
    includeSemantics: options.includeSemantics !== false,
    includeGrays: options.includeGrays !== false,
    presets: options.presets || 'all' as const,
    disabledPresets: options.disabledPresets || [],
    customThemes: options.customThemes || [],
    hooks: options.hooks,
    nameMap: options.nameMap,
  }

  // Prepare preset themes
  let availablePresets: PresetTheme[] = []

  if (mergedOptions.presets === 'all') {
    // Use all built-in presets, excluding disabled ones
    availablePresets = presetThemes.filter(
      preset => !mergedOptions.disabledPresets.includes(preset.name)
    )
  } else {
    // Use custom presets
    availablePresets = mergedOptions.presets
  }

  // Add custom themes
  if (mergedOptions.customThemes.length > 0) {
    availablePresets = [...availablePresets, ...mergedOptions.customThemes]
  }

  // Sort by order field
  const sortPresets = (presets: PresetTheme[]): PresetTheme[] => {
    return [...presets].sort((a, b) => {
      const orderA = a.order ?? 9999
      const orderB = b.order ?? 9999
      return orderA - orderB
    })
  }

  availablePresets = sortPresets(availablePresets)

  // Create theme manager with custom storage
  const manager = new ThemeManager({
    prefix: mergedOptions.prefix,
    storageKey: mergedOptions.storageKey,
    autoApply: false, // We'll handle auto-apply in the plugin
    includeSemantics: mergedOptions.includeSemantics,
    includeGrays: mergedOptions.includeGrays,
    nameMap: mergedOptions.nameMap,
  })

  // Custom storage wrapper
  const storage = {
    async getItem(key: string): Promise<string | null> {
      try {
        if (mergedOptions.storage) {
          return await mergedOptions.storage.getItem(key)
        }

        if (typeof window === 'undefined') return null

        const storageImpl = mergedOptions.storageType === 'sessionStorage'
          ? window.sessionStorage
          : window.localStorage

        return storageImpl.getItem(key)
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

        const storageImpl = mergedOptions.storageType === 'sessionStorage'
          ? window.sessionStorage
          : window.localStorage

        storageImpl.setItem(key, value)
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

        const storageImpl = mergedOptions.storageType === 'sessionStorage'
          ? window.sessionStorage
          : window.localStorage

        storageImpl.removeItem(key)
      } catch (error) {
        mergedOptions.hooks?.onError?.(error as Error)
      }
    }
  }

  // Wrap applyTheme with hooks and persistence
  const applyTheme = async (colorOrName: string, themeOptions?: ThemeOptions): Promise<ThemeState> => {
    const oldTheme = manager.getCurrentTheme()

    try {
      // beforeChange hook
      if (mergedOptions.hooks?.beforeChange) {
        const shouldContinue = await mergedOptions.hooks.beforeChange(
          { primaryColor: colorOrName, themeName: colorOrName } as ThemeState,
          oldTheme
        )
        if (shouldContinue === false) {
          throw new Error('Theme change cancelled by beforeChange hook')
        }
      }

      // Apply theme
      const newTheme = manager.applyTheme(colorOrName, {
        ...themeOptions,
        prefix: themeOptions?.prefix || mergedOptions.prefix,
        includeSemantics: themeOptions?.includeSemantics ?? mergedOptions.includeSemantics,
        includeGrays: themeOptions?.includeGrays ?? mergedOptions.includeGrays,
        nameMap: themeOptions?.nameMap || mergedOptions.nameMap,
      })

      // Save to storage if persistence is enabled
      if (mergedOptions.persistence) {
        await storage.setItem(mergedOptions.storageKey, JSON.stringify(newTheme))
        await mergedOptions.hooks?.onSave?.(newTheme)
      }

      // afterChange hook
      await mergedOptions.hooks?.afterChange?.(newTheme)

      return newTheme
    } catch (error) {
      mergedOptions.hooks?.onError?.(error as Error)
      throw error
    }
  }

  // Wrap applyPresetTheme
  const applyPresetTheme = async (name: string, themeOptions?: ThemeOptions): Promise<ThemeState> => {
    const preset = availablePresets.find(p => p.name === name)
    if (!preset) {
      throw new Error(`Preset theme "${name}" not found`)
    }
    return applyTheme(name, themeOptions)
  }

  // Load custom themes from storage
  const CUSTOM_THEMES_KEY = `${mergedOptions.storageKey}-custom-themes`

  const loadCustomThemes = async (): Promise<void> => {
    try {
      const stored = await storage.getItem(CUSTOM_THEMES_KEY)
      if (stored) {
        const customThemes = JSON.parse(stored) as PresetTheme[]
        // Add custom themes to available presets
        customThemes.forEach(theme => {
          if (!availablePresets.find(p => p.name === theme.name)) {
            availablePresets.push({ ...theme, custom: true })
          }
        })
        // Re-sort after adding custom themes
        availablePresets = sortPresets(availablePresets)
      }
    } catch (error) {
      mergedOptions.hooks?.onError?.(error as Error)
    }
  }

  // Save custom themes to storage
  const saveCustomThemes = async (): Promise<void> => {
    try {
      const customThemes = availablePresets.filter(p => p.custom)
      await storage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(customThemes))
    } catch (error) {
      mergedOptions.hooks?.onError?.(error as Error)
    }
  }

  // Load theme from storage
  const loadTheme = async (): Promise<void> => {
    try {
      // Load custom themes first
      await loadCustomThemes()

      const stored = await storage.getItem(mergedOptions.storageKey)
      if (stored) {
        const theme = JSON.parse(stored) as ThemeState
        await applyTheme(theme.themeName || theme.primaryColor)
        await mergedOptions.hooks?.onLoad?.(theme)
      } else if (mergedOptions.defaultTheme) {
        // Apply default theme
        await applyTheme(mergedOptions.defaultTheme)
      }
    } catch (error) {
      mergedOptions.hooks?.onError?.(error as Error)
    }
  }

  // Add custom theme
  const addCustomTheme = (theme: PresetTheme) => {
    // Check if theme already exists
    const existing = availablePresets.find(p => p.name === theme.name)
    if (existing) {
      throw new Error(`Theme "${theme.name}" already exists`)
    }

    // Add custom flag
    const customTheme: PresetTheme = {
      ...theme,
      custom: true,
      order: theme.order ?? (Math.max(...availablePresets.map(p => p.order ?? 0)) + 1)
    }

    availablePresets.push(customTheme)
    availablePresets = sortPresets(availablePresets)

    // Save to storage
    saveCustomThemes()
  }

  // Remove custom theme
  const removeCustomTheme = (name: string) => {
    const index = availablePresets.findIndex(p => p.name === name && p.custom)
    if (index === -1) {
      throw new Error(`Custom theme "${name}" not found`)
    }

    availablePresets.splice(index, 1)

    // Save to storage
    saveCustomThemes()
  }

  // Get sorted presets
  const getSortedPresets = () => {
    return sortPresets(availablePresets)
  }

  // Track cleanup handlers
  const cleanupHandlers: Array<() => void> = []

  // Create plugin instance
  const plugin: ColorPlugin = {
    manager,
    presets: availablePresets,
    options: { ...mergedOptions, locale: currentLocale.value },
    currentLocale,
    localeMessages,
    applyTheme,
    applyPresetTheme,
    getCurrentTheme: () => manager.getCurrentTheme(),
    onChange: (listener) => {
      const unsubscribe = manager.onChange(listener)
      cleanupHandlers.push(unsubscribe)
      return unsubscribe
    },
    addCustomTheme,
    removeCustomTheme,
    getSortedPresets,

    // Add cleanup method
    destroy() {
      // Clear all event listeners
      cleanupHandlers.forEach(handler => handler())
      cleanupHandlers.length = 0

      // Clear cache - WeakMap doesn't have clear method
      // Cache will be auto-cleaned by garbage collection

      // Destroy manager
      if (manager.destroy) {
        manager.destroy()
      }
    },

    install(app: App) {
      // 智能共享：如果没有传�?Ref，尝试自动共�?
      if (!isRef(options.locale)) {
        // 尝试从 app context 获取共享的 locale
        const sharedLocale = app._context?.provides?.locale as Ref<string> | undefined

        if (sharedLocale && sharedLocale.value !== undefined) {
          // 发现共享的 locale，使用它
          // Use sharedLocale instead
          // WeakMap will automatically handle cache invalidation
        } else {
          // 没有共享的 locale，提供自己的
          app.provide('locale', currentLocale)
        }
      }

      // Provide plugin instance
      app.provide(ColorPluginSymbol, plugin)
      app.provide('color', plugin)

      // Provide color locale for consumers
      app.provide('color-locale', localeMessages)

      // Add global property
      app.config.globalProperties.$color = plugin

      // Auto-apply theme on initialization
      if (mergedOptions.autoApply) {
        if (typeof window !== 'undefined') {
          // Load after next tick to ensure DOM is ready
          const timeoutId = setTimeout(() => {
            loadTheme()
          }, 0)
          cleanupHandlers.push(() => clearTimeout(timeoutId))
        }
      }

      // Register app unmount cleanup
      // Note: _scope is internal API and may not be available
      // Use app.unmount hook if available in future versions
    }
  }

  return plugin
}

/**
 * Default export
 */
export default createColorPlugin


