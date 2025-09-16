/**
 * 插件管理器
 */

import type { 
  CalendarPlugin, 
  PluginContext, 
  PluginOptions, 
  PluginManagerInterface,
  PluginHooks,
  PluginState,
  PluginEvents
} from './types'
import type { Calendar } from '../core/Calendar'

/**
 * 插件管理器类
 */
export class PluginManager implements PluginManagerInterface {
  /** 日历实例 */
  private calendar: Calendar
  /** 插件状态映射 */
  private plugins: Map<string, PluginState> = new Map()
  /** 事件监听器 */
  private listeners: Map<keyof PluginEvents, Function[]> = new Map()
  /** 插件执行顺序 */
  private executionOrder: string[] = []

  constructor(calendar: Calendar) {
    this.calendar = calendar
  }

  /**
   * 注册插件
   */
  public register(plugin: CalendarPlugin, options: PluginOptions = {}): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`)
    }

    // 检查依赖
    this.checkDependencies(plugin)

    // 合并选项
    const finalOptions = {
      enabled: true,
      priority: 0,
      ...plugin.defaultOptions,
      ...options
    }

    // 创建插件上下文
    const context = this.createContext(plugin, finalOptions)

    // 创建插件状态
    const state: PluginState = {
      name: plugin.name,
      installed: false,
      enabled: finalOptions.enabled || false,
      options: finalOptions,
      instance: plugin,
      context,
      installedAt: new Date(),
      usageCount: 0
    }

    // 注册插件
    this.plugins.set(plugin.name, state)

    // 更新执行顺序
    this.updateExecutionOrder()

    try {
      // 执行安装前钩子
      if (plugin.beforeInstall) {
        plugin.beforeInstall(context)
      }

      // 安装插件
      plugin.install(context)
      state.installed = true

      // 执行安装后钩子
      if (plugin.afterInstall) {
        plugin.afterInstall(context)
      }

      // 初始化插件
      if (plugin.init && state.enabled) {
        plugin.init(context)
      }

      this.emit('plugin:register', plugin)
    } catch (error) {
      // 安装失败，清理状态
      this.plugins.delete(plugin.name)
      this.updateExecutionOrder()
      
      const pluginError = error instanceof Error ? error : new Error(String(error))
      this.emit('plugin:error', plugin.name, pluginError)
      throw new Error(`Failed to install plugin "${plugin.name}": ${pluginError.message}`)
    }
  }

  /**
   * 卸载插件
   */
  public unregister(name: string): void {
    const state = this.plugins.get(name)
    if (!state) {
      throw new Error(`Plugin "${name}" is not registered`)
    }

    try {
      // 执行卸载前钩子
      if (state.instance.beforeUninstall) {
        state.instance.beforeUninstall(state.context)
      }

      // 销毁插件
      if (state.instance.destroy) {
        state.instance.destroy(state.context)
      }

      // 卸载插件
      if (state.instance.uninstall) {
        state.instance.uninstall(state.context)
      }

      // 执行卸载后钩子
      if (state.instance.afterUninstall) {
        state.instance.afterUninstall(state.context)
      }

      // 移除插件
      this.plugins.delete(name)
      this.updateExecutionOrder()

      this.emit('plugin:unregister', name)
    } catch (error) {
      const pluginError = error instanceof Error ? error : new Error(String(error))
      state.error = pluginError
      this.emit('plugin:error', name, pluginError)
      throw new Error(`Failed to uninstall plugin "${name}": ${pluginError.message}`)
    }
  }

  /**
   * 启用插件
   */
  public enable(name: string): void {
    const state = this.plugins.get(name)
    if (!state) {
      throw new Error(`Plugin "${name}" is not registered`)
    }

    if (state.enabled) {
      return
    }

    try {
      state.enabled = true
      
      // 初始化插件
      if (state.instance.init) {
        state.instance.init(state.context)
      }

      this.emit('plugin:enable', name)
    } catch (error) {
      state.enabled = false
      const pluginError = error instanceof Error ? error : new Error(String(error))
      state.error = pluginError
      this.emit('plugin:error', name, pluginError)
      throw new Error(`Failed to enable plugin "${name}": ${pluginError.message}`)
    }
  }

  /**
   * 禁用插件
   */
  public disable(name: string): void {
    const state = this.plugins.get(name)
    if (!state) {
      throw new Error(`Plugin "${name}" is not registered`)
    }

    if (!state.enabled) {
      return
    }

    try {
      state.enabled = false
      
      // 销毁插件
      if (state.instance.destroy) {
        state.instance.destroy(state.context)
      }

      this.emit('plugin:disable', name)
    } catch (error) {
      const pluginError = error instanceof Error ? error : new Error(String(error))
      state.error = pluginError
      this.emit('plugin:error', name, pluginError)
      throw new Error(`Failed to disable plugin "${name}": ${pluginError.message}`)
    }
  }

  /**
   * 获取插件
   */
  public get(name: string): CalendarPlugin | null {
    const state = this.plugins.get(name)
    return state ? state.instance : null
  }

  /**
   * 获取所有插件
   */
  public getAll(): CalendarPlugin[] {
    return Array.from(this.plugins.values()).map(state => state.instance)
  }

  /**
   * 检查插件是否存在
   */
  public has(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 检查插件是否启用
   */
  public isEnabled(name: string): boolean {
    const state = this.plugins.get(name)
    return state ? state.enabled : false
  }

  /**
   * 执行插件钩子
   */
  public async executeHook(hook: keyof PluginHooks, ...args: any[]): Promise<void> {
    const promises: Promise<void>[] = []

    for (const name of this.executionOrder) {
      const state = this.plugins.get(name)
      if (!state || !state.enabled || !state.instance[hook]) {
        continue
      }

      try {
        state.usageCount++
        state.lastUsedAt = new Date()

        const result = state.instance[hook]!(state.context, ...args)
        if (result instanceof Promise) {
          promises.push(result)
        }
      } catch (error) {
        const pluginError = error instanceof Error ? error : new Error(String(error))
        state.error = pluginError
        this.emit('plugin:error', name, pluginError)
        console.error(`Error in plugin "${name}" hook "${hook}":`, pluginError)
      }
    }

    // 等待所有异步钩子完成
    if (promises.length > 0) {
      await Promise.allSettled(promises)
    }
  }

  /**
   * 获取插件状态
   */
  public getState(name: string): PluginState | null {
    return this.plugins.get(name) || null
  }

  /**
   * 获取所有插件状态
   */
  public getAllStates(): PluginState[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 事件监听
   */
  public on<K extends keyof PluginEvents>(event: K, handler: PluginEvents[K]): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(handler as Function)
  }

  /**
   * 移除事件监听
   */
  public off<K extends keyof PluginEvents>(event: K, handler?: PluginEvents[K]): void {
    if (!this.listeners.has(event)) return

    if (handler) {
      const handlers = this.listeners.get(event)!
      const index = handlers.indexOf(handler as Function)
      if (index >= 0) {
        handlers.splice(index, 1)
      }
    } else {
      this.listeners.delete(event)
    }
  }

  /**
   * 触发事件
   */
  private emit<K extends keyof PluginEvents>(event: K, ...args: Parameters<PluginEvents[K]>): void {
    if (!this.listeners.has(event)) return

    this.listeners.get(event)!.forEach(handler => {
      try {
        handler(...args)
      } catch (error) {
        console.error(`Error in plugin event handler for "${event}":`, error)
      }
    })
  }

  /**
   * 创建插件上下文
   */
  private createContext(plugin: CalendarPlugin, options: PluginOptions): PluginContext {
    return {
      calendar: this.calendar,
      options: options.config || {},
      state: {},
      emit: (event: string, ...args: any[]) => {
        this.calendar.emit(event, ...args)
      },
      on: (event: string, handler: Function) => {
        this.calendar.on(event, handler)
      },
      off: (event: string, handler?: Function) => {
        this.calendar.off(event, handler)
      }
    }
  }

  /**
   * 检查插件依赖
   */
  private checkDependencies(plugin: CalendarPlugin): void {
    if (!plugin.dependencies || plugin.dependencies.length === 0) {
      return
    }

    for (const dependency of plugin.dependencies) {
      if (!this.plugins.has(dependency)) {
        throw new Error(`Plugin "${plugin.name}" requires dependency "${dependency}" which is not installed`)
      }
    }
  }

  /**
   * 更新插件执行顺序
   */
  private updateExecutionOrder(): void {
    const plugins = Array.from(this.plugins.values())
    
    // 按优先级排序（优先级高的先执行）
    plugins.sort((a, b) => (b.options.priority || 0) - (a.options.priority || 0))
    
    this.executionOrder = plugins.map(state => state.name)
  }

  /**
   * 销毁插件管理器
   */
  public destroy(): void {
    // 卸载所有插件
    const pluginNames = Array.from(this.plugins.keys())
    for (const name of pluginNames) {
      try {
        this.unregister(name)
      } catch (error) {
        console.error(`Error unregistering plugin "${name}":`, error)
      }
    }

    // 清理状态
    this.plugins.clear()
    this.listeners.clear()
    this.executionOrder = []
  }
}
