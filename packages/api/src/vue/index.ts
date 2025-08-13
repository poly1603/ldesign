import type { ApiEngine, ApiEngineConfig } from '../types'
import { type App, inject, type InjectionKey, provide } from 'vue'
import { createApiEngine } from '../core/api-engine'

/**
 * Vue 插件选项
 */
export interface ApiVuePluginOptions extends ApiEngineConfig {
  /** 全局属性名称 */
  globalPropertyName?: string
  /** 注入键名称 */
  injectionKey?: string | symbol
}

/**
 * API 引擎注入键
 */
export const API_ENGINE_KEY: InjectionKey<ApiEngine> = Symbol('api-engine')

/**
 * Vue 插件
 */
export const apiVuePlugin = {
  install(app: App, options: ApiVuePluginOptions = {}) {
    const {
      globalPropertyName = '$api',
      injectionKey = API_ENGINE_KEY,
      ...engineConfig
    } = options

    // 创建 API 引擎实例
    const apiEngine = createApiEngine(engineConfig)

    // 提供依赖注入
    app.provide(injectionKey, apiEngine)

    // 添加全局属性
    app.config.globalProperties[globalPropertyName] = apiEngine

    // 在应用卸载时清理资源
    const originalUnmount = app.unmount
    app.unmount = function () {
      apiEngine.destroy()
      originalUnmount.call(this)
    }
  },
}

/**
 * 使用 API 引擎的组合式函数
 */
export function useApi(
  injectionKey: string | symbol = API_ENGINE_KEY
): ApiEngine {
  const apiEngine = inject(injectionKey)
  if (!apiEngine) {
    throw new Error(
      'API Engine not found. Make sure you have installed the apiVuePlugin.'
    )
  }
  return apiEngine
}

/**
 * 创建 API 引擎提供者
 */
export function createApiProvider(
  config?: ApiEngineConfig,
  injectionKey: string | symbol = API_ENGINE_KEY
) {
  const apiEngine = createApiEngine(config)

  return {
    apiEngine,
    provide: () => provide(injectionKey, apiEngine),
    use: () => useApi(injectionKey),
  }
}
