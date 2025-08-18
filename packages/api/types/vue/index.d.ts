import { ApiEngineConfig, ApiEngine } from '../types/index.js'
import { InjectionKey, App } from 'vue'

/**
 * Vue 插件选项
 */
interface ApiVuePluginOptions extends ApiEngineConfig {
  /** 全局属性名称 */
  globalPropertyName?: string
  /** 注入键名称 */
  injectionKey?: string | symbol
}
/**
 * API 引擎注入键
 */
declare const API_ENGINE_KEY: InjectionKey<ApiEngine>
/**
 * Vue 插件
 */
declare const apiVuePlugin: {
  install(app: App, options?: ApiVuePluginOptions): void
}
/**
 * 使用 API 引擎的组合式函数
 */
declare function useApi(
  injectionKey?: InjectionKey<ApiEngine> | string | symbol
): ApiEngine
/**
 * 创建 API 引擎提供者
 */
declare function createApiProvider(
  config?: ApiEngineConfig,
  injectionKey?: InjectionKey<ApiEngine> | string | symbol
): {
  apiEngine: ApiEngine
  provide: () => any
  use: () => ApiEngine
}

export { API_ENGINE_KEY, apiVuePlugin, createApiProvider, useApi }
export type { ApiVuePluginOptions }
