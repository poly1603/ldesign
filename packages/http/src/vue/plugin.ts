import type { App, Plugin } from 'vue'
import type { HttpClient, RequestConfig } from '../types'
import type { HttpPluginOptions } from '../types/vue'
import { provide, ref } from 'vue'
import { createAdapter } from '../adapters'
import { HttpClientImpl } from '../client'
import { HTTP_CLIENT_KEY, HTTP_CONFIG_KEY } from './useHttp'

/**
 * Vue 3 HTTP 插件
 */
export const HttpPlugin: Plugin = {
  install(app: App, options: unknown = {}) {
    const httpOptions = options as HttpPluginOptions
    // 创建或使用提供的 HTTP 客户端
    const client: HttpClient
      = httpOptions.client
        || new HttpClientImpl(httpOptions.globalConfig || {}, createAdapter())

    // 提供 HTTP 客户端到应用上下文
    app.provide(HTTP_CLIENT_KEY, client)
    if (httpOptions.globalConfig) {
      app.provide(HTTP_CONFIG_KEY, ref(httpOptions.globalConfig))
    }

    // 注册全局属性
    const globalProperty = httpOptions.globalProperty || '$http'
    ;(app.config.globalProperties as any)[globalProperty] = client

    // 提供全局方法
    app.provide('httpClient', client)

    // 注册全局组件（如果需要）
    // app.component('HttpProvider', HttpProvider)
  },
}

/**
 * 安装插件的便利函数
 */
export function install(app: App, options?: HttpPluginOptions): void {
  app.use(HttpPlugin, options)
}

/**
 * HTTP Provider 组件
 * 用于在组件树中提供 HTTP 客户端
 */
export const HttpProvider = {
  name: 'HttpProvider',
  props: {
    client: {
      type: Object as () => HttpClient,
      required: false,
    },
    config: {
      type: Object as () => RequestConfig,
      required: false,
    },
  },
  setup(
    props: { client?: HttpClient, config?: RequestConfig },
    { slots }: any,
  ) {
    // 使用提供的客户端或创建新的客户端
    const client
      = props.client || new HttpClientImpl(props.config || {}, createAdapter())

    // 提供客户端到子组件
    provide(HTTP_CLIENT_KEY, client)
    if (props.config) {
      provide(HTTP_CONFIG_KEY, ref(props.config))
    }

    return () => slots.default?.()
  },
}

/**
 * 创建 HTTP 插件实例
 */
export function createHttpPlugin(options: HttpPluginOptions = {}): Plugin {
  return {
    install(app: App) {
      HttpPlugin.install?.(app, options)
    },
  }
}

/**
 * 默认导出
 */
export default HttpPlugin

// 扩展 Vue 应用实例类型
declare module 'vue' {
  interface ComponentCustomProperties {
    $http: HttpClient
  }

  interface GlobalComponents {
    HttpProvider: typeof HttpProvider
  }
}
