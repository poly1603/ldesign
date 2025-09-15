/**
 * 版本控制功能模块导出
 */

// 导出类型定义
export type * from './types'

// 导出核心类
export { VersionManager } from './VersionManager'
export { BranchManager } from './BranchManager'
export { DiffEngine } from './DiffEngine'
export { VersionStorage } from './VersionStorage'
