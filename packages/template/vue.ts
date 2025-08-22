/**
 * Vue 3 集成入口文件 - 重构版本
 *
 * 提供完整的 Vue 3 模板渲染功能，包括：
 * - 组合式函数
 * - 组件
 * - 插件
 * - 类型定义
 */

// 重新导出所有 Vue 相关功能
export * from './src/vue'

// 默认导出 Vue 插件
export { TemplatePlugin as default } from './src/vue/plugin'
