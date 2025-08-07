/**
 * Vue 3 集成入口文件
 * 
 * 提供完整的 Vue 3 路由功能，包括：
 * - 路由器创建和配置
 * - Composition API Hooks
 * - 路由组件
 * - 导航守卫
 * - 类型定义
 */

// 重新导出所有功能，因为 router 本身就是为 Vue 设计的
export * from './src'

// 默认导出
export { default } from './src'
