/**
 * 生命周期管理类型定义
 * 包含生命周期钩子、管理器等相关类型
 */

// 生命周期阶段
export type LifecyclePhase =
  | 'initialization'
  | 'configuration'
  | 'startup'
  | 'running'
  | 'shutdown'
  | 'cleanup'
  | 'beforeInit'
  | 'init'
  | 'afterInit'
  | 'beforeMount'
  | 'mount'
  | 'afterMount'
  | 'beforeUnmount'
  | 'unmount'
  | 'afterUnmount'
  | 'beforeDestroy'
  | 'destroy'
  | 'afterDestroy'
  | 'error'
  | 'test-phase'

// 生命周期状态
export type LifecycleStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'failed'
  | 'cancelled'

// 生命周期钩子
export interface LifecycleHook {
  name: string
  phase: LifecyclePhase
  priority: number
  handler: () => void | Promise<void>
  condition?: () => boolean
  timeout?: number
  retryCount?: number
  retryDelay?: number
  metadata?: Record<string, unknown>
}

// 生命周期事件
export interface LifecycleEvent {
  type: string
  phase: LifecyclePhase
  status: LifecycleStatus
  timestamp: number
  duration?: number
  error?: Error
  metadata?: Record<string, unknown>
}

// 生命周期管理器接口
export interface LifecycleManager {
  register: (hook: LifecycleHook) => void
  unregister: (name: string) => void
  get: (name: string) => LifecycleHook | undefined
  getAll: () => LifecycleHook[]
  getByPhase: (phase: LifecyclePhase) => LifecycleHook[]
  execute: (phase: LifecyclePhase, context?: unknown) => Promise<void>
  executeAll: () => Promise<void>
  getStatus: () => LifecycleStatus
  getCurrentPhase: () => LifecyclePhase
  getEvents: () => LifecycleEvent[]
  reset: () => void
  on: (phase: LifecyclePhase, callback: () => void) => void
}

// 验证结果类型
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

// 生命周期管道接口
export interface LifecyclePipeline {
  add: (hook: LifecycleHook) => void
  remove: (name: string) => void
  execute: (phase: LifecyclePhase) => Promise<void>
  getHooks: (phase: LifecyclePhase) => LifecycleHook[]
  getOrder: (phase: LifecyclePhase) => string[]
  validate: () => ValidationResult
  optimize: () => void
}

// 生命周期验证器接口
export interface LifecycleValidator {
  validate: (hook: LifecycleHook) => ValidationResult
  validatePhase: (phase: LifecyclePhase) => ValidationResult
  validatePipeline: (pipeline: LifecyclePipeline) => ValidationResult
  getSchema: () => unknown
  setSchema: (schema: unknown) => void
}

// 生命周期监控器接口
export interface LifecycleMonitor {
  start: (phase: LifecyclePhase) => void
  end: (phase: LifecyclePhase) => void
  getMetrics: () => LifecycleMetrics
  getEvents: () => LifecycleEvent[]
  clear: () => void
  export: () => LifecycleReport
}

// 生命周期指标
export interface LifecycleMetrics {
  phases: Record<LifecyclePhase, PhaseMetrics>
  totalDuration: number
  averageDuration: number
  successRate: number
  errorRate: number
  totalHooks: number
  activeHooks: number
}

// 阶段指标
export interface PhaseMetrics {
  duration: number
  hookCount: number
  successCount: number
  errorCount: number
  averageHookDuration: number
  status: LifecycleStatus
}

// 生命周期报告
export interface LifecycleReport {
  summary: LifecycleSummary
  details: LifecycleDetails
  recommendations: string[]
  timestamp: number
}

// 生命周期摘要
export interface LifecycleSummary {
  totalPhases: number
  completedPhases: number
  failedPhases: number
  totalDuration: number
  averagePhaseDuration: number
  overallStatus: LifecycleStatus
}

// 生命周期详情
export interface LifecycleDetails {
  phases: Array<{
    phase: LifecyclePhase
    status: LifecycleStatus
    duration: number
    hookCount: number
    errors: Error[]
  }>
  hooks: Array<{
    name: string
    phase: LifecyclePhase
    status: LifecycleStatus
    duration: number
    error?: Error
  }>
  events: LifecycleEvent[]
}

// 生命周期配置
export interface LifecycleConfig {
  enabled: boolean
  phases: LifecyclePhase[]
  defaultTimeout: number
  retryEnabled: boolean
  maxRetries: number
  retryDelay: number
  parallelExecution: boolean
  errorHandling: 'continue' | 'stop' | 'rollback'
  logging: boolean
  monitoring: boolean
}

// 生命周期错误处理器
export interface LifecycleErrorHandler {
  handle: (error: Error, phase: LifecyclePhase, hook?: LifecycleHook) => void
  shouldRetry: (error: Error, retryCount: number) => boolean
  getRetryDelay: (retryCount: number) => number
  getMaxRetries: (hook: LifecycleHook) => number
  rollback: (phase: LifecyclePhase) => Promise<void>
}

// 生命周期健康检查器
export interface LifecycleHealthChecker {
  check: () => LifecycleHealthStatus
  getHealthScore: () => number
  getIssues: () => LifecycleIssue[]
  getRecommendations: () => string[]
  isHealthy: () => boolean
}

// 生命周期健康状态
export interface LifecycleHealthStatus {
  score: number
  status: 'healthy' | 'warning' | 'critical'
  issues: LifecycleIssue[]
  recommendations: string[]
  lastCheck: number
}

// 生命周期问题
export interface LifecycleIssue {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  phase?: LifecyclePhase
  hook?: string
  timestamp: number
  metadata?: Record<string, unknown>
}
