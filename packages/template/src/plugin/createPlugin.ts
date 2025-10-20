/**
 * @ldesign/template - Plugin System
 * 
 * Template management plugin for Vue 3 applications
 */

import type { App, Component, ComputedRef, Ref } from 'vue'
import type { TemplateManagerOptions, TemplateMetadata, TemplateRegistryItem } from '../types'
import { inject, ref } from 'vue'
import { TemplateManager } from '../core/manager'
import { loadStyles } from '../core/style-loader'
import { getLocale, type TemplateLocale } from '../locales'

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
   * 语言设置 - 支持 string 或 Ref<string>
   * 如果传入 Ref，将直接使用（共享模式）
   * 如果传入 string 或不传，将创建新 Ref（独立模式）
   */
  locale?: string | Ref<string>
  
  /**
   * Default locale
   * @default 'zh-CN'
   */
  defaultLocale?: string
  
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
   * Current locale (reactive)
   */
  currentLocale: Ref<string>
  
  /**
   * Current locale messages (computed)
   */
  localeMessages: ComputedRef<TemplateLocale>

  /**
   * Install the plugin
   */
  install: (app: App) => void
  
  /**
   * Dispose the plugin and clean up resources
   */
  dispose: () => void
}

/**
 * Symbol for plugin injection
 */
export const TemplatePluginSymbol = Symbol('TemplatePlugin')

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
function useSmartLocale(options: TemplatePluginOptions): { locale: Ref<string>; cleanup: () => void } {
  let eventListener: ((e: Event) => void) | null = null
  
  // 优先级1：使用传入的locale
  if (options.locale) {
    return { 
      locale: isRef(options.locale) ? options.locale : ref(options.locale),
      cleanup: () => {} // No cleanup needed for provided locale
    }
  }
  
  // 优先级2：从Vue上下文inject（如果在组件内）
  try {
    const injected = inject<Ref<string>>('app-locale', null)
    if (injected && injected.value) {
      return { locale: injected, cleanup: () => {} }
    }
  } catch {}
  
  // 优先级3：创建独立的locale并监听全局事件
  const locale = ref(options.defaultLocale || 'zh-CN')
  
  // 从localStorage恢复
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('app-locale')
    if (stored) {
      locale.value = stored
    }
    
    // 监听全局语言变化事件
    eventListener = (e: Event) => {
      const customEvent = e as CustomEvent<{ locale: string }>
      if (customEvent.detail?.locale) {
        locale.value = customEvent.detail.locale
      }
    }
    window.addEventListener('app:locale-changed', eventListener)
  }
  
  return {
    locale,
    cleanup: () => {
      if (eventListener && typeof window !== 'undefined') {
        window.removeEventListener('app:locale-changed', eventListener)
        eventListener = null
      }
    }
  }
}

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
  // 使用智能locale获取
  const { locale: currentLocale, cleanup: localeCleanup } = useSmartLocale(options)
  
  // Plugin disposal state
  let disposed = false
  const cleanupHandlers: (() => void)[] = [localeCleanup]
  let initializeTimeout: NodeJS.Timeout | null = null
  
  // 懒加载 locale 数据（性能优化）
  let localeCache: { key: string; data: any } | null = null
  const getLocaleData = () => {
    if (disposed) return null
    if (!localeCache || localeCache.key !== currentLocale.value) {
      localeCache = { key: currentLocale.value, data: getLocale(currentLocale.value) }
    }
    return localeCache.data
  }
  
  // 兼容旧的 computed 接口
  const localeMessages = {
    get value() { return getLocaleData() }
  } as ComputedRef<TemplateLocale>
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
    locale: options.locale,
    defaultLocale: options.defaultLocale || 'zh-CN',
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
    if (disposed) {
      throw new Error('Plugin has been disposed')
    }
    
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
    if (disposed) {
      throw new Error('Plugin has been disposed')
    }
    
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

  // User preferences management - limit size to prevent memory growth
  let preferences: TemplatePreferences = {}
  const MAX_PREFERENCES = 100 // Limit number of stored preferences

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
      console.error('[Template Plugin] Failed to load preferences:', error)
    }
    return {}
  }

  // Save preferences to storage
  const savePreferencesToStorage = () => {
    if (!mergedOptions.rememberPreferences) return
    
    try {
      localStorage.setItem(mergedOptions.preferencesKey, JSON.stringify(preferences))
    } catch (error) {
      console.error('[Template Plugin] Failed to save preferences:', error)
    }
  }

  // Save user preference
  const savePreference = (category: string, device: string, templateName: string) => {
    if (!mergedOptions.rememberPreferences) return
    
    // Limit preferences size
    const keys = Object.keys(preferences)
    if (keys.length >= MAX_PREFERENCES && !preferences[category]) {
      // Remove oldest preference
      delete preferences[keys[0]]
    }
    
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
    // Ensure preferences are loaded
    if (mergedOptions.rememberPreferences && Object.keys(preferences).length === 0) {
      loadPreferences()
    }
    
    // First, check user preferences
    if (mergedOptions.rememberPreferences) {
      const userPref = preferences[category]?.[device]
      
      if (userPref) {
        try {
          // Verify that the preferred template exists
          const templates = await manager.scanTemplates()
          const templateKey = `${category}/${device}/${userPref}`
          
          if (templates.has(templateKey)) {
            return { name: userPref }
          } else {
            if (import.meta.env.DEV) {
              console.warn(`[Template Plugin] Preferred template ${userPref} not found, falling back to default`)
            }
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.warn(`[Template Plugin] Failed to verify preferred template ${userPref}, falling back to default`, error)
          }
        }
      }
    }
    
    // Fall back to default template
    const defaultTemplate = await getDefaultTemplate(category, device)
    if (defaultTemplate?.name) {
      return { name: defaultTemplate.name }
    }
    
    return null
  }

  // Load preferences on initialization (立即加载，不等待)
  if (mergedOptions.rememberPreferences && typeof window !== 'undefined') {
    // 立即同步加载偏好设置
    loadPreferences()
  }

  // Dispose function to clean up resources
  const dispose = () => {
    if (disposed) return
    
    disposed = true
    
    // Clear initialization timeout
    if (initializeTimeout) {
      clearTimeout(initializeTimeout)
      initializeTimeout = null
    }
    
    // Run all cleanup handlers
    cleanupHandlers.forEach(handler => {
      try {
        handler()
      } catch (error) {
        console.error('[Template Plugin] Cleanup error:', error)
      }
    })
    cleanupHandlers.length = 0
    
    // Clear cache
    localeCache = null
    preferences = {}
    
    // Clean up manager resources if it has dispose
    if ('dispose' in manager && typeof manager.dispose === 'function') {
      (manager as any).dispose()
    }
    
    // Clear window reference
    if (typeof window !== 'undefined') {
      delete (window as any).__TEMPLATE_PLUGIN__
    }
  }
  
  // Create plugin instance
  const plugin: TemplatePlugin = {
    manager,
    options: mergedOptions,
    currentLocale,
    localeMessages,
    initialize,
    loadTemplate,
    getDefaultTemplate,
    getPreferredTemplate,
    savePreference,
    getPreferences,
    clearPreferences,
    scanTemplates: () => disposed ? Promise.reject(new Error('Plugin disposed')) : manager.scanTemplates(),
    clearCache: () => disposed ? undefined : manager.clearCache(),
    detectDevice: mergedOptions.detectDevice,
    dispose,

    install(app: App) {
      // 智能共享：如果没有传入 Ref，尝试自动共享
      if (!isRef(options.locale)) {
        // 尝试从 app context 获取共享的 locale
        const sharedLocale = app._context?.provides?.['app-locale'] as Ref<string> | undefined
        
        if (sharedLocale && sharedLocale.value !== undefined) {
          // 发现共享的 locale，使用它
          currentLocale.value = sharedLocale.value
          plugin.currentLocale = sharedLocale
          
          // 清除缓存以触发重新计算
          localeCache = null
        } else {
          // 没有共享的 locale，提供自己的
          app.provide('app-locale', currentLocale)
        }
      }
      
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
      
      // Register template directive
      import('../directives').then(({ installTemplateDirective }) => {
        if (!disposed) {
          installTemplateDirective(app)
        }
      }).catch(err => {
        console.warn('[Template Plugin] Failed to load directives:', err)
      })

      // Auto-initialize on install
      if (mergedOptions.autoInit) {
        if (typeof window !== 'undefined') {
          // Initialize after next tick to ensure DOM is ready
          initializeTimeout = setTimeout(() => {
            if (!disposed) {
              initialize().catch(error => {
                console.error('[Template Plugin] Initialization failed:', error)
                mergedOptions.hooks?.onError?.(error)
              })
            }
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