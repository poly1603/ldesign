import type { App } from 'vue'
import type {
  IEngine,
  IPlugin,
  PluginInstaller,
  EngineConfig,
  EngineState,
  LifecyclePhase
} from '../types'
import { EventBus } from './event-bus'
import { Lifecycle } from './lifecycle'
import { createLogger } from '../utils'

/**
 * LDesign引擎核心实现
 */
export class Engine implements IEngine {
  public readonly version = '1.0.0'
  public app?: App
  public readonly eventBus = new EventBus()
  public readonly lifecycle = new Lifecycle()
  
  private readonly plugins = new Map<string, IPlugin>()
  private readonly logger = createLogger('Engine')
  private state: EngineState = EngineState.IDLE
  private config: EngineConfig

  constructor(config: EngineConfig = {}) {
    this.config = { debug: false, ...config }
    this.setupLogger()
    this.setupLifecycleHooks()
  }

  /**
   * 设置日志记录器
   */
  private setupLogger(): void {
    if (this.config.debug) {
      this.logger.setLevel('debug')
    }
  }

  /**
   * 设置生命周期钩子
   */
  private setupLifecycleHooks(): void {
    this.lifecycle.hook(LifecyclePhase.BEFORE_START, () => {
      this.logger.info('Engine is about to start')
      this.eventBus.emit('engine:before-start')
    })

    this.lifecycle.hook(LifecyclePhase.STARTED, () => {
      this.logger.info('Engine started successfully')
      this.eventBus.emit('engine:started')
    })

    this.lifecycle.hook(LifecyclePhase.BEFORE_STOP, () => {
      this.logger.info('Engine is about to stop')
      this.eventBus.emit('engine:before-stop')
    })

    this.lifecycle.hook(LifecyclePhase.STOPPED, () => {
      this.logger.info('Engine stopped')
      this.eventBus.emit('engine:stopped')
    })

    this.lifecycle.hook(LifecyclePhase.DESTROYED, () => {
      this.logger.info('Engine destroyed')
      this.eventBus.emit('engine:destroyed')
    })
  }

  /**
   * 安装插件
   */
  async use(plugin: IPlugin | PluginInstaller, options?: any): Promise<this> {
    try {
      let pluginInstance: IPlugin

      if (typeof plugin === 'function') {
        // 创建临时插件实例
        pluginInstance = {
          name: `anonymous-${Date.now()}`,
          version: '1.0.0',
          install: plugin
        }
      } else {
        pluginInstance = plugin
      }

      // 检查插件是否已安装
      if (this.plugins.has(pluginInstance.name)) {
        this.logger.warn(`Plugin ${pluginInstance.name} is already installed`)
        return this
      }

      // 检查依赖
      if (pluginInstance.dependencies) {
        for (const dep of pluginInstance.dependencies) {
          if (!this.plugins.has(dep)) {
            throw new Error(`Plugin ${pluginInstance.name} requires ${dep} but it's not installed`)
          }
        }
      }

      // 安装插件
      await pluginInstance.install(this, options)
      this.plugins.set(pluginInstance.name, pluginInstance)
      
      this.logger.info(`Plugin ${pluginInstance.name} installed successfully`)
      this.eventBus.emit('plugin:installed', pluginInstance)
      
      return this
    } catch (error) {
      this.logger.error('Failed to install plugin:', error)
      throw error
    }
  }

  /**
   * 卸载插件
   */
  async unuse(pluginName: string): Promise<this> {
    try {
      const plugin = this.plugins.get(pluginName)
      if (!plugin) {
        this.logger.warn(`Plugin ${pluginName} is not installed`)
        return this
      }

      // 检查是否有其他插件依赖此插件
      for (const [name, p] of this.plugins) {
        if (p.dependencies?.includes(pluginName)) {
          throw new Error(`Cannot uninstall ${pluginName} because ${name} depends on it`)
        }
      }

      // 卸载插件
      if (plugin.uninstall) {
        await plugin.uninstall(this)
      }
      
      this.plugins.delete(pluginName)
      this.logger.info(`Plugin ${pluginName} uninstalled successfully`)
      this.eventBus.emit('plugin:uninstalled', plugin)
      
      return this
    } catch (error) {
      this.logger.error('Failed to uninstall plugin:', error)
      throw error
    }
  }

  /**
   * 获取插件
   */
  getPlugin(name: string): IPlugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * 获取所有插件
   */
  getPlugins(): IPlugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 启动引擎
   */
  async start(): Promise<void> {
    if (this.state !== EngineState.IDLE) {
      throw new Error(`Cannot start engine in ${this.state} state`)
    }

    try {
      this.state = EngineState.STARTING
      
      await this.lifecycle.execute(LifecyclePhase.BEFORE_START)
      await this.lifecycle.execute(LifecyclePhase.STARTING)
      
      // 自动安装配置中的插件
      if (this.config.plugins) {
        for (const pluginConfig of this.config.plugins) {
          if (pluginConfig.enabled !== false) {
            await this.use(pluginConfig.plugin, pluginConfig.options)
          }
        }
      }
      
      this.state = EngineState.RUNNING
      await this.lifecycle.execute(LifecyclePhase.STARTED)
    } catch (error) {
      this.state = EngineState.IDLE
      throw error
    }
  }

  /**
   * 停止引擎
   */
  async stop(): Promise<void> {
    if (this.state !== EngineState.RUNNING) {
      throw new Error(`Cannot stop engine in ${this.state} state`)
    }

    try {
      this.state = EngineState.STOPPING
      
      await this.lifecycle.execute(LifecyclePhase.BEFORE_STOP)
      await this.lifecycle.execute(LifecyclePhase.STOPPING)
      
      this.state = EngineState.STOPPED
      await this.lifecycle.execute(LifecyclePhase.STOPPED)
    } catch (error) {
      this.state = EngineState.RUNNING
      throw error
    }
  }

  /**
   * 销毁引擎
   */
  async destroy(): Promise<void> {
    try {
      if (this.state === EngineState.RUNNING) {
        await this.stop()
      }
      
      await this.lifecycle.execute(LifecyclePhase.BEFORE_DESTROY)
      await this.lifecycle.execute(LifecyclePhase.DESTROYING)
      
      // 卸载所有插件
      const pluginNames = Array.from(this.plugins.keys())
      for (const name of pluginNames) {
        await this.unuse(name)
      }
      
      // 清理资源
      this.eventBus.clear()
      this.plugins.clear()
      
      this.state = EngineState.DESTROYED
      await this.lifecycle.execute(LifecyclePhase.DESTROYED)
    } catch (error) {
      this.logger.error('Failed to destroy engine:', error)
      throw error
    }
  }

  /**
   * 获取引擎状态
   */
  getState(): EngineState {
    return this.state
  }

  /**
   * 设置Vue应用实例
   */
  setApp(app: App): void {
    this.app = app
  }
}

/**
 * 创建引擎实例
 */
export function createEngine(config?: EngineConfig): Engine {
  return new Engine(config)
}

// 导出状态枚举
export { EngineState }