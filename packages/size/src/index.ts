// API 导出
export * from './api'
// 便捷导出
export { Size } from './api'

// 核心功能导出
export * from './core/animation-manager'
export * from './core/base-tokens'
export * from './core/cache-manager'
export * from './core/css-generator'
export * from './core/css-injector'
export * from './core/keyboard-manager'
export * from './core/performance-monitor'
export * from './core/preset-manager'
export * from './core/presets'
export * from './core/size-manager'
export * from './core/theme-manager'

// 默认导出
export { globalSizeManager as default } from './core/size-manager'

// 插件系统
export * from './plugins'

// 类型导出
export * from './types'

// 工具函数导出
export * from './utils'

// Vue 支持（主要的 Vue 支持已通过 plugins 导出）
// 这里不再导出以避免与 plugins/vue 冲突
