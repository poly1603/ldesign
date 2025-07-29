// Router工具包主入口文件
// 导出核心类和工具函数

export * from './types'
export * from './core/router'
export * from './utils'
export * from './plugin'

// 便捷导出
export { RouterPlugin as default } from './plugin'