/**
 * 统一插件管理系统
 * 提供插件的注册、初始化、生命周期管理
 */

import type { App, Plugin } from 'vue'
import type { EnginePlugin } from '@ldesign/engine'

/**
 * 插件元数据
 */
export interface PluginMeta {
  name: string
  version?: string
  description?: string
  dependencies?: string[]
  priority?: number
  lazy?: boolean
}

/**
 * 插件接口
 */
export interface ManagedPlugin extends PluginMeta {
  install: (app: App, options?: any) => void | Promise<void>
  uninstall?: (app: App) => void
  configure?: (options: any) => void
  onBeforeMount?: () => void | Promise<void>
  onMounted?: () => void | Promise<void>
  onBeforeUnmount?: () => void
  onUnmounted?: () => void
  onError?: (error: Error) => void
}

/**
 * 插件状态
 */
export enum PluginState {
  PENDING = 'pending',
  LOADING = 'loading',
  LOADED = 'loaded',
  INSTALLING = 'installing',
  INSTALLED = 'installed',
  ERROR = 'error',
  UNINSTALLED = 'uninstalled'
}

/**
 * 插件注册项
 */
interface PluginEntry {
  plugin: ManagedPlugin
  state: PluginState
  options?: any
  error?: Error
  loadTime?: number
  installTime?: number
}

/**
 * 插件管理器
 */
export class PluginManager {
  private plugins = new Map<string, PluginEntry>()
  private app: App | null = null
  private loadOrder: string[] = []
  
  /**
   * 注册插件
   */
  register(plugin: ManagedPlugin, options?: any): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already registered`)
      return
    }
    
    this.plugins.set(plugin.name, {
      plugin,
      state: PluginState.PENDING,
      options
    })
    
    console.log(`✅ Plugin registered: ${plugin.name}`)
  }
  
  /**
   * 批量注册插件
   */
  registerMany(plugins: Array<{ plugin: ManagedPlugin; options?: any }>): void {
    plugins.forEach(({ plugin, options }) => {
      this.register(plugin, options)
    })
  }
  
  /**
   * 初始化插件系统
   */
  async initialize(app: App): Promise<void> {
    this.app = app
    
    // 排序插件（按优先级和依赖关系）
    this.sortPlugins()
    
    // 加载插件
    for (const name of this.loadOrder) {
      await this.loadPlugin(name)
    }
    
    // 安装插件
    for (const name of this.loadOrder) {
      await this.installPlugin(name)
    }
  }
  
  /**
   * 加载单个插件
   */
  private async loadPlugin(name: string): Promise<void> {
    const entry = this.plugins.get(name)
    if (!entry) return
    
    try {
      entry.state = PluginState.LOADING
      const startTime = performance.now()
      
      // 检查依赖
      if (entry.plugin.dependencies) {
        for (const dep of entry.plugin.dependencies) {
          if (!this.isPluginReady(dep)) {
            throw new Error(`Dependency ${dep} is not ready`)
          }
        }
      }
      
      // 配置插件
      if (entry.plugin.configure && entry.options) {
        entry.plugin.configure(entry.options)
      }
      
      entry.loadTime = performance.now() - startTime
      entry.state = PluginState.LOADED
      
      console.log(`⚡ Plugin loaded: ${name} (${entry.loadTime.toFixed(2)}ms)`)
    } catch (error) {
      entry.state = PluginState.ERROR
      entry.error = error as Error
      console.error(`❌ Failed to load plugin ${name}:`, error)
      throw error
    }
  }
  
  /**
   * 安装单个插件
   */
  private async installPlugin(name: string): Promise<void> {
    const entry = this.plugins.get(name)
    if (!entry || !this.app) return
    
    try {
      entry.state = PluginState.INSTALLING
      const startTime = performance.now()
      
      // 执行 onBeforeMount 钩子
      if (entry.plugin.onBeforeMount) {
        await entry.plugin.onBeforeMount()
      }
      
      // 安装插件
      await entry.plugin.install(this.app, entry.options)
      
      entry.installTime = performance.now() - startTime
      entry.state = PluginState.INSTALLED
      
      console.log(`✅ Plugin installed: ${name} (${entry.installTime.toFixed(2)}ms)`)
      
      // 执行 onMounted 钩子
      if (entry.plugin.onMounted) {
        await entry.plugin.onMounted()
      }
    } catch (error) {
      entry.state = PluginState.ERROR
      entry.error = error as Error
      
      // 执行错误处理钩子
      if (entry.plugin.onError) {
        entry.plugin.onError(error as Error)
      }
      
      console.error(`❌ Failed to install plugin ${name}:`, error)
      throw error
    }
  }
  
  /**
   * 排序插件（拓扑排序）
   */
  private sortPlugins(): void {
    const sorted: string[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()
    
    const visit = (name: string) => {
      if (visited.has(name)) return
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`)
      }
      
      visiting.add(name)
      
      const entry = this.plugins.get(name)
      if (entry?.plugin.dependencies) {
        for (const dep of entry.plugin.dependencies) {
          if (this.plugins.has(dep)) {
            visit(dep)
          }
        }
      }
      
      visiting.delete(name)
      visited.add(name)
      sorted.push(name)
    }
    
    // 先按优先级排序
    const entries = Array.from(this.plugins.entries())
      .sort(([, a], [, b]) => (b.plugin.priority || 0) - (a.plugin.priority || 0))
    
    // 然后进行拓扑排序
    for (const [name] of entries) {
      visit(name)
    }
    
    this.loadOrder = sorted
  }
  
  /**
   * 检查插件是否就绪
   */
  private isPluginReady(name: string): boolean {
    const entry = this.plugins.get(name)
    return entry ? entry.state === PluginState.INSTALLED : false
  }
  
  /**
   * 获取插件状态
   */
  getPluginState(name: string): PluginState | undefined {
    return this.plugins.get(name)?.state
  }
  
  /**
   * 获取所有插件状态
   */
  getAllPluginStates(): Record<string, PluginState> {
    const states: Record<string, PluginState> = {}
    this.plugins.forEach((entry, name) => {
      states[name] = entry.state
    })
    return states
  }
  
  /**
   * 卸载插件
   */
  async uninstall(name: string): Promise<void> {
    const entry = this.plugins.get(name)
    if (!entry || !this.app) return
    
    try {
      // 执行 onBeforeUnmount 钩子
      if (entry.plugin.onBeforeUnmount) {
        entry.plugin.onBeforeUnmount()
      }
      
      // 执行卸载
      if (entry.plugin.uninstall) {
        entry.plugin.uninstall(this.app)
      }
      
      // 执行 onUnmounted 钩子
      if (entry.plugin.onUnmounted) {
        entry.plugin.onUnmounted()
      }
      
      entry.state = PluginState.UNINSTALLED
      console.log(`🗑️ Plugin uninstalled: ${name}`)
    } catch (error) {
      console.error(`Failed to uninstall plugin ${name}:`, error)
      throw error
    }
  }
  
  /**
   * 获取性能报告
   */
  getPerformanceReport(): Record<string, any> {
    const report: Record<string, any> = {
      totalPlugins: this.plugins.size,
      loadOrder: this.loadOrder,
      plugins: {}
    }
    
    this.plugins.forEach((entry, name) => {
      report.plugins[name] = {
        state: entry.state,
        loadTime: entry.loadTime,
        installTime: entry.installTime,
        hasError: !!entry.error,
        error: entry.error?.message
      }
    })
    
    return report
  }
  
  /**
   * 清理
   */
  async cleanup(): Promise<void> {
    // 按照反向顺序卸载插件
    const reverseOrder = [...this.loadOrder].reverse()
    for (const name of reverseOrder) {
      await this.uninstall(name)
    }
    
    this.plugins.clear()
    this.loadOrder = []
    this.app = null
  }
}

// 创建全局插件管理器实例
export const pluginManager = new PluginManager()