/**
 * 插件管理器实现
 */

import type { Router } from '../types'
import type {
  IPluginManager,
  PluginContext,
  PluginInfo,
  PluginInstallOptions,
  PluginUninstallOptions,
  RouterPlugin,
} from './types'
import { PluginStatus } from './types'

/**
 * 事件发射器
 */
class EventEmitter {
  private events = new Map<string, Function[]>()

  on(event: string, handler: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(handler)
  }

  off(event: string, handler: Function): void {
    const handlers = this.events.get(event)
    if (handlers) {
      const index = handlers.indexOf(handler)
      if (index > -1) {
        handlers.splice(index, 1)
      }
    }
  }

  emit(event: string, ...args: any[]): void {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(...args)
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error)
        }
      })
    }
  }

  clear(): void {
    this.events.clear()
  }
}

/**
 * 插件管理器
 */
export class PluginManager extends EventEmitter implements IPluginManager {
  private router: Router
  private plugins = new Map<string, PluginInfo>()
  private context: PluginContext

  constructor(router: Router) {
    super()
    this.router = router
    this.context = this.createContext()
  }

  /**
   * 创建插件上下文
   */
  private createContext(): PluginContext {
    return {
      router: this.router,
      emit: this.emit.bind(this),
      on: this.on.bind(this),
      off: this.off.bind(this),
      getPlugin: this.get.bind(this),
      hasPlugin: this.has.bind(this),
    }
  }

  /**
   * 注册插件
   */
  register(plugin: RouterPlugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin "${plugin.name}" is already registered`)
    }

    this.plugins.set(plugin.name, {
      plugin,
      status: PluginStatus.NOT_INSTALLED,
      dependents: [],
    })
  }

  /**
   * 安装插件
   */
  async install(
    name: string,
    options?: any,
    installOptions: PluginInstallOptions = {}
  ): Promise<void> {
    const info = this.plugins.get(name)
    if (!info) {
      throw new Error(`Plugin "${name}" is not registered`)
    }

    if (info.status === PluginStatus.INSTALLED && !installOptions.force) {
      if (!installOptions.silent) {
        console.warn(`Plugin "${name}" is already installed`)
      }
      return
    }

    if (info.status === PluginStatus.INSTALLING) {
      throw new Error(`Plugin "${name}" is currently being installed`)
    }

    try {
      // 更新状态
      this.updatePluginStatus(name, PluginStatus.INSTALLING)
      this.emit('plugin:before-install', name, options)

      // 检查依赖
      if (!installOptions.skipDependencies) {
        await this.installDependencies(info.plugin, installOptions)
      }

      // 执行前置钩子
      if (info.plugin.beforeInstall) {
        const canInstall = await info.plugin.beforeInstall(
          this.context,
          options
        )
        if (canInstall === false) {
          throw new Error(
            `Plugin "${name}" installation was cancelled by beforeInstall hook`
          )
        }
      }

      // 安装插件
      await info.plugin.install(this.context, options)

      // 执行后置钩子
      if (info.plugin.afterInstall) {
        await info.plugin.afterInstall(this.context, options)
      }

      // 更新插件信息
      info.status = PluginStatus.INSTALLED
      info.installTime = Date.now()
      info.options = options
      delete info.error

      this.emit('plugin:after-install', name, options)

      if (!installOptions.silent) {
        console.log(`Plugin "${name}" installed successfully`)
      }
    } catch (error) {
      info.status = PluginStatus.ERROR
      info.error = error as Error
      this.emit('plugin:error', name, error as Error)

      if (!installOptions.silent) {
        console.error(`Failed to install plugin "${name}":`, error)
      }
      throw error
    }
  }

  /**
   * 卸载插件
   */
  async uninstall(
    name: string,
    uninstallOptions: PluginUninstallOptions = {}
  ): Promise<void> {
    const info = this.plugins.get(name)
    if (!info) {
      throw new Error(`Plugin "${name}" is not registered`)
    }

    if (info.status === PluginStatus.UNINSTALLING) {
      throw new Error(`Plugin "${name}" is currently being uninstalled`)
    }

    if (info.status !== PluginStatus.INSTALLED) {
      if (!uninstallOptions.silent) {
        console.warn(`Plugin "${name}" is not installed`)
      }
      return
    }

    try {
      // 检查依赖
      if (!uninstallOptions.force) {
        const dependents = this.getDependents(name)
        if (dependents.length > 0) {
          if (uninstallOptions.cascade) {
            // 级联卸载依赖插件
            for (const dependent of dependents) {
              await this.uninstall(dependent, uninstallOptions)
            }
          } else {
            throw new Error(
              `Cannot uninstall plugin "${name}" because it has dependents: ${dependents.join(
                ', '
              )}`
            )
          }
        }
      }

      // 更新状态
      this.updatePluginStatus(name, PluginStatus.UNINSTALLING)
      this.emit('plugin:before-uninstall', name)

      // 执行前置钩子
      if (info.plugin.beforeUninstall) {
        const canUninstall = await info.plugin.beforeUninstall(this.context)
        if (canUninstall === false) {
          throw new Error(
            `Plugin "${name}" uninstallation was cancelled by beforeUninstall hook`
          )
        }
      }

      // 卸载插件
      if (info.plugin.uninstall) {
        await info.plugin.uninstall(this.context)
      }

      // 执行后置钩子
      if (info.plugin.afterUninstall) {
        await info.plugin.afterUninstall(this.context)
      }

      // 更新插件信息
      info.status = PluginStatus.NOT_INSTALLED
      delete info.installTime
      info.options = undefined
      delete info.error

      this.emit('plugin:after-uninstall', name)

      if (!uninstallOptions.silent) {
        console.log(`Plugin "${name}" uninstalled successfully`)
      }
    } catch (error) {
      info.status = PluginStatus.ERROR
      info.error = error as Error
      this.emit('plugin:error', name, error as Error)

      if (!uninstallOptions.silent) {
        console.error(`Failed to uninstall plugin "${name}":`, error)
      }
      throw error
    }
  }

  /**
   * 安装依赖
   */
  private async installDependencies(
    plugin: RouterPlugin,
    installOptions: PluginInstallOptions
  ): Promise<void> {
    if (!plugin.dependencies || plugin.dependencies.length === 0) {
      return
    }

    const missingDependencies = plugin.dependencies.filter(
      dep => !this.has(dep)
    )
    if (missingDependencies.length > 0) {
      throw new Error(
        `Plugin "${
          plugin.name
        }" has missing dependencies: ${missingDependencies.join(', ')}`
      )
    }

    // 安装未安装的依赖
    for (const dep of plugin.dependencies) {
      const depInfo = this.plugins.get(dep)
      if (depInfo && depInfo.status !== PluginStatus.INSTALLED) {
        await this.install(dep, undefined, installOptions)
      }

      // 添加到依赖列表
      if (depInfo) {
        if (!depInfo.dependents) {
          depInfo.dependents = []
        }
        if (!depInfo.dependents.includes(plugin.name)) {
          depInfo.dependents.push(plugin.name)
        }
      }
    }
  }

  /**
   * 更新插件状态
   */
  private updatePluginStatus(name: string, status: PluginStatus): void {
    const info = this.plugins.get(name)
    if (info) {
      info.status = status
      this.emit('plugin:status-change', name, status)
    }
  }

  /**
   * 检查插件是否存在
   */
  has(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 获取插件
   */
  get(name: string): RouterPlugin | undefined {
    return this.plugins.get(name)?.plugin
  }

  /**
   * 获取插件信息
   */
  getInfo(name: string): PluginInfo | undefined {
    return this.plugins.get(name)
  }

  /**
   * 获取所有插件
   */
  getAll(): RouterPlugin[] {
    return Array.from(this.plugins.values()).map(info => info.plugin)
  }

  /**
   * 获取所有插件信息
   */
  getAllInfo(): PluginInfo[] {
    return Array.from(this.plugins.values())
  }

  /**
   * 获取已安装的插件
   */
  getInstalled(): RouterPlugin[] {
    return Array.from(this.plugins.values())
      .filter(info => info.status === PluginStatus.INSTALLED)
      .map(info => info.plugin)
  }

  /**
   * 检查依赖
   */
  checkDependencies(name: string): string[] {
    const info = this.plugins.get(name)
    if (!info || !info.plugin.dependencies) {
      return []
    }

    return info.plugin.dependencies.filter(dep => !this.has(dep))
  }

  /**
   * 获取依赖此插件的其他插件
   */
  getDependents(name: string): string[] {
    const info = this.plugins.get(name)
    return info?.dependents || []
  }

  /**
   * 清除所有插件
   */
  clear(): void {
    this.plugins.clear()
    super.clear()
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    // 卸载所有已安装的插件
    const installed = this.getInstalled()
    for (const plugin of installed) {
      try {
        this.uninstall(plugin.name, { silent: true })
      } catch (error) {
        console.error(
          `Error uninstalling plugin "${plugin.name}" during destroy:`,
          error
        )
      }
    }

    this.clear()
  }
}

/**
 * 创建插件管理器
 */
export function createPluginManager(router: Router): PluginManager {
  return new PluginManager(router)
}
