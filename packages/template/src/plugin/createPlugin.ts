/**
 * @ldesign/template - Plugin System
 * 
 * Template management plugin for Vue 3 applications
 */

import type { App, Component } from 'vue'
import type { TemplateManagerOptions, TemplateMetadata, TemplateRegistryItem } from '../types'
import { TemplateManager } from '../core/manager'
import { loadStyles } from '../core/style-loader'

/**
 * Template plugin configuration options
 */
export interface TemplatePluginOptions {
  /**
   * Template scan pattern
   * @default '**\/*.vue'
   */
  pattern?: string

  /**
   * Base path for template scanning
   * @default '/src/templates'
   */
  basePath?: string

  /**
   * Enable auto initialization
   * @default true
   */
  autoInit?: boolean

  /**
   * Enable template preloading
   * @default false
   */
  preload?: boolean

  /**
   * Preload strategy
   * @default 'lazy'
   */
  preloadStrategy?: 'lazy' | 'eager' | 'smart'

  /**
   * Cache options
   */
  cache?: {
    enabled?: boolean
    ttl?: number
    maxSize?: number
  }

  /**
   * Performance monitoring
   * @default false
   */
  performance?: boolean

  /**
   * Default device type
   * @default 'desktop'
   */
  defaultDevice?: 'desktop' | 'tablet' | 'mobile'

  /**
   * Auto detect device
   * @default true
   */
  autoDetect?: boolean

  /**
   * Custom device detection
   */
  detectDevice?: () => 'desktop' | 'tablet' | 'mobile'

  /**
   * Remember user preferences
   * @default false
   */
  rememberPreferences?: boolean

  /**
   * Storage key for preferences
   * @default 'ldesign-template-prefs'
   */
  preferencesKey?: string

  /**
   * Hooks
   */
  hooks?: {
    beforeLoad?: (templatePath: string) => void | Promise<void>
    afterLoad?: (templatePath: string, component: Component) => void | Promise<void>
    onError?: (error: Error) => void
  }
}

/**
 * User preferences structure
 */
export interface TemplatePreferences {
  [category: string]: {
    [device: string]: string // template name
  }
}

/**
 * Template plugin instance
 */
export interface TemplatePlugin {
  /**
   * Template manager instance
   */
  manager: TemplateManager

  /**
   * Plugin options
   */
  options: Required<TemplatePluginOptions>

  /**
   * Initialize the plugin
   */
  initialize: () => Promise<void>

  /**
   * Load a template
   */
  loadTemplate: (category: string, device: string, name: string) => Promise<Component>

  /**
   * Get default template
   */
  getDefaultTemplate: (category: string, device: string) => Promise<TemplateMetadata | null>

  /**
   * Get preferred template (from user preferences or default)
   */
  getPreferredTemplate: (category: string, device: string) => Promise<{ name: string } | null>

  /**
   * Save user preference
   */
  savePreference: (category: string, device: string, templateName: string) => void

  /**
   * Get user preferences
   */
  getPreferences: () => TemplatePreferences

  /**
   * Clear user preferences
   */
  clearPreferences: () => void

  /**
   * Scan templates
   */
  scanTemplates: () => Promise<Map<string, TemplateRegistryItem>>

  /**
   * Clear cache
   */
  clearCache: () => void

  /**
   * Detect current device
   */
  detectDevice: () => 'desktop' | 'tablet' | 'mobile'

  /**
   * Install the plugin
   */
  install: (app: App) => void
}

/**
 * Symbol for plugin injection
 */
export const TemplatePluginSymbol = Symbol('TemplatePlugin')

/**
 * Default device detection
 */
const defaultDetectDevice = (): 'desktop' | 'tablet' | 'mobile' => {
  if (typeof window === 'undefined') return 'desktop'
  const width = window.innerWidth
  if (width < 768) return 'mobile'
  if (width < 1024) return 'tablet'
  return 'desktop'
}

/**
 * Create template plugin
 */
export function createTemplatePlugin(options: TemplatePluginOptions = {}): TemplatePlugin {
  // Merge options with defaults
  const mergedOptions: Required<TemplatePluginOptions> = {
    pattern: options.pattern || '**/*.vue',
    basePath: options.basePath || '/src/templates',
    autoInit: options.autoInit !== false,
    preload: options.preload || false,
    preloadStrategy: options.preloadStrategy || 'lazy',
    cache: {
      enabled: options.cache?.enabled !== false,
      ttl: options.cache?.ttl || 300000, // 5 minutes
      maxSize: options.cache?.maxSize || 50,
    },
    performance: options.performance || false,
    defaultDevice: options.defaultDevice || 'desktop',
    autoDetect: options.autoDetect !== false,
    detectDevice: options.detectDevice || defaultDetectDevice,
    rememberPreferences: options.rememberPreferences || false,
    preferencesKey: options.preferencesKey || 'ldesign-template-prefs',
    hooks: options.hooks || {},
  }

  // Create template manager
  const managerOptions: TemplateManagerOptions = {
    scanOptions: {
      pattern: mergedOptions.pattern,
      basePath: mergedOptions.basePath,
    },
    loaderOptions: {
      cache: mergedOptions.cache?.enabled,
      cacheTtl: mergedOptions.cache?.ttl,
      cacheMaxSize: mergedOptions.cache?.maxSize,
      performance: mergedOptions.performance,
    },
    defaultStrategy: 'smart',
    preload: mergedOptions.preload,
    preloadStrategy: mergedOptions.preloadStrategy,
  }

  const manager = new TemplateManager(managerOptions)

  // Initialize function
  const initialize = async (): Promise<void> => {
    try {
      await manager.initialize()
      
      // Preload templates if enabled
      // Note: preloadAll and preloadCommon are not implemented in TemplateManager
      // Use preloadByFilter instead if needed
      if (mergedOptions.preload) {
        // You can implement specific preloading logic here
        // For example, preload login templates:
        // await manager.preloadByFilter({ category: 'login' })
      }
    } catch (error) {
      mergedOptions.hooks?.onError?.(error as Error)
      throw error
    }
  }

  // Load template with hooks
  const loadTemplate = async (category: string, device: string, name: string): Promise<Component> => {
    const templatePath = `${category}/${device}/${name}`
    
    try {
      await mergedOptions.hooks?.beforeLoad?.(templatePath)
      const component = await manager.loadTemplate(category, device, name)
      await mergedOptions.hooks?.afterLoad?.(templatePath, component)
      return component
    } catch (error) {
      mergedOptions.hooks?.onError?.(error as Error)
      throw error
    }
  }

  // Get default template
  const getDefaultTemplate = async (category: string, device: string): Promise<TemplateMetadata | null> => {
    try {
      const template = await manager.getDefaultTemplate(category, device)
      return template
    } catch (error) {
      mergedOptions.hooks?.onError?.(error as Error)
      throw error
    }
  }

  // User preferences management
  let preferences: TemplatePreferences = {}

  // Load preferences from storage
  const loadPreferences = (): TemplatePreferences => {
    if (!mergedOptions.rememberPreferences) return {}
    
    try {
      const stored = localStorage.getItem(mergedOptions.preferencesKey)
      if (stored) {
        preferences = JSON.parse(stored)
        return preferences
      }
    } catch (error) {
      console.error('Failed to load template preferences:', error)
    }
    return {}
  }

  // Save preferences to storage
  const savePreferencesToStorage = () => {
    if (!mergedOptions.rememberPreferences) return
    
    try {
      localStorage.setItem(mergedOptions.preferencesKey, JSON.stringify(preferences))
    } catch (error) {
      console.error('Failed to save template preferences:', error)
    }
  }

  // Save user preference
  const savePreference = (category: string, device: string, templateName: string) => {
    if (!mergedOptions.rememberPreferences) return
    
    if (!preferences[category]) {
      preferences[category] = {}
    }
    preferences[category][device] = templateName
    savePreferencesToStorage()
  }

  // Get user preferences
  const getPreferences = (): TemplatePreferences => {
    return { ...preferences }
  }

  // Clear user preferences
  const clearPreferences = () => {
    preferences = {}
    if (mergedOptions.rememberPreferences) {
      try {
        localStorage.removeItem(mergedOptions.preferencesKey)
      } catch (error) {
        console.error('Failed to clear template preferences:', error)
      }
    }
  }

  // Get preferred template (from preferences or default)
  const getPreferredTemplate = async (category: string, device: string): Promise<{ name: string } | null> => {
    // First, check user preferences
    if (mergedOptions.rememberPreferences) {
      const userPref = preferences[category]?.[device]
      if (userPref) {
        try {
          // Try to load the preferred template
          const template = await manager.loadTemplate(category, device, userPref)
          if (template) {
            
            return { name: userPref, component: template }
          }
        } catch (error) {
          console.warn(`Failed to load preferred template ${userPref}, falling back to default`, error)
        }
      }
    }
    
    // Fall back to default template
    return getDefaultTemplate(category, device)
  }

  // Load preferences on initialization
  if (mergedOptions.rememberPreferences) {
    loadPreferences()
  }

  // Create plugin instance
  const plugin: TemplatePlugin = {
    manager,
    options: mergedOptions,
    initialize,
    loadTemplate,
    getDefaultTemplate,
    getPreferredTemplate,
    savePreference,
    getPreferences,
    clearPreferences,
    scanTemplates: () => manager.scanTemplates(),
    clearCache: () => manager.clearCache(),
    detectDevice: mergedOptions.detectDevice,

    install(app: App) {
      // Provide plugin instance
      app.provide(TemplatePluginSymbol, plugin)

      // Add global property
      app.config.globalProperties.$template = plugin
      
      // Also expose to window for easy access by components
      if (typeof window !== 'undefined') {
        (window as unknown as { __TEMPLATE_PLUGIN__?: TemplatePlugin }).__TEMPLATE_PLUGIN__ = plugin
        
        // 自动加载主样式文件
        try {
          // 在构建环境中，尝试加载样式
          const baseUrl = new URL(import.meta.url)
          const indexCssPath = new URL('../index.css', baseUrl)
          loadStyles([indexCssPath.href])
          
        } catch (error) {
          console.warn('[Template Plugin] 无法自动加载样式，请手动导入 @ldesign/template/index.css', error)
        }
      }

      // Register global components
      app.component('TemplateRenderer', async () => {
        const module = await import('../components/TemplateRenderer.vue')
        return module.default
      })

      app.component('TemplateSelector', async () => {
        const module = await import('../components/TemplateSelector.vue')
        return module.default
      })

      // Auto-initialize on install
      if (mergedOptions.autoInit) {
        if (typeof window !== 'undefined') {
          // Initialize after next tick to ensure DOM is ready
          setTimeout(() => {
            initialize().catch(error => {
              console.error('[Template Plugin] Initialization failed:', error)
              mergedOptions.hooks?.onError?.(error)
            })
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
export default createTemplatePlugin