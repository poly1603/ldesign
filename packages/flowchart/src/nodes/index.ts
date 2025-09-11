/**
 * 审批流程节点注册
 * 
 * 统一注册所有审批流程节点类型
 */

import type { LogicFlow } from '@logicflow/core'
// 基础节点
import { StartNode, StartNodeModel } from './StartNode'
import { ApprovalNode, ApprovalNodeModel } from './ApprovalNode'
import { ConditionNode, ConditionNodeModel } from './ConditionNode'
import { EndNode, EndNodeModel } from './EndNode'
import { ProcessNode, ProcessNodeModel } from './ProcessNode'

// 任务节点
import { UserTaskNode, UserTaskNodeModel } from './UserTaskNode'
import { ServiceTaskNode, ServiceTaskNodeModel } from './ServiceTaskNode'
import { ScriptTaskNode, ScriptTaskNodeModel } from './ScriptTaskNode'
import { ManualTaskNode, ManualTaskNodeModel } from './ManualTaskNode'

// 网关节点
import { ParallelGateway, ParallelGatewayModel } from './ParallelGateway'
import { ExclusiveGateway, ExclusiveGatewayModel } from './ExclusiveGateway'
import { InclusiveGatewayNode, InclusiveGatewayNodeModel } from './InclusiveGateway'
import { EventGatewayNode, EventGatewayNodeModel } from './EventGateway'

// 事件节点
import { TimerEventNode, TimerEventNodeModel } from './TimerEventNode'
import { MessageEventNode, MessageEventNodeModel } from './MessageEventNode'
import { SignalEventNode, SignalEventNodeModel } from './SignalEventNode'

// 自定义物料节点
import { registerCustomMaterialNode } from './CustomMaterialNode'

/**
 * 注册所有审批流程节点
 * @param lf LogicFlow 实例
 */
export function registerApprovalNodes(lf: LogicFlow): void {
  // 注册开始节点
  lf.register({
    type: 'start',
    view: StartNode,
    model: StartNodeModel
  })

  // 注册审批节点
  lf.register({
    type: 'approval',
    view: ApprovalNode,
    model: ApprovalNodeModel
  })

  // 注册条件节点
  lf.register({
    type: 'condition',
    view: ConditionNode,
    model: ConditionNodeModel
  })

  // 注册结束节点
  lf.register({
    type: 'end',
    view: EndNode,
    model: EndNodeModel
  })

  // 注册处理节点
  lf.register({
    type: 'process',
    view: ProcessNode,
    model: ProcessNodeModel
  })

  // 注册并行网关
  lf.register({
    type: 'parallel-gateway',
    view: ParallelGateway,
    model: ParallelGatewayModel
  })

  // 注册排他网关
  lf.register({
    type: 'exclusive-gateway',
    view: ExclusiveGateway,
    model: ExclusiveGatewayModel
  })

  // 注册用户任务节点
  lf.register({
    type: 'user-task',
    view: UserTaskNode,
    model: UserTaskNodeModel
  })

  // 注册服务任务节点
  lf.register({
    type: 'service-task',
    view: ServiceTaskNode,
    model: ServiceTaskNodeModel
  })

  // 注册脚本任务节点
  lf.register({
    type: 'script-task',
    view: ScriptTaskNode,
    model: ScriptTaskNodeModel
  })

  // 注册手工任务节点
  lf.register({
    type: 'manual-task',
    view: ManualTaskNode,
    model: ManualTaskNodeModel
  })

  // 注册包容网关
  lf.register({
    type: 'inclusive-gateway',
    view: InclusiveGatewayNode,
    model: InclusiveGatewayNodeModel
  })

  // 注册事件网关
  lf.register({
    type: 'event-gateway',
    view: EventGatewayNode,
    model: EventGatewayNodeModel
  })

  // 注册定时事件节点
  lf.register({
    type: 'timer-event',
    view: TimerEventNode,
    model: TimerEventNodeModel
  })

  // 注册消息事件节点
  lf.register({
    type: 'message-event',
    view: MessageEventNode,
    model: MessageEventNodeModel
  })

  // 注册信号事件节点
  lf.register({
    type: 'signal-event',
    view: SignalEventNode,
    model: SignalEventNodeModel
  })

  // 注册自定义物料节点
  registerCustomMaterialNode(lf)
}

// 导出所有节点类
// 基础节点
export { StartNode, StartNodeModel } from './StartNode'
export { ApprovalNode, ApprovalNodeModel } from './ApprovalNode'
export { ConditionNode, ConditionNodeModel } from './ConditionNode'
export { EndNode, EndNodeModel } from './EndNode'
export { ProcessNode, ProcessNodeModel } from './ProcessNode'

// 任务节点
export { UserTaskNode, UserTaskNodeModel } from './UserTaskNode'
export { ServiceTaskNode, ServiceTaskNodeModel } from './ServiceTaskNode'
export { ScriptTaskNode, ScriptTaskNodeModel } from './ScriptTaskNode'
export { ManualTaskNode, ManualTaskNodeModel } from './ManualTaskNode'

// 网关节点
export { ParallelGateway, ParallelGatewayModel } from './ParallelGateway'
export { ExclusiveGateway, ExclusiveGatewayModel } from './ExclusiveGateway'
export { InclusiveGatewayNode, InclusiveGatewayNodeModel } from './InclusiveGateway'
export { EventGatewayNode, EventGatewayNodeModel } from './EventGateway'

// 事件节点
export { TimerEventNode, TimerEventNodeModel } from './TimerEventNode'
export { MessageEventNode, MessageEventNodeModel } from './MessageEventNode'
export { SignalEventNode, SignalEventNodeModel } from './SignalEventNode'
