/**
 * @ldesign/config-editor 主入口文件
 * 
 * 导出可视化配置编辑器的核心功能
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

// 核心类导出
export { ConfigEditor } from './core/ConfigEditor'
export { LauncherConfigParser } from './core/parsers/LauncherConfigParser'
export { AppConfigParser } from './core/parsers/AppConfigParser'
export { PackageJsonParser } from './core/parsers/PackageJsonParser'

// 服务器相关导出
export { ConfigEditorServer } from './server/ConfigEditorServer'

// 工具函数导出
export * from './utils/fileSystem'
export * from './utils/configUtils'
export * from './utils/validation'

// 类型定义导出
export type * from './types/config'
export type * from './types/parser'
export type * from './types/server'
export type * from './types/common'

// 常量导出
export * from './constants/defaults'
export * from './constants/patterns'

/**
 * 版本信息
 */
export const VERSION = '1.0.0'

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  server: {
    port: 3002,
    host: 'localhost'
  },
  client: {
    port: 3001,
    host: 'localhost'
  }
} as const
