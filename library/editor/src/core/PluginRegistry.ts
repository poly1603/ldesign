/**
 * 插件注册中心
 * 支持插件的按需加载、配置管理和生命周期管理
 */

import { EventEmitter } from './EventEmitter'
import type { Plugin } from './Plugin'
import type { Editor } from './Editor'

/**
 * 插件配置接口
 */
export interface PluginConfig {
  enabled: boolean
  priority?: number
  lazy?: boolean
  dependencies?: string[]
  config?: Record<string, any>
}

/**
 * 插件元数据
 */
export interface PluginMetadata {
  name: string
  version?: string
  description?: string
  author?: string
  category?: PluginCategory
  tags?: string[]
}

/**
 * 插件分类
 */
export enum PluginCategory {
  FORMAT = 'format',
  BLOCK = 'block',
  INLINE = 'inline',
  MEDIA = 'media',
  TOOL = 'tool',
  AI = 'ai',
  OTHER = 'other'
}

/**
 * 插件加载器类型
 */
export type PluginLoader = () => Promise<Plugin> | Plugin

/**
 * 插件注册信息
 */
interface PluginRegistration {
  metadata: PluginMetadata
  config: PluginConfig
  loader: PluginLoader
  instance?: Plugin
  loaded: boolean
  loading: boolean
  error?: Error
}

/**
 * 插件注册中心类
 */
export class PluginRegistry extends EventEmitter {
  private registry: Map<string, PluginRegistration> = new Map()
  private editor?: Editor
  private loadedPlugins: Set<string> = new Set()
  
  constructor() {
    super()
  }
  
  /**
   * 设置编辑器实例
   */
  setEditor(editor: Editor): void {
    this.editor = editor
  }
  
  /**
   * 注册插件
   */
  register(
    name: string,
    loader: PluginLoader,
    metadata: Partial<PluginMetadata> = {},
    config: Partial<PluginConfig> = {}
  ): void {
    if (this.registry.has(name)) {
      console.warn(`Plugin "${name}" is already registered`)
      return
    }
    
    const registration: PluginRegistration = {
      metadata: {
        name,
        ...metadata
      },
      config: {
        enabled: true,
        lazy: false,
        priority: 0,
        ...config
      },
      loader,
      loaded: false,
      loading: false
    }
    
    this.registry.set(name, registration)
    this.emit('plugin:registered', { name, metadata, config })
  }
  
  /**
   * 批量注册插件
   */
  registerBatch(plugins: Array<{
    name: string
    loader: PluginLoader
    metadata?: Partial<PluginMetadata>
    config?: Partial<PluginConfig>
  }>): void {
    plugins.forEach(({ name, loader, metadata, config }) => {
      this.register(name, loader, metadata, config)
    })
  }
  
  /**
   * 加载插件
   */
  async load(name: string): Promise<Plugin | null> {
    const registration = this.registry.get(name)
    
    if (!registration) {
      console.error(`Plugin "${name}" not found`)
      return null
    }
    
    if (!registration.config.enabled) {
      console.log(`Plugin "${name}" is disabled`)
      return null
    }
    
    if (registration.loaded && registration.instance) {
      return registration.instance
    }
    
    if (registration.loading) {
      // 等待加载完成
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (registration.loaded) {
            this.off('plugin:loaded', checkLoaded)
            resolve(registration.instance || null)
          }
        }
        this.on('plugin:loaded', checkLoaded)
      })
    }
    
    // 检查依赖
    if (registration.config.dependencies) {
      for (const dep of registration.config.dependencies) {
        if (!this.isLoaded(dep)) {
          await this.load(dep)
        }
      }
    }
    
    registration.loading = true
    this.emit('plugin:loading', { name })
    
    try {
      const plugin = await registration.loader()
      
      if (!this.editor) {
        throw new Error('Editor instance not set')
      }
      
      // 应用插件配置
      if (registration.config.config && plugin.config) {
        Object.assign(plugin.config, registration.config.config)
      }
      
      // 初始化插件
      if (plugin.init) {
        await plugin.init(this.editor)
      }
      
      registration.instance = plugin
      registration.loaded = true
      registration.loading = false
      this.loadedPlugins.add(name)
      
      this.emit('plugin:loaded', { name, plugin })
      
      return plugin
    } catch (error) {
      registration.error = error as Error
      registration.loading = false
      this.emit('plugin:error', { name, error })
      console.error(`Failed to load plugin "${name}":`, error)
      return null
    }
  }
  
  /**
   * 批量加载插件
   */
  async loadBatch(names: string[]): Promise<Array<Plugin | null>> {
    // 按优先级排序
    const sorted = names
      .map(name => ({ name, priority: this.registry.get(name)?.config.priority || 0 }))
      .sort((a, b) => b.priority - a.priority)
      .map(item => item.name)
    
    return Promise.all(sorted.map(name => this.load(name)))
  }
  
  /**
   * 卸载插件
   */
  async unload(name: string): Promise<void> {
    const registration = this.registry.get(name)
    
    if (!registration || !registration.loaded || !registration.instance) {
      return
    }
    
    try {
      // 调用销毁方法
      if (registration.instance.destroy) {
        await registration.instance.destroy()
      }
      
      registration.loaded = false
      registration.instance = undefined
      this.loadedPlugins.delete(name)
      
      this.emit('plugin:unloaded', { name })
    } catch (error) {
      console.error(`Failed to unload plugin "${name}":`, error)
      this.emit('plugin:error', { name, error })
    }
  }
  
  /**
   * 启用插件
   */
  async enable(name: string): Promise<void> {
    const registration = this.registry.get(name)
    
    if (!registration) {
      console.error(`Plugin "${name}" not found`)
      return
    }
    
    registration.config.enabled = true
    this.emit('plugin:enabled', { name })
    
    // 如果不是懒加载，立即加载
    if (!registration.config.lazy) {
      await this.load(name)
    }
  }
  
  /**
   * 禁用插件
   */
  async disable(name: string): Promise<void> {
    const registration = this.registry.get(name)
    
    if (!registration) {
      console.error(`Plugin "${name}" not found`)
      return
    }
    
    registration.config.enabled = false
    
    // 如果已加载，卸载它
    if (registration.loaded) {
      await this.unload(name)
    }
    
    this.emit('plugin:disabled', { name })
  }
  
  /**
   * 更新插件配置
   */
  updateConfig(name: string, config: Partial<PluginConfig>): void {
    const registration = this.registry.get(name)
    
    if (!registration) {
      console.error(`Plugin "${name}" not found`)
      return
    }
    
    Object.assign(registration.config, config)
    
    // 如果插件已加载，更新实例配置
    if (registration.instance && registration.instance.config) {
      Object.assign(registration.instance.config, config.config || {})
    }
    
    this.emit('plugin:config-updated', { name, config })
  }
  
  /**
   * 获取插件配置
   */
  getConfig(name: string): PluginConfig | null {
    return this.registry.get(name)?.config || null
  }
  
  /**
   * 获取插件元数据
   */
  getMetadata(name: string): PluginMetadata | null {
    return this.registry.get(name)?.metadata || null
  }
  
  /**
   * 获取插件实例
   */
  getInstance(name: string): Plugin | null {
    return this.registry.get(name)?.instance || null
  }
  
  /**
   * 检查插件是否已注册
   */
  isRegistered(name: string): boolean {
    return this.registry.has(name)
  }
  
  /**
   * 检查插件是否已加载
   */
  isLoaded(name: string): boolean {
    return this.loadedPlugins.has(name)
  }
  
  /**
   * 检查插件是否已启用
   */
  isEnabled(name: string): boolean {
    return this.registry.get(name)?.config.enabled || false
  }
  
  /**
   * 获取所有注册的插件名称
   */
  getRegistered(): string[] {
    return Array.from(this.registry.keys())
  }
  
  /**
   * 获取所有已加载的插件名称
   */
  getLoaded(): string[] {
    return Array.from(this.loadedPlugins)
  }
  
  /**
   * 获取所有启用的插件名称
   */
  getEnabled(): string[] {
    return Array.from(this.registry.entries())
      .filter(([_, reg]) => reg.config.enabled)
      .map(([name]) => name)
  }
  
  /**
   * 按分类获取插件
   */
  getByCategory(category: PluginCategory): string[] {
    return Array.from(this.registry.entries())
      .filter(([_, reg]) => reg.metadata.category === category)
      .map(([name]) => name)
  }
  
  /**
   * 获取插件统计信息
   */
  getStats(): {
    total: number
    loaded: number
    enabled: number
    disabled: number
    errors: number
  } {
    const registrations = Array.from(this.registry.values())
    
    return {
      total: registrations.length,
      loaded: this.loadedPlugins.size,
      enabled: registrations.filter(r => r.config.enabled).length,
      disabled: registrations.filter(r => !r.config.enabled).length,
      errors: registrations.filter(r => r.error).length
    }
  }
  
  /**
   * 导出配置
   */
  exportConfig(): Record<string, Partial<PluginConfig>> {
    const config: Record<string, Partial<PluginConfig>> = {}
    
    this.registry.forEach((reg, name) => {
      config[name] = {
        enabled: reg.config.enabled,
        priority: reg.config.priority,
        lazy: reg.config.lazy,
        config: reg.config.config
      }
    })
    
    return config
  }
  
  /**
   * 导入配置
   */
  importConfig(config: Record<string, Partial<PluginConfig>>): void {
    Object.entries(config).forEach(([name, pluginConfig]) => {
      if (this.registry.has(name)) {
        this.updateConfig(name, pluginConfig)
      }
    })
    
    this.emit('plugins:config-imported', config)
  }
  
  /**
   * 重置所有配置
   */
  reset(): void {
    this.registry.forEach((reg) => {
      reg.config.enabled = true
      reg.config.priority = 0
      reg.config.lazy = false
      reg.config.config = {}
    })
    
    this.emit('plugins:reset')
  }
  
  /**
   * 清理所有插件
   */
  async destroy(): Promise<void> {
    const loaded = Array.from(this.loadedPlugins)
    
    for (const name of loaded) {
      await this.unload(name)
    }
    
    this.registry.clear()
    this.loadedPlugins.clear()
    this.removeAllListeners()
  }
}

// 全局单例
let globalRegistry: PluginRegistry | null = null

/**
 * 获取全局插件注册中心
 */
export function getPluginRegistry(): PluginRegistry {
  if (!globalRegistry) {
    globalRegistry = new PluginRegistry()
  }
  return globalRegistry
}

/**
 * 重置全局插件注册中心
 */
export function resetPluginRegistry(): void {
  if (globalRegistry) {
    globalRegistry.destroy()
    globalRegistry = null
  }
}






