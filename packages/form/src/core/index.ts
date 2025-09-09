/**
 * 核心模块入口文件
 *
 * 统一导出所有核心模块，方便外部使用
 *
 * @author LDesign Team
 * @since 2.0.0
 */

// 导出表单核心引擎
export { FormCore } from './form-core'

// 导出数据管理器
export { DataManager } from './data-manager'

// 导出状态管理器
export { StateManager } from './state-manager'

// 导出验证引擎
export { ValidationEngine } from './validation-engine'

// 导出字段管理器
export { FieldManager } from './field-manager'

// 导出工厂函数
export * from './factory'

// 保持向后兼容，导出现有模块
export * from './form'
export * from './field'
export * from './validation'
export * from './layout'
