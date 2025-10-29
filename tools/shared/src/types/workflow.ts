/**
 * 工作流相关类型定义
 */

import type { ToolName } from './tool'

/**
 * 工作流状态
 */
export type WorkflowStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'

/**
 * 工作流步骤状态
 */
export type WorkflowStepStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped'

/**
 * 工作流步骤
 */
export interface WorkflowStep {
  id: string
  name: string
  tool: ToolName
  action: string
  params?: Record<string, any>
  condition?: string | ((context: WorkflowContext) => boolean)
  continueOnError?: boolean
  timeout?: number
  retries?: number
  dependsOn?: string[]
}

/**
 * 工作流定义
 */
export interface WorkflowDefinition {
  id: string
  name: string
  description?: string
  version?: string
  steps: WorkflowStep[]
  variables?: Record<string, any>
  timeout?: number
  continueOnError?: boolean
}

/**
 * 工作流实例
 */
export interface WorkflowInstance {
  id: string
  projectId: string
  workflowId: string
  name: string
  status: WorkflowStatus
  currentStep?: number
  steps: WorkflowStepInstance[]
  variables: Record<string, any>
  startedAt?: number
  completedAt?: number
  error?: string
  createdAt: number
}

/**
 * 工作流步骤实例
 */
export interface WorkflowStepInstance {
  id: string
  stepId: string
  name: string
  status: WorkflowStepStatus
  result?: any
  error?: string
  startedAt?: number
  completedAt?: number
  logs?: string[]
}

/**
 * 工作流上下文
 */
export interface WorkflowContext {
  workflow: WorkflowInstance
  projectId: string
  variables: Record<string, any>
  stepResults: Record<string, any>
  currentStep?: WorkflowStepInstance
}

/**
 * 工作流事件
 */
export interface WorkflowEvent {
  type: 'start' | 'step-start' | 'step-complete' | 'step-error' | 'complete' | 'error'
  workflowId: string
  stepId?: string
  data?: any
  timestamp: number
}

/**
 * 工作流执行选项
 */
export interface WorkflowExecutionOptions {
  projectId: string
  variables?: Record<string, any>
  skipSteps?: string[]
  dryRun?: boolean
}


