/**
 * 导出模块索引
 * 提供分类导出的统一入口
 *
 * 注意：此模块导出所有功能，会增加 bundle 大小
 * 建议在生产环境中使用具体的子模块导入
 */

// 工厂函数 - 按需导入
export * from '../factory'

// 可访问性 - 按需导入
export * from './accessibility'

// 高级功能 - 按需导入（仅导出类型）
export type * from './advanced'

// 颜色处理 - 按需导入
export * from './color-processing'

// 核心功能 - 总是需要的
export * from './core'

// CSS 集成 - 按需导入（仅导出类型）
export type * from './css-integration'

// 性能优化 - 按需导入（仅导出类型）
export type * from './performance'

// Vue 集成 - 按需导入（仅导出类型）
export type * from './vue'
