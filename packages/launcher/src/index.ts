/**
 * @ldesign/launcher - 基于 Vite JavaScript API 的前端项目启动器
 * 
 * 提供统一的开发服务器、构建工具和预览服务，支持多种前端技术栈
 * 
 * @author LDesign Team
 * @version 1.0.0
 * @since 1.0.0
 */

// 导出核心类
export { ViteLauncher } from './core/ViteLauncher'
export { ConfigManager } from './core/ConfigManager'
// export { PluginManager } from './core/PluginManager' // 暂时禁用，类型问题待修复

// 导出所有类型定义
export * from './types'

// 导出常量
export * from './constants'

// 导出工具函数 - 只导出特定的工具，避免冲突
export { Logger } from './utils/logger'
export { ErrorHandler, LauncherError } from './utils/error-handler'
export { FileSystem } from './utils/file-system'
export { PathUtils } from './utils/path-utils'

// 配置和构建工具 - 避免重复导出
export {
  loadConfigFile,
  validateConfig,
  mergeConfigs
} from './utils/config'

export {
  analyzeBuildResult,
  generateBuildReport
} from './utils/build'

export {
  getServerUrl
} from './utils/server'

export {
  validatePlugin
} from './utils/plugin'

export {
  validateObjectSchema,
  batchValidate
} from './utils/validation'

export {
  formatDuration
} from './utils/format'

export {
  isValidUrl
} from './utils/server'

export {
  PerformanceMonitor
} from './utils/performance'

// 导出配置定义函数
export { defineConfig } from './utils/config'

// 导出版本信息
export const version = '1.0.0'

// 默认导出
export default {
  version,
  ViteLauncher: () => import('./core/ViteLauncher').then(m => m.ViteLauncher),
  ConfigManager: () => import('./core/ConfigManager').then(m => m.ConfigManager),
  PluginManager: () => import('./core/PluginManager').then(m => m.PluginManager),
  createCli: () => import('./cli').then(m => m.createCli)
}
