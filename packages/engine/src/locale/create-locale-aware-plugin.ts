/**
 * createLocaleAwarePlugin - 插件包装工具
 * 
 * 将普通插件包装成支持自动语言同步的插件
 * 大幅减少样板代码，统一多语言管理
 */

import type { App } from 'vue'
import type { Engine } from '../types/engine'
import type { Plugin, PluginContext } from '../types/plugin'
import type { LocaleAwarePlugin } from './locale-manager'

/**
 * 创建支持语言同步的插件配置
 */
export interface CreateLocaleAwarePluginOptions {
  /**
   * 插件名称（唯一标识）
   * 用于在 LocaleManager 中注册
   */
  name: string

  /**
   * 是否同步语言
   * @default true
   */
  syncLocale?: boolean

  /**
   * 插件版本号
   * @default '1.0.0'
   */
  version?: string

  /**
   * 自定义安装逻辑
   * 在插件本身的 install 方法执行后调用
   */
  afterInstall?: (engine: Engine, app: App) => void | Promise<void>
}

/**
 * 创建支持自动语言同步的 Engine 插件
 * 
 * @param plugin 原始插件实例（必须实现 LocaleAwarePlugin 接口）
 * @param options 配置选项
 * @returns Engine Plugin
 * 
 * @example
 * ```typescript
 * // 1. 创建原始插件
 * const colorPlugin = createColorPlugin(options)
 * 
 * // 2. 包装成 Engine 插件（自动同步语言）
 * const colorEnginePlugin = createLocaleAwarePlugin(colorPlugin, {
 *   name: 'color',
 *   syncLocale: true
 * })
 * 
 * // 3. 在应用中使用
 * const engine = await createEngineApp({
 *   plugins: [colorEnginePlugin]
 * })
 * 
 * // 4. 语言自动同步到所有插件
 * engine.localeManager.setLocale('en-US')
 * ```
 */
export function createLocaleAwarePlugin<T extends LocaleAwarePlugin>(
  plugin: T,
  options: CreateLocaleAwarePluginOptions
): Plugin {
  const {
    name,
    syncLocale = true,
    version = '1.0.0',
    afterInstall
  } = options

  return {
    name: `${name}-locale-aware`,
    version,

    async install(context: PluginContext<Engine>) {
      const { engine } = context
      // 1. 安装原始插件  
      const app = (engine as any).app as App
      if (typeof (plugin as any).install === 'function') {
        (plugin as any).install(app)
        ;(engine as any).logger?.debug(`Plugin \"${name}\" installed`, { syncLocale })
      }

      // 2. 注册到 LocaleManager（如果启用同步且 LocaleManager 存在）
      // @deprecated - 保留用于兼容旧代码
      if (syncLocale && (engine as any).localeManager) {
        (engine as any).localeManager.register(name, plugin);
        (engine as any).logger?.debug(`Plugin "${name}" registered to LocaleManager`)
      }

      // 3. 存储插件实例到 engine.state（方便其他地方访问）
      if ((engine as any).state) {
        (engine as any).state.set(`plugins.${name}`, plugin)
      }

      // 4. 调用自定义安装后钩子
      if (afterInstall) {
        await afterInstall(engine, app)
      }

      (engine as any).logger?.info(`Locale-aware plugin "${name}" installed successfully`)
    }
  }
}

/**
 * 创建简化版的 LocaleAware Engine Plugin
 * 
 * 适用于简单场景，直接传入插件创建函数和选项
 * 
 * @example
 * ```typescript
 * export const createColorEnginePlugin = createSimpleLocaleAwarePlugin(
 *   createColorPlugin,
 *   'color'
 * )
 * 
 * // 使用
 * const plugin = createColorEnginePlugin({ defaultTheme: 'blue' })
 * ```
 */
export function createSimpleLocaleAwarePlugin<
  TOptions,
  TPlugin extends LocaleAwarePlugin
>(
  pluginFactory: (options: TOptions) => TPlugin,
  name: string
): (options?: TOptions) => Plugin {
  return (options?: TOptions) => {
    const plugin = pluginFactory(options as TOptions)
    return createLocaleAwarePlugin(plugin, { name })
  }
}
