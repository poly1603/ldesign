import type { IPlugin, IEngine } from '../types'
import { createLogger } from '../utils'

/**
 * 插件基类
 */
export abstract class BasePlugin implements IPlugin {
  public abstract readonly name: string
  public abstract readonly version: string
  public readonly description?: string
  public readonly dependencies?: string[]
  
  protected readonly logger = createLogger(this.constructor.name)
  protected engine?: IEngine

  /**
   * 插件安装方法
   */
  async install(engine: IEngine, options?: any): Promise<void> {
    this.engine = engine
    this.logger.info(`Installing plugin: ${this.name}`)
    
    try {
      await this.onInstall(engine, options)
      this.logger.info(`Plugin ${this.name} installed successfully`)
    } catch (error) {
      this.logger.error(`Failed to install plugin ${this.name}:`, error)
      throw error
    }
  }

  /**
   * 插件卸载方法
   */
  async uninstall(engine: IEngine): Promise<void> {
    this.logger.info(`Uninstalling plugin: ${this.name}`)
    
    try {
      await this.onUninstall(engine)
      this.engine = undefined
      this.logger.info(`Plugin ${this.name} uninstalled successfully`)
    } catch (error) {
      this.logger.error(`Failed to uninstall plugin ${this.name}:`, error)
      throw error
    }
  }

  /**
   * 插件安装时的具体实现
   */
  protected abstract onInstall(engine: IEngine, options?: any): void | Promise<void>

  /**
   * 插件卸载时的具体实现
   */
  protected onUninstall(engine: IEngine): void | Promise<void> {
    // 默认实现为空，子类可以重写
  }

  /**
   * 获取引擎实例
   */
  protected getEngine(): IEngine {
    if (!this.engine) {
      throw new Error(`Plugin ${this.name} is not installed`)
    }
    return this.engine
  }
}

/**
 * 创建简单插件
 */
export function createPlugin(
  name: string,
  version: string,
  installer: (engine: IEngine, options?: any) => void | Promise<void>,
  options?: {
    description?: string
    dependencies?: string[]
    uninstaller?: (engine: IEngine) => void | Promise<void>
  }
): IPlugin {
  return {
    name,
    version,
    description: options?.description,
    dependencies: options?.dependencies,
    install: installer,
    uninstall: options?.uninstaller
  }
}

/**
 * 插件装饰器
 */
export function Plugin(config: {
  name: string
  version: string
  description?: string
  dependencies?: string[]
}) {
  return function <T extends new (...args: any[]) => BasePlugin>(constructor: T): T {
    // 直接修改构造函数的原型
    Object.defineProperty(constructor.prototype, 'name', {
      value: config.name,
      writable: false,
      enumerable: true,
      configurable: false
    })
    Object.defineProperty(constructor.prototype, 'version', {
      value: config.version,
      writable: false,
      enumerable: true,
      configurable: false
    })
    if (config.description) {
      Object.defineProperty(constructor.prototype, 'description', {
        value: config.description,
        writable: false,
        enumerable: true,
        configurable: false
      })
    }
    if (config.dependencies) {
      Object.defineProperty(constructor.prototype, 'dependencies', {
        value: config.dependencies,
        writable: false,
        enumerable: true,
        configurable: false
      })
    }
    return constructor
  }
}

/**
 * 插件管理器
 */
export class PluginManager {
  private readonly plugins = new Map<string, IPlugin>()
  private readonly logger = createLogger('PluginManager')

  /**
   * 注册插件
   */
  register(plugin: IPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`)
    }
    
    this.plugins.set(plugin.name, plugin)
    this.logger.debug(`Registered plugin: ${plugin.name}`)
  }

  /**
   * 注销插件
   */
  unregister(name: string): void {
    if (!this.plugins.has(name)) {
      this.logger.warn(`Plugin ${name} is not registered`)
      return
    }
    
    this.plugins.delete(name)
    this.logger.debug(`Unregistered plugin: ${name}`)
  }

  /**
   * 获取插件
   */
  get(name: string): IPlugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * 获取所有插件
   */
  getAll(): IPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 检查插件是否已注册
   */
  has(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 清空所有插件
   */
  clear(): void {
    this.plugins.clear()
    this.logger.debug('Cleared all registered plugins')
  }

  /**
   * 解析插件依赖关系
   */
  resolveDependencies(plugins: IPlugin[]): IPlugin[] {
    const resolved: IPlugin[] = []
    const visited = new Set<string>()
    const visiting = new Set<string>()

    const visit = (plugin: IPlugin) => {
      if (visiting.has(plugin.name)) {
        throw new Error(`Circular dependency detected: ${plugin.name}`)
      }
      
      if (visited.has(plugin.name)) {
        return
      }

      visiting.add(plugin.name)

      // 先处理依赖
      if (plugin.dependencies) {
        for (const depName of plugin.dependencies) {
          const dep = plugins.find(p => p.name === depName)
          if (!dep) {
            throw new Error(`Dependency ${depName} not found for plugin ${plugin.name}`)
          }
          visit(dep)
        }
      }

      visiting.delete(plugin.name)
      visited.add(plugin.name)
      resolved.push(plugin)
    }

    for (const plugin of plugins) {
      visit(plugin)
    }

    return resolved
  }
}