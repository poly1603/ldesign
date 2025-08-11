/**
 * Vue 3 集成入口文件
 *
 * 提供完整的 Vue 3 集成功能，包括：
 * - Composition API Hooks
 * - Vue 插件
 * - 组件和指令
 * - 类型定义
 */

// 重新导出所有 Vue 相关功能
export * from './src/vue'

// 默认导出插件
export { default } from './src/vue/plugin'
