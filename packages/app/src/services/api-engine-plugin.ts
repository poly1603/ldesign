import type { Plugin } from '@ldesign/engine'
import { createApiService, setGlobalApiService } from './api'

/**
 * API 引擎插件配置
 */
export interface ApiEnginePluginConfig {
  /** 插件名称 */
  name?: string
  /** 插件版本 */
  version?: string
  /** 全局属性名称 */
  globalPropertyName?: string
  /** 是否启用系统接口 */
  enableSystemApis?: boolean
}

/**
 * 创建 API 引擎插件
 * @param config 插件配置
 * @returns API 引擎插件
 */
export function createApiEnginePlugin(
  config: ApiEnginePluginConfig = {}
): Plugin {
  const {
    name = 'api',
    version = '1.0.0',
    globalPropertyName = '$api',
  } = config

  return {
    name,
    version,
    async install(engine: any) {
      try {
        // 获取 HTTP 客户端
        const httpClient =
          (engine as any).httpClient ||
          engine.getApp()?.config.globalProperties.$http

        // 创建 API 服务实例
        const apiService = createApiService(httpClient)

        // 设置全局 API 服务
        setGlobalApiService(apiService)

        // 注册到引擎状态管理器
        engine.state.set('apiService', apiService)

        // 添加到全局属性
        const vueApp = engine.getApp()
        if (vueApp && globalPropertyName) {
          vueApp.config.globalProperties[globalPropertyName] = apiService
        }

        // 添加到引擎实例
        ;(engine as any).apiService = apiService

        console.log(`✅ API 引擎插件 ${name}@${version} 安装成功`)
      } catch (error) {
        console.error(`❌ API 引擎插件 ${name} 安装失败:`, error)
        throw error
      }
    },

    async uninstall(engine: any) {
      try {
        // 清理全局属性
        const vueApp = engine.getApp()
        if (vueApp && globalPropertyName) {
          delete vueApp.config.globalProperties[globalPropertyName]
        }

        // 清理引擎实例
        delete (engine as any).apiService

        console.log(`✅ API 引擎插件 ${name} 卸载成功`)
      } catch (error) {
        console.error(`❌ API 引擎插件 ${name} 卸载失败:`, error)
        throw error
      }
    },
  }
}

/**
 * 获取 API 服务实例
 * @param engine LDesign 引擎实例
 * @returns API 服务实例
 */
export function getApiService(engine: any) {
  return engine.state.get('apiService') || engine.apiService
}
