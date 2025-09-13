/**
 * 插件管理器
 * 
 * 负责管理日历的插件系统：
 * - 插件注册和卸载
 * - 插件生命周期管理
 * - 插件依赖管理
 * - 插件API提供
 * - 插件事件处理
 */

import type {
  CalendarPlugin,
  IPluginManager,
  PluginEvent,
  PluginHooks
} from '../types/plugin'
import type { ICalendar } from '../types/calendar'

/**
 * 插件管理器类
 */
export class PluginManager implements IPluginManager {
  /** 已注册的插件 */
  private plugins: Map<string, CalendarPlugin> = new Map()

  /** 插件启用状态 */
  private enabledPlugins: Set<string> = new Set()

  /** 事件监听器 */
  private eventListeners: Map<string, Function[]> = new Map()

  /** 日历实例引用 */
  private calendar: ICalendar

  /**
   * 构造函数
   * @param calendar 日历实例
   */
  constructor(calendar: ICalendar) {
    this.calendar = calendar
  }

  /**
   * 注册插件
   * @param plugin 插件对象
   */
  register(plugin: CalendarPlugin): void {
    const { name } = plugin.metadata

    if (this.plugins.has(name)) {
      console.warn(`插件 ${name} 已经注册`)
      return
    }

    // 验证插件
    if (!this.validatePlugin(plugin)) {
      throw new Error(`插件 ${name} 验证失败`)
    }

    // 检查依赖
    if (!this.checkDependencies(plugin)) {
      throw new Error(`插件 ${name} 依赖检查失败`)
    }

    // 注册插件
    this.plugins.set(name, plugin)

    // 如果插件默认启用，则启用它
    if (plugin.options?.enabled !== false) {
      this.enable(name)
    }

    // 触发插件注册事件
    this.emitPluginEvent('register', name, plugin)
  }

  /**
   * 卸载插件
   * @param pluginName 插件名称
   */
  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      console.warn(`插件 ${pluginName} 不存在`)
      return
    }

    // 如果插件已启用，先禁用它
    if (this.isEnabled(pluginName)) {
      this.disable(pluginName)
    }

    // 卸载插件
    if (plugin.uninstall) {
      try {
        plugin.uninstall(this.calendar)
      } catch (error) {
        console.error(`插件 ${pluginName} 卸载失败:`, error)
      }
    }

    // 从注册表中移除
    this.plugins.delete(pluginName)

    // 触发插件卸载事件
    this.emitPluginEvent('unregister', pluginName, plugin)
  }

  /**
   * 启用插件
   * @param pluginName 插件名称
   */
  enable(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`插件 ${pluginName} 不存在`)
    }

    if (this.isEnabled(pluginName)) {
      console.warn(`插件 ${pluginName} 已经启用`)
      return
    }

    try {
      // 安装插件
      plugin.install(this.calendar, plugin.options)

      // 标记为已启用
      this.enabledPlugins.add(pluginName)

      // 触发插件启用事件
      this.emitPluginEvent('enable', pluginName, plugin)
    } catch (error) {
      console.error(`插件 ${pluginName} 启用失败:`, error)
      this.emitPluginEvent('error', pluginName, plugin, error as Error)
      throw error
    }
  }

  /**
   * 禁用插件
   * @param pluginName 插件名称
   */
  disable(pluginName: string): void {
    const plugin = this.plugins.get(pluginName)
    if (!plugin) {
      throw new Error(`插件 ${pluginName} 不存在`)
    }

    if (!this.isEnabled(pluginName)) {
      console.warn(`插件 ${pluginName} 未启用`)
      return
    }

    try {
      // 卸载插件
      if (plugin.uninstall) {
        plugin.uninstall(this.calendar)
      }

      // 标记为已禁用
      this.enabledPlugins.delete(pluginName)

      // 触发插件禁用事件
      this.emitPluginEvent('disable', pluginName, plugin)
    } catch (error) {
      console.error(`插件 ${pluginName} 禁用失败:`, error)
      this.emitPluginEvent('error', pluginName, plugin, error as Error)
      throw error
    }
  }

  /**
   * 获取插件
   * @param pluginName 插件名称
   */
  get(pluginName: string): CalendarPlugin | null {
    return this.plugins.get(pluginName) || null
  }

  /**
   * 获取所有插件
   */
  getAll(): CalendarPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 获取已启用的插件
   */
  getEnabled(): CalendarPlugin[] {
    return Array.from(this.enabledPlugins)
      .map(name => this.plugins.get(name))
      .filter(plugin => plugin !== undefined) as CalendarPlugin[]
  }

  /**
   * 检查插件是否存在
   * @param pluginName 插件名称
   */
  has(pluginName: string): boolean {
    return this.plugins.has(pluginName)
  }

  /**
   * 检查插件是否启用
   * @param pluginName 插件名称
   */
  isEnabled(pluginName: string): boolean {
    return this.enabledPlugins.has(pluginName)
  }

  /**
   * 执行插件钩子
   * @param hookName 钩子名称
   * @param args 参数
   */
  async executeHook(hookName: keyof PluginHooks, ...args: any[]): Promise<void> {
    const enabledPlugins = this.getEnabled()

    // 按优先级排序
    enabledPlugins.sort((a, b) => {
      const priorityA = a.options?.priority || 0
      const priorityB = b.options?.priority || 0
      return priorityB - priorityA // 高优先级先执行
    })

    // 执行钩子
    for (const plugin of enabledPlugins) {
      if (plugin.hooks && plugin.hooks[hookName]) {
        try {
          await (plugin.hooks[hookName] as any)(this.calendar, ...args)
        } catch (error) {
          console.error(`插件 ${plugin.metadata.name} 钩子 ${hookName} 执行失败:`, error)
          this.emitPluginEvent('error', plugin.metadata.name, plugin, error as Error)
        }
      }
    }
  }

  /**
   * 清空所有插件
   */
  clear(): void {
    // 禁用所有已启用的插件
    const enabledPluginNames = Array.from(this.enabledPlugins)
    enabledPluginNames.forEach(name => {
      try {
        this.disable(name)
      } catch (error) {
        console.error(`禁用插件 ${name} 失败:`, error)
      }
    })

    // 清空插件注册表
    this.plugins.clear()
    this.enabledPlugins.clear()
  }

  /**
   * 添加事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(listener)
  }

  /**
   * 移除事件监听器
   * @param event 事件名称
   * @param listener 监听器函数
   */
  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * 验证插件
   * @param plugin 插件对象
   */
  private validatePlugin(plugin: CalendarPlugin): boolean {
    // 检查必需的属性
    if (!plugin.metadata || !plugin.metadata.name || !plugin.metadata.version) {
      console.error('插件缺少必需的元数据')
      return false
    }

    if (typeof plugin.install !== 'function') {
      console.error('插件缺少 install 方法')
      return false
    }

    // 检查版本兼容性
    if (!this.checkVersionCompatibility(plugin)) {
      console.error('插件版本不兼容')
      return false
    }

    return true
  }

  /**
   * 检查插件依赖
   * @param plugin 插件对象
   */
  private checkDependencies(plugin: CalendarPlugin): boolean {
    const dependencies = plugin.options?.dependencies || []

    for (const dependency of dependencies) {
      if (!this.plugins.has(dependency)) {
        console.error(`插件 ${plugin.metadata.name} 依赖的插件 ${dependency} 不存在`)
        return false
      }
    }

    return true
  }

  /**
   * 检查版本兼容性
   * @param plugin 插件对象
   */
  private checkVersionCompatibility(_plugin: CalendarPlugin): boolean {
    // TODO: 实现版本兼容性检查
    // 这里需要获取当前日历的版本，并与插件要求的版本范围进行比较
    return true
  }

  /**
   * 触发插件事件
   * @param type 事件类型
   * @param pluginName 插件名称
   * @param plugin 插件对象
   * @param error 错误对象（可选）
   */
  private emitPluginEvent(
    type: PluginEvent['type'],
    pluginName: string,
    plugin: CalendarPlugin,
    error?: Error
  ): void {
    const event: PluginEvent = {
      type,
      pluginName,
      data: plugin,
      timestamp: Date.now(),
    }

    if (error) {
      event.error = error
    }

    // 触发通用插件事件
    this.emit('pluginEvent', event)

    // 触发特定类型的事件
    this.emit(`plugin${type.charAt(0).toUpperCase() + type.slice(1)}`, event)
  }

  /**
   * 触发事件
   * @param event 事件名称
   * @param args 参数
   */
  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args)
        } catch (error) {
          console.error(`插件事件监听器执行错误 (${event}):`, error)
        }
      })
    }
  }
}
