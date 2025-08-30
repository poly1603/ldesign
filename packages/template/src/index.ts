/**
 * @ldesign/template 主入口文件
 * 高性能动态模板管理系统
 */

// 核心功能导出
export * from './core'

// Vue 集成导出
export * from './vue'

// 类型导出
export type * from './types'

// 默认导出模板管理器
export { TemplateManager as default } from './core/template-manager'
