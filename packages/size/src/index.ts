// 类型导出
export * from './types'

// 核心功能导出
export * from './core/presets'
export * from './core/css-generator'
export * from './core/css-injector'
export * from './core/size-manager'

// 工具函数导出
export * from './utils'

// Vue 支持（可选导入）
export * as Vue from './vue'

// 默认导出
export { globalSizeManager as default } from './core/size-manager'
