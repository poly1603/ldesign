/**
 * @ldesign/engine-core
 * 
 * Framework-agnostic core engine for building modern applications
 */

// 核心引擎
export { CoreEngineImpl, createCoreEngine } from './core-engine'

// 适配器 (新增)
export * from './adapters'

// 管理器
export * from './plugin'
export * from './middleware'
export * from './lifecycle'
export * from './events'
export * from './state'
export * from './cache'
export * from './logger'
export * from './config'
export * from './di'

// 工具函数
export * from './utils'

// 错误类型
export * from './errors'

// 类型导出
export type * from './types'

// 版本
export const version = '0.2.0'

