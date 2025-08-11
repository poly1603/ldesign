/**
 * LDesign App - 完整应用模板
 *
 * 🚀 基于 Vue 3 + TypeScript + LDesign 生态系统的现代化应用开发模板
 *
 * 特性：
 * - 🎨 现代化 UI 设计
 * - 🔧 完整的 Engine 集成
 * - 🛣️ 高性能路由系统
 * - 📱 响应式模板系统
 * - 🧪 完整的测试覆盖
 * - 📚 详细的文档
 *
 * @packageDocumentation
 */

// ============ 核心应用组件 ============
export { default as App } from './App'

// ============ 组件库 ============
export * from './components'
// ============ 应用启动函数 ============
export { default as createApp } from './main'
// ============ 路由配置 ============
export { routes } from './router/routes'
// ============ 样式 ============
export * from './styles'
// ============ 类型定义 ============
export * from './types'
// ============ 工具函数 ============
export * from './utils'
export { default as Dashboard } from './views/Dashboard'

export { default as Help } from './views/Help'

export { default as Home } from './views/Home'

// ============ 页面组件 ============
export { default as Login } from './views/Login'

export { default as Products } from './views/Products'

export { default as Profile } from './views/Profile'

export { default as Settings } from './views/Settings'
