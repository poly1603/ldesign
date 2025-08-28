/**
 * @ldesign/template 主入口文件
 * 高性能动态模板管理系统
 */

// 核心模块
export {
  DeviceAdapter,
  TemplateLoader,
  TemplateManager,
  TemplateScanner,
} from './core'

// 默认导出管理器
export { TemplateManager as default } from './core/manager'

// 服务层
export {
  CacheService,
  DeviceService,
} from './services'

// 类型定义
export type * from './types'

// 工具函数
export * from './utils'

// Vue 集成
export * from './vue'

// Engine 集成
export * from './engine'
