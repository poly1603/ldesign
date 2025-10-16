/**
 * @ldesign/size - Vue Plugin System
 * 
 * Size system plugin for Vue 3 applications
 */

import type { App } from 'vue'
import { SizeManager, type SizePreset, type SizeConfig } from '../core/SizeManager'

/**
 * Size plugin configuration options
 */
export interface SizePluginOptions {
  /**
   * CSS variable prefix
   * @default 'ld'
   */
  prefix?: string

  /**
   * Storage key for size persistence
   * @default 'ldesign-size'
   */
  storageKey?: string

  /**
   * Enable size persistence
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
   * Auto-apply size on initialization
   * @default true
   */
  autoApply?: boolean

  /**
   * Default size preset name
   * @default 'default'
   */
  defaultPreset?: string

  /**
   * Custom size presets
   */
  customPresets?: SizePreset[]

  /**
   * Auto-detect device and apply appropriate preset
   * @default true
   */
  autoDetect?: boolean

  /**
   * Hooks
   */
  hooks?: {
    /**
     * Called before size change
     * Return false to cancel the change
     */
    beforeChange?: (newConfig: SizeConfig, oldConfig: SizeConfig | null) => boolean | Promise<boolean>

    /**
     * Called after size change
     */
    afterChange?: (config: SizeConfig) => void | Promise<void>

    /**
     * Called when size is loaded from storage
     */
    onLoad?: (config: SizeConfig) => void | Promise<void>

    /**
     * Called when size is saved to storage
     */
    onSave?: (config: SizeConfig) => void | Promise<void>

    /**
     * Called on error
     */
    onError?: (error: Error) => void
  }
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
   * Apply a size preset
   */
  applyPreset: (name: string) => Promise<void>

  /**
   * Set base size
   */
  setBaseSize: (size: number) => Promise<void>

  /**
   * Set scale ratio
   */
  setScale: (scale: number) => Promise<void>

  /**
   * Get current size config
   */
  getCurrentConfig: () => SizeConfig

  /**
   * Get available presets
   */
  getPresets: () => SizePreset[]

  /**
   * Add a custom preset
   */
  addPreset: (preset: SizePreset) => void

  /**
   * Remove a custom preset
   */
  removePreset: (name: string) => void

  /**
   * Listen to size changes
   */
  onChange: (listener: (config: SizeConfig) => void) => () => void

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
  // Merge options with defaults
  const mergedOptions = {
    prefix: options.prefix || 'ld',
    storageKey: options.storageKey || 'ldesign-size',
    persistence: options.persistence !== false,
    storageType: options.storageType || 'localStorage' as const,
    storage: options.storage,
    autoApply: options.autoApply !== false,
    defaultPreset: options.defaultPreset || 'default',
    customPresets: options.customPresets || [],
    autoDetect: options.autoDetect !== false,
    hooks: options.hooks,
  }

  // Create size manager
  const manager = new SizeManager()

  // Add custom presets
  mergedOptions.customPresets.forEach(preset => {
    manager.registerCustomPreset(preset)
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

  // Apply size preset with hooks and persistence
  const applyPreset = async (name: string): Promise<void> => {
    const oldConfig = manager.getCurrentConfig()

    try {
      // beforeChange hook
      if (mergedOptions.hooks?.beforeChange) {
        const newConfig = { ...oldConfig, presetName: name }
        const shouldContinue = await mergedOptions.hooks.beforeChange(newConfig, oldConfig)
        if (shouldContinue === false) {
          throw new Error('Size change cancelled by beforeChange hook')
        }
      }

      // Apply preset
      manager.applyPreset(name)
      const newConfig = manager.getCurrentConfig()

      // Save to storage if persistence is enabled
      if (mergedOptions.persistence) {
        await storage.setItem(mergedOptions.storageKey, JSON.stringify(newConfig))
        await mergedOptions.hooks?.onSave?.(newConfig)
      }

      // afterChange hook
      await mergedOptions.hooks?.afterChange?.(newConfig)
    } catch (error) {
      mergedOptions.hooks?.onError?.(error as Error)
      throw error
    }
  }

  // Set base size with hooks
  const setBaseSize = async (size: number): Promise<void> => {
    const oldConfig = manager.getCurrentConfig()

    try {
      // beforeChange hook
      if (mergedOptions.hooks?.beforeChange) {
        const newConfig = { ...oldConfig, baseSize: size }
        const shouldContinue = await mergedOptions.hooks.beforeChange(newConfig, oldConfig)
        if (shouldContinue === false) {
          throw new Error('Size change cancelled by beforeChange hook')
        }
      }

      // Set base size
      manager.setBaseSize(size)
      const newConfig = manager.getCurrentConfig()

      // Save to storage if persistence is enabled
      if (mergedOptions.persistence) {
        await storage.setItem(mergedOptions.storageKey, JSON.stringify(newConfig))
        await mergedOptions.hooks?.onSave?.(newConfig)
      }

      // afterChange hook
      await mergedOptions.hooks?.afterChange?.(newConfig)
    } catch (error) {
      mergedOptions.hooks?.onError?.(error as Error)
      throw error
    }
  }

  // Set scale ratio with hooks
  const setScale = async (scale: number): Promise<void> => {
    const oldConfig = manager.getCurrentConfig()

    try {
      // beforeChange hook
      if (mergedOptions.hooks?.beforeChange) {
        const newConfig = { ...oldConfig, scale }
        const shouldContinue = await mergedOptions.hooks.beforeChange(newConfig, oldConfig)
        if (shouldContinue === false) {
          throw new Error('Scale change cancelled by beforeChange hook')
        }
      }

      // Set scale
      manager.setScale(scale)
      const newConfig = manager.getCurrentConfig()

      // Save to storage if persistence is enabled
      if (mergedOptions.persistence) {
        await storage.setItem(mergedOptions.storageKey, JSON.stringify(newConfig))
        await mergedOptions.hooks?.onSave?.(newConfig)
      }

      // afterChange hook
      await mergedOptions.hooks?.afterChange?.(newConfig)
    } catch (error) {
      mergedOptions.hooks?.onError?.(error as Error)
      throw error
    }
  }

  // Load size from storage
  const loadSize = async (): Promise<void> => {
    try {
      const stored = await storage.getItem(mergedOptions.storageKey)
      if (stored) {
        const config = JSON.parse(stored) as SizeConfig
        
        // Apply stored config
        if (config.presetName) {
          await applyPreset(config.presetName)
        } else {
          if (config.baseSize) manager.setBaseSize(config.baseSize)
          if (config.scale) manager.setScale(config.scale)
        }
        
        await mergedOptions.hooks?.onLoad?.(config)
      } else if (mergedOptions.autoDetect) {
        // Auto-detect device and apply appropriate preset
        manager.applyByDevice()
      } else if (mergedOptions.defaultPreset) {
        // Apply default preset
        await applyPreset(mergedOptions.defaultPreset)
      }
    } catch (error) {
      mergedOptions.hooks?.onError?.(error as Error)
    }
  }

  // Add custom preset
  const addPreset = (preset: SizePreset) => {
    manager.registerCustomPreset(preset)
  }

  // Remove custom preset
  const removePreset = (name: string) => {
    // This would need to be implemented in SizeManager
    // For now, we'll just log a warning
    console.warn(`Removing preset "${name}" is not yet implemented`)
  }

  // Get available presets
  const getPresets = (): SizePreset[] => {
    return manager.getAvailablePresets()
  }

  // Create plugin instance
  const plugin: SizePlugin = {
    manager,
    options: mergedOptions,
    applyPreset,
    setBaseSize,
    setScale,
    getCurrentConfig: () => manager.getCurrentConfig(),
    getPresets,
    addPreset,
    removePreset,
    onChange: (listener) => manager.subscribe(listener),

    install(app: App) {
      // Provide plugin instance
      app.provide(SizePluginSymbol, plugin)

      // Add global property
      app.config.globalProperties.$size = plugin

      // Auto-apply size on initialization
      if (mergedOptions.autoApply) {
        if (typeof window !== 'undefined') {
          // Load after next tick to ensure DOM is ready
          setTimeout(() => {
            loadSize()
          }, 0)
        }
      }
    }
  }

  return plugin
}

/**
 * Default export
 */
export default createSizePlugin