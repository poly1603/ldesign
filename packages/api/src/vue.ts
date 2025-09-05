/**
 * Vue 专用导出文件
 * 提供 Vue 3 集成的所有功能
 */

// 重新导出核心功能（Vue 环境中也可能需要）
export {
  createApiEngine,
  createApiEngineByEnv,
  createApiEngineWithDefaults,
  createApiEngineWithPlugins,
  createDevelopmentApiEngine,
  createProductionApiEngine,
  createSingletonApiEngine,
  createTestApiEngine,
  destroySingletonApiEngine,
} from './core/factory'

export {
  createCustomSystemApiPlugin,
  systemApiPlugin,
} from './plugins/systemApi'

export { SYSTEM_API_METHODS } from './types'
// 重新导出 Vue 模块的所有内容
export * from './vue/index'

// 版本信息
export const version = '1.0.0'
