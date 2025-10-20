/**
 * 工具函数统一导出
 */

// DOM操作工具（已合并）
export * from './dom'  // 主要DOM工具
export * from './DOMUtils'  // 向后兼容

// 编辑器操作工具
export * from './EditorUtils'
export * from './EditorHelper'

// 字符串处理工具
export * from './StringUtils'

// 样式常量和工具
export * from './StyleConstants'

// 位置和坐标
export * from './position'

// 颜色处理
export * from './color'

// 事件处理
export * from './event'

// 性能优化工具 ⭐新增
export * from './performance'

// 日志工具 ⭐新增
export * from './logger'

// 错误处理 ⭐新增
export * from './error-handler'

// 图标工具（向后兼容，实际使用ui/icons）
export * from './icons'
