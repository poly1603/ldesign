/**
 * LDesign App 入口文件
 *
 * 这是一个演示应用，展示了如何使用 LDesign Engine 和相关包
 */

// 导出主要的应用创建函数
export { default as createLDesignApp } from './main'

// 导出组件
export { default as App } from './App'

// 导出路由配置
export { routes } from './router/routes'

// 导出工具函数
export * from './utils'

// 导出类型定义
export * from './types'
