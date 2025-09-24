/**
 * @ldesign/form 表单组件库 - 核心API
 *
 * 框架无关的表单解决方案，支持多种前端框架。
 *
 * @author LDesign Team
 * @since 2.0.0
 */

// 导出核心工厂函数
export * from './core/factory'

// 导出核心类
export { FormCore } from './core/form-core'
export { DataManager } from './core/data-manager'
export { ValidationEngine } from './core/validation-engine'
export { FieldManager } from './core/field-manager'

// 导出适配器
export { BaseAdapter } from './adapters/base-adapter'
export { VanillaAdapter } from './adapters/vanilla-adapter'

// 导出工具函数
export * from './utils/helpers'
export * from './utils/validation'
export * from './utils/layout'

// 导出验证规则
export * from './utils/validation-rules'

// 导出类型定义
export * from './types'

// 版本信息
export const version = '2.0.0'
export const VERSION = version

// 默认导出
export default {
  version,
  VERSION
}
