/**
 * @ldesign/template - Plugin System
 * 
 * Template management plugin for Vue 3 applications
 */

import type { App } from 'vue'
import { TemplateManager } from '../core'
import type { TemplateManagerOptions } from '../types'

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
   * Hooks
   */
  hooks?: {
    beforeLoad?: (templatePath: string) => void | Promise<void>
    afterLoad?: (templatePath: string, component: any) => void | Promise<void>
    onError?: (error: Error) => void
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
  loadTemplate: (category: string, device: string, name: string) => Promise<any>

  /**
   * Get default template
   */
  getDefaultTemplate: (category: string, device: string) => Promise<any>

  /**
   * Scan templates
   */
  scanTemplates: () => Promise<Map<string, any>>

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
      if (mergedOptions.preload) {
        if (mergedOptions.preloadStrategy === 'eager') {
          await manager.preloadAll()
        } else if (mergedOptions.preloadStrategy === 'smart') {
          await manager.preloadCommon()
        }
      }
    } catch (error) {
      mergedOptions.hooks?.onError?.(error as Error)
      throw error
    }
  }

  // Load template with hooks
  const loadTemplate = async (category: string, device: string, name: string): Promise<any> => {
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
  const getDefaultTemplate = async (category: string, device: string): Promise<any> => {
    try {
      const template = await manager.getDefaultTemplate(category, device)
      return template
    } catch (error) {
      mergedOptions.hooks?.onError?.(error as Error)
      throw error
    }
  }

  // Create plugin instance
  const plugin: TemplatePlugin = {
    manager,
    options: mergedOptions,
    initialize,
    loadTemplate,
    getDefaultTemplate,
    scanTemplates: () => manager.scanTemplates(),
    clearCache: () => manager.clearCache(),
    detectDevice: mergedOptions.detectDevice,

    install(app: App) {
      // Provide plugin instance
      app.provide(TemplatePluginSymbol, plugin)

      // Add global property
      app.config.globalProperties.$template = plugin

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