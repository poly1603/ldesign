/**
 * 引擎工厂函数
 * 提供创建引擎实例的便捷方法
 */

import type { Component } from 'vue'
import type { ConfigSchema, CreateEngineOptions, Engine } from '../types'
import { commonDirectives } from '../directives/directive-manager'
import { EngineImpl } from './engine'

/**
 * 创建 Vue3 应用引擎实例
 *
 * 🚀 这是引擎的核心创建函数，它会初始化所有必要的管理器和服务。
 *
 * 功能特性：
 * - 📊 智能的管理器系统：自动管理依赖关系和初始化顺序
 * - 🔌 插件架构：支持动态加载和热更新
 * - 🚪 中间件支持：提供请求/响应处理管道
 * - 📊 性能监控：实时监控应用性能和资源使用
 * - 🔒 安全防护：内置 XSS、CSRF 等安全防护
 * - 💾 智能缓存：多级缓存策略和自动失效
 * - 🔔 通知系统：统一的通知和消息管理
 *
 * @param {CreateEngineOptions} options 引擎配置选项
 * @param {Record<string, unknown>} [options.config] 基本配置项
 * @param {Plugin[]} [options.plugins] 要注册的插件列表
 * @param {Middleware[]} [options.middleware] 要注册的中间件列表
 * @param {ConfigSchema} [options.configSchema] 自定义配置模式
 * @param {boolean} [options.enableAutoSave] 是否启用配置自动保存
 * @param {number} [options.autoSaveInterval] 自动保存间隔（毫秒）
 * @param {Component} [options.rootComponent] 根组件（提供时会自动创建Vue应用）
 * @param {string|Element} [options.mountElement] 挂载元素
 * @param {boolean} [options.autoMount] 是否自动挂载
 * @returns {Engine} 配置完整的引擎实例
 *
 * @example
 * 基本使用：
 * ```typescript
 * const engine = createEngine({
 *   config: {
 *     app: { name: 'My App', version: '1.0.0' },
 *     debug: true,
 *     features: {
 *       enableHotReload: true,
 *       enableDevTools: true
 *     }
 *   }
 * })
 * ```
 *
 * @example
 * 带插件和中间件：
 * ```typescript
 * const engine = createEngine({
 *   config: { debug: true },
 *   plugins: [routerPlugin, storePlugin],
 *   middleware: [authMiddleware, loggingMiddleware]
 * })
 * ```
 *
 * @example
 * 一步到位创建并挂载：
 * ```typescript
 * const engine = createEngine({
 *   rootComponent: App,
 *   mountElement: '#app',
 *   autoMount: true,
 *   config: { debug: true }
 * })
 * ```
 */
export function createEngine(options: CreateEngineOptions = {}): Engine {
  // 1. 解构配置参数，设置默认值
  const {
    config = {},
    plugins = [],
    middleware = [],
    configSchema,
    enableAutoSave = false,
    autoSaveInterval = 30000, // 30秒自动保存一次
    rootComponent,
    mountElement,
    autoMount = false,
  } = options

  // 2. 创建引擎核心实例，传入基础配置
  const engine = new EngineImpl(config)

  // 3. 配置高级特性
  // 3.1 设置自定义配置模式，用于配置验证和类型检查
  if (configSchema) {
    engine.config.setSchema(configSchema as ConfigSchema)
  }

  // 3.2 启用配置自动保存功能，防止配置丢失
  if (enableAutoSave) {
    engine.config.enableAutoSave(autoSaveInterval)
  }

  // 4. 注册内置组件
  // 4.1 注册常用的 Vue 指令（如 v-loading、v-copy 等）
  engine.directives.registerBatch(commonDirectives)

  // 5. 注册中间件系统
  // 中间件按顺序执行，可用于请求拦截、日志记录、认证检查等
  middleware.forEach(m => {
    engine.middleware.use(m)
  })

  // 6. 注册插件系统
  // 使用 Promise.all 并行加载所有插件
  const pluginPromise = Promise.all(plugins.map(plugin => engine.use(plugin)))

  // 7. 自动创建和挂载 Vue 应用（可选）
  if (rootComponent) {
    // 7.1 创建 Vue 应用实例并安装引擎
    engine.createApp(rootComponent)

    // 7.2 如果需要自动挂载并且指定了挂载元素
    if (autoMount && mountElement) {
      // 等待插件加载完成后再挂载，确保所有功能都可用
      pluginPromise.then(async () => {
        try {
          await engine.mount(mountElement)
        } catch (error) {
          engine.logger.error('Failed to mount application', error)
        }
      }).catch(error => {
        engine.logger.error('Plugin installation failed, cannot mount application', error)
      })
    }
  }

  // 8. 返回完整配置的引擎实例
  return engine
}

/**
 * 创建Vue3应用（简化版API）
 *
 * 🎯 这是一个便捷函数，它会自动创建引擎实例并创建Vue应用
 *
 * @param rootComponent 根组件
 * @param options 引擎配置选项
 * @returns 配置完整的引擎实例
 *
 * @example
 * ```typescript
 * const engine = createApp(App, {
 *   config: { debug: true },
 *   plugins: [routerPlugin, storePlugin]
 * })
 *
 * // 应用已经创建，可以直接挂载
 * engine.mount('#app')
 * ```
 */
export function createApp(
  rootComponent: Component,
  options: CreateEngineOptions = {}
): Engine {
  // 将根组件添加到选项中
  const enhancedOptions = {
    ...options,
    rootComponent,
  }

  // 创建引擎实例（会自动创建Vue应用）
  return createEngine(enhancedOptions)
}

/**
 * 创建并自动挂载Vue3应用（一步到位API）
 *
 * 🚀 这是最简化的API，一步完成应用创建、配置和挂载
 *
 * @param rootComponent 根组件
 * @param mountElement 挂载元素选择器或DOM元素
 * @param options 引擎配置选项
 * @returns 配置完整且已挂载的引擎实例
 *
 * @example
 * ```typescript
 * // 最简单的使用方式
 * const engine = createAndMountApp(App, '#app')
 *
 * // 带配置的使用方式
 * const engine = createAndMountApp(App, '#app', {
 *   config: { debug: true },
 *   plugins: [routerPlugin, storePlugin]
 * })
 * ```
 */
export function createAndMountApp(
  rootComponent: Component,
  mountElement: string | Element,
  options: CreateEngineOptions = {}
): Engine {
  // 创建引擎实例并自动挂载
  return createEngine({
    ...options,
    rootComponent,
    mountElement,
    autoMount: true,
  })
}

/**
 * 便捷创建器集合
 *
 * 🛠️ 提供创建插件和中间件的便捷方法
 */
export const creators = {
  /**
   * 创建插件
   *
   * @param name 插件名称
   * @param install 安装函数
   * @param options 其他选项
   * @returns 插件对象
   */
  plugin: (name: string, install: unknown, options?: Record<string, unknown>) => ({
    name,
    install,
    ...options,
  }),

  /**
   * 创建中间件
   *
   * @param name 中间件名称
   * @param handler 处理函数
   * @param priority 优先级
   * @returns 中间件对象
   */
  middleware: (name: string, handler: unknown, priority?: number) => ({
    name,
    handler,
    priority,
  }),
}
