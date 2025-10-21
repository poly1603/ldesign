/**
 * @ldesign/launcher 类型定义
 * 
 * 导出所有类型定义，为 TypeScript 提供完整的类型支持
 * 
 * @author LDesign Team
 * @since 1.0.0
 */

// 导出所有类型定义
export * from './common'
export * from './config'
export * from './launcher'
export * from './plugin'
export * from './server'
export * from './build'
export * from './cli'

// 从 ui-config 中选择性导出，避免与 config.ts 中的 EnvironmentConfig 冲突
export type {
  UIConfigField,
  UIConfigSection,
  UIEnvironmentConfig,
  SUPPORTED_ENVIRONMENTS,
  getConfigFields,
  getEnvironmentConfig,
  getDefaultEnvironment,
  getEnvironmentConfigPath,
  getNestedValue,
  setNestedValue,
  validateConfigValue
} from './ui-config'

// 导出工具类型
export type { Logger } from '../utils/logger'
