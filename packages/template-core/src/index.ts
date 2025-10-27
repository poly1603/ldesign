/**
 * @ldesign/template-core
 * 框架无关的核心模板管理系统
 */

// 导出类型
export * from './types'

// 导出管理器
export { TemplateManager } from './managers/TemplateManager'
export * from './managers'

// 导出缓存系统
export { SmartCache, createSmartCache } from './cache/SmartCache'
export type { SmartCacheOptions, CacheStats } from './cache/SmartCache'
export * from './cache'

// 导出版本管理
export * from './version'

// 导出测试工具
export * from './testing'

// 导出性能工具
export * from './performance'

// 导出错误处理
export * from './errors'

// 导出工具函数
export * from './utils'

// 版本号
export const VERSION = '1.0.0'

// 默认导出
export default {
  VERSION,
}
