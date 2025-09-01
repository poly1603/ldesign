// 重新组织类型定义，按模块拆分
// 基础类型
export * from './base'
// 缓存管理类型
export * from './cache'
// 配置管理类型 - 包含所有配置相关类型
export * from './config'
// Dialog弹窗类型
export * from './dialog'
// 指令管理类型
export * from './directive'
// 核心引擎类型
export * from './engine'
// 环境管理类型
export * from './environment'
// 错误处理类型
export * from './error'
// 事件管理类型
export * from './event'
// 生命周期类型 - 排除重复的ValidationResult
export type {
  LifecycleEvent,
  LifecycleHook,
  LifecycleManager,
  LifecyclePhase,
} from './lifecycle'
// 日志管理类型
export * from './logger'
// 消息系统类型
export * from './message'
// 中间件类型
export * from './middleware'
// 通知管理类型 - 只导出非配置类型
export type {
  EngineNotification,
  NotificationAction,
  NotificationManager,
  NotificationOptions,
  NotificationProgress,
  NotificationStats,
} from './notification'
// 性能监控类型 - 只导出非配置类型
export type { PerformanceManager } from './performance'
// 插件系统类型
export * from './plugin'
// 安全管理类型 - 只导出非配置类型
export type { SecurityManager } from './security'
// 状态管理类型
export * from './state'
// 样式管理类型
export * from './style'

// 工具类型
export * from './utils'
// Vue集成类型
export * from './vue'
