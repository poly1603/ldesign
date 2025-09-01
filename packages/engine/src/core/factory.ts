/**
 * 引擎工厂函数
 * 提供创建引擎实例的便捷方法
 */

import type { Component } from 'vue'
import type { CreateEngineOptions, Engine } from '../types'
import { commonDirectives } from '../directives/directive-manager'
import { EngineImpl } from './engine'

/**
 * 创建Vue3应用引擎实例
 *
 * 🚀 这是引擎的核心创建函数，它会初始化所有必要的管理器和服务
 *
 * @param options 引擎配置选项
 * @returns 配置完整的引擎实例
 *
 * @example
 * ```typescript
 * const engine = createEngine({
 *   config: {
 *     app: { name: 'My App', version: '1.0.0' },
 *     debug: true,
 *     features: {
 *       enableHotReload: true,
 *       enableDevTools: true
 *     }
 *   },
 *   plugins: [myPlugin],
 *   middleware: [loggingMiddleware]
 * })
 * ```
 */
export function createEngine(options: CreateEngineOptions = {}): Engine {
  const {
    config = {},
    plugins = [],
    middleware = [],
    configSchema,
    enableAutoSave = false,
    autoSaveInterval = 30000,
    rootComponent,
    mountElement,
    autoMount = false,
  } = options

  // 创建引擎实例
  const engine = new EngineImpl(config)

  // 设置自定义配置Schema
  if (configSchema) {
    engine.config.setSchema(configSchema as any)
  }

  // 启用配置自动保存
  if (enableAutoSave) {
    engine.config.enableAutoSave(autoSaveInterval)
  }

  // 注册常用指令
  engine.directives.registerBatch(commonDirectives)

  // 注册中间件
  middleware.forEach(m => {
    engine.middleware.use(m)
  })

  // 注册插件（异步）
  const pluginPromise = Promise.all(plugins.map(plugin => engine.use(plugin))).catch(error => {
    engine.logger.error('Failed to register plugins', error)
  })

  // 如果提供了根组件，自动创建Vue应用
  if (rootComponent) {
    engine.createApp(rootComponent)

    // 如果启用自动挂载且提供了挂载元素
    if (autoMount && mountElement) {
      // 等待插件加载完成后再挂载
      pluginPromise.finally(() => {
        engine.mount(mountElement).catch(error => {
          engine.logger.error('Failed to auto-mount application', error)
        })
      })
    }
  }

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
  plugin: (name: string, install: any, options?: Record<string, unknown>) => ({
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
  middleware: (name: string, handler: any, priority?: number) => ({
    name,
    handler,
    priority,
  }),
}
