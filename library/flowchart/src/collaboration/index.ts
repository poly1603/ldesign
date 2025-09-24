/**
 * 协作功能模块导出
 */

// 导出类型定义
export type * from './types'

// 导出核心类
export { CollaborationManager } from './CollaborationManager'
export { RealTimeSync } from './RealTimeSync'
export { ConflictResolver } from './ConflictResolver'
export { UserPresenceManager } from './UserPresence'

// 导出现有的协作相关类型（保持向后兼容）
export type {
  CollaborationUser,
  CollaborationOperation,
  CollaborationConflict,
  CollaborationConfig as LegacyCollaborationConfig
} from './CollaborationManager'
