/**
 * 插件系统入口文件
 */

// 核心插件系统
export { PluginManagerImpl } from './core/plugin-manager'
export { PluginContextImpl } from './core/plugin-context'
export { BasePlugin } from './core/base-plugin'

// 别名导出
export { PluginManagerImpl as PluginManager } from './core/plugin-manager'
export { PluginContextImpl as PluginContext } from './core/plugin-context'

// 插件接口和类型
export type {
  Plugin,
  PluginManager as IPluginManager,
  PluginContext as IPluginContext,
  PluginLifecycle,
  PluginMetadata,
  PluginConfig,
  PluginFactory,
  PluginRegistrationOptions,
  PluginEvents,
  PluginInfo,
} from './core/plugin-interface'

export { PluginStatus } from './core/plugin-interface'

// 内置插件
export { ToolbarPlugin, createToolbarPlugin } from './built-in/toolbar'
export type { ToolbarPluginConfig, ToolbarTool } from './built-in/toolbar'

export { ContextMenuPlugin, createContextMenuPlugin } from './built-in/context-menu'
export type { ContextMenuPluginConfig, ContextMenuItem } from './built-in/context-menu'

// 插件工具函数
export const PluginUtils = {
  /**
   * 创建插件元数据
   */
  createMetadata(
    name: string,
    version: string,
    options: {
      description?: string
      author?: string
      dependencies?: string[]
      configSchema?: Record<string, any>
    } = {}
  ): PluginMetadata {
    return {
      name,
      version,
      description: options.description,
      author: options.author,
      dependencies: options.dependencies || [],
      configSchema: options.configSchema,
    }
  },

  /**
   * 验证插件元数据
   */
  validateMetadata(metadata: PluginMetadata): boolean {
    if (!metadata.name || typeof metadata.name !== 'string') {
      return false
    }

    if (!metadata.version || typeof metadata.version !== 'string') {
      return false
    }

    if (metadata.dependencies && !Array.isArray(metadata.dependencies)) {
      return false
    }

    return true
  },

  /**
   * 合并插件配置
   */
  mergeConfig(defaultConfig: PluginConfig, userConfig: PluginConfig): PluginConfig {
    return { ...defaultConfig, ...userConfig }
  },

  /**
   * 创建插件工厂函数
   */
  createFactory<T extends Plugin>(
    PluginClass: new (config?: PluginConfig) => T
  ): PluginFactory<T> {
    return (config?: PluginConfig) => new PluginClass(config)
  },
}

// 预定义插件集合
export const BuiltInPlugins = {
  /**
   * 工具栏插件
   */
  get toolbar() { return createToolbarPlugin },

  /**
   * 右键菜单插件
   */
  get contextMenu() { return createContextMenuPlugin },
}

// 插件注册助手
export class PluginRegistry {
  private static plugins = new Map<string, PluginFactory>()

  /**
   * 注册插件工厂
   */
  static register<T extends Plugin>(name: string, factory: PluginFactory<T>): void {
    this.plugins.set(name, factory)
  }

  /**
   * 获取插件工厂
   */
  static get<T extends Plugin>(name: string): PluginFactory<T> | undefined {
    return this.plugins.get(name) as PluginFactory<T> | undefined
  }

  /**
   * 创建插件实例
   */
  static create<T extends Plugin>(name: string, config?: PluginConfig): T | undefined {
    const factory = this.get<T>(name)
    return factory ? factory(config) : undefined
  }

  /**
   * 获取所有注册的插件名称
   */
  static getRegisteredNames(): string[] {
    return Array.from(this.plugins.keys())
  }

  /**
   * 检查插件是否已注册
   */
  static has(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * 取消注册插件
   */
  static unregister(name: string): boolean {
    return this.plugins.delete(name)
  }

  /**
   * 清空所有注册的插件
   */
  static clear(): void {
    this.plugins.clear()
  }
}

// 注册内置插件
PluginRegistry.register('toolbar', () => createToolbarPlugin())
PluginRegistry.register('context-menu', () => createContextMenuPlugin())

// 插件开发助手
export const PluginDev = {
  /**
   * 创建简单插件
   */
  createSimplePlugin(
    metadata: PluginMetadata,
    hooks: Partial<PluginLifecycle>,
    config: PluginConfig = {}
  ): Plugin {
    class SimplePlugin extends BasePlugin {
      constructor() {
        super(metadata, config)
      }
    }

    // 添加生命周期钩子
    Object.entries(hooks).forEach(([hook, fn]) => {
      if (fn) {
        (SimplePlugin.prototype as any)[hook] = fn
      }
    })

    return new SimplePlugin()
  },

  /**
   * 创建事件插件
   */
  createEventPlugin(
    metadata: PluginMetadata,
    events: Record<string, (context: PluginContext, ...args: any[]) => void>,
    config: PluginConfig = {}
  ): Plugin {
    return this.createSimplePlugin(
      metadata,
      {
        mounted(context) {
          Object.entries(events).forEach(([event, handler]) => {
            context.on(event, (...args) => handler(context, ...args))
          })
        },
      },
      config
    )
  },

  /**
   * 创建DOM插件
   */
  createDOMPlugin(
    metadata: PluginMetadata,
    createElement: (context: PluginContext) => HTMLElement,
    config: PluginConfig = {}
  ): Plugin {
    let element: HTMLElement | undefined

    return this.createSimplePlugin(
      metadata,
      {
        mounted(context) {
          element = createElement(context)
          const container = (context as any).getContainer()
          container.appendChild(element)
        },
        beforeUnmount(context) {
          if (element && element.parentNode) {
            element.parentNode.removeChild(element)
            element = undefined
          }
        },
      },
      config
    )
  },
}

// 默认导出
export default {
  PluginManager: PluginManagerImpl,
  PluginContext: PluginContextImpl,
  BasePlugin,
  BuiltInPlugins,
  PluginRegistry,
  PluginUtils,
  PluginDev,
}
