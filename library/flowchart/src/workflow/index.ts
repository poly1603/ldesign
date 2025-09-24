/**
 * 工作流执行引擎模块导出
 */

// 导出类型定义
export type * from './types'

// 导出核心类
export { WorkflowEngine } from './WorkflowEngine'
export { ProcessInstanceManager } from './ProcessInstanceManager'
export { TaskManager } from './TaskManager'
export { StateTracker } from './StateTracker'
export { ConditionEvaluator } from './ConditionEvaluator'
export { WorkflowStorage, MemoryWorkflowStorage } from './WorkflowStorage'

// 导出事件和查询类型
export type { ProcessEvent, ExecutionTrace } from './StateTracker'
export type { ProcessInstanceQuery, ProcessInstanceQueryResult, ProcessInstanceStats } from './ProcessInstanceManager'
export type { TaskStats } from './TaskManager'
