/**
 * 基础插件类
 */

import type { 
  Plugin, 
  PluginMetadata, 
  PluginConfig, 
  PluginContext 
} from './plugin-interface'

/**
 * 基础插件抽象类
 */
export abstract class BasePlugin implements Plugin {
  public context?: PluginContext
  public config: PluginConfig = { enabled: true }
  private _installed = false

  constructor(
    public readonly metadata: PluginMetadata,
    config: PluginConfig = {}
  ) {
    this.config = { enabled: true, ...config }
  }

  /**
   * 插件是否已安装
   */
  get installed(): boolean {
    return this._installed
  }

  /**
   * 插件是否已启用
   */
  get enabled(): boolean {
    return this.config.enabled === true
  }

  /**
   * 设置插件配置
   */
  setConfig(config: Partial<PluginConfig>): void {
    this.config = { ...this.config, ...config }
    this.onConfigChange?.(this.config)
  }

  /**
   * 获取插件配置
   */
  getConfig<T = any>(key?: string): T {
    if (!key) {
      return this.config as T
    }

    const keys = key.split('.')
    let value: any = this.config

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return undefined as T
      }
    }

    return value as T
  }

  /**
   * 验证插件配置
   */
  validateConfig(config: PluginConfig): boolean {
    if (!this.metadata.configSchema) {
      return true
    }

    // 简单的配置验证
    try {
      return this.validateConfigSchema(config, this.metadata.configSchema)
    } catch {
      return false
    }
  }

  /**
   * 配置验证辅助方法
   */
  private validateConfigSchema(config: any, schema: any): boolean {
    if (typeof schema !== 'object' || schema === null) {
      return true
    }

    for (const [key, schemaValue] of Object.entries(schema)) {
      const configValue = config[key]

      if (schemaValue && typeof schemaValue === 'object') {
        if ('required' in schemaValue && schemaValue.required && configValue === undefined) {
          return false
        }

        if ('type' in schemaValue && configValue !== undefined) {
          const expectedType = schemaValue.type
          const actualType = typeof configValue

          if (expectedType === 'array' && !Array.isArray(configValue)) {
            return false
          } else if (expectedType !== 'array' && actualType !== expectedType) {
            return false
          }
        }

        if ('properties' in schemaValue && configValue && typeof configValue === 'object') {
          if (!this.validateConfigSchema(configValue, schemaValue.properties)) {
            return false
          }
        }
      }
    }

    return true
  }

  /**
   * 安装钩子
   */
  install?(context: PluginContext): void | Promise<void>

  /**
   * 挂载前钩子
   */
  beforeMount?(context: PluginContext): void | Promise<void>

  /**
   * 挂载钩子
   */
  mounted?(context: PluginContext): void | Promise<void>

  /**
   * 更新前钩子
   */
  beforeUpdate?(context: PluginContext): void | Promise<void>

  /**
   * 更新钩子
   */
  updated?(context: PluginContext): void | Promise<void>

  /**
   * 卸载前钩子
   */
  beforeUnmount?(context: PluginContext): void | Promise<void>

  /**
   * 卸载钩子
   */
  uninstall?(context: PluginContext): void | Promise<void>

  /**
   * 配置变化回调
   */
  protected onConfigChange?(config: PluginConfig): void

  /**
   * 创建DOM元素辅助方法
   */
  protected createElement(tag: string, props?: Record<string, any>): HTMLElement {
    if (!this.context) {
      throw new Error('Plugin context is not available')
    }
    return this.context.createElement(tag, props)
  }

  /**
   * 添加样式辅助方法
   */
  protected addStyle(css: string): void {
    if (!this.context) {
      throw new Error('Plugin context is not available')
    }
    this.context.addStyle(css)
  }

  /**
   * 移除样式辅助方法
   */
  protected removeStyle(css: string): void {
    if (!this.context) {
      throw new Error('Plugin context is not available')
    }
    this.context.removeStyle(css)
  }

  /**
   * 发送事件辅助方法
   */
  protected emit(event: string, ...args: any[]): void {
    if (!this.context) {
      throw new Error('Plugin context is not available')
    }
    this.context.emit(event, ...args)
  }

  /**
   * 监听事件辅助方法
   */
  protected on(event: string, callback: (...args: any[]) => void): void {
    if (!this.context) {
      throw new Error('Plugin context is not available')
    }
    this.context.on(event, callback)
  }

  /**
   * 取消监听事件辅助方法
   */
  protected off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.context) {
      throw new Error('Plugin context is not available')
    }
    this.context.off(event, callback)
  }

  /**
   * 获取选中节点辅助方法
   */
  protected getSelectedNodes() {
    if (!this.context) {
      throw new Error('Plugin context is not available')
    }
    return this.context.getSelectedNodes()
  }

  /**
   * 获取所有节点辅助方法
   */
  protected getAllNodes() {
    if (!this.context) {
      throw new Error('Plugin context is not available')
    }
    return this.context.getAllNodes()
  }

  /**
   * 查找节点辅助方法
   */
  protected findNode(predicate: (node: any) => boolean) {
    if (!this.context) {
      throw new Error('Plugin context is not available')
    }
    return this.context.findNode(predicate)
  }

  /**
   * 查找多个节点辅助方法
   */
  protected findNodes(predicate: (node: any) => boolean) {
    if (!this.context) {
      throw new Error('Plugin context is not available')
    }
    return this.context.findNodes(predicate)
  }

  /**
   * 获取树容器辅助方法
   */
  protected getContainer(): HTMLElement {
    if (!this.context) {
      throw new Error('Plugin context is not available')
    }
    return (this.context as any).getContainer()
  }

  /**
   * 获取节点元素辅助方法
   */
  protected getNodeElement(nodeId: string): HTMLElement | null {
    if (!this.context) {
      throw new Error('Plugin context is not available')
    }
    return (this.context as any).getNodeElement(nodeId)
  }

  /**
   * 日志辅助方法
   */
  protected log(message: string, ...args: any[]): void {
    console.log(`[${this.metadata.name}] ${message}`, ...args)
  }

  /**
   * 警告辅助方法
   */
  protected warn(message: string, ...args: any[]): void {
    console.warn(`[${this.metadata.name}] ${message}`, ...args)
  }

  /**
   * 错误辅助方法
   */
  protected error(message: string, ...args: any[]): void {
    console.error(`[${this.metadata.name}] ${message}`, ...args)
  }
}
